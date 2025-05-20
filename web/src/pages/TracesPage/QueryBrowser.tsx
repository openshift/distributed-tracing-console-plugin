import React, { useCallback, useEffect, useMemo } from 'react';
import { Divider, PageSection, Split, SplitItem, Stack, Title } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import {
  DEFAULT_DURATION,
  DurationDropdown,
  DurationValues,
} from '../../components/DurationDropdown';
import { ScatterPlot } from './ScatterPlot';
import { TraceTable } from './TraceTable';
import {
  PersesDashboardWrapper,
  PersesTempoDatasourceWrapper,
  PersesWrapper,
} from '../../components/PersesWrapper';
import { DurationString, RelativeTimeRange, TimeRangeValue } from '@perses-dev/core';
import {
  createEnumParam,
  NumberParam,
  StringParam,
  useQueryParam,
  withDefault,
} from 'use-query-params';
import { useTempoInstance } from '../../hooks/useTempoInstance';
import { useTimeRange } from '@perses-dev/plugin-system';
import { FilterToolbar } from './Toolbar/FilterToolbar';
import { DEFAULT_LIMIT, LimitSelect } from './LimitSelect';

const durationQueryParam = withDefault(createEnumParam(DurationValues), DEFAULT_DURATION);

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
    <PersesWrapper>
      <PersesDashboardWrapper timeRange={timeRange} setTimeRange={setTimeRange}>
        <QueryBrowserBody />
      </PersesDashboardWrapper>
    </PersesWrapper>
  );
}

export function QueryBrowserBody() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const [tempo, setTempo] = useTempoInstance();
  const [query, setQuery] = useQueryParam('q', withDefault(StringParam, '{}'));
  const [limit, setLimit] = useQueryParam('limit', withDefault(NumberParam, DEFAULT_LIMIT));
  const { timeRange, setTimeRange, refresh } = useTimeRange();

  // Refresh query if Tempo instance or tenant changes.
  // The Perses data source is selected via a mock DatasourceApiImpl implementation in <PersesWrapper>,
  // therefore Perses doesn't refresh automatically if the Tempo instance changes.
  useEffect(() => {
    refresh();
  }, [tempo, refresh]);

  const runQuery = useCallback(
    (query: string) => {
      setQuery(query);
      refresh();
    },
    [setQuery, refresh],
  );

  return (
    <>
      <PageSection variant="light">
        <Split hasGutter>
          <SplitItem isFilled>
            <Title headingLevel="h1">{t('Traces')}</Title>
          </SplitItem>
          <DurationDropdown
            duration={(timeRange as RelativeTimeRange).pastDuration}
            setDuration={(value) => setTimeRange({ pastDuration: value })}
          />
          <LimitSelect limit={limit} setLimit={setLimit} />
        </Split>
        <Divider className="pf-v5-u-mt-md" />
      </PageSection>
      <PageSection variant="light" style={{ paddingTop: 0 }}>
        <Stack hasGutter>
          <FilterToolbar
            tempo={tempo}
            setTempo={setTempo}
            query={query}
            setQuery={setQuery}
            runQuery={runQuery}
          />
          <PersesTempoDatasourceWrapper
            tempo={tempo}
            queries={[{ kind: 'TempoTraceQuery', spec: { query, limit } }]}
          >
            <ScatterPlot />
            <TraceTable setQuery={setQuery} />
          </PersesTempoDatasourceWrapper>
        </Stack>
      </PageSection>
    </>
  );
}
