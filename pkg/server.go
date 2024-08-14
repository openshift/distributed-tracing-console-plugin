package server

import (
	"crypto/tls"
	"encoding/json"
	"fmt"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/gorilla/handlers"
	"github.com/gorilla/mux"
	"github.com/sirupsen/logrus"
	"gopkg.in/yaml.v3"

	"k8s.io/client-go/dynamic"
	"k8s.io/client-go/rest"

	"github.com/openshift/distributed-tracing-console-plugin/pkg/api"
	"github.com/openshift/distributed-tracing-console-plugin/pkg/proxy"
)

var log = logrus.WithField("module", "server")

type Config struct {
	Port             int
	CertFile         string
	PrivateKeyFile   string
	Features         map[string]bool
	StaticPath       string
	ConfigPath       string
	PluginConfigPath string
}

type PluginConfig struct {
	Timeout time.Duration `json:"timeout,omitempty" yaml:"timeout,omitempty"`
}

func (pluginConfig *PluginConfig) MarshalJSON() ([]byte, error) {
	type Alias PluginConfig
	return json.Marshal(&struct {
		Timeout float64 `json:"timeout,omitempty"`
		*Alias
	}{
		Timeout: pluginConfig.Timeout.Seconds(),
		Alias:   (*Alias)(pluginConfig),
	})
}

func Start(cfg *Config) {
	// Uncomment the following line for local development:
	// k8sconfig, err := clientcmd.BuildConfigFromFlags("", "/home/<username>/.kube/config")

	k8sconfig, err := rest.InClusterConfig()
	if err != nil {
		panic(fmt.Errorf("cannot get in cluster config: %w", err))
	}

	k8sclient, err := dynamic.NewForConfig(k8sconfig)
	if err != nil {
		panic(fmt.Errorf("error creating dynamicClient: %w", err))
	}

	router, pluginConfig := setupRoutes(cfg, k8sclient)
	router.Use(corsHeaderMiddleware())

	loggedRouter := handlers.LoggingHandler(log.Logger.Out, router)

	// clients must use TLS 1.2 or higher
	tlsConfig := &tls.Config{
		MinVersion: tls.VersionTLS12,
	}

	timeout := 30 * time.Second
	if pluginConfig != nil {
		timeout = pluginConfig.Timeout
	}

	httpServer := &http.Server{
		Handler:      loggedRouter,
		Addr:         fmt.Sprintf(":%d", cfg.Port),
		TLSConfig:    tlsConfig,
		ReadTimeout:  timeout,
		WriteTimeout: timeout,
	}

	if cfg.CertFile != "" && cfg.PrivateKeyFile != "" {
		log.Infof("listening on https://:%d", cfg.Port)
		panic(httpServer.ListenAndServeTLS(cfg.CertFile, cfg.PrivateKeyFile))
	} else {
		log.Infof("listening on http://:%d", cfg.Port)
		panic(httpServer.ListenAndServe())
	}
}

func setupRoutes(cfg *Config, k8sclient *dynamic.DynamicClient) (*mux.Router, *PluginConfig) {
	configHandlerFunc, pluginConfig := configHandler(cfg)

	r := mux.NewRouter()

	r.PathPrefix("/health").HandlerFunc(healthHandler())

	// serve list of Tempo CRs found on the cluster
	r.Path("/api/v1/list-tempo-resources").HandlerFunc(api.ListTempoResourcesHandler(k8sclient))

	// uses the namespace and name to forward requests to a particular Tempo instance
	r.PathPrefix("/proxy/{namespace}/{name}/{tenant}").Handler(proxy.NewProxyHandler(k8sclient, cfg.CertFile))

	// serve plugin manifest according to enabled features
	r.Path("/plugin-manifest.json").Handler(manifestHandler(cfg))

	// serve enabled features list to the front-end
	r.PathPrefix("/features").HandlerFunc(featuresHandler(cfg))

	// serve plugin configuration to the front-end
	r.PathPrefix("/config").HandlerFunc(configHandlerFunc)

	// serve front end files
	r.PathPrefix("/").Handler(filesHandler(http.Dir(cfg.StaticPath)))

	return r, pluginConfig
}

func filesHandler(root http.FileSystem) http.Handler {
	fileServer := http.FileServer(root)
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		filePath := r.URL.Path

		// disable caching for plugin entry point
		if strings.HasPrefix(filePath, "/plugin-entry.js") {
			w.Header().Set("Cache-Control", "no-cache, no-store, must-revalidate")
			w.Header().Set("Expires", "0")
		}

		fileServer.ServeHTTP(w, r)
	})
}

func healthHandler() http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Write([]byte("ok"))
	})
}

func corsHeaderMiddleware() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			headers := w.Header()
			headers.Set("Access-Control-Allow-Origin", "*")
			next.ServeHTTP(w, r)
		})
	}
}

func featuresHandler(cfg *Config) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		jsonFeatures, err := json.Marshal(cfg.Features)

		if err != nil {
			log.WithError(err).Errorf("cannot marshall, features were: %v", string(jsonFeatures))
			http.Error(w, err.Error(), http.StatusInternalServerError)
			return
		}

		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonFeatures)
	})
}

func configHandler(cfg *Config) (http.HandlerFunc, *PluginConfig) {
	pluginConfData, err := os.ReadFile(cfg.PluginConfigPath)

	if err != nil {
		log.WithError(err).Warnf("cannot read config file, serving plugin with default configuration, tried %s", cfg.PluginConfigPath)

		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.Write([]byte("{}"))
		}), nil
	}

	var pluginConfig PluginConfig
	err = yaml.Unmarshal(pluginConfData, &pluginConfig)

	if err != nil {
		log.WithError(err).Error("unable to unmarshall config data")
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			http.Error(w, "unable to unmarshall config data", http.StatusInternalServerError)
		}), nil
	}

	jsonPluginConfig, err := pluginConfig.MarshalJSON()

	if err != nil {
		log.WithError(err).Errorf("unable to marshall, config data: %v", pluginConfig)
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			http.Error(w, "unable to marshall config data", http.StatusInternalServerError)
		}), nil
	}

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Content-Type", "application/json")
		w.Write(jsonPluginConfig)
	}), &pluginConfig
}
