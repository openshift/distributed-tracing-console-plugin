FROM registry.redhat.io/ubi8/nodejs-18:latest AS web-builder

WORKDIR /opt/app-root

USER 0

COPY web/package*.json web/
COPY Makefile Makefile
RUN make install-frontend-ci-clean

COPY web/ web/
RUN make build-frontend

FROM brew.registry.redhat.io/rh-osbs/openshift-golang-builder:rhel_9_golang_1.23 as go-builder

WORKDIR /opt/app-root

COPY Makefile Makefile
COPY go.mod go.mod
COPY go.sum go.sum

RUN go mod download

COPY cmd/ cmd/
COPY pkg/ pkg/

ENV GOEXPERIMENT=strictfipsruntime
ENV CGO_ENABLED=1

RUN make build-backend BUILD_OPTS="-tags strictfipsruntime"

FROM registry.access.redhat.com/ubi9/ubi-minimal

COPY --from=web-builder /opt/app-root/web/dist /opt/app-root/web/dist
COPY --from=go-builder /opt/app-root/plugin-backend /opt/app-root

ENTRYPOINT ["/opt/app-root/plugin-backend", "-static-path", "/opt/app-root/web/dist", "-config-path", "/opt/app-root/web/dist"]
