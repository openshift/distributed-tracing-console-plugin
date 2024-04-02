import { Stack, StackItem } from '@patternfly/react-core';
import { TextInput, Button } from '@patternfly/react-core';
import { TraceTable } from './TraceTable';
import { ScatterChart } from '@perses-dev/panels-plugin';
import React from 'react';

import './TraceQueryBrowser.css';

export default function TraceQueryBrowser({ setQuery }) {
  // Use ref to prevent reload on each key tap in TraceQL input box
  const ref = React.useRef<HTMLInputElement>(null);

  return (
    <Stack hasGutter>
      <StackItem className="query-browser-stack">
        <ScatterChart.PanelComponent
          contentDimensions={{
            width: 1100,
            height: 400,
          }}
          spec={{
            legend: {
              position: 'bottom',
              size: 'medium',
            },
          }}
        />
      </StackItem>
      <StackItem>
        <div className="pf-v5-l-grid">
          <div className="pf-v5-l-grid__item pf-m-10-col">
            <TextInput aria-label="trace query input" ref={ref} type="text" />
          </div>
          <div className="pf-v5-l-grid__item pf-m-2-col">
            <Button
              aria-label="trace query button"
              className="query-browser-input-button"
              variant="primary"
              onClick={() => {
                setQuery(ref.current.value);
              }}
            >
              Run Query
            </Button>
          </div>
        </div>
      </StackItem>
      <StackItem>
        <TraceTable />
      </StackItem>
    </Stack>
  );
}
