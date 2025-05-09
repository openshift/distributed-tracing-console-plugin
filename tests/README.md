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
% ls -ltr tests
drwxr-xr-x  views
-rw-r--r--  reporter-config.json
-rw-r--r--  package.json
drwxr-xr-x  node_modules
drwxr-xr-x  cypress
-rw-r--r--  cypress.config.ts
-rw-r--r--  README.md
drwxr-xr-x  tests
-rw-r--r--  tsconfig.json
drwxr-xr-x  fixtures
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

### Start Cypress
We can either open Cypress GUI(open) or run Cypress in headless mode(run) to run the tests.
```bash
npx cypress open
npx cypress run
```
