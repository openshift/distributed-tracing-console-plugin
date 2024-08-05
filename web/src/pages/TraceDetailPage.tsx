import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Divider,
  Page,
  PageSection,
  Stack,
  StackItem,
  Title,
} from '@patternfly/react-core';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { Link, useParams } from 'react-router-dom';
import { TracingGanttChart } from '@perses-dev/panels-plugin';
import { PersesWrapper } from '../components/PersesWrapper';
import { useDataQueries } from '@perses-dev/plugin-system';
import { ErrorBoundary } from '@perses-dev/components';
import { ErrorAlert } from '../components/ErrorAlert';

interface RouteParams {
  traceId: string;
}

export function TraceDetailPage() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const { traceId } = useParams<RouteParams>();

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>
            {traceId} · {t('Tracing')}
          </title>
        </Helmet>
      </HelmetProvider>
      <Page>
        <PageSection variant="light">
          <Stack>
            <Breadcrumb>
              <BreadcrumbItem>
                <Link to="/observe/traces">{t('Traces')}</Link>
              </BreadcrumbItem>
              <BreadcrumbItem isActive>{t('Trace details')}</BreadcrumbItem>
            </Breadcrumb>

            <PersesWrapper
              queries={[{ kind: 'TempoTraceQuery', spec: { query: traceId } }]}
            >
              <Title headingLevel="h1">
                <TraceTitle />
              </Title>
              <Divider className="pf-v5-u-my-md" />
              <StackItem isFilled>
                <ErrorBoundary FallbackComponent={ErrorAlert}>
                  <TracingGanttChart.PanelComponent spec={{}} />
                </ErrorBoundary>
              </StackItem>
            </PersesWrapper>
          </Stack>
        </PageSection>
      </Page>
    </>
  );
}

function TraceTitle() {
  const { traceId } = useParams<RouteParams>();
  const { queryResults } = useDataQueries('TraceQuery');
  const trace = queryResults[0]?.data?.trace;

  if (!trace) {
    return <>{traceId}</>;
  }
  return (
    <>
      {trace.rootSpan.resource.serviceName}: {trace.rootSpan.name}
    </>
  );
}
