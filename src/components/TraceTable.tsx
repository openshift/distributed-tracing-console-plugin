import React from 'react';
import {
  Table,
  Thead,
  Tr,
  Th,
  Tbody,
  Td,
  TableVariant,
  TableGridBreakpoint,
} from '@patternfly/react-table';
import { useDataQueries } from '@perses-dev/plugin-system';
import {
  Title,
  EmptyState,
  EmptyStateIcon,
} from '@patternfly/react-core';
import CubesIcon from '@patternfly/react-icons/dist/esm/icons/cubes-icon';

import { useTranslation } from 'react-i18next';

export const TraceTable: React.FunctionComponent = () => {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');

  const EmptyTable = () => (
    <EmptyState>
      <EmptyStateIcon icon={CubesIcon} />
      <Title headingLevel="h4" size="lg">
        {t('No Data')}
      </Title>
    </EmptyState>
  );
  
  const LoadingTable = () => (
    <svg
      className="pf-v5-c-spinner"
      role="progressbar"
      viewBox="0 0 100 100"
      aria-label="Loading..."
    >
      <circle
        className="pf-v5-c-spinner__path"
        cx="50"
        cy="50"
        r="45"
        fill="none"
      />
    </svg>
  );

  // Get trace data from Perses's DataQueriesProvider
  const traceData = useDataQueries('TraceQuery');

  if (!traceData?.isLoading && traceData?.queryResults?.length < 1) {
    return <EmptyTable />;
  } else if (traceData?.isLoading) {
    return <LoadingTable />;
  }

  const traces = traceData?.queryResults[0]?.data?.traces;
  if (traces === undefined || traces === null || traces.length < 1) {
    return <EmptyTable />;
  }

  const columnNames = {
    traceId: 'Trace Id',
    durationMs: 'Duration (ms)',
    spanCount: 'Span count',
    errorCount: 'Error count',
    startTime: 'Start time',
  };

  return (
    <Table
      aria-label="traces query result table"
      variant={TableVariant.compact}
      gridBreakPoint={TableGridBreakpoint.none}
      borders={true}
    >
      <Thead>
        <Tr>
          <Th modifier="wrap">{t(columnNames.traceId)}</Th>
          <Th modifier="wrap">{t(columnNames.durationMs)}</Th>
          <Th modifier="wrap">{t(columnNames.spanCount)}</Th>
          <Th modifier="wrap">{t(columnNames.errorCount)}</Th>
          <Th modifier="wrap">{t(columnNames.startTime)}</Th>
        </Tr>
      </Thead>
      <Tbody>
        {traces.map((trace) => (
          <Tr key={trace.traceId}>
            <Td dataLabel={columnNames.traceId}>{trace.traceId}</Td>
            <Td dataLabel={columnNames.durationMs}>{trace.durationMs}</Td>
            <Td dataLabel={columnNames.spanCount}>{trace.spanCount}</Td>
            <Td dataLabel={columnNames.errorCount}>{trace.errorCount}</Td>
            <Td dataLabel={columnNames.startTime}>
              {new Date(trace.startTimeUnixMs).toString()}
            </Td>
          </Tr>
        ))}
      </Tbody>
    </Table>
  );
};
