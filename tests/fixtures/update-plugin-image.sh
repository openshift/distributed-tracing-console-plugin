#!/bin/bash

# Generate a random filename
RANDOM_FILE="/tmp/coo_tracing_csv_$(date +%s%N).yaml"

COO_CSV_NAME=$(oc get csv --kubeconfig "${KUBECONFIG}" --namespace="${DTP_NAMESPACE}" | grep "cluster-observability-operator" | awk '{print $1}')

oc get csv "${COO_CSV_NAME}" -n "${DTP_NAMESPACE}" -o yaml > "${RANDOM_FILE}" --kubeconfig "${KUBECONFIG}"

sed -i "s#value: .*distributed-tracing-console-plugin.*#value: ${DT_CONSOLE_IMAGE}#g" "${RANDOM_FILE}"

oc apply -f "${RANDOM_FILE}" --kubeconfig "${KUBECONFIG}"

oc wait --for=condition=ready pod -l app.kubernetes.io/instance=distributed-tracing -n "${DTP_NAMESPACE}" --timeout=60s --kubeconfig "${KUBECONFIG}"
oc wait --for=condition=ready pod -l app.kubernetes.io/name=observability-operator -n "${DTP_NAMESPACE}" --timeout=60s --kubeconfig "${KUBECONFIG}"