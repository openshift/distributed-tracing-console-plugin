# Terminal output colors
GREEN='\033[0;32m'
ENDCOLOR='\033[0m' # No Color
RED='\033[0;31m'

# Environment Variables
PREFER_PODMAN="${PREFER_PODMAN:-0}"
PUSH="${PUSH:-1}"
TAG="${TAG:-dev}"
REGISTRY_ORG="${REGISTRY_ORG:-jezhu}"
BASE_IMAGE="quay.io/${REGISTRY_ORG}/distributed-tracing-console-plugin"
IMAGE=${BASE_IMAGE}:${TAG}

printf "${GREEN}Environment Varibles ${ENDCOLOR}\n"
printf "PREFER_PODMAN = ${PREFER_PODMAN}\n"
printf "PUSH = ${PUSH}\n"
printf "TAG = ${TAG}\n"
printf "REGISTRY_ORG = ${REGISTRY_ORG}\n"
printf "IMAGE = ${IMAGE}\n"

# User Input to confirm environment variables before proceeding.
read -p "$(printf "Do these env variables look right? (Y/N): ")" confirm && [[ $confirm == [yY] || $confirm == [yY][eE][sS] ]] || exit 1

if [[ -x "$(command -v podman)" && $PREFER_PODMAN == 1 ]]; then
    OCI_BIN="podman"
else
    OCI_BIN="docker"
fi

echo "Building image '${IMAGE}' with ${OCI_BIN}"
$OCI_BIN build -t $IMAGE --platform=linux/amd64 -f Dockerfile.dev .

if [[ $PUSH == 1 ]]; then
    echo "Pushing to registry with ${OCI_BIN}"
    $OCI_BIN push $IMAGE
fi

export DISTRIBUTED_TRACING_CONSOLE_PLUGIN_DEV_IMAGE=${IMAGE}
echo "Your newly built image has been exported as the variable: \n DISTRIBUTED_TRACING_CONSOLE_PLUGIN_DEV_IMAGE = ${DISTRIBUTED_TRACING_CONSOLE_PLUGIN_DEV_IMAGE}"
