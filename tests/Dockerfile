# This Dockerfile is used by OpenShift CI for running the Distributed Tracing UI plugin tests
FROM quay.io/redhat-distributed-tracing-qe/cypress-base:latest

# Copy current context and set working directory
COPY . /tmp/distributed-tracing-console-plugin
RUN chmod -R 777 /tmp/distributed-tracing-console-plugin
WORKDIR /tmp/distributed-tracing-console-plugin/tests
