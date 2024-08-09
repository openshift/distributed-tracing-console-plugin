import React from 'react';
import { Divider, Page, PageSection, Split, Stack, Title } from '@patternfly/react-core';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { DurationDropdown } from '../../components/DurationDropdown';
import { QueryEditor } from './QueryEditor/QueryEditor';
import { useQueryParam } from '../../hooks/useQueryParams';
import { TempoInstanceDropdown } from '../../components/TempoInstanceDropdown';
import { ScatterPlot } from './ScatterPlot';
import { TraceTable } from './TraceTable';
import { PersesWrapper } from '../../components/PersesWrapper';
import { DurationString } from '@perses-dev/core';

export function TracesPage() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const [duration, setDuration] = useQueryParam('duration', '30m');
  const [query, setQuery] = useQueryParam('q', '{}');

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{t('Tracing')}</title>
        </Helmet>
      </HelmetProvider>
      <Page>
        <PageSection variant="light">
          <Stack hasGutter>
            <Title headingLevel="h1">{t('Traces')}</Title>
            <Divider />
            <Split hasGutter>
              <TempoInstanceDropdown />
              <DurationDropdown duration={duration as DurationString} setDuration={setDuration} />
            </Split>
            <PersesWrapper
              definitions={[{ kind: 'TempoTraceQuery', spec: { query } }]}
              duration={duration as DurationString}
            >
              <ScatterPlot />
              <QueryEditor query={query} setQuery={setQuery} />
              <TraceTable setQuery={setQuery} />
            </PersesWrapper>
          </Stack>
        </PageSection>
      </Page>
    </>
  );
}
