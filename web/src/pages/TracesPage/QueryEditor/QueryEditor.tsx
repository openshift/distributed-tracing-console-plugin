import React, { useEffect, useState } from 'react';
import { Split } from '@patternfly/react-core';
import { Button } from '@patternfly/react-core';
import { TraceQLEditor } from './TraceQLEditor';

interface QueryEditorProps {
  query: string;
  setQuery: (query: string) => void;
}

export function QueryEditor(props: QueryEditorProps) {
  // Parent query will be updated only on "run query" click, not on every change
  const [pendingQuery, setPendingQuery] = useState(props.query);

  // Propagate query state down from parent element,
  // but not up (only on "Run query" button click).
  useEffect(() => {
    setPendingQuery(props.query);
  }, [props.query]);

  return (
    <Split hasGutter>
      <TraceQLEditor query={pendingQuery} setQuery={setPendingQuery} />
      <Button
        variant="primary"
        aria-label="run query"
        onClick={() => props.setQuery(pendingQuery)}
      >
        Run Query
      </Button>
    </Split>
  );
}
