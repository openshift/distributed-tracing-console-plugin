package api

import (
	"testing"

	"github.com/stretchr/testify/require"
	"k8s.io/apimachinery/pkg/apis/meta/v1/unstructured"
)

func TestReadStatusFromCR(t *testing.T) {
	tests := []struct {
		name            string
		status          map[string]interface{}
		expectedReady   bool
		expectedMessage string
	}{
		{
			name:          "no status (not reconciled yet)",
			status:        nil,
			expectedReady: false,
		},
		{
			name:          "no conditions",
			status:        map[string]interface{}{"conditions": []interface{}{}},
			expectedReady: false,
		},
		{
			name: "ready",
			status: map[string]interface{}{"conditions": []interface{}{
				map[string]interface{}{"type": "Pending", "status": "False", "message": "some components pending"},
				map[string]interface{}{"type": "Ready", "status": "True", "message": "all components are up"},
			}},
			expectedReady: true,
		},
		{
			name: "pending",
			status: map[string]interface{}{"conditions": []interface{}{
				map[string]interface{}{"type": "Ready", "status": "False", "message": "all components are up"},
				map[string]interface{}{"type": "Pending", "status": "True", "message": "some components pending"},
			}},
			expectedReady:   false,
			expectedMessage: "some components pending",
		},
		{
			name: "configuration error",
			status: map[string]interface{}{"conditions": []interface{}{
				map[string]interface{}{"type": "ConfigurationError", "status": "True", "message": "invalid storage secret"},
			}},
			expectedReady:   false,
			expectedMessage: "invalid storage secret",
		},
		{
			name: "active condition without message",
			status: map[string]interface{}{"conditions": []interface{}{
				map[string]interface{}{"type": "Failed", "status": "True"},
			}},
			expectedReady:   false,
			expectedMessage: "",
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			cr := &unstructured.Unstructured{Object: map[string]interface{}{}}
			if tt.status != nil {
				cr.Object["status"] = tt.status
			}

			ready, message := readStatusFromCR(cr)
			require.Equal(t, tt.expectedReady, ready)
			require.Equal(t, tt.expectedMessage, message)
		})
	}
}
