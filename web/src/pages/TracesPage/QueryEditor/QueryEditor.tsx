import React, { useCallback, useEffect, useRef, useState } from 'react';
import { Stack, TextInput } from '@patternfly/react-core';
import { Button } from '@patternfly/react-core';
import { TraceQLEditor } from './TraceQLEditor';
import { useTranslation } from 'react-i18next';
import { TempoInstance } from '../../../hooks/useTempoInstance';
import { TempoTraceQuerySpec } from '@perses-dev/tempo-plugin/dist/model/trace-query-model';

interface QueryEditorProps {
  tempo: TempoInstance | undefined;
  query: string;
  limit: number;
  runQuery: (spec: TempoTraceQuerySpec) => void;
}

export const DEFAULT_LIMIT = 20;
const MAX_LIMIT = 10000;

export function QueryEditor({ tempo, query, limit, runQuery }: QueryEditorProps) {
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

  // Using a string state here as users can write arbitrary text in the input field.
  // Only if the validation passes, the value will be converted to a number.
  const [pendingLimit, setPendingLimit] = useState(limit.toString());
  useEffect(() => {
    setPendingLimit(limit.toString());
  }, [limit]);
  // limit must be empty or an integer between 1 and MAX_LIMIT
  const pendingLimitHasError = !(
    pendingLimit === '' ||
    (/^[0-9]+$/.test(pendingLimit) &&
      parseInt(pendingLimit) >= 1 &&
      parseInt(pendingLimit) <= MAX_LIMIT)
  );

  const runPendingQuery = useCallback(() => {
    if (pendingLimitHasError) {
      return;
    }

    runQuery({
      query: pendingQuery.current,
      limit: pendingLimit === '' ? undefined : parseInt(pendingLimit),
    });
  }, [runQuery, pendingLimit, pendingLimitHasError]);

  return (
    <>
      <Stack style={{ flexGrow: 1 }}>
        <label htmlFor="traceql-input">{t('Query')}</label>
        <TraceQLEditor
          tempo={tempo}
          query={query}
          setQuery={setPendingQuery}
          runQuery={runPendingQuery}
        />
      </Stack>
      <Stack>
        <label htmlFor="limit-input">{t('Max Traces')}</label>
        <TextInput
          id="limit-input"
          value={pendingLimit}
          title={
            pendingLimitHasError
              ? t('The number of search results must be between 1 and {{max}}', { max: MAX_LIMIT })
              : ''
          }
          validated={pendingLimitHasError ? 'error' : 'default'}
          onChange={setPendingLimit}
          aria-label="max traces"
          size={5}
        />
      </Stack>
      <Stack style={{ height: 'auto', flexDirection: 'column-reverse' }}>
        <Button variant="primary" onClick={runPendingQuery}>
          {t('Run query')}
        </Button>
      </Stack>
    </>
  );
}
