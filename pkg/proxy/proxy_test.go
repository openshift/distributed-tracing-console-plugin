package proxy

import (
	"crypto/tls"
	"encoding/pem"
	"net/http"
	"net/http/httptest"
	"os"
	"testing"

	"github.com/stretchr/testify/require"
)

// startTLSServer starts a test HTTPS server with the given TLS config.
// Returns the server and the path to a CA file containing the server's certificate.
func startTLSServer(t *testing.T, tlsConfig *tls.Config) (*httptest.Server, string) {
	t.Helper()

	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})

	server := httptest.NewUnstartedServer(handler)
	server.TLS = tlsConfig
	server.StartTLS()

	// Write the server's certificate to a temp file so the proxy can use it as CA
	caFile := t.TempDir() + "/ca.cert"
	certOut, err := os.Create(caFile)
	require.NoError(t, err)

	for _, cert := range server.TLS.Certificates {
		for _, certBytes := range cert.Certificate {
			_ = pem.Encode(certOut, &pem.Block{Type: "CERTIFICATE", Bytes: certBytes})
		}
	}
	certOut.Close()

	return server, caFile
}

// buildClientFromHandler creates an HTTP client using the TLS config that the
// proxy handler would use for outbound connections.
func buildClientFromHandler(t *testing.T, handler *ProxyHandler) *http.Client {
	t.Helper()

	tlsConfig, err := handler.buildTLSConfig()
	require.NoError(t, err)

	return &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: tlsConfig,
		},
	}
}

func TestProxyTLS13MinVersion(t *testing.T) {
	// Server requires TLS 1.3
	server, caFile := startTLSServer(t, &tls.Config{
		MinVersion: tls.VersionTLS13,
	})
	defer server.Close()

	// Proxy with TLS 1.3 min version should succeed
	handler13 := NewProxyHandler(nil, caFile, tls.VersionTLS13, nil)
	client13 := buildClientFromHandler(t, handler13)

	resp, err := client13.Get(server.URL + "/health")
	require.NoError(t, err, "TLS 1.3 proxy should be able to connect to TLS 1.3 server")
	resp.Body.Close()

	// Proxy with TLS 1.2 max version should be rejected by the TLS 1.3 server
	handler12 := NewProxyHandler(nil, caFile, 0, nil)
	tlsConfig, err := handler12.buildTLSConfig()
	require.NoError(t, err)
	tlsConfig.MaxVersion = tls.VersionTLS12

	client12 := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: tlsConfig,
		},
	}

	_, err = client12.Get(server.URL + "/health")
	require.Error(t, err, "TLS 1.2 client should be rejected by TLS 1.3 server")
}

func TestProxyCipherSuites(t *testing.T) {
	serverCipherSuite := tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256

	// Server only accepts a specific cipher suite
	server, caFile := startTLSServer(t, &tls.Config{
		MaxVersion:   tls.VersionTLS12,
		CipherSuites: []uint16{serverCipherSuite},
	})
	defer server.Close()

	// Proxy with matching cipher suite should succeed
	handlerMatch := NewProxyHandler(nil, caFile, 0, []uint16{serverCipherSuite})
	tlsConfig, err := handlerMatch.buildTLSConfig()
	require.NoError(t, err)
	tlsConfig.MaxVersion = tls.VersionTLS12

	clientMatch := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: tlsConfig,
		},
	}

	resp, err := clientMatch.Get(server.URL + "/health")
	require.NoError(t, err, "Client with matching cipher suite should connect")
	resp.Body.Close()

	// Proxy with non-matching cipher suite should be rejected
	handlerMismatch := NewProxyHandler(nil, caFile, 0, []uint16{tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384})
	tlsConfigMismatch, err := handlerMismatch.buildTLSConfig()
	require.NoError(t, err)
	tlsConfigMismatch.MaxVersion = tls.VersionTLS12

	clientMismatch := &http.Client{
		Transport: &http.Transport{
			TLSClientConfig: tlsConfigMismatch,
		},
	}

	_, err = clientMismatch.Get(server.URL + "/health")
	require.Error(t, err, "Client with non-matching cipher suite should be rejected")
}

func TestProxyTLSConfigNoCert(t *testing.T) {
	// When no CA file is provided, buildTLSConfig should return nil
	handler := NewProxyHandler(nil, "", tls.VersionTLS13, []uint16{tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256})
	tlsConfig, err := handler.buildTLSConfig()
	require.NoError(t, err)
	require.Nil(t, tlsConfig, "TLS config should be nil when no CA file is provided")
}
