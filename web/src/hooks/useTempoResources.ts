import * as React from 'react';
import { cancellableFetch, FetchError } from '../cancellable-fetch';
import { BACKEND_URL } from './api';

/**
 * Definition of a TempoStack or TempoMonolithic Custom Resource in the cluster.
 * This is different from TempoInstance, which represents a selected Tempo instance including the tenant.
 */
export type TempoResource = {
  kind: 'TempoStack' | 'TempoMonolithic';
  namespace: string;
  name: string;
  /** list of tenants for multi-tenant instances, undefined for single-tenant instances */
  tenants?: string[];
};

interface ListTempoResourcesResponse {
  status: 'success' | 'error';
  data: TempoResource[];
  errorType?: string;
  error?: string;
}

const isTempoStackListResponse = (value: unknown): value is TempoResource => {
  const obj = value as TempoResource;
  return (
    obj.namespace !== undefined &&
    typeof obj.namespace === 'string' &&
    obj.name !== undefined &&
    typeof obj.name === 'string'
  );
};

export const useTempoResources = () => {
  const [tempoResources, setTempoResources] = React.useState<Array<TempoResource>>();
  const [error, setError] = React.useState<{ errorType?: string; error: string } | undefined>();
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { request } = cancellableFetch<ListTempoResourcesResponse>(
          `${BACKEND_URL}/api/v1/list-tempo-resources`,
        );
        const response = await request();

        if (
          response &&
          response.status === 'success' &&
          Array.isArray(response.data) &&
          response.data.every(isTempoStackListResponse)
        ) {
          setTempoResources(response.data);
          setError(undefined);
        } else {
          throw new FetchError('Error retrieving Tempo resources', 500, response);
        }
      } catch (e) {
        setTempoResources(undefined);
        if (e instanceof FetchError && e.json?.error) {
          setError(e.json);
        } else {
          setError({ error: String(e) });
        }
        console.error(e);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    loading,
    error,
    tempoResources,
  };
};
