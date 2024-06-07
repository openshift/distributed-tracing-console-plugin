# Color variables for console output 
GREEN='\033[0;32m'
ENDCOLOR='\033[0m' # No Color
RED='\033[0;31m'

# Creates a output to title each sub-action
add_title()
{
  eval title="$1"
  echo "${GREEN} *** ${title} *** ${ENDCOLOR}\n" 
  echo
}

# 1. Apply all the K8 Resources needed to deploy distributed-tracing-console-plugin on a cluster 
title1="Deploy K8 resources for distritributed-tracing-console-plugin"
add_title "\${title1}"

oc apply -f ./distributed-tracing-console-plugin-resources.yaml

echo

# 2. Deploy TempoStack Operator and one TempoStack instance 
title2="Deploy K8 resources for TempoStack Operator and TempoStack Instance"
add_title "\${title2}"

./deploy-tempostack.sh

echo

# 3. Deploy Red Hat build of OpenTelemetry 
# https://docs.openshift.com/container-platform/4.15/observability/otel/otel-installing.html

./deploy-otel-all.sh

# 3. Once deployed, patch the Console operator config to enable the plugin.
# This determines what plugins the console is looking for. 
title3="Patch Console Operator "
add_title "\${title3}"

# FOR FUTURE ENHANCEMENT: Retrieve current plugins and append `distributed-tracing-console-plugin`. 
# because we are replacing the current array with this one. So all current plugins will be removed
# until operator reconciles all plugins. 
oc patch consoles.operator.openshift.io cluster \
  --patch '{ "spec": { "plugins": ["distributed-tracing-console-plugin"] } }' --type=merge

echo

# 4. Open Openshift Console
title4="Opening web browser to Openshift console "
add_title "\${title4}"

oc login --token=$(oc whoami --show-token) --server=$(oc whoami --show-server)
open $(oc whoami --show-console)
