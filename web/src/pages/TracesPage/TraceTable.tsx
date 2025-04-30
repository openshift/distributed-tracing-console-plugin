import React from 'react';
import { TraceQueryPanelWrapper } from '../../components/PersesWrapper';
import { TraceTable as PersesTraceTable } from '@perses-dev/panels-plugin';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { linkToTraceDetailPage } from '../../links';
import './TraceTable.css';
import { TempoTraceQuerySpec } from '@perses-dev/tempo-plugin';

interface TraceTableProps {
  runQuery: (spec: TempoTraceQuerySpec) => void;
}

export function TraceTable({ runQuery }: TraceTableProps) {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');

  const noResults = (
    <EmptyState titleText={t('No results found')} headingLevel="h4" icon={SearchIcon}>
      <EmptyStateBody>
        {t('No results match this query criteria. Clear all filters and try again.')}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant="link" onClick={() => runQuery({ query: '{}' })}>
            {t('Clear all filters')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );

  return (
    <TraceQueryPanelWrapper noResults={noResults}>
      <div className="dt-plugin-trace-table">
        <PersesTraceTable.PanelComponent
          spec={{ visual: { palette: { mode: 'categorical' } } }}
          traceLink={traceDetailLink}
        />
      </div>
    </TraceQueryPanelWrapper>
  );
}

export function traceDetailLink({ traceId }: { traceId: string }) {
  return linkToTraceDetailPage(traceId);
}
