# Hack 

## Prerequisites
 1) AWS CLI. To test try `aws --version`. 
 2) AWS configurations for `access_key`, `secret_key`, and `region` should be configured.
 This is for the creation of a Secret to access AWS S3 bucket. To test try `aws configure list`.
 3) OpenShift CLI. To test try `oc version`. 
 4) An OpenShift cluster that you're signed into. To test try `open $(oc whoami --show-console)`.

## Deploy Test Instance 
1. Build your image and push to an image repository, like quay.io. <br/>
There is a `make` command that will build your image and push to quay.io. Below is an example how to use the command with environemnt variables. The script can be found in `/scripts/build-dev-image.sh`.
```
$ PUSH=true REGISTRY_ORG=<my-repository> make build-dev-image
```
Replace <my-repository> with the name of your image repository. <br/>
The `make build-dev-image` will produce an image with the following name:tag `quay.io/<my-repository>/distributed-tracing-console-plugin:dev`. For example `quay.io/janesmith/distributed-tracing-console-plugin:dev`. You will need this in the next step.

2. In the file `distributed-tracing-console-plugin-resources.yaml` > `kind: Deployment` > `spec.template.spec.containers.image`
replace <my-repository> with the name of your image repository (e.g. `quay.io/janesmith/distributed-tracing-console-plugin:dev`)

```
apiVersion: apps/v1
kind: Deployment
metadata:
  name: distributed-tracing-console-plugin
  ...
spec:
  template:
    spec:
      containers:
        - name: distributed-tracing-console-plugin
          image: "quay.io/<my-repository>/distributed-tracing-console-plugin:dev"
```

3. Run `./deploy-test-instance.sh`

The script will open two pages on your web browser 
1) Jaeger UI -- to confirm traces are being forwarded 
2) OpenShift Console 

Note: If you wish to adjust the AWS bucket name, change the variable 'BUCKET_NAME' in the file `./deploy-tempostack.sh`

## Appendix: What is being deployed? 
1. Resources to run the distributed-tracing-console-plugin 
    - Deployment 
    - Service 
    - Custom Resource: ConsolePlugin
    - ConfigMap 
2. TempoStack 
    - Operator 
    - Deployment   
    - Auth : ServiceAccount, ClusterRole, ClusterRoleBinding  
    - Job (to forward traces to OpenTelemetry Collector)
2. OpenTelemetry 
    - Operator 
    - Collector    
    - Auth : ServiceAccount, ClusterRole, ClusterRoleBinding  

## Testing http.HandlerFunc locally 
The example code below show sample code on how to create a `config` locally vs. in a cluster. 

```
# server.go
import (
	"k8s.io/client-go/rest"
	"k8s.io/client-go/tools/clientcmd"
)

func TempoStackHandler(cfg *Config) http.HandlerFunc {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// For testing LOCALLY
		 config, err := clientcmd.BuildConfigFromFlags("", "/Users/jezhu/.kube/config")
		 if err != nil {
		 	w.Write([]byte("[]"))
		 	log.WithError(err).Errorf("config error")
		  return
		}

		// For PRODUCTION on a cluster 
		config, err := rest.InClusterConfig()
		if err != nil {
			log.WithError(err).Error("cannot get in cluster config")
			return
		}
    ...
  })
}
```