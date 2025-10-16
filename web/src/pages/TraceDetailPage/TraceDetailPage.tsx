import * as React from 'react';
import { Breadcrumb, BreadcrumbItem, Divider, PageSection, Title } from '@patternfly/react-core';
import { Helmet } from 'react-helmet';
import { useTranslation } from 'react-i18next';
import { Link, useLocation, useParams } from 'react-router-dom-v5-compat';
import {
  PersesDashboardWrapper,
  PersesTempoDatasourceWrapper,
  PersesTracePanelWrapper,
  PersesWrapper,
} from '../../components/PersesWrapper';
import { useDataQueries } from '@perses-dev/plugin-system';
import { useTempoInstance } from '../../hooks/useTempoInstance';
import { TracingApp } from '../../TracingApp';
import { memo } from 'react';
import { linkToSpan, linkToTrace, spanAttributeLinks } from '../../links';
import { StringParam, useQueryParam } from 'use-query-params';
import './TraceDetailPage.css';

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
  const [selectedSpanId] = useQueryParam('selectSpan', StringParam);

  return (
    <PersesTempoDatasourceWrapper
      tempo={tempo}
      queries={[{ kind: 'TempoTraceQuery', spec: { query: traceId } }]}
    >
      <PageSection variant="light">
        <Breadcrumb>
          <BreadcrumbItem>
            <Link to={`/observe/traces${location.search}`}>{t('Traces')}</Link>
          </BreadcrumbItem>
          <BreadcrumbItem isActive>{t('Trace details')}</BreadcrumbItem>
        </Breadcrumb>
        <PageTitle />
        <Divider className="pf-v5-u-mt-md" />
      </PageSection>
      <PageSection variant="light" isFilled className="mui-pf-theme" style={{ paddingTop: 0 }}>
        <div className="dt-plugin-perses-panel dt-plugin-gantt-chart">
          <PersesTracePanelWrapper
            panelOptions={{ showIcons: 'always' }}
            definition={{
              kind: 'Panel',
              spec: {
                display: { name: `Trace ${traceId}` },
                plugin: {
                  kind: 'TracingGanttChart',
                  spec: {
                    visual: {
                      palette: {
                        mode: 'categorical',
                      },
                    },
                    links: {
                      trace: linkToTrace(),
                      span: linkToSpan(),
                      attributes: spanAttributeLinks,
                    },
                    selectedSpanId,
                  },
                },
              },
            }}
          />
        </div>
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

function useTraceName(): string {
  const { traceId } = useParams();
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
