import React, { memo, useCallback, useState } from 'react';
import {
  Divider,
  Level,
  PageSection,
  Split,
  SplitItem,
  Stack,
  Title,
} from '@patternfly/react-core';
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

// use memo() to prevent re-rendering (and flickering) of this page once
// the parent component loaded the list of Tempo resources in the cluster
export const QueryBrowser = memo(function QueryBrowser() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const [tempo, setTempo] = useTempoInstance();
  const [, setLastRefresh] = useState(new Date());
  const [query, setQuery] = useQueryParam('q', withDefault(StringParam, '{}'));
  const [duration, setDuration] = useQueryParam('duration', durationQueryParam, {
    updateType: 'replaceIn',
  });

  const runQuery = useCallback(
    (val: string) => {
      setQuery(val);

      // Force invalidating the state, even if the query is unchanged. The duration dropdown
      // is relative ("last 5 minutes"), therefore re-running an unchanged query should
      // always refresh the search results with the current time frame (e.g. last 5 minutes until now).
      setLastRefresh(new Date());
    },
    [setQuery, setLastRefresh],
  );

  return (
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
            <QueryEditor query={query} runQuery={runQuery} />
          </SplitItem>
        </Split>
        <PersesWrapper
          tempo={tempo}
          definitions={[{ kind: 'TempoTraceQuery', spec: { query } }]}
          duration={duration as DurationString}
        >
          <ScatterPlot />
          <TraceTable runQuery={runQuery} />
        </PersesWrapper>
      </Stack>
    </PageSection>
  );
});
