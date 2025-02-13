#!/usr/bin/env bash

set -euo pipefail

CONSOLE_IMAGE=${CONSOLE_IMAGE:="quay.io/openshift/origin-console:latest"}
CONSOLE_PORT=${CONSOLE_PORT:=9000}
CONSOLE_IMAGE_PLATFORM=${CONSOLE_IMAGE_PLATFORM:="linux/amd64"}

echo "Starting local OpenShift console..."

BRIDGE_USER_AUTH="disabled"
BRIDGE_K8S_MODE="off-cluster"
BRIDGE_K8S_AUTH="bearer-token"
BRIDGE_K8S_MODE_OFF_CLUSTER_SKIP_VERIFY_TLS=true
BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT=$(oc whoami --show-server)
# The monitoring operator is not always installed (e.g. for local OpenShift). Tolerate missing config maps.
set +e
BRIDGE_K8S_MODE_OFF_CLUSTER_THANOS=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.thanosPublicURL}' 2>/dev/null)
BRIDGE_K8S_MODE_OFF_CLUSTER_ALERTMANAGER=$(oc -n openshift-config-managed get configmap monitoring-shared-config -o jsonpath='{.data.alertmanagerPublicURL}' 2>/dev/null)
set -e
BRIDGE_K8S_AUTH_BEARER_TOKEN=$(oc whoami --show-token 2>/dev/null)
BRIDGE_USER_SETTINGS_LOCATION="localstorage"

npm_package_consolePlugin_name='distributed-tracing-console-plugin'

# Don't fail if the cluster doesn't have gitops.
set +e
GITOPS_HOSTNAME=$(oc -n openshift-gitops get route cluster -o jsonpath='{.spec.host}' 2>/dev/null)
set -e
if [ -n "$GITOPS_HOSTNAME" ]; then
    BRIDGE_K8S_MODE_OFF_CLUSTER_GITOPS="https://$GITOPS_HOSTNAME"
fi

echo "API Server: $BRIDGE_K8S_MODE_OFF_CLUSTER_ENDPOINT"
echo "Console Image: $CONSOLE_IMAGE"
echo "Console URL: http://localhost:${CONSOLE_PORT}"
echo "npm_package_consolePlugin_name : ${npm_package_consolePlugin_name}"

# Prefer podman if installed. Otherwise, fall back to docker.
if [ -x "$(command -v podman)" ]; then
    if [ "$(uname -s)" = "Linux" ]; then
        # Use host networking on Linux since host.containers.internal is unreachable in some environments.
        BRIDGE_PLUGINS="${npm_package_consolePlugin_name}=http://localhost:9001"
        podman run --pull always \
        --rm --network=host \
        --platform $CONSOLE_IMAGE_PLATFORM \
        --env-file <(set | grep BRIDGE) \
        --env BRIDGE_PLUGIN_PROXY='{"services": [{"consoleAPIPath": "/api/proxy/plugin/distributed-tracing-console-plugin/backend/", "endpoint":"http://localhost:9002","authorize":true}, {"consoleAPIPath": "/api/plugins/distributed-tracing-console-plugin/api/v1/list-tempostacks", "endpoint":"http://localhost:9002/api/v1/list-tempostacks","authorize":true}]}' \
        $CONSOLE_IMAGE
    else
        BRIDGE_PLUGINS="${npm_package_consolePlugin_name}=http://host.containers.internal:9001"
        podman run \
        --pull always \
        --platform $CONSOLE_IMAGE_PLATFORM \
        --rm -p "$CONSOLE_PORT":9000 \
        --env-file <(set | grep BRIDGE)  \
        --env BRIDGE_PLUGIN_PROXY='{"services": [{"consoleAPIPath": "/api/proxy/plugin/distributed-tracing-console-plugin/backend/", "endpoint":"http://host.containers.internal:9002","authorize":true}, {"consoleAPIPath": "/api/plugins/distributed-tracing-console-plugin/api/v1/list-tempostacks", "endpoint":"http://host.containers.internal:9002/api/v1/list-tempostacks","authorize":true}]}' \
        $CONSOLE_IMAGE
    fi
else
    BRIDGE_PLUGINS="${npm_package_consolePlugin_name}=http://host.docker.internal:9001"
    docker run \
    --pull always \
    --platform $CONSOLE_IMAGE_PLATFORM \
    --rm -p "$CONSOLE_PORT":9000 \
    --env-file <(set | grep BRIDGE) \
    --env BRIDGE_PLUGIN_PROXY='{"services": [{"consoleAPIPath": "/api/proxy/plugin/distributed-tracing-console-plugin/backend/", "endpoint":"https://host.docker.internal:9002","authorize":true},{"consoleAPIPath": "/api/plugins/distributed-tracing-console-plugin/api/v1/list-tempostacks", "endpoint":"https://host.docker.internal:9002/api/v1/list-tempostacks","authorize":true}]}' \
    $CONSOLE_IMAGE 
fi
