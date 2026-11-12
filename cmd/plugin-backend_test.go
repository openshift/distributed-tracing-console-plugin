package main

import (
	"crypto/tls"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestMergeEnvValue(t *testing.T) {
	tests := []struct {
		name     string
		envValue string
		flag     string
		expected string
	}{
		{name: "flag set takes priority over env", envValue: "VersionTLS12", flag: "VersionTLS13", expected: "VersionTLS13"},
		{name: "env used when flag is empty", envValue: "VersionTLS13", flag: "", expected: "VersionTLS13"},
		{name: "default when both empty", envValue: "", flag: "", expected: "default"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Setenv("TEST_MERGE_ENV_VALUE", tt.envValue)
			require.Equal(t, tt.expected, mergeEnvValue("TEST_MERGE_ENV_VALUE", tt.flag, "default"))
		})
	}
}

func TestMergeEnvValueInt(t *testing.T) {
	tests := []struct {
		name     string
		envValue string
		flag     int
		expected int
	}{
		{name: "flag set takes priority over env", envValue: "9002", flag: 9003, expected: 9003},
		{name: "env used when flag is unset", envValue: "9002", flag: 0, expected: 9002},
		{name: "default when both unset", envValue: "", flag: 0, expected: 9443},
		{name: "default when env is not a number", envValue: "not-a-port", flag: 0, expected: 9443},
		{name: "default when env is zero", envValue: "0", flag: 0, expected: 9443},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			t.Setenv("TEST_MERGE_ENV_VALUE_INT", tt.envValue)
			require.Equal(t, tt.expected, mergeEnvValueInt("TEST_MERGE_ENV_VALUE_INT", tt.flag, 9443))
		})
	}
}

func TestParseTLSMaxVersion(t *testing.T) {
	tests := []struct {
		input    string
		expected uint16
	}{
		{input: "", expected: 0},
		{input: "VersionTLS12", expected: tls.VersionTLS12},
		{input: "VersionTLS13", expected: tls.VersionTLS13},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			version, err := parseTLSMaxVersion(tt.input)
			require.NoError(t, err)
			require.Equal(t, tt.expected, version)
		})
	}
}

func TestParseTLSMaxVersionFails(t *testing.T) {
	for _, input := range []string{"TLSv1.3", "versiontls13", "VersionTLS14"} {
		t.Run(input, func(t *testing.T) {
			version, err := parseTLSMaxVersion(input)
			require.Error(t, err)
			require.Zero(t, version)
			// The raw input must not be echoed; the valid values are listed instead.
			require.NotContains(t, err.Error(), input)
			require.ErrorContains(t, err, "VersionTLS12")
			require.ErrorContains(t, err, "VersionTLS13")
		})
	}
}
