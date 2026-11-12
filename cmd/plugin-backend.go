package main

import (
	"crypto/tls"
	"flag"
	"fmt"
	"os"
	"strconv"
	"strings"

	server "github.com/openshift/distributed-tracing-console-plugin/pkg"
	"github.com/sirupsen/logrus"
	k8sapiflag "k8s.io/component-base/cli/flag"
)

func main() {
	portArg := flag.Int("port", 0, "server port to listen on (default: 9443)")
	certArg := flag.String("cert", "", "cert file path to enable TLS (disabled by default)")
	keyArg := flag.String("key", "", "private key file path to enable TLS (disabled by default)")
	tlsMinVersionArg := flag.String("tls-min-version", "", "Minimum TLS version supported. Value must match version names from https://golang.org/pkg/crypto/tls/#pkg-constants (default: VersionTLS12).")
	tlsMaxVersionArg := flag.String("tls-max-version", "", "Maximum TLS version supported. Value must match version names from https://golang.org/pkg/crypto/tls/#pkg-constants (default: the highest version supported by Go).")
	tlsCipherSuitesArg := flag.String("tls-cipher-suites", "", "Comma-separated list of cipher suites for the server. Values are from tls package constants (https://golang.org/pkg/crypto/tls/#pkg-constants). If omitted, the default Go cipher suites will be used")
	tlsCurvesArg := flag.String("tls-curves", "", "comma-separated list of TLS curves for the server\nvalues are tls.CurveID names (https://pkg.go.dev/crypto/tls#CurveID) or OpenShift TLS group names")
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
	tlsMaxVersion := mergeEnvValue("TLS_MAX_VERSION", *tlsMaxVersionArg, "")
	tlsCipherSuites := mergeEnvValue("TLS_CIPHER_SUITES", *tlsCipherSuitesArg, "")
	tlsCurves := mergeEnvValue("TLS_CURVES", *tlsCurvesArg, "")
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

	var tlsMinVer uint16
	if tlsMinVersion != "" {
		var err error
		tlsMinVer, err = k8sapiflag.TLSVersion(tlsMinVersion)
		if err != nil {
			log.WithError(err).Fatal("invalid TLS min version")
		}
	}
	tlsMaxVer, err := parseTLSMaxVersion(tlsMaxVersion)
	if err != nil {
		log.WithError(err).Fatal("invalid TLS max version")
	}
	if tlsMaxVer != 0 {
		log.Infof("Max TLS version: %q", tls.VersionName(tlsMaxVer))
	}
	tlsCiphers, err := server.ParseCipherSuites(tlsCipherSuites)
	if err != nil {
		log.WithError(err).Fatal("invalid TLS cipher suites configuration")
	}
	if len(tlsCiphers) > 0 {
		log.Infof("TLS ciphers: %q", server.CipherSuiteNames(tlsCiphers))
	}
	tlsCurvePrefs, err := server.ParseCurves(tlsCurves)
	if err != nil {
		log.WithError(err).Fatal("invalid TLS curves configuration")
	}
	if len(tlsCurvePrefs) > 0 {
		log.Infof("TLS curves: %q", tlsCurvePrefs)
	}

	server.Start(&server.Config{
		Port:                port,
		CertFile:            cert,
		PrivateKeyFile:      key,
		TLSMinVersion:       tlsMinVer,
		TLSMaxVersion:       tlsMaxVer,
		TLSCipherSuites:     tlsCiphers,
		TLSCurvePreferences: tlsCurvePrefs,
		Features:            featuresSet,
		StaticPath:          staticPath,
		ConfigPath:          configPath,
		PluginConfigPath:    pluginConfigPath,
	})
}

// parseTLSMaxVersion uses the same version names as the min version, but
// lists the valid values instead of echoing the configured one on error.
func parseTLSMaxVersion(version string) (uint16, error) {
	if version == "" {
		return 0, nil
	}
	v, err := k8sapiflag.TLSVersion(version)
	if err != nil {
		return 0, fmt.Errorf("unknown TLS max version, valid values are: %s", strings.Join(k8sapiflag.TLSPossibleVersions(), ", "))
	}
	return v, nil
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

func mergeEnvValueInt(key string, arg int, defaultValue int) int {
	if arg != 0 {
		return arg
	}

	envValue := os.Getenv(key)

	num, err := strconv.Atoi(envValue)
	if err == nil && num != 0 {
		return num
	}

	return defaultValue
}
