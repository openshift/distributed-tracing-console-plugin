# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Test Directory Overview

This is the test directory for the OpenShift Distributed Tracing UI Plugin, containing end-to-end tests using Cypress and Chainsaw for testing the plugin integration with OpenShift Console.

## Common Commands

### Running Tests
```bash
# Install dependencies
npm install

# Open Cypress GUI for interactive testing
npx cypress open

# Run tests in headless mode
npx cypress run

# Run specific test file
npx cypress run --spec "e2e/dt-plugin-tests.cy.ts"

# Skip debug files during CI runs
npx cypress run --ignore-pattern "**/*debug*.cy.ts"

# Lint tests
npm run lint

# Fix linting issues
npm run lint-fix
```

### Environment Setup
Required environment variables for test execution:
```bash
export CYPRESS_BASE_URL=https://<console_route_spec_host>
export CYPRESS_LOGIN_IDP=flexy-htpasswd-provider  # or kube:admin
export CYPRESS_LOGIN_USERS=username:password
export CYPRESS_KUBECONFIG_PATH=~/Downloads/kubeconfig

# Optional: Skip operator installation
export CYPRESS_SKIP_COO_INSTALL=true

# Optional: Use UI installation
export CYPRESS_COO_UI_INSTALL=true

# Optional: Use custom COO bundle image
export CYPRESS_CUSTOM_COO_BUNDLE_IMAGE=<image>

# Optional: Use custom console image
export CYPRESS_DT_CONSOLE_IMAGE=<image>

# Optional: Use custom Lightspeed console plugin image
export CYPRESS_LIGHTSPEED_CONSOLE_IMAGE=<lightspeed-console-image>

# Optional: Custom namespace (defaults to openshift-cluster-observability-operator)
export CYPRESS_COO_NAMESPACE=<namespace>

# Lightspeed integration (Chainsaw tests in fixtures/lightspeed/)
export CYPRESS_LIGHTSPEED_PROVIDER_URL=<lightspeed-provider-url>
export CYPRESS_LIGHTSPEED_PROVIDER_TOKEN=<lightspeed-api-token>
```

## Architecture

### Test Structure
- **e2e/**: Contains main test files (`dt-plugin-tests.cy.ts`)
- **cypress/**: Cypress configuration and support files with custom commands
- **views/**: Page objects for different UI sections (pages.ts, search.ts, tour.ts, utils.ts)
- **fixtures/**: Test data including Chainsaw RBAC tests and operator configurations
- **gui_test_screenshots/**: Test artifacts and screenshots

### Key Components

#### Custom Commands
The test suite includes comprehensive PatternFly-aware custom commands:
- **PatternFly selectors**: `cy.pfMenuToggle()`, `cy.pfMenuItem()`, `cy.pfButton()`
- **Trace testing**: `cy.muiTraceLink()`, `cy.muiSpanBar()`, `cy.muiTraceAttributes()`
- **Bulk validation**: Commands for validating multiple trace attributes efficiently
- **Chainsaw integration**: `cy.runChainsawTest(testDirs, description, options?)` runs chainsaw tests from Cypress; accepts a single directory name, an array of directories, or full paths starting with `./`; supports optional `timeout` and `extraArgs`
- **Trace UI verification**: `cy.verifyTracesVisible(tempoInstance, tenant)` navigates to traces page and asserts traces are visible for the given Tempo instance and tenant
- **OCP compatibility**: `cy.dismissWelcomeModal()` handles the OCP 4.22+ "Welcome to the new OpenShift experience!" modal overlay

#### Test Types
1. **Cypress E2E Tests**: Main UI automation testing the plugin functionality (11 tests covering empty state, trace visualization, RBAC, trace limits, cutoff box, AI analysis, TraceQL queries, custom time range, scatter plot, attribute-based filtering, TLS profiles, and operator installation). Validated on OCP 4.22 nightly.
2. **Chainsaw Tests**: Kubernetes-native testing for RBAC, TLS profiles, and operator behavior
3. **Debug Tests**: Rapid iteration tests without full setup/teardown

### Operator Testing
Tests install and verify four main operators:
- **Cluster Observability Operator (COO)**: Main plugin operator
- **OpenTelemetry Operator**: Telemetry data collection
- **Tempo Operator**: Trace storage and query
- **Lightspeed Operator**: AI-powered trace analysis and insights

### Test Configuration
- **cypress.config.ts**: Main Cypress configuration with custom browser settings
- **reporter-config.json**: Multi-reporter configuration for test results
- **tsconfig.json**: TypeScript configuration for test files

## Development Guidelines

### Adding New Tests
1. Use custom PatternFly commands for UI interactions
2. Follow selector best practices documented in SELECTOR_BEST_PRACTICES.md
3. Use page objects in `views/` directory for reusable UI interactions
4. Add test-specific data to `fixtures/` directory

### Debug Testing
Enable debug test file for rapid development:
```bash
mv e2e/dt-plugin-tests-debug.cy.ts.skip e2e/dt-plugin-tests-debug.cy.ts
```

### RBAC Testing
Chainsaw tests in `fixtures/chainsaw-tests/` validate operator permissions and multi-tenancy scenarios.

### TLS Profile Testing
Chainsaw tests in `fixtures/chainsaw-tests/tls-profile-*` verify the plugin backend's TLS min version and cipher suite configuration. The tests use a `tls-scanner` pod (nmap/openssl) to scan the plugin's port 9443 and verify the advertised TLS versions and cipher suites match the configured profile. The operator is scaled down during testing to prevent reconciliation of manual deployment patches.

Profiles tested: Intermediate (default), Modern (TLS 1.3 only), Custom cipher suites, Old (TLS 1.0+).

Shared helpers live in `fixtures/chainsaw-tests/tls-profile/tls-helpers.sh`. Each profile is a separate chainsaw test directory invoked via `cy.runChainsawTest()` from the Cypress `[Capability:TLSProfile]` test, with `cy.verifyTracesVisible()` called after each to confirm the UI still works.

## Cypress MCP Setup

The Cypress MCP server provides Claude Code with tools to run Cypress tests, manage spec files, and automate browsers. To set it up:

### 1. Clone the cypress-mcp repository
```bash
cd ~
git clone git@github.com:yashpreetbathla/cypress-mcp.git
```

### 2. Install dependencies and build
```bash
cd ~/cypress-mcp
npm install
npm run build
```

### 3. Install Playwright Chromium (one-time, for browser automation tools)
```bash
npx playwright install chromium
```

### 4. Install Chromium for cypress-mcp's playwright-core version
```bash
cd ~/cypress-mcp
node node_modules/playwright-core/cli.js install chromium
```

### 5. Configure MCP server
Create `.mcp.json` in the project root (`distributed-tracing-console-plugin/.mcp.json`):
```json
{
  "mcpServers": {
    "cypress": {
      "command": "node",
      "args": ["<home>/cypress-mcp/dist/index.js", "--project", "<project-root>/tests"]
    }
  }
}
```
Replace `<home>` with your home directory path and `<project-root>` with the absolute path to the distributed-tracing-console-plugin repository. The `--project` flag points to `tests/` where `cypress.config.ts` and the spec files live.

### 6. Restart Claude Code
Restart Claude Code to activate the MCP server. You will be prompted to approve the `cypress` server on first launch.

### Notes
- `.mcp.json` lives in the project root so it is picked up automatically without needing to change directories.
- `.mcp.json` contains local absolute paths and is already listed in `.gitignore`.

## Documentation
- **SELECTOR_BEST_PRACTICES.md**: Comprehensive selector guidelines
- **PATTERNFLY_COMMANDS_EXAMPLES.md**: Custom command examples and workflows
- **README.md**: Detailed setup and environment configuration