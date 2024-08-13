import React from 'react';
import { TextInput } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';

interface TraceQLEditorProps {
  query: string;
  setQuery: (query: string) => void;
}

export function TraceQLEditor({ query, setQuery }: TraceQLEditorProps) {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const placeholder = t('TraceQL Query');

  return (
    <TextInput
      id="traceql-input"
      aria-label="trace query input"
      placeholder={placeholder}
      value={query}
      onChange={setQuery}
    />
  );
}
