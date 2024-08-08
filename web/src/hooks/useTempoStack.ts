import * as React from 'react';
import { cancellableFetch } from '../cancellable-fetch';

type TempoStackListResponse = {
  namespace: string;
  name: string;
};

const backendURL =
  '/api/proxy/plugin/distributed-tracing-console-plugin/backend/api/v1/list-tempostacks';

const isTempoStackListResponse = (value: unknown): value is TempoStackListResponse => {
  const obj = value as TempoStackListResponse;
  return (
    obj.namespace !== undefined &&
    typeof obj.namespace === 'string' &&
    obj.name !== undefined &&
    typeof obj.name === 'string'
  );
};

export const useTempoStack = () => {
  const [tempoStackList, setTempoStackList] = React.useState<Array<TempoStackListResponse>>([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { request } = cancellableFetch<TempoStackListResponse[]>(backendURL);

        const response: Array<TempoStackListResponse | undefined | null> = await request();

        if (response && Array.isArray(response) && response.every(isTempoStackListResponse)) {
          setTempoStackList(response);
        } else {
          throw new Error('Invalid TempoStackList response');
        }
      } catch (error) {
        setTempoStackList([]);
        console.error(error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  return {
    loading,
    tempoStackList,
  };
};
