.PHONY: install-frontend
install-frontend:
	cd web && npm install

.PHONY: install-frontend-ci
install-frontend-ci:
	cd web && npm ci

.PHONY: install-frontend-ci-clean
install-frontend-ci-clean: install-frontend-ci
	cd web && npm cache clean --force

.PHONY: build-frontend
build-frontend:
	cd web && npm run build

.PHONY: start-frontend
start-frontend:
	cd web && npm run start

.PHONY: start-console
start-console:
	./scripts/start-console.sh

.PHONY: lint-frontend
lint-frontend:
	cd web && npm run lint

.PHONY: install-backend
install-backend:
	go mod download

.PHONY: test-unit-backend
test-unit-backend:
	go test ./...

.PHONY: build-backend
build-backend:
	go build -o plugin-backend cmd/plugin-backend.go

.PHONY: start-backend
start-backend:
	go run ./cmd/plugin-backend.go -port='9002' -config-path='./web/dist' -static-path='./web/dist'

.PHONY: start-backend-k8
start-backend-k8:
	./scripts/start-backend.sh

.PHONY: build-image
build-image:install
	./scripts/build-image.sh

.PHONY: build-dev-image
build-dev-image:
	./scripts/build-dev-image.sh

.PHONY: install
install: install-frontend install-backend
