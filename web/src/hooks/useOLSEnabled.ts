import { useK8sWatchResource } from '@openshift-console/dynamic-plugin-sdk';

export function useOLSEnabled(): boolean {
  const [, loaded, err] = useK8sWatchResource({
    groupVersionKind: {
      group: 'ols.openshift.io',
      version: 'v1alpha1',
      kind: 'OLSConfig',
    },
    name: 'cluster',
    isList: false,
  });

  return loaded && !err;
}
