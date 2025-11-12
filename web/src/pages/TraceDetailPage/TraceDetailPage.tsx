import * as React from 'react';
import {
  Breadcrumb,
  BreadcrumbItem,
  Button,
  Divider,
  PageSection,
  Title,
  Tooltip,
} from '@patternfly/react-core';
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
import { MagicIcon } from '@patternfly/react-icons';
import { useDispatch } from 'react-redux';
import { attachmentSet, AttachmentTypes, openOLS, setQuery } from '../../hooks/ols_actions';
import { dump as dumpYAML } from 'js-yaml';
import { useOLSEnabled } from '../../hooks/useOLSEnabled';

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
  const olsEnabled = useOLSEnabled();

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
      <PageSection
        isFilled
        hasBodyWrapper={false}
        className="mui-pf-theme"
        style={{ paddingTop: 0 }}
      >
        <div className="dt-plugin-perses-panel dt-plugin-gantt-chart">
          <PersesTracePanelWrapper
            panelOptions={{
              showIcons: 'always',
              extra: olsEnabled ? () => <LightspeedButton /> : undefined,
            }}
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

function LightspeedButton() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const dispatch = useDispatch();
  const { queryResults } = useDataQueries('TraceQuery');
  const traceName = useTraceName();
  const trace = queryResults[0]?.data?.trace;

  const handleTraceAISummaryClick = () => {
    const traceYaml = dumpYAML(trace, { lineWidth: -1 }).trim();

    dispatch(openOLS());
    dispatch(attachmentSet(AttachmentTypes.YAML, 'Trace', traceName, '', '', traceYaml));
    dispatch(
      setQuery('Analyze this trace in my OpenShift cluster and highlight any errors and outliers.'),
    );
  };

  return (
    <Tooltip content={t('Ask OpenShift Lightspeed')}>
      <Button
        variant="plain"
        onClick={handleTraceAISummaryClick}
        aria-label={t('Ask OpenShift Lightspeed')}
        icon={<MagicIcon />}
      />
    </Tooltip>
  );
}
