import React, { useCallback, useEffect } from 'react';
import { Divider, PageSection, Split, SplitItem, Stack, Title } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { TimeRangeSelect } from '../../components/TimeRangeSelect';
import { ScatterPlot } from './ScatterPlot';
import { TraceTable } from './TraceTable';
import {
  PersesDashboardWrapper,
  PersesTempoDatasourceWrapper,
  PersesWrapper,
} from '../../components/PersesWrapper';
import { NumberParam, StringParam, useQueryParam, withDefault } from 'use-query-params';
import { useTempoInstance } from '../../hooks/useTempoInstance';
import { useTimeRange } from '@perses-dev/plugin-system';
import { FilterToolbar } from './Toolbar/FilterToolbar';
import { DEFAULT_LIMIT, LimitSelect } from './LimitSelect';

export function QueryBrowser() {
  return (
    <PersesWrapper>
      <PersesDashboardWrapper>
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
  const { refresh } = useTimeRange();

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
      <PageSection className="mui-pf-theme">
        <Split hasGutter>
          <SplitItem isFilled>
            <Title headingLevel="h1">{t('Traces')}</Title>
          </SplitItem>
          <TimeRangeSelect />
          <LimitSelect limit={limit} setLimit={setLimit} />
        </Split>
        <Divider className="pf-v6-u-mt-md" />
      </PageSection>
      <PageSection className="mui-pf-theme">
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
