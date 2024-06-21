import * as React from 'react';
import { cancellableFetch } from '../cancellable-fetch';

type TempoStackListResponse = {
  namespace: string;
  name: string;
};

const backendURL =
  '/api/proxy/plugin/distributed-tracing-console-plugin/backend/api/v1/list-tempostacks';

export const useTempoStack = () => {
  const [tempoStackList, setTempoStackList] = React.useState<
    Array<TempoStackListResponse>
  >([]);
  const [loading, setLoading] = React.useState<boolean>(false);

  React.useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);

        const { request } =
          cancellableFetch<TempoStackListResponse[]>(backendURL);

        const response: Array<TempoStackListResponse> = await request();

        setTempoStackList(response);
      } catch (error) {
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
