import * as React from 'react';
import { Breadcrumb, BreadcrumbItem, Divider, PageSection, Title } from '@patternfly/react-core';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom-v5-compat';
import { TracingGanttChart } from '@perses-dev/panels-plugin';
import {
  PersesDashboardWrapper,
  PersesTempoDatasourceWrapper,
  PersesWrapper,
  TraceQueryPanelWrapper,
} from '../components/PersesWrapper';
import { TraceAttributeValue } from '@perses-dev/core';
import { useDataQueries } from '@perses-dev/plugin-system';
import { useTempoInstance } from '../hooks/useTempoInstance';
import { TracingApp } from '../TracingApp';
import { memo } from 'react';

function TraceDetailPage() {
  return (
    <TracingApp>
      <PersesWrapper>
        <PersesDashboardWrapper>
          <TraceDetailPageBody />
        </PersesDashboardWrapper>
      </PersesWrapper>
    </TracingApp>
  );
}

export default memo(TraceDetailPage);

function TraceDetailPageBody() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const { traceId } = useParams();
  const [tempo] = useTempoInstance();
  const location = useLocation();

  return (
    <PersesTempoDatasourceWrapper
      tempo={tempo}
      queries={[{ kind: 'TempoTraceQuery', spec: { query: traceId } }]}
    >
      <PageSection>
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={`/observe/traces${location.search}`}>{t('Traces')}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{t('Trace details')}</BreadcrumbItem>
        </Breadcrumb>
        <PageTitle />
        <Divider className="pf-v6-u-mt-md" />
      </PageSection>
      <PageSection isFilled hasBodyWrapper={false}>
        <TraceQueryPanelWrapper>
          <TracingGanttChart.PanelComponent
            spec={{ visual: { palette: { mode: 'categorical' } } }}
            attributeLinks={attributeLinks}
          />
        </TraceQueryPanelWrapper>
      </PageSection>
    </PersesTempoDatasourceWrapper>
  );
}

function PageTitle() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const traceName = useTraceName();

  return (
    <>
      <Helmet>
        <title>
          {t('Trace')} {traceName} · {t('Tracing')}
        </title>
      </Helmet>
      <Title headingLevel="h1">{traceName}</Title>
    </>
  );
}

function useTraceName() {
  const { traceId } = useParams();
  const { queryResults } = useDataQueries('TraceQuery');
  const trace = queryResults[0]?.data?.trace;

  if (!trace) {
    return traceId;
  }
  return `${trace.rootSpan.resource.serviceName}: ${trace.rootSpan.name}`;
}

const sval = (val?: TraceAttributeValue) =>
  val && 'stringValue' in val ? encodeURIComponent(val.stringValue) : '';

const attributeLinks: Record<string, (attrs: Record<string, TraceAttributeValue>) => string> = {
  'k8s.namespace.name': (attrs) => `/k8s/cluster/namespaces/${sval(attrs['k8s.namespace.name'])}`,
  'k8s.node.name': (attrs) => `/k8s/cluster/nodes/${sval(attrs['k8s.node.name'])}`,
  'k8s.deployment.name': (attrs) =>
    `/k8s/ns/${sval(attrs['k8s.namespace.name'])}/deployments/${sval(
      attrs['k8s.deployment.name'],
    )}`,
  'k8s.pod.name': (attrs) =>
    `/k8s/ns/${sval(attrs['k8s.namespace.name'])}/pods/${sval(attrs['k8s.pod.name'])}`,
};
