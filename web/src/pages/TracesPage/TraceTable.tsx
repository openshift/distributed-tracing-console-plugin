import React from 'react';
import {
  NoResultsOverlayWithClearFilterButton,
  TraceQueryPanelWrapper,
} from '../../components/PersesWrapper';
import { TraceTable as PersesTraceTable } from '@perses-dev/panels-plugin';

interface TraceTableProps {
  setQuery: (query: string) => void;
}

export function TraceTable({ setQuery }: TraceTableProps) {
  const noResultsOverlay = (
    <NoResultsOverlayWithClearFilterButton onClick={() => setQuery('{}')} />
  );

  return (
    <TraceQueryPanelWrapper noResults={noResultsOverlay}>
      <PersesTraceTable.PanelComponent
        spec={{}}
        {...{ traceLink: traceDetailLink }}
      />
    </TraceQueryPanelWrapper>
  );
}

export function traceDetailLink({ traceId }: { traceId: string }) {
  return `/observe/traces/${traceId}?${new URLSearchParams(
    window.location.search,
  ).toString()}`;
}
