import React, { useCallback, useEffect, useRef } from 'react';
import { Split, Stack } from '@patternfly/react-core';
import { Button } from '@patternfly/react-core';
import { TraceQLEditor } from './TraceQLEditor';
import { useTranslation } from 'react-i18next';
import { TempoInstance } from '../../../hooks/useTempoInstance';

interface QueryEditorProps {
  tempo: TempoInstance | undefined;
  query: string;
  runQuery: (query: string) => void;
}

export function QueryEditor({ tempo, query, runQuery }: QueryEditorProps) {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');

  // The 'query' prop contains the current executed query.
  // For performance and UX reasons, the search results should not be refreshed on every key press.
  // Also, the query editor should not be re-rendered on every key press.
  // Therefore we create a derived state, 'pendingQuery', which holds the current query from the editor (which may or may have been executed).
  const pendingQuery = useRef<string>(query);
  const setPendingQuery = useCallback((query: string) => {
    pendingQuery.current = query;
  }, []);

  // If the query editor re-renders (for example because of the "Clear all filters" button of the empty results state),
  // sync the pendingQuery with the executed query.
  useEffect(() => {
    pendingQuery.current = query;
  }, [query]);

  const runPendingQuery = useCallback(() => {
    runQuery(pendingQuery.current);
  }, [runQuery]);

  return (
    <Stack>
      <label htmlFor="traceql-input">{t('Query')}</label>
      <Split hasGutter>
        <TraceQLEditor
          tempo={tempo}
          query={query}
          setQuery={setPendingQuery}
          runQuery={runPendingQuery}
        />
        <Button variant="primary" onClick={runPendingQuery}>
          {t('Run query')}
        </Button>
      </Split>
    </Stack>
  );
}
