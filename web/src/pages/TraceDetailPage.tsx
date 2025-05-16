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
import {
  PersesDashboardWrapper,
  PersesTempoDatasourceWrapper,
  PersesWrapper,
  PersesPanelPluginWrapper,
} from '../components/PersesWrapper';
import { otlpcommonv1 } from '@perses-dev/core';
import { useDataQueries } from '@perses-dev/plugin-system';
import { useTempoInstance } from '../hooks/useTempoInstance';
import { TracingGanttChart } from '@perses-dev/tracing-gantt-chart-plugin';

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
              <PersesDashboardWrapper>
                <PersesTempoDatasourceWrapper
                  tempo={tempo}
                  queries={[{ kind: 'TempoTraceQuery', spec: { query: traceId } }]}
                >
                  <PageTitle />
                  <Divider className="pf-v5-u-my-md" />
                  <StackItem isFilled>
                    <PersesPanelPluginWrapper
                      plugin={TracingGanttChart}
                      spec={{ visual: { palette: { mode: 'categorical' } } }}
                      attributeLinks={attributeLinks}
                    />
                  </StackItem>
                </PersesTempoDatasourceWrapper>
              </PersesDashboardWrapper>
            </PersesWrapper>
          </Stack>
        </PageSection>
      </Page>
    </>
  );
}

function PageTitle() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const traceName = useTraceName();

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>
            {t('Trace')} {traceName} · {t('Tracing')}
          </title>
        </Helmet>
      </HelmetProvider>
      <Title headingLevel="h1">{traceName}</Title>
    </>
  );
}

function useTraceName(): string {
  const { traceId } = useParams<RouteParams>();
  const { queryResults } = useDataQueries('TraceQuery');
  const trace = queryResults[0]?.data?.trace;

  for (const resourceSpan of trace?.resourceSpans ?? []) {
    for (const scopeSpan of resourceSpan.scopeSpans) {
      for (const span of scopeSpan.spans) {
        if (!span.parentSpanId) {
          // found a root span, look for service name attribute
          for (const attr of resourceSpan.resource?.attributes ?? []) {
            if (attr.key === 'service.name' && 'stringValue' in attr.value) {
              return `${attr.value.stringValue}: ${span.name}`;
            }
          }
        }
      }
    }
  }

  // return traceId if span is not loaded or root span is not found
  return traceId ?? '';
}

const sval = (val?: otlpcommonv1.AnyValue) =>
  val && 'stringValue' in val ? encodeURIComponent(val.stringValue) : '';

const attributeLinks: Record<string, (attrs: Record<string, otlpcommonv1.AnyValue>) => string> = {
  'k8s.namespace.name': (attrs) => `/k8s/cluster/namespaces/${sval(attrs['k8s.namespace.name'])}`,
  'k8s.node.name': (attrs) => `/k8s/cluster/nodes/${sval(attrs['k8s.node.name'])}`,
  'k8s.deployment.name': (attrs) =>
    `/k8s/ns/${sval(attrs['k8s.namespace.name'])}/deployments/${sval(
      attrs['k8s.deployment.name'],
    )}`,
  'k8s.pod.name': (attrs) =>
    `/k8s/ns/${sval(attrs['k8s.namespace.name'])}/pods/${sval(attrs['k8s.pod.name'])}`,
};
