# Tracing Console Plugin

This is an OpenShift Console dynamic plugin that adds UI for tracing. This can be found in the OpenShift UI in the navigation bar under `Observe > Traces`.

## Development

### Option 1: Local

**Prerequisite** </br>
You need to have
- a OpenShift Cluster.
- a [Tempo](https://grafana.com/oss/tempo/) instance.

The current `start-console.sh` script is configured to proxy to a local tempo instance at http://localhost:3200.
To change this to a different endpoint modify this line:

```
# start-console.sh

# Replace <NewEndpoint> (e.g., replace 'http://localhost:3200' with 'http://example-tempo-instance.com')
    ...
    --env BRIDGE_PLUGIN_PROXY='{"services": [{"consoleAPIPath": "/api/proxy/plugin/distributed-tracing-plugin/backend/", "endpoint": <NewEndpoint> ,"authorize":true}]}' \
    ...
```

**Instructions to start the plugin** </br>
In one terminal window, run:

1. `yarn install`
2. `yarn run start`

In another terminal window, run:

1. `oc login` Login to your OpenShift Cluster (requires [oc](https://console.redhat.com/openshift/downloads) and an [OpenShift cluster](https://console.redhat.com/openshift/create))
2. `yarn run start-console` (requires [Docker](https://www.docker.com) or [podman 3.2.0+](https://podman.io))

This will run the OpenShift console in a container connected to the cluster
you've logged into. The plugin HTTP server runs on port 9001 with CORS enabled.
Navigate to <http://localhost:9000/example> to see the running plugin.


#### Running start-console with Apple silicon and podman

If you are using podman on a Mac with Apple silicon, `yarn run start-console`
might fail since it runs an amd64 image. You can workaround the problem with
[qemu-user-static](https://github.com/multiarch/qemu-user-static) by running
these commands:

```bash
podman machine ssh
sudo -i
rpm-ostree install qemu-user-static
systemctl reboot
```

### Option 2: Docker + VSCode Remote Container

Make sure the
[Remote Containers](https://marketplace.visualstudio.com/items?itemName=ms-vscode-remote.remote-containers)
extension is installed. This method uses Docker Compose where one container is
the OpenShift console and the second container is the plugin. It requires that
you have access to an existing OpenShift cluster. After the initial build, the
cached containers will help you start developing in seconds.

1. Create a `dev.env` file inside the `.devcontainer` folder with the correct values for your cluster:

```bash
OC_PLUGIN_NAME=my-plugin
OC_URL=https://api.example.com:6443
OC_USER=kubeadmin
OC_PASS=<password>
```

2. `(Ctrl+Shift+P) => Remote Containers: Open Folder in Container...`
3. `yarn run start`
4. Navigate to <http://localhost:9000/example>

## Docker image

Before you can deploy your plugin on a cluster, you must build an image and
push it to an image registry.

1. Build the image:

   ```sh
   docker build -t quay.io/my-repositroy/my-plugin:latest -f Dockerfile.dev .
   ```

2. Run the image:

   ```sh
   docker run -it --rm -d -p 9001:80 quay.io/my-repository/my-plugin:latest
   ```

3. Push the image:

   ```sh
   docker push quay.io/my-repository/my-plugin:latest
   ```

NOTE: If you have a Mac with Apple silicon, you will need to add the flag
`--platform=linux/amd64` when building the image to target the correct platform
to run in-cluster.

For development purposes you can modify the ./script/build-dev-images.sh script to point to your repository. In the variable `REGISTRY_ORG="${REGISTRY_ORG:-<my-repositroy>}"` change `<your-repository>` to the name of your quay.io repository. For example, `REGISTRY_ORG="${REGISTRY_ORG:-janesmith}"`.

## Deployment on cluster

A [Helm](https://helm.sh) chart is available to deploy the plugin to an OpenShift environment.

The following Helm parameters are required:

`plugin.image`: The location of the image containing the plugin that was previously pushed

Additional parameters can be specified if desired. Consult the chart [values](charts/openshift-console-plugin/values.yaml) file for the full set of supported parameters.

### Installing the Helm Chart

Install the chart using the name of the plugin as the Helm release name into a new namespace or an existing namespace as specified by the `my-plugin-namespace` parameter and providing the location of the image within the `plugin.image` parameter by using the following command:

```shell
helm upgrade -i distributed-tracing-console-plugin charts/distributed-tracing-console-plugin -n <my-plugin-namespace> --create-namespace --set plugin.image=<my-plugin-image-location>
```

For example,
`helm upgrade -i distributed-tracing-console-plugin charts/distributed-tracing-console-plugin -n distributed-tracing-console-plugin --create-namespace --set plugin.image=quay.io/jezhu/distributed-tracing-console-plugin:dev`. <br/>

NOTE: When deploying on OpenShift 4.10, it is recommended to add the parameter `--set plugin.securityContext.enabled=false` which will omit configurations related to Pod Security.

## Linting

This project adds prettier, eslint, and stylelint. Linting can be run with
`yarn run lint`.

The stylelint config disallows hex colors since these cause problems with dark
mode (starting in OpenShift console 4.11). You should use the
[PatternFly global CSS variables](https://patternfly-react-main.surge.sh/developer-resources/global-css-variables#global-css-variables)
for colors instead.

The stylelint config also disallows naked element selectors like `table` and
`.pf-` or `.co-` prefixed classes. This prevents plugins from accidentally
overwriting default console styles, breaking the layout of existing pages. The
best practice is to prefix your CSS classnames with your plugin name to avoid
conflicts. Please don't disable these rules without understanding how they can
break console styles!

## Testing

This project includes comprehensive end-to-end testing using Cypress and Chainsaw. Tests validate the plugin functionality, RBAC scenarios, and multi-tenancy configurations. For detailed testing instructions, see [tests/README.md](tests/README.md).

## Reporting

Steps to generate reports

1. In command prompt, navigate to root folder and execute the command `yarn run cypress-merge`
2. Then execute command `yarn run cypress-generate`
   The cypress-report.html file is generated and should be in (/integration-tests/screenshots) directory

## More about Dynamic Plugins on OpenShift

This plugin was forked from [OpenShift Console Plugin Template](https://github.com/openshift/console-plugin-template).

[Dynamic plugins](https://github.com/openshift/console/tree/master/frontend/packages/console-dynamic-plugin-sdk)
allow you to extend the
[OpenShift UI](https://github.com/openshift/console)
at runtime, adding custom pages and other extensions. They are based on
[webpack module federation](https://webpack.js.org/concepts/module-federation/).
Plugins are registered with console using the `ConsolePlugin` custom resource
and enabled in the console operator config by a cluster administrator.

Using the latest `v1` API version of `ConsolePlugin` CRD, requires OpenShift 4.12
and higher. For using old `v1alpha1` API version us OpenShift version 4.10 or 4.11.

For an example of a plugin that works with OpenShift 4.11, see the `release-4.11` branch.
For a plugin that works with OpenShift 4.10, see the `release-4.10` branch.

[Node.js](https://nodejs.org/en/) and [yarn](https://yarnpkg.com) are required
to build and run the example. To run OpenShift console in a container, either
[Docker](https://www.docker.com) or [podman 3.2.0+](https://podman.io) and
[oc](https://console.redhat.com/openshift/downloads) are required.

## How to Add Pages and Tabs to the Console Plugin

The [example](https://github.com/openshift/console-plugin-template) below adds a single example page in the Home navigation section.

1. Expose modules in [package.json](package.json):

```json
"consolePlugin": {
  "name": "my-plugin",
  "version": "0.0.1",
  "displayName": "My Plugin",
  "description": "Enjoy this shiny, new console plugin!",
  "exposedModules": {
    "ExamplePage": "./components/ExamplePage"
  },
  "dependencies": {
    "@console/pluginAPI": "*"
  }
}
```

2. The extension is declared in the [console-extensions.json](https://github.com/openshift/console-plugin-template/blob/main/console-extensions.json)
   file.

```json
[
  {
    "type": "console.page/route",
    "properties": {
      "exact": true,
      "path": "/example",
      "component": { "$codeRef": "ExamplePage" }
    }
  },
  {
    "type": "console.navigation/href",
    "properties": {
      "id": "example",
      "name": "Plugin Example",
      "href": "/example",
      "perspective": "admin",
      "section": "home"
    }
  }
]
```

4. And the React component is declared in
   [src/components/ExamplePage.tsx](https://github.com/openshift/console-plugin-template/blob/main/src/components/ExamplePage.tsx).

You can run the plugin using a local development environment or build an image
to deploy it to a cluster.

## References

- [Console Plugin Template](https://github.com/openshift/console-plugin-template)
- [Console Plugin SDK README](https://github.com/openshift/console/tree/master/frontend/packages/console-dynamic-plugin-sdk)
- [Customization Plugin Example](https://github.com/spadgett/console-customization-plugin)
- [Dynamic Plugin Enhancement Proposal](https://github.com/openshift/enhancements/blob/master/enhancements/console/dynamic-plugins.md)
