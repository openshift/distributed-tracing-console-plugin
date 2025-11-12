package proxy

import (
	"context"
	"crypto/tls"
	"crypto/x509"
	"errors"
	"fmt"
	"net"
	"net/http"
	"net/http/httputil"
	"net/url"
	"os"
	"time"

	"github.com/gorilla/mux"
	lru "github.com/hashicorp/golang-lru/v2"
	"github.com/openshift/distributed-tracing-console-plugin/pkg/api"
	oscrypto "github.com/openshift/library-go/pkg/crypto"
	"github.com/sirupsen/logrus"
	"k8s.io/client-go/dynamic"
)

var log = logrus.WithField("module", "proxy")

type ProxyHandler struct {
	k8sclient     *dynamic.DynamicClient
	serviceCAfile string
	proxyCache    *lru.Cache[string, *httputil.ReverseProxy]
}

func NewProxyHandler(k8sclient *dynamic.DynamicClient, serviceCAfile string) *ProxyHandler {
	proxyCache, err := lru.New[string, *httputil.ReverseProxy](128)
	if err != nil {
		// the only error path of lru.New is size <= 0
		panic(fmt.Errorf("cannot allocate LRU cache: %w", err))
	}

	return &ProxyHandler{
		k8sclient:     k8sclient,
		serviceCAfile: serviceCAfile,
		proxyCache:    proxyCache,
	}
}

// These headers aren't things that proxies should pass along. Some are forbidden by http2.
// This fixes the bug where Chrome users saw a ERR_SPDY_PROTOCOL_ERROR for all proxied requests.
func FilterHeaders(r *http.Response) error {
	badHeaders := []string{
		"Connection",
		"Keep-Alive",
		"Proxy-Connection",
		"Transfer-Encoding",
		"Upgrade",
		"Access-Control-Allow-Headers",
		"Access-Control-Allow-Methods",
		"Access-Control-Allow-Origin",
		"Access-Control-Expose-Headers",
	}
	for _, h := range badHeaders {
		r.Header.Del(h)
	}
	return nil
}

func (h *ProxyHandler) createProxy(tempo api.TempoResource, tenant string) (*httputil.ReverseProxy, error) {
	// TODO: allow custom CA per datasource
	var serviceProxyTLSConfig *tls.Config
	if h.serviceCAfile != "" {
		serviceCertPEM, err := os.ReadFile(h.serviceCAfile)
		if err != nil {
			return nil, fmt.Errorf("failed to read certificate file: tried '%s' and got %v", h.serviceCAfile, err)
		}

		serviceProxyRootCAs := x509.NewCertPool()
		if !serviceProxyRootCAs.AppendCertsFromPEM(serviceCertPEM) {
			return nil, fmt.Errorf("no CA found for Kubernetes services, proxy to datasources will fail")
		}

		serviceProxyTLSConfig = oscrypto.SecureTLSConfig(&tls.Config{
			RootCAs: serviceProxyRootCAs,
		})
	}

	const (
		dialerKeepalive       = 30 * time.Second
		dialerTimeout         = 5 * time.Minute // Maximum request timeout for most browsers.
		tlsHandshakeTimeout   = 10 * time.Second
		websocketPingInterval = 30 * time.Second
		websocketTimeout      = 30 * time.Second
	)

	dialer := &net.Dialer{
		Timeout:   dialerTimeout,
		KeepAlive: dialerKeepalive,
	}

	transport := &http.Transport{
		Proxy: http.ProxyFromEnvironment,
		DialContext: func(ctx context.Context, network, addr string) (net.Conn, error) {
			return dialer.DialContext(ctx, network, addr)
		},
		TLSClientConfig:     serviceProxyTLSConfig,
		TLSHandshakeTimeout: tlsHandshakeTimeout,
	}

	var targetURL string
	switch tempo.Kind {
	case api.KindTempoStack:
		if len(tempo.Tenants) > 0 {
			service := DNSName(fmt.Sprintf("tempo-%s-gateway", tempo.Name))
			targetURL = fmt.Sprintf("https://%s.%s.svc:8080/api/traces/v1/%s/tempo", service, tempo.Namespace, url.PathEscape(tenant))
		} else {
			service := DNSName(fmt.Sprintf("tempo-%s-query-frontend", tempo.Name))
			targetURL = fmt.Sprintf("http://%s.%s.svc:3200", service, tempo.Namespace)
		}

	case api.KindTempoMonolithic:
		if len(tempo.Tenants) > 0 {
			service := DNSName(fmt.Sprintf("tempo-%s-gateway", tempo.Name))
			targetURL = fmt.Sprintf("https://%s.%s.svc:8080/api/traces/v1/%s/tempo", service, tempo.Namespace, url.PathEscape(tenant))
		} else {
			service := DNSName(fmt.Sprintf("tempo-%s", tempo.Name))
			targetURL = fmt.Sprintf("http://%s.%s.svc:3200", service, tempo.Namespace)
		}

	default:
		return nil, fmt.Errorf("invalid Tempo resource with kind '%s'", tempo.Kind)
	}

	// For local development, set the target URL to a local Tempo instance
	// targetURL = "http://localhost:3200"

	proxyURL, err := url.Parse(targetURL)
	if err != nil {
		return nil, err
	}

	reverseProxy := httputil.NewSingleHostReverseProxy(proxyURL)
	reverseProxy.FlushInterval = time.Millisecond * 100
	reverseProxy.Transport = transport
	reverseProxy.ModifyResponse = FilterHeaders
	reverseProxy.ErrorHandler = func(w http.ResponseWriter, r *http.Request, err error) {
		log.Printf("http: proxy error: %v", err)
		w.WriteHeader(http.StatusBadGateway)
		fmt.Fprintf(w, "Error connecting to Tempo instance: %s", err)
	}
	return reverseProxy, nil
}

func handleError(w http.ResponseWriter, code int, err error) {
	log.Error(err)
	http.Error(w, err.Error(), code)
}

func (h *ProxyHandler) ServeHTTP(w http.ResponseWriter, r *http.Request) {
	vars := mux.Vars(r)
	// all path params are unescaped by gorilla/mux
	namespace := vars["namespace"]
	name := vars["name"]
	tenant := vars["tenant"]

	if len(namespace) == 0 {
		handleError(w, http.StatusBadRequest, errors.New("cannot proxy request, namespace was not provided"))
		return
	}

	if len(name) == 0 {
		handleError(w, http.StatusBadRequest, errors.New("cannot proxy request, tempo name was not provided"))
		return
	}

	// Slashes are not allowed in the namespace or name fields, therefore it's a suitable cache key separator
	cacheKey := fmt.Sprintf("%s/%s/%s", namespace, name, tenant)

	// If two requests arrive simultaneously, it's likely that two proxy instances will be created,
	// the later one overriding the first one in the cache.
	// This could be avoided by locking, at the cost of performance.
	proxy, ok := h.proxyCache.Get(cacheKey)
	if !ok {
		// proxy not found in cache, validate if a Tempo resource exists with this namespace/name
		tempo, err := h.lookupTempoResource(r.Context(), namespace, name)
		if err != nil {
			handleError(w, http.StatusInternalServerError, fmt.Errorf("cannot proxy request: %w", err))
			return
		}

		proxy, err = h.createProxy(tempo, tenant)
		if err != nil {
			handleError(w, http.StatusInternalServerError, fmt.Errorf("cannot proxy request: %w", err))
			return
		}
		h.proxyCache.Add(cacheKey, proxy)
	}

	http.StripPrefix(fmt.Sprintf("/proxy/%s/%s/%s", url.PathEscape(namespace), url.PathEscape(name), url.PathEscape(tenant)), proxy).ServeHTTP(w, r)
}

func (h *ProxyHandler) lookupTempoResource(ctx context.Context, namespace string, name string) (api.TempoResource, error) {
	resources, err := api.ListTempoResources(ctx, h.k8sclient)
	if err != nil {
		return api.TempoResource{}, err
	}

	var tempo api.TempoResource
	found := false
	for _, resource := range resources {
		if resource.Namespace == namespace && resource.Name == name {
			found = true
			tempo = resource
			break
		}
	}

	if !found {
		return api.TempoResource{}, fmt.Errorf("%s/%s is not a valid Tempo resource", namespace, name)
	}
	return tempo, nil
}
