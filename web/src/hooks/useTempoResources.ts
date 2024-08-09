import * as React from 'react';
import { cancellableFetch } from '../cancellable-fetch';
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
  const [tempoResources, setTempoResources] = React.useState<Array<TempoResource>>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { request } = cancellableFetch<TempoResource[]>(
          `${BACKEND_URL}/api/v1/list-tempo-resources`,
        );

        const response: Array<TempoResource | undefined | null> = await request();

        if (response && Array.isArray(response) && response.every(isTempoStackListResponse)) {
          setTempoResources(response);
        } else {
          throw new Error('Invalid TempoResource response');
        }
      } catch (error) {
        setTempoResources([]);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    loading,
    tempoResources,
  };
};
