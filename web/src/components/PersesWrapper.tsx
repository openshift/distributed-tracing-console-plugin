import React, { useMemo } from 'react';
import {
  ChartsProvider,
  generateChartsTheme,
  getTheme,
  PersesChartsTheme,
  typography,
} from '@perses-dev/components';
import { ThemeProvider } from '@mui/material';
import {
  DataQueriesProvider,
  dynamicImportPluginLoader,
  PanelData,
  PanelPlugin,
  PanelProps,
  PluginRegistry,
  RouterProvider,
  TimeRangeProvider,
  useDataQueriesContext,
} from '@perses-dev/plugin-system';
import {
  DatasourceResource,
  Definition,
  DurationString,
  GlobalDatasourceResource,
  TimeRangeValue,
  TraceData,
  UnknownSpec,
} from '@perses-dev/core';
import {
  DatasourceApi,
  DatasourceStoreProvider,
  Panel,
  PanelProps as DashboardPanelProps,
  VariableProvider,
} from '@perses-dev/dashboards';
import * as tempoPlugin from '@perses-dev/tempo-plugin';
import * as scatterChartPlugin from '@perses-dev/scatter-chart-plugin';
import * as traceTablePlugin from '@perses-dev/trace-table-plugin';
import * as tracingGanttChartPlugin from '@perses-dev/tracing-gantt-chart-plugin';
import { ChartThemeColor, getThemeColors } from '@patternfly/react-charts';
import { TempoInstance } from '../hooks/useTempoInstance';
import { getProxyURLFor } from '../hooks/api';
import { ErrorBoundary } from 'react-error-boundary';
import { ErrorAlert } from './ErrorAlert';
import { NoTempoInstanceSelectedState } from './NoTempoInstanceSelectedState';
import { LoadingState } from './LoadingState';
import { usePatternFlyTheme } from './console/utils/usePatternFlyTheme';
import { Link as RouterLink, useNavigate } from 'react-router-dom-v5-compat';

class DatasourceApiImpl implements DatasourceApi {
  constructor(public proxyDatasource: GlobalDatasourceResource) {}

  getDatasource(): Promise<DatasourceResource | undefined> {
    return Promise.resolve(undefined);
  }
  getGlobalDatasource(): Promise<GlobalDatasourceResource | undefined> {
    return Promise.resolve(this.proxyDatasource);
  }
  listDatasources(): Promise<DatasourceResource[]> {
    return Promise.resolve([]);
  }
  listGlobalDatasources(): Promise<GlobalDatasourceResource[]> {
    return Promise.resolve([this.proxyDatasource]);
  }
  buildProxyUrl(): string {
    return '/';
  }
}

// Override eChart defaults with PatternFly colors.
const patternflyBlue300 = '#2b9af3';
const patternflyBlue400 = '#0066cc';
const patternflyBlue500 = '#004080';
const patternflyBlue600 = '#002952';
const defaultPaletteColors = [patternflyBlue400, patternflyBlue500, patternflyBlue600];

const patternflyChartsMultiUnorderedPalette = getThemeColors(
  ChartThemeColor.multiUnordered,
).chart.colorScale.flatMap((cssColor) => {
  // colors are stored as 'var(--pf-chart-theme--multi-color-unordered--ColorScale--3400, #73c5c5)'
  // need to extract the hex value, because fillStyle() of <canvas> does not support CSS vars
  const match = cssColor.match(/#[a-fA-F0-9]+/);
  return match ? [match[0]] : [];
});

// PluginRegistry configuration to allow access to
// visualization panels/charts (@perses-dev/panels-plugin)
// and data handlers for tempo (@perses-dev/tempo-plugin).
const pluginLoader = dynamicImportPluginLoader(
  [tempoPlugin, scatterChartPlugin, traceTablePlugin, tracingGanttChartPlugin].map((x) => ({
    resource: x.getPluginModule(),
    importPlugin: () => Promise.resolve(x),
  })),
);

interface PersesWrapperProps {
  children?: React.ReactNode;
}

/**
 * PersesWrapper initializes the MaterialUI theme, Perses plugin registry, and query client.
 */
export function PersesWrapper({ children }: PersesWrapperProps) {
  const { theme } = usePatternFlyTheme();
  const navigate = useNavigate();

  const muiTheme = getTheme(theme, {
    typography: {
      ...typography,
      fontFamily: 'var(--pf-t--global--font--family--body)',
    },
    shape: {
      borderRadius: 4, // should be var(--pf-t--global--border--radius--tiny), but type must be a number.
    },
  });

  const chartsTheme: PersesChartsTheme = generateChartsTheme(muiTheme, {
    echartsTheme: {
      color: patternflyChartsMultiUnorderedPalette,
    },
    thresholds: {
      defaultColor: patternflyBlue300,
      palette: defaultPaletteColors,
    },
  });

  return (
    <ThemeProvider theme={muiTheme}>
      <RouterProvider RouterComponent={RouterLink} navigate={navigate}>
        <ChartsProvider chartsTheme={chartsTheme}>
          <PluginRegistry pluginLoader={pluginLoader}>{children}</PluginRegistry>
        </ChartsProvider>
      </RouterProvider>
    </ThemeProvider>
  );
}

interface PersesDashboardWrapperProps {
  timeRange?: TimeRangeValue;
  setTimeRange?: (value: TimeRangeValue) => void;
  children?: React.ReactNode;
}

/**
 * PersesDashboardWrapper initializes the dashboard time range and variable providers.
 */
export function PersesDashboardWrapper({
  timeRange = { pastDuration: '0s' },
  setTimeRange,
  children,
}: PersesDashboardWrapperProps) {
  return (
    <TimeRangeProvider timeRange={timeRange} setTimeRange={setTimeRange}>
      <VariableProvider>{children}</VariableProvider>
    </TimeRangeProvider>
  );
}

interface PersesTempoDatasourceWrapperProps {
  tempo: TempoInstance | undefined;
  queries: Definition<UnknownSpec>[];
  duration?: DurationString;
  children?: React.ReactNode;
}

/**
 * PersesTempoDatasourceWrapper initializes the Tempo data source.
 */
export function PersesTempoDatasourceWrapper({
  tempo,
  queries,
  children,
}: PersesTempoDatasourceWrapperProps) {
  const datasourceApi = useMemo(() => {
    const proxyDatasource: GlobalDatasourceResource = {
      kind: 'GlobalDatasource',
      metadata: { name: 'TempoProxy' },
      spec: {
        default: true,
        plugin: {
          kind: 'TempoDatasource',
          spec: {
            directUrl: tempo ? getProxyURLFor(tempo) : '',
          },
        },
      },
    };
    return new DatasourceApiImpl(proxyDatasource);
  }, [tempo]);

  if (!tempo) {
    return <NoTempoInstanceSelectedState />;
  }

  return (
    <DatasourceStoreProvider datasourceApi={datasourceApi}>
      <DataQueriesProvider definitions={queries}>{children}</DataQueriesProvider>
    </DatasourceStoreProvider>
  );
}

interface PersesPanelPluginWrapperProps<T> {
  plugin: T;
  noResults?: React.ReactNode;
}

/**
 * PersesPanelWrapper renders a Perses panel plugin and shows PatternFly empty, loading states and error states.
 */
export function PersesPanelPluginWrapper<
  T extends PanelPlugin<Spec, PanelProps<Spec, TraceData>>,
  Spec = any, // eslint-disable-line @typescript-eslint/no-explicit-any
>(
  props: PersesPanelPluginWrapperProps<T> &
    Omit<React.ComponentProps<T['PanelComponent']>, 'queryResults'>,
) {
  const { plugin, noResults, ...otherProps } = props;
  const { isFetching, isLoading, queryResults } = useDataQueriesContext();

  // queryResults is an empty array until the TempoTraceQuery plugin is loaded
  if (isLoading || isFetching || queryResults.length === 0) {
    return <LoadingState />;
  }

  const queryError = queryResults.find((d) => d.error);
  if (queryError) {
    return <ErrorAlert error={queryError.error as Error} />;
  }

  const queryResultsWithData = queryResults.flatMap((q) =>
    q.data ? [{ data: q.data, definition: q.definition }] : [],
  ) as PanelData<TraceData>[];
  const traceDataFound = queryResultsWithData.some(
    ({ data }) =>
      ('searchResult' in data && data.searchResult && data.searchResult.length > 0) ||
      ('trace' in data && data.trace),
  );
  if (!traceDataFound && noResults) {
    return <>{noResults}</>;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorAlert} resetKeys={[]}>
      <plugin.PanelComponent queryResults={queryResultsWithData} {...otherProps} />
    </ErrorBoundary>
  );
}

interface PersesTracePanelWrapperProps {
  noResults?: React.ReactElement;
}

/**
 * PersesTracePanelWrapper renders a full Perses panel, including panel header and panel content.
 */
export function PersesTracePanelWrapper(props: PersesTracePanelWrapperProps & DashboardPanelProps) {
  const { noResults, ...panelProps } = props;
  const { loading, error, hasTraceData } = usePersesTraceData();

  if (loading) {
    return <LoadingState />;
  }

  if (error) {
    return <ErrorAlert error={error as Error} />;
  }

  if (!hasTraceData && noResults) {
    return <>{noResults}</>;
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorAlert}>
      <Panel {...panelProps} />
    </ErrorBoundary>
  );
}

export function usePersesTraceData(): { loading: boolean; error?: unknown; hasTraceData: boolean } {
  const { isLoading, isFetching, queryResults } = useDataQueriesContext();

  // queryResults is an empty array until the TempoTraceQuery plugin is loaded
  const loading = isLoading || isFetching || queryResults.length === 0;
  const error = queryResults.find((d) => d.error)?.error;
  const hasTraceData = queryResults.some(
    ({ data }) =>
      (data && 'searchResult' in data && data.searchResult && data.searchResult.length > 0) ||
      (data && 'trace' in data && data.trace),
  );

  return { loading, error, hasTraceData };
}
