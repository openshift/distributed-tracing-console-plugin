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
import { PersesWrapper, TraceQueryPanelWrapper } from '../components/PersesWrapper';
import { useDataQueries } from '@perses-dev/plugin-system';
import { useTempoInstance } from '../hooks/useTempoInstance';

interface RouteParams {
  traceId: string;
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

            <PersesWrapper
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
