import React, { useEffect, useState } from 'react';
import { Split, Stack } from '@patternfly/react-core';
import { Button } from '@patternfly/react-core';
import { TraceQLEditor } from './TraceQLEditor';
import { useTranslation } from 'react-i18next';

interface QueryEditorProps {
  query: string;
  runQuery: (query: string) => void;
}

export function QueryEditor(props: QueryEditorProps) {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  // Parent query will be updated only on "run query" click, not on every change
  const [pendingQuery, setPendingQuery] = useState(props.query);

  // Propagate query state down from parent element,
  // but not up (only on "Run query" button click).
  useEffect(() => {
    setPendingQuery(props.query);
  }, [props.query]);

  return (
    <Stack>
      <label htmlFor="traceql-input">{t('Query')}</label>
      <Split hasGutter>
        <TraceQLEditor query={pendingQuery} setQuery={setPendingQuery} />
        <Button variant="primary" onClick={() => props.runQuery(pendingQuery)}>
          {t('Run query')}
        </Button>
      </Split>
    </Stack>
  );
}
