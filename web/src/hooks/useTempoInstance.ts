import { useMemo } from 'react';
import { useQueryParams } from './useQueryParams';

/** a selected Tempo instance, including the tenant for multi-tenant instances */
export interface TempoInstance {
  namespace: string;
  name: string;
  tenant: string | undefined;
}

export function useTempoInstance(): [
  TempoInstance | undefined,
  (tempo: TempoInstance | undefined) => void,
] {
  const [queryParams, setQueryParams] = useQueryParams({
    namespace: undefined,
    name: undefined,
    tenant: undefined,
  });

  // either return a fully populated TempoInstance if all required params are set, or undefined
  const tempo = useMemo(() => {
    return queryParams.namespace && queryParams.name
      ? {
          namespace: queryParams.namespace,
          name: queryParams.name,
          tenant: queryParams.tenant,
        }
      : undefined;
  }, [queryParams]);

  const setTempo = (tempo: TempoInstance | undefined) => {
    if (tempo) {
      setQueryParams(tempo);
    } else {
      setQueryParams({
        namespace: undefined,
        name: undefined,
        tenant: undefined,
      });
    }
  };

  return [tempo, setTempo];
}
