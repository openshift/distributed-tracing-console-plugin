#!/usr/bin/env bash

set -euo pipefail

# Prerequisites
# 1) AWS CLI. To test try `aws --version`. 
# 2) AWS configurations for `access_key`, `secret_key`, and `region` should be configured.
# This is for the creation of a Secret to access AWS S3 bucket. To test try `aws configure list`.
# 3) OpenShift CLI. To test try `oc version`. 

# Variables
TEMPOSTACK_NS=${TEMPOSTACK_NS:="openshift-tracing"}
BUCKET_NAME=${BUCKET_NAME:="tempo-bucket-openshift-tracing"}
SECRET_NAME=${SECRET_NAME:="tempo-bucket-secret-openshift-tracing"}

# Create AWS bucket 
aws s3api create-bucket --bucket ${BUCKET_NAME}

# Install Tempo Operator Namespace/Project 
oc apply -f - << EOF
apiVersion: project.openshift.io/v1
kind: Project
metadata:
  labels:
    kubernetes.io/metadata.name: openshift-tempo-operator
    openshift.io/cluster-monitoring: "true"
  name: openshift-tempo-operator
EOF

# Install Tempo Operator 
oc apply -f - << EOF
apiVersion: operators.coreos.com/v1
kind: OperatorGroup
metadata:
  name: openshift-tempo-operator
  namespace: openshift-tempo-operator
spec:
  upgradeStrategy: Default
EOF

# Install Tempo Operator Subscription
oc apply -f - << EOF
apiVersion: operators.coreos.com/v1alpha1
kind: Subscription
metadata:
  name: tempo-product
  namespace: openshift-tempo-operator
spec:
  channel: stable
  installPlanApproval: Automatic
  name: tempo-product
  source: redhat-operators
  sourceNamespace: openshift-marketplace
EOF


# Check if Tempo operator is installed
echo "** sleeping for 60s to await Tempo Operator ready status **"
sleep 60
echo "** Checking Tempo Operator Status... **"
oc get csv -n openshift-tempo-operator

# Create TempoStack Namespace/Project 
oc apply -f - << EOF
apiVersion: project.openshift.io/v1
kind: Project
metadata:
  name: ${TEMPOSTACK_NS}
EOF

# Create Secret for AWS Object storage 
oc apply -f - << EOF
apiVersion: v1
kind: Secret
metadata:
  name: ${SECRET_NAME}
  namespace: ${TEMPOSTACK_NS}
stringData:
  endpoint: https://s3.$(aws configure get region).amazonaws.com
  bucket: ${BUCKET_NAME}
  access_key_id: $(aws configure get aws_access_key_id)
  access_key_secret: $(aws configure get aws_secret_access_key)
type: Opaque
EOF

# wait for other components to be ready before continuing
echo "** SECOND CHECK: sleeping for 20s to await Tempo Operator ready status **"
sleep 20
echo "** Checking Tempo Operator Status... **"
oc get csv -n openshift-tempo-operator

# Create TempoStack as Custom Resource 
oc apply -f - <<EOF
apiVersion: tempo.grafana.com/v1alpha1
kind: TempoStack
metadata:
  name: simplest
  namespace: ${TEMPOSTACK_NS}
spec:
  storage:
    secret:
      name: ${SECRET_NAME}
      type: s3
  storageSize: 1Gi
  resources:
    total:
      limits:
        memory: 4Gi
        cpu: 4000m
  template:
    queryFrontend:
      jaegerQuery:
        enabled: true
        ingress:
          route:
            termination: edge
          type: route
EOF


oc apply -f - <<EOF
apiVersion: batch/v1
kind: Job
metadata:
  name: generate-traces
  namespace: ${TEMPOSTACK_NS}
spec:
  template:
    spec:
      restartPolicy: Never
      containers:
      - name: tracegen
        image: ghcr.io/grafana/xk6-client-tracing:v0.0.2
        env:
        - name: ENDPOINT
          value: otel-collector:4317
EOF


# Will need to add sleep here too 
echo "** sleeping for 60s to await TempoStack ready status **"
sleep 60
echo "** continuing... ** "

# Go to Jaeger UI 
export TEMPO_URL=$(oc get route -n ${TEMPOSTACK_NS} tempo-simplest-query-frontend -o jsonpath='{.spec.host}')
echo "Opening TEMPO_URL: $TEMPO_URL"
open https://$TEMPO_URL
