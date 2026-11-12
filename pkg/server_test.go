package server

import (
	"bytes"
	"context"
	"crypto/rand"
	"crypto/rsa"
	"crypto/tls"
	"crypto/x509"
	"crypto/x509/pkix"
	"encoding/pem"
	"fmt"
	"math/big"
	rnd "math/rand"
	"net"
	"net/http"
	"net/http/httptest"
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
	"time"

	"github.com/stretchr/testify/require"
)

type httpClientConfig struct {
	TLSConfig     *tls.Config
	HTTPTransport *http.Transport
}

const (
	testHostname = "127.0.0.1"
)

func TestServerRunning(t *testing.T) {
	testPort, err := getFreePort(testHostname)
	if err != nil {
		t.Fatalf("Cannot get a free port to run tests on host [%v]", testHostname)
	} else {
		t.Logf("Will use free port [%v] on host [%v] for tests", testPort, testHostname)
	}

	testServerHostPort := fmt.Sprintf("%v:%v", testHostname, testPort)

	rnd.Seed(time.Now().UnixNano())

	serverURL := fmt.Sprintf("http://%s", testServerHostPort)

	// Prepare directory to serve web files
	prepareServerAssets(t)

	go func() {
		Start(&Config{
			Port: testPort,
		})
	}()

	t.Logf("Started test http server: %v", serverURL)

	httpConfig := httpClientConfig{}
	httpClient, err := httpConfig.buildHTTPClient()
	if err != nil {
		t.Fatalf("Failed to create http client")
	}

	// wait for our test http server to come up
	checkHTTPReady(httpClient, serverURL)

	if _, err = getRequestResults(t, httpClient, serverURL); err != nil {
		t.Fatalf("Failed: could not fetch static files on / (root): %v", err)
	}

	if _, err = getRequestResults(t, httpClient, serverURL+"/health"); err != nil {
		t.Fatalf("Failed: could not fetch health check: %v", err)
	}

	if _, err = getRequestResults(t, httpClient, serverURL+"/features"); err != nil {
		t.Fatalf("Failed: could not fetch features endpoint: %v", err)
	}

	// sanity check - make sure we cannot get to a bogus context path
	if _, err = getRequestResults(t, httpClient, serverURL+"/badroot"); err == nil {
		t.Fatalf("Failed: Should have failed going to /badroot")
	}
}

func TestSecureServerRunning(t *testing.T) {
	srv := startTLSTestServer(t, &Config{})
	httpClient := srv.client(t, &tls.Config{})

	_, err := getRequestResults(t, httpClient, srv.url)
	require.NoError(t, err, "could not fetch static files on / (root)")

	_, err = getRequestResults(t, httpClient, srv.url+"/health")
	require.NoError(t, err, "could not fetch API endpoint")

	// Make sure the server rejects anything trying to use TLS 1.1 or under
	httpClientTLS11 := srv.client(t, &tls.Config{
		MinVersion: tls.VersionTLS10,
		MaxVersion: tls.VersionTLS11,
	})
	_, err = getRequestResults(t, httpClientTLS11, srv.url)
	require.Error(t, err, "should not have been able to use TLS 1.1")
}

func getFreePort(host string) (int, error) {
	addr, err := net.ResolveTCPAddr("tcp", host+":0")
	if err != nil {
		return 0, err
	}

	l, err := net.ListenTCP("tcp", addr)
	if err != nil {
		return 0, err
	}
	defer l.Close()
	return l.Addr().(*net.TCPAddr).Port, nil
}

// prepareServerAssets creates a temporary directory with the web assets and
// changes into it. Both the directory and the working directory change are
// undone on cleanup.
func prepareServerAssets(t *testing.T) {
	t.Helper()

	tmpDir := t.TempDir()
	distpath := filepath.Join(tmpDir, "web/dist")
	require.NoError(t, os.MkdirAll(distpath, os.ModePerm))
	dummyfile, err := os.Create(filepath.Join(distpath, "dummy"))
	require.NoError(t, err)
	require.NoError(t, dummyfile.Close())
	t.Chdir(tmpDir)
}

func getRequestResults(t *testing.T, httpClient *http.Client, url string) (string, error) {
	r, err := http.NewRequest("GET", url, nil)
	if err != nil {
		t.Fatal(err)
		return "", err
	}

	resp, err := httpClient.Do(r)
	if err != nil {
		return "", err
	}
	defer resp.Body.Close()
	if resp.StatusCode == http.StatusOK {
		buf := new(bytes.Buffer)
		_, err2 := buf.ReadFrom(resp.Body)
		if err2 != nil {
			return "", err2
		}
		bodyString := buf.String()
		return bodyString, nil
	}
	return "", fmt.Errorf("Bad status: %v", resp.StatusCode)
}

func checkHTTPReady(httpClient *http.Client, url string) {
	for i := 0; i < 60; i++ {
		if r, err := httpClient.Get(url); err == nil {
			r.Body.Close()
			break
		} else {
			time.Sleep(time.Second)
		}
	}
}

func (conf *httpClientConfig) buildHTTPClient() (*http.Client, error) {
	// Make our own copy of TLS config
	tlsConfig := &tls.Config{}
	if conf.TLSConfig != nil {
		tlsConfig = conf.TLSConfig
	}

	// Make our own copy of HTTP transport
	transport := &http.Transport{}
	if conf.HTTPTransport != nil {
		transport = conf.HTTPTransport
	}

	// Make sure the transport has some things we know we need
	transport.TLSClientConfig = tlsConfig

	if transport.IdleConnTimeout == 0 {
		transport.IdleConnTimeout = time.Second * 600
	}
	if transport.ResponseHeaderTimeout == 0 {
		transport.ResponseHeaderTimeout = time.Second * 600
	}

	// Build the http client
	httpClient := http.Client{Transport: transport}

	return &httpClient, nil
}

func generateCertificate(t *testing.T, certPath string, keyPath string, host string) error {
	priv, err := rsa.GenerateKey(rand.Reader, 2048)
	if err != nil {
		return err
	}

	serialNumber, err := rand.Int(rand.Reader, new(big.Int).Lsh(big.NewInt(1), 128))
	if err != nil {
		return err
	}

	notBefore := time.Now()
	notAfter := notBefore.Add(365 * 24 * time.Hour)

	template := x509.Certificate{
		SerialNumber:          serialNumber,
		NotBefore:             notBefore,
		NotAfter:              notAfter,
		KeyUsage:              x509.KeyUsageKeyEncipherment | x509.KeyUsageDigitalSignature,
		ExtKeyUsage:           []x509.ExtKeyUsage{x509.ExtKeyUsageServerAuth},
		BasicConstraintsValid: true,
		Subject: pkix.Name{
			Organization: []string{"ABC Corp."},
		},
	}

	hosts := strings.Split(host, ",")
	for _, h := range hosts {
		if ip := net.ParseIP(h); ip != nil {
			template.IPAddresses = append(template.IPAddresses, ip)
		} else {
			template.DNSNames = append(template.DNSNames, h)
		}
	}

	template.IsCA = true
	template.KeyUsage |= x509.KeyUsageCertSign

	derBytes, err := x509.CreateCertificate(rand.Reader, &template, &template, &priv.PublicKey, priv)
	if err != nil {
		return err
	}

	certOut, err := os.Create(certPath)
	if err != nil {
		return err
	}
	_ = pem.Encode(certOut, &pem.Block{Type: "CERTIFICATE", Bytes: derBytes})
	certOut.Close()

	keyOut, err := os.OpenFile(keyPath, os.O_WRONLY|os.O_CREATE|os.O_TRUNC, 0600)
	if err != nil {
		return err
	}

	pemBlockForKey := &pem.Block{Type: "RSA PRIVATE KEY", Bytes: x509.MarshalPKCS1PrivateKey(priv)}
	_ = pem.Encode(keyOut, pemBlockForKey)
	keyOut.Close()

	t.Logf("Generated security data: %v|%v|%v", certPath, keyPath, host)
	return nil
}

type tlsTestServer struct {
	url  string
	port int
}

// startTLSTestServer starts a TLS server with conf, filling in its Port and
// cert files, and waits until it is ready. Temporary files and the working
// directory are cleaned up automatically. Start never returns, so the server
// itself keeps running until the test binary exits.
func startTLSTestServer(t *testing.T, conf *Config) tlsTestServer {
	t.Helper()

	testPort, err := getFreePort(testHostname)
	require.NoError(t, err)

	tmpDir := t.TempDir()
	conf.Port = testPort
	conf.CertFile = filepath.Join(tmpDir, "server.cert")
	conf.PrivateKeyFile = filepath.Join(tmpDir, "server.key")
	require.NoError(t, generateCertificate(t, conf.CertFile, conf.PrivateKeyFile, testHostname))

	prepareServerAssets(t)

	go Start(conf)

	srv := tlsTestServer{
		url:  fmt.Sprintf("https://%s:%d", testHostname, testPort),
		port: testPort,
	}
	readyClient := srv.client(t, &tls.Config{})
	require.Eventually(t, func() bool {
		_, err := getRequestResults(t, readyClient, srv.url+"/health")
		return err == nil
	}, 30*time.Second, 50*time.Millisecond, "test https server did not become ready")
	t.Logf("Started test https server: %v", srv.url)

	return srv
}

// client returns a client using a copy of tlsConfig with InsecureSkipVerify.
func (s tlsTestServer) client(t *testing.T, tlsConfig *tls.Config) *http.Client {
	t.Helper()

	tlsConfig = tlsConfig.Clone()
	tlsConfig.InsecureSkipVerify = true
	httpClient, err := (&httpClientConfig{TLSConfig: tlsConfig}).buildHTTPClient()
	require.NoError(t, err)

	return httpClient
}

func TestSecureServerTLS13MinVersion(t *testing.T) {
	srv := startTLSTestServer(t, &Config{TLSMinVersion: tls.VersionTLS13})
	healthURL := srv.url + "/health"

	httpClientTLS13 := srv.client(t, &tls.Config{MinVersion: tls.VersionTLS13})
	_, err := getRequestResults(t, httpClientTLS13, healthURL)
	require.NoError(t, err, "TLS 1.3 client should be able to connect")

	httpClientTLS12 := srv.client(t, &tls.Config{
		MinVersion: tls.VersionTLS10,
		MaxVersion: tls.VersionTLS12,
	})
	_, err = getRequestResults(t, httpClientTLS12, healthURL)
	require.Error(t, err, "TLS 1.2 client should be rejected when server requires TLS 1.3")
}

func TestSecureServerTLS12MaxVersion(t *testing.T) {
	srv := startTLSTestServer(t, &Config{TLSMaxVersion: tls.VersionTLS12})
	healthURL := srv.url + "/health"

	httpClientTLS12 := srv.client(t, &tls.Config{
		MinVersion: tls.VersionTLS12,
		MaxVersion: tls.VersionTLS12,
	})
	_, err := getRequestResults(t, httpClientTLS12, healthURL)
	require.NoError(t, err, "TLS 1.2 client should be able to connect")

	httpClientTLS13 := srv.client(t, &tls.Config{MinVersion: tls.VersionTLS13})
	_, err = getRequestResults(t, httpClientTLS13, healthURL)
	require.ErrorContains(t, err, "tls: protocol version not supported",
		"TLS 1.3 client should be rejected when server allows at most TLS 1.2")
}

func TestSecureServerCipherSuites(t *testing.T) {
	srv := startTLSTestServer(t, &Config{
		TLSCipherSuites: []uint16{tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256},
	})
	healthURL := srv.url + "/health"

	httpClientMatch := srv.client(t, &tls.Config{
		MaxVersion:   tls.VersionTLS12,
		CipherSuites: []uint16{tls.TLS_ECDHE_RSA_WITH_AES_128_GCM_SHA256},
	})
	_, err := getRequestResults(t, httpClientMatch, healthURL)
	require.NoError(t, err, "Client with matching cipher suite should connect")

	httpClientMismatch := srv.client(t, &tls.Config{
		MaxVersion:   tls.VersionTLS12,
		CipherSuites: []uint16{tls.TLS_ECDHE_RSA_WITH_AES_256_GCM_SHA384},
	})
	_, err = getRequestResults(t, httpClientMismatch, healthURL)
	require.Error(t, err, "Client with non-matching cipher suite should be rejected")
}

func TestSecureServerCurvePreferences(t *testing.T) {
	srv := startTLSTestServer(t, &Config{
		TLSCurvePreferences: []tls.CurveID{tls.CurveP384},
	})
	healthURL := srv.url + "/health"

	for _, version := range []uint16{tls.VersionTLS12, tls.VersionTLS13} {
		t.Run(tls.VersionName(version), func(t *testing.T) {
			httpClientP384 := srv.client(t, &tls.Config{
				MinVersion:       version,
				MaxVersion:       version,
				CurvePreferences: []tls.CurveID{tls.CurveP384},
			})
			_, err := getRequestResults(t, httpClientP384, healthURL)
			require.NoError(t, err, "could not connect with allowed curve CurveP384")

			httpClientX25519 := srv.client(t, &tls.Config{
				MinVersion:       version,
				MaxVersion:       version,
				CurvePreferences: []tls.CurveID{tls.X25519},
			})
			// Must be a handshake rejection, not an unrelated failure.
			_, err = getRequestResults(t, httpClientX25519, healthURL)
			require.ErrorContains(t, err, "tls: handshake failure")
		})
	}
}

// TestSecureServerCertRotation verifies that the server dynamically reloads its
// TLS certificate when the cert/key files are replaced on disk, without a pod
// restart. This is the regression test for the cert-rotation bug where
// GetConfigForClient, AddListener, and certKeyPair.Run were not wired up,
// causing the server to serve the initial static cert forever.
//
// The test intentionally connects by IP (no SNI) to exercise the non-SNI code
// path in GetConfigForClient — exactly the path the original bug exposed.
func TestSecureServerCertRotation(t *testing.T) {
	conf := &Config{}
	srv := startTLSTestServer(t, conf)
	httpClient := srv.client(t, &tls.Config{})

	initialSerial, err := getServedCertSerial(testHostname, srv.port)
	require.NoError(t, err)
	t.Logf("Initial cert serial: %X", initialSerial)

	// Replace the cert/key files on disk to simulate certificate rotation.
	err = generateCertificate(t, conf.CertFile, conf.PrivateKeyFile, testHostname)
	require.NoError(t, err)
	t.Logf("Cert/key files replaced on disk")

	// Poll until the server begins serving the new cert. The dynamic controller
	// detects the file change via fsnotify and reloads within a few seconds.
	var rotatedSerial *big.Int
	deadline := time.Now().Add(30 * time.Second)
	for time.Now().Before(deadline) {
		serial, dialErr := getServedCertSerial(testHostname, srv.port)
		if dialErr == nil && serial.Cmp(initialSerial) != 0 {
			rotatedSerial = serial
			break
		}
		time.Sleep(500 * time.Millisecond)
	}

	require.NotNil(t, rotatedSerial, "server must serve the new cert within 30s of file replacement")
	t.Logf("Rotated cert serial: %X", rotatedSerial)

	_, err = getRequestResults(t, httpClient, srv.url+"/health")
	require.NoError(t, err, "server must remain healthy after cert rotation")
}

// getServedCertSerial dials the TLS server at host:port and returns the serial
// number of the presented leaf certificate. Connecting by IP without a
// server-name hint (no SNI) is intentional — this exercises the code path in
// DynamicServingCertificateController.GetConfigForClient that selects the cert
// for clients that omit SNI, which is exactly how in-cluster scanners connect
// to a pod IP directly.
func getServedCertSerial(host string, port int) (*big.Int, error) {
	ctx, cancel := context.WithTimeout(context.Background(), 5*time.Second)
	defer cancel()
	dialer := tls.Dialer{Config: &tls.Config{InsecureSkipVerify: true}} //nolint:gosec
	conn, err := dialer.DialContext(ctx, "tcp", fmt.Sprintf("%s:%d", host, port))
	if err != nil {
		return nil, err
	}
	defer conn.Close()
	certs := conn.(*tls.Conn).ConnectionState().PeerCertificates
	if len(certs) == 0 {
		return nil, fmt.Errorf("no peer certificates presented")
	}
	return certs[0].SerialNumber, nil
}

func TestFilesHandler(t *testing.T) {
	_, thisFile, _, _ := runtime.Caller(0)
	fs := http.Dir(filepath.Join(filepath.Dir(thisFile), "testdata"))
	handler := filesHandler(fs)

	req := httptest.NewRequest("GET", "/index.html", nil)
	w := httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	res := w.Result()
	if res.Header.Get("Cache-Control") != "" {
		t.Errorf("Expected no Cache-Control header, but got %q", res.Header.Get("Cache-Control"))
	}
	if res.Header.Get("Expires") != "" {
		t.Errorf("Expected no Expires header, but got %q", res.Header.Get("Expires"))
	}

	req = httptest.NewRequest("GET", "/plugin-entry.js", nil)
	w = httptest.NewRecorder()
	handler.ServeHTTP(w, req)

	res = w.Result()
	if res.Header.Get("Cache-Control") != "no-cache, no-store, must-revalidate" {
		t.Errorf("Expected Cache-Control header %q, but got %q", "no-cache, no-store, must-revalidate", res.Header.Get("Cache-Control"))
	}
	if res.Header.Get("Expires") != "0" {
		t.Errorf("Expected Expires header %q, but got %q", "0", res.Header.Get("Expires"))
	}
}
