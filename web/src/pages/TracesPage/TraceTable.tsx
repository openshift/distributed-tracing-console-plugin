import React from 'react';
import { PersesPanelPluginWrapper } from '../../components/PersesWrapper';
import { TraceTable as PersesTraceTable } from '@perses-dev/trace-table-plugin';
import {
  Button,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
} from '@patternfly/react-core';
import { SearchIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { linkToTraceDetailPage } from '../../links';
import './TraceTable.css';

interface TraceTableProps {
  setQuery: (query: string) => void;
}

export function TraceTable({ setQuery }: TraceTableProps) {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');

  const noResults = (
    <EmptyState>
      <EmptyStateHeader
        titleText={t('No results found')}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={SearchIcon} />}
      />
      <EmptyStateBody>
        {t('No results match this query criteria. Clear all filters and try again.')}
      </EmptyStateBody>
      <EmptyStateFooter>
        <EmptyStateActions>
          <Button variant="link" onClick={() => setQuery('{}')}>
            {t('Clear all filters')}
          </Button>
        </EmptyStateActions>
      </EmptyStateFooter>
    </EmptyState>
  );

  return (
    <div className="dt-plugin-trace-table">
      <PersesPanelPluginWrapper
        plugin={PersesTraceTable}
        noResults={noResults}
        spec={{ visual: { palette: { mode: 'categorical' } } }}
        traceLink={traceDetailLink}
      />
    </div>
  );
}

export function traceDetailLink({ traceId }: { traceId: string }) {
  return linkToTraceDetailPage(traceId);
}
