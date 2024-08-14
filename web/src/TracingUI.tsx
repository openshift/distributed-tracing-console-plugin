import React, { memo } from 'react';
import { Switch, Route } from 'react-router-dom';
import { TraceDetailPage } from './pages/TraceDetailPage';
import { TracesPage } from './pages/TracesPage/TracesPage';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouter5Adapter } from 'use-query-params/adapters/react-router-5';

function TracingUI() {
  return (
    <QueryParamProvider adapter={ReactRouter5Adapter}>
      <Switch>
        <Route path="/observe/traces" exact component={TracesPage} />
        <Route path="/observe/traces/:traceId" exact component={TraceDetailPage} />
      </Switch>
    </QueryParamProvider>
  );
}

// without memoization, TracingUI is rendered twice on every URL change
export default memo(TracingUI);
