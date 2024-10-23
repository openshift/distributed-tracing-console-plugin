import React, { useCallback, useMemo } from 'react';
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
import {
  PersesDashboardWrapper,
  PersesTempoDatasourceWrapper,
  PersesWrapper,
} from '../../components/PersesWrapper';
import { DurationString, RelativeTimeRange, TimeRangeValue } from '@perses-dev/core';
import { createEnumParam, StringParam, useQueryParam, withDefault } from 'use-query-params';
import { useTempoInstance } from '../../hooks/useTempoInstance';
import { useTimeRange } from '@perses-dev/plugin-system';

const durationQueryParam = withDefault(createEnumParam(DurationValues), '30m');

export function QueryBrowser() {
  const [duration, setDuration] = useQueryParam('duration', durationQueryParam, {
    updateType: 'replaceIn',
  });
  const timeRange = useMemo(() => {
    return { pastDuration: duration as DurationString };
  }, [duration]);
  const setTimeRange = useCallback(
    (value: TimeRangeValue) => {
      const pastDuration = (value as RelativeTimeRange).pastDuration;
      if (pastDuration) {
        setDuration(pastDuration);
      }
    },
    [setDuration],
  );

  return (
    <PageSection variant="light">
      <PersesWrapper>
        <PersesDashboardWrapper timeRange={timeRange} setTimeRange={setTimeRange}>
          <QueryBrowserBody />
        </PersesDashboardWrapper>
      </PersesWrapper>
    </PageSection>
  );
}

export function QueryBrowserBody() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const [tempo, setTempo] = useTempoInstance();
  const [query, setQuery] = useQueryParam('q', withDefault(StringParam, '{}'));
  const { timeRange, setTimeRange, refresh } = useTimeRange();

  const runQuery = useCallback(
    (val: string) => {
      setQuery(val);
      refresh();
    },
    [setQuery, refresh],
  );

  return (
    <PageSection variant="light">
      <Stack hasGutter>
        <Level hasGutter>
          <Title headingLevel="h1">{t('Traces')}</Title>
          <DurationDropdown
            duration={(timeRange as RelativeTimeRange).pastDuration}
            setDuration={(value) => setTimeRange({ pastDuration: value })}
          />
        </Level>
        <Divider />
        <Split hasGutter>
          <TempoInstanceDropdown tempo={tempo} setTempo={setTempo} />
          <SplitItem isFilled>
            <QueryEditor tempo={tempo} query={query} runQuery={runQuery} />
          </SplitItem>
        </Split>
        <PersesTempoDatasourceWrapper
          tempo={tempo}
          queries={[{ kind: 'TempoTraceQuery', spec: { query } }]}
        >
          <ScatterPlot />
          <TraceTable runQuery={runQuery} />
        </PersesTempoDatasourceWrapper>
      </Stack>
    </PageSection>
  );
}
