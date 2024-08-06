import * as React from 'react';
import { Switch, Route } from 'react-router-dom';
import { TraceDetailPage } from './pages/TraceDetailPage';
import { TracesPage } from './pages/TracesPage';

export default function TracingUI() {
  return (
    <Switch>
      <Route path="/observe/traces" exact component={TracesPage} />
      <Route
        path="/observe/traces/:traceId"
        exact
        component={TraceDetailPage}
      />
    </Switch>
  );
}
