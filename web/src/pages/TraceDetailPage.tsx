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
import { Link, useLocation, useParams } from 'react-router-dom';
import { TracingGanttChart } from '@perses-dev/panels-plugin';
import {
  PersesDashboardWrapper,
  PersesWrapper,
  TraceQueryPanelWrapper,
} from '../components/PersesWrapper';
import { useDataQueries } from '@perses-dev/plugin-system';
import { useTempoInstance } from '../hooks/useTempoInstance';

interface RouteParams {
  traceId: string;
}

export function linkToTraceDetailPage(traceId: string) {
  // by capturing the entire URL search params, we can provide a breadcrumb to the previous page with the Tempo instance and query filled out
  return `/observe/traces/${traceId}?${new URLSearchParams(window.location.search).toString()}`;
}

export function TraceDetailPage() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const { traceId } = useParams<RouteParams>();
  const [tempo] = useTempoInstance();
  const location = useLocation();

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>
            {t('Trace')} {traceId} · {t('Tracing')}
          </title>
        </Helmet>
      </HelmetProvider>
      <Page>
        <PageSection variant="light">
          <Stack>
            <Breadcrumb>
              <BreadcrumbItem>
                <Link to={`/observe/traces${location.search}`}>{t('Traces')}</Link>
              </BreadcrumbItem>
              <BreadcrumbItem isActive>{t('Trace details')}</BreadcrumbItem>
            </Breadcrumb>

            <PersesWrapper>
              <PersesDashboardWrapper
                tempo={tempo}
                definitions={[{ kind: 'TempoTraceQuery', spec: { query: traceId } }]}
              >
                <Title headingLevel="h1">
                  <TraceTitle />
                </Title>
                <Divider className="pf-v5-u-my-md" />
                <StackItem isFilled>
                  <TraceQueryPanelWrapper>
                    <TracingGanttChart.PanelComponent spec={{}} />
                  </TraceQueryPanelWrapper>
                </StackItem>
              </PersesDashboardWrapper>
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
