package main

import (
	"os"
	"testing"

	"github.com/stretchr/testify/require"
)

func TestMergeEnvValueSlice(t *testing.T) {
	tests := []struct {
		name     string
		envKey   string
		envValue string
		flag     string
		expected []string
	}{
		{
			name:     "flag set takes priority over env",
			envKey:   "TEST_CIPHER_SUITES",
			envValue: "TLS_AES_128_GCM_SHA256",
			flag:     "TLS_AES_256_GCM_SHA384",
			expected: []string{"TLS_AES_256_GCM_SHA384"},
		},
		{
			name:     "env used when flag is empty",
			envKey:   "TEST_CIPHER_SUITES",
			envValue: "TLS_AES_128_GCM_SHA256,TLS_AES_256_GCM_SHA384",
			flag:     "",
			expected: []string{"TLS_AES_128_GCM_SHA256", "TLS_AES_256_GCM_SHA384"},
		},
		{
			name:     "nil when both empty",
			envKey:   "TEST_CIPHER_SUITES",
			envValue: "",
			flag:     "",
			expected: nil,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			if tt.envValue != "" {
				os.Setenv(tt.envKey, tt.envValue)
				defer os.Unsetenv(tt.envKey)
			}
			result := mergeEnvValueSlice(tt.envKey, tt.flag)
			require.Equal(t, tt.expected, result)
		})
	}
}
