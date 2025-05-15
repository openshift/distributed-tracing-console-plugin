import { TempoDatasource } from '@perses-dev/tempo-plugin';
import { useQuery } from '@tanstack/react-query';
import { TempoInstance } from './useTempoInstance';
import { getProxyURLFor } from './api';

export function useTagValues(
  tempo: TempoInstance | undefined,
  tag: string,
  query: string,
  enabled: boolean,
  start?: number,
  end?: number,
) {
  return useQuery({
    queryKey: ['useTagValues', tempo, tag, query, start, end],
    enabled,
    queryFn: async function () {
      if (!tempo) return [];
      const client = TempoDatasource.createClient({ directUrl: getProxyURLFor(tempo) }, {});
      const values = await client.searchTagValues({ tag, q: query, start, end });
      return values.tagValues
        .map((tagValue) => ({
          content: tagValue.value,
          value: tagValue.value,
        }))
        .sort((a, b) => a.value.localeCompare(b.value));
    },
    staleTime: 60 * 1000, // cache tag value response for 1m
  });
}
