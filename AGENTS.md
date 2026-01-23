# AGENTS.md

This file provides guidance for AI assistents when working with code in this repository.

## Project Overview

This is the **Distributed Tracing Console Plugin** for OpenShift, a hybrid web application with React frontend and Go backend that adds distributed tracing UI capabilities to the OpenShift console. The plugin integrates with Perses for trace data visualization.

## Architecture

The project follows a plugin architecture for OpenShift console:

- **Frontend (`web/`)**: React TypeScript application using PatternFly UI and Perses components
- **Backend (`pkg/`)**: Go HTTP server providing API endpoints and proxying requests to Tempo

### Key Components

- **QueryBrowser**: Main interface for searching and viewing traces
- **TraceDetailPage**: Detailed view of individual traces

## Development Commands

### Development Servers
```bash
make start-frontend     # Start webpack dev server (port 9001)
make start-backend      # Start Go backend (port 9002)
make start-console      # Start OpenShift console with plugin (port 9000)
```

The `start-console` script requires:
- Active OpenShift cluster connection (`oc` CLI configured)
- Podman or Docker installed
- Sets up console with plugin proxy configuration

### Formatting and Linting
```bash
cd web && npm run lint  # Format the frontend code and run linters
```

### Update language strings
```bash
cd web && npm run i18n  # Update translation strings in web/locales folder
```

### Building
```bash
make build-frontend     # Build React app to web/dist
make build-backend      # Compile Go binary to plugin-backend
make build-image        # Build container image
```

### Testing
```bash
# Backend
make test-unit-backend    # Go unit tests
```

### Single Test Execution
```bash
# Frontend unit tests
cd web && npx jest src/components/ComponentName.test.tsx

# Backend unit tests
go test ./pkg -run TestSpecificFunction
```

## Important Development Details

### Plugin Configuration
- Plugin metadata defined in `web/package.json` under `consolePlugin` section
- Exposed modules: TracesPage and TraceDetailPage
- Plugin name: `distributed-tracing-console-plugin`

### Development Workflow
1. Frontend runs on port 9001 (webpack dev server)
2. Backend runs on port 9002 (Go HTTP server)
3. Console runs on port 9000 with plugin proxy configuration
4. Plugin proxy routes `/api/proxy/plugin/distributed-tracing-console-plugin/backend/` to backend

### Key Dependencies
- **Frontend**: React 17, TypeScript, PatternFly, @perses-dev components
- **Backend**: Gorilla Mux, Kubernetes client-go, Logrus logging
- **Testing**: Jest, Cypress, Go testing package

### Internationalization
- Uses react-i18next for i18n support
- Build i18n resources with `npm run i18n`
- Namespace: `plugin__distributed-tracing-console-plugin`

### Console Integration Notes
- Requires OpenShift console dynamic plugin SDK
- Uses console API proxy for backend communication
