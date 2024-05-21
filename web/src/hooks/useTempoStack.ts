import * as React from 'react';
import { cancellableFetch } from '../cancellable-fetch';

type TempoStackListResponse = {
  namespace: string;
  name: string;
}

export const useTempoStack = () => {
  const [tempoStackList, setTempoStackList] = React.useState<
  Array<TempoStackListResponse>
>([]);

  React.useEffect(() => {
    const fetchData = async () => {
      const { request } = cancellableFetch<TempoStackListResponse[]>(
        `/api/plugins/distributed-tracing-console-plugin/api/v1/list-tempostacks`,
      );

      let response: Array<TempoStackListResponse> = [];
      response = await request();

      setTempoStackList(response)
    }
    fetchData()
      .catch(console.error);
  }, [])

  return {
    tempoStackList,
  };
};
