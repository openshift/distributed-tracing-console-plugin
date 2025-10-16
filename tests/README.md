# Openshift Distributed Tracing UI Plugin Tests
These console tests install the Openshift Cluster Observability Operator with the Distributed Tracing UI Plugin, Tempo and OpenTelemetry Operators in the specified cluster and then run a series of tests against the UI.

## Prerequisite
1. [node.js](https://nodejs.org/) >= 18
2. [chainsaw](https://kyverno.github.io/chainsaw/latest/quick-start/install/) >= v0.2.12


## Install dependencies
All required dependencies are defined in `package.json` in order to run Cypress tests, run `npm install` so that dependencies will be installed in `node_modules` folder
```bash
$ npm install
$ ls -ltr
node_modules/     -> dependencies will be installed at runtime here
```

## Directory structure
After dependencies are installed successfully and before we run actual tests, please confirm if we have correct structure as below.
```bash
tree -L 1
.
├── CLAUDE.md
├── cypress
├── cypress.config.ts
├── Dockerfile
├── Dockerfile-cypress
├── e2e
├── fixtures
├── node_modules
├── package-lock.json
├── package.json
├── PATTERNFLY_COMMANDS_EXAMPLES.md
├── README.md
├── reporter-config.json
├── SELECTOR_BEST_PRACTICES.md
├── tsconfig.json
└── views

6 directories, 11 files
````

### Export necessary variables
in order to run Cypress tests, we need to export some environment variables that Cypress can read then pass down to our tests, currently we have following environment variables defined and used.

Using a non-admin user.
```bash
export CYPRESS_BASE_URL=https://<console_route_spec_host>
export CYPRESS_LOGIN_IDP=flexy-htpasswd-provider
export CYPRESS_LOGIN_USERS=username:password
export CYPRESS_KUBECONFIG_PATH=~/Downloads/kubeconfig
```
Using kubeadmin user.
```bash
export CYPRESS_BASE_URL=https://<console_route_spec_host>
export CYPRESS_LOGIN_IDP=kube:admin
export CYPRESS_LOGIN_USERS=kubeadmin:password
export CYPRESS_KUBECONFIG_PATH=~/Downloads/kubeconfig
```

Set the var to skip Cluster Observability and all the required operators installation.
```bash
export CYPRESS_SKIP_COO_INSTALL=true
```

Set the var to install Cluster Observability, OpenTelemetry and Tempo operators from redhat-operators catalog source.
```bash
export CYPRESS_COO_UI_INSTALL=true
```

Set the var to install Cluster Observability Operator using Konflux bundle. Tempo and OpenTelemetry operators will be installed from redhat-operators catalog source.
```bash
export CYPRESS_KONFLUX_COO_BUNDLE_IMAGE=<COO image>
```
Set the var to use custom Cluster Observability Operator bundle image. Tempo and OpenTelemetry operators will be installed from redhat-operators catalog source.
```bash
export CYPRESS_CUSTOM_COO_BUNDLE_IMAGE=<COO bundle image>
```

Set the following var to use custom Distributed Tracing UI plugin image. The image will be patched in Cluster Observability Operator CSV.
```bash
export CYPRESS_DT_CONSOLE_IMAGE=<console image>
```

Set the following var to specify a custom namespace for the Cluster Observability Operator installation. If not set, defaults to `openshift-cluster-observability-operator`.
```bash
export CYPRESS_COO_NAMESPACE=<custom-namespace>
```

### Start Cypress
We can either open Cypress GUI(open) or run Cypress in headless mode(run) to run the tests.
```bash
npx cypress open
npx cypress run

# Run specific test files
npx cypress run --spec "e2e/dt-plugin-tests.cy.ts"

# Skip debug files during CI runs
npx cypress run --ignore-pattern "**/*debug*.cy.ts"
```

## Test Architecture & Best Practices

### Custom Commands
This project includes a comprehensive set of custom Cypress commands optimized for PatternFly and Material-UI components. These commands provide:

- **Semantic selectors** instead of brittle CSS selectors
- **Component-aware interactions** for PatternFly elements
- **Bulk validation** for trace attributes (75% code reduction)
- **Debug-friendly** commands with built-in logging

### Key Command Categories

#### PatternFly Components
```typescript
// Menu interactions
cy.pfMenuToggle('Select Instance').click()
cy.pfSelectMenuItem('tempo-stack').click()
cy.pfCheckMenuItem('service-name')

// Navigation
cy.pfBreadcrumb('Traces').click()
cy.pfButton('Create').click()
cy.pfCloseButton('Close dialog').click()

// Form controls
cy.pfTypeahead('Select a Tempo instance').click()
cy.pfMenuToggleByLabel('Multi typeahead').click()
```

#### Trace & Observability
```typescript
// Trace interactions
cy.muiFirstTraceLink().click()
cy.muiTraceLink('http-service').click()
cy.muiSpanBar('grpc-service').click()

// Attribute validation (bulk)
cy.muiTraceAttributes({
  'service.name': { value: 'my-service' },
  'network.peer.address': { value: '1.2.3.4' },
  'k8s.namespace': { value: 'test-ns', optional: true }
})
```

### Debug Testing
A debug test file (`dt-plugin-tests-debug.cy.ts.skip`) is available for rapid iteration without setup/teardown overhead. To use:

```bash
# Enable debug test
mv tests/e2e/dt-plugin-tests-debug.cy.ts.skip tests/e2e/dt-plugin-tests-debug.cy.ts

# Run debug test only
npx cypress run --spec "e2e/dt-plugin-tests-debug.cy.ts"

# Disable debug test
mv tests/e2e/dt-plugin-tests-debug.cy.ts tests/e2e/dt-plugin-tests-debug.cy.ts.skip
```

### Chainsaw RBAC Testing
Chainsaw tests in `fixtures/chainsaw-tests/` validate operator permissions and multi-tenancy scenarios:

- **Multitenancy RBAC**: Tests for role-based access control across multiple tenants
- **Monolithic Multitenancy RBAC**: Tests for RBAC in monolithic deployment scenarios  
- **HotRod Integration**: Automatic deployment and trace generation using the Jaeger HotRod example application for comprehensive testing

These tests ensure that the distributed tracing plugin works correctly with different RBAC configurations and deployment models, supporting both upstream and downstream environments.

### Documentation
- **CLAUDE.md** - Guidance for Claude AI assistance with this codebase
- **SELECTOR_BEST_PRACTICES.md** - Comprehensive selector guidelines and command usage
- **PATTERNFLY_COMMANDS_EXAMPLES.md** - Complete command examples and workflows
- **README.md** - This file with setup and architecture overview
