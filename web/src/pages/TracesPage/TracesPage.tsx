import React from 'react';
import {
  Divider,
  Level,
  Page,
  PageSection,
  Split,
  SplitItem,
  Stack,
  Title,
} from '@patternfly/react-core';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { DurationDropdown, DurationValues } from '../../components/DurationDropdown';
import { QueryEditor } from './QueryEditor/QueryEditor';
import { TempoInstanceDropdown } from '../../components/TempoInstanceDropdown';
import { ScatterPlot } from './ScatterPlot';
import { TraceTable } from './TraceTable';
import { PersesWrapper } from '../../components/PersesWrapper';
import { DurationString } from '@perses-dev/core';
import { createEnumParam, StringParam, useQueryParam, withDefault } from 'use-query-params';
import { useTempoInstance } from '../../hooks/useTempoInstance';

const durationQueryParam = withDefault(createEnumParam(DurationValues), '30m');

export function TracesPage() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const [tempo, setTempo] = useTempoInstance();
  const [query, setQuery] = useQueryParam('q', withDefault(StringParam, '{}'));
  const [duration, setDuration] = useQueryParam('duration', durationQueryParam, {
    updateType: 'replaceIn',
  });

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
            <Level hasGutter>
              <Title headingLevel="h1">{t('Traces')}</Title>
              <DurationDropdown duration={duration as DurationString} setDuration={setDuration} />
            </Level>
            <Divider />
            <Split hasGutter>
              <TempoInstanceDropdown tempo={tempo} setTempo={setTempo} />
              <SplitItem isFilled>
                <QueryEditor query={query} setQuery={setQuery} />
              </SplitItem>
            </Split>
            <PersesWrapper
              tempo={tempo}
              definitions={[{ kind: 'TempoTraceQuery', spec: { query } }]}
              duration={duration as DurationString}
            >
              <ScatterPlot />
              <TraceTable setQuery={setQuery} />
            </PersesWrapper>
          </Stack>
        </PageSection>
      </Page>
    </>
  );
}
