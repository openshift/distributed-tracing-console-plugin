package main

import (
	"flag"
	"os"
	"strconv"
	"strings"

	server "github.com/openshift/distributed-tracing-console-plugin/pkg"
	"github.com/sirupsen/logrus"
)

type cipherSuitesSlice []string

func (s *cipherSuitesSlice) String() string {
	return strings.Join(*s, ",")
}

func (s *cipherSuitesSlice) Set(value string) error {
	parts := strings.Split(value, ",")
	for i := range parts {
		parts[i] = strings.TrimSpace(parts[i])
	}
	*s = parts
	return nil
}

func main() {
	portArg := flag.Int("port", 0, "server port to listen on (default: 9443)")
	certArg := flag.String("cert", "", "cert file path to enable TLS (disabled by default)")
	keyArg := flag.String("key", "", "private key file path to enable TLS (disabled by default)")
	tlsMinVersionArg := flag.String("tls-min-version", "", "Minimum TLS version supported. Value must match version names from https://golang.org/pkg/crypto/tls/#pkg-constants (default: VersionTLS12).")
	var tlsCipherSuitesArg cipherSuitesSlice
	flag.Var(&tlsCipherSuitesArg, "tls-cipher-suites", "Comma-separated list of cipher suites for the server. Values are from tls package constants (https://golang.org/pkg/crypto/tls/#pkg-constants). If omitted, the default Go cipher suites will be used")
	featuresArg := flag.String("features", "", "enabled features, comma separated")
	staticPathArg := flag.String("static-path", "", "static files path to serve frontend (default: './web/dist')")
	configPathArg := flag.String("config-path", "", "config files path (default: './web/dist')")
	pluginConfigArg := flag.String("plugin-config-path", "", "plugin yaml configuration")
	flag.Parse()

	var log = logrus.WithField("module", "main")

	port := mergeEnvValueInt("PORT", *portArg, 9443)
	cert := mergeEnvValue("CERT_FILE_PATH", *certArg, "")
	key := mergeEnvValue("PRIVATE_KEY_FILE_PATH", *keyArg, "")
	tlsMinVersion := mergeEnvValue("TLS_MIN_VERSION", *tlsMinVersionArg, "")
	tlsCipherSuites := mergeEnvValueSlice("TLS_CIPHER_SUITES", tlsCipherSuitesArg)
	features := mergeEnvValue("DISTRIBUTED_TRACING_CONSOLE_PLUGIN_FEATURES", *featuresArg, "")
	staticPath := mergeEnvValue("DISTRIBUTED_TRACING_CONSOLE_PLUGIN_STATIC_PATH", *staticPathArg, "./web/dist")
	configPath := mergeEnvValue("DISTRIBUTED_TRACING_CONSOLE_PLUGIN_MANIFEST_CONFIG_PATH", *configPathArg, "./web/dist")
	pluginConfigPath := mergeEnvValue("DISTRIBUTED_TRACING_CONSOLE_PLUGIN_CONFIG_PATH", *pluginConfigArg, "/etc/plugin/config.yaml")

	featuresList := strings.Fields(strings.Join(strings.Split(strings.ToLower(features), ","), " "))

	featuresSet := make(map[string]bool)
	for _, s := range featuresList {
		featuresSet[s] = true
	}

	log.Infof("enabled features: %+q\n", featuresList)

	server.Start(&server.Config{
		Port:             port,
		CertFile:         cert,
		PrivateKeyFile:   key,
		TLSMinVersion:    tlsMinVersion,
		TLSCipherSuites:  tlsCipherSuites,
		Features:         featuresSet,
		StaticPath:       staticPath,
		ConfigPath:       configPath,
		PluginConfigPath: pluginConfigPath,
	})
}

func mergeEnvValue(key string, arg string, defaultValue string) string {
	if arg != "" {
		return arg
	}

	envValue := os.Getenv(key)

	if envValue != "" {
		return envValue
	}

	return defaultValue
}

func mergeEnvValueSlice(key string, arg cipherSuitesSlice) []string {
	if len(arg) > 0 {
		return []string(arg)
	}

	envValue := os.Getenv(key)
	if envValue != "" {
		parts := strings.Split(envValue, ",")
		for i := range parts {
			parts[i] = strings.TrimSpace(parts[i])
		}
		return parts
	}

	return nil
}

func mergeEnvValueInt(key string, arg int, defaultValue int) int {
	if arg != 0 {
		return arg
	}

	envValue := os.Getenv(key)

	num, err := strconv.Atoi(envValue)
	if err != nil && num != 0 {
		return num
	}

	return defaultValue
}
