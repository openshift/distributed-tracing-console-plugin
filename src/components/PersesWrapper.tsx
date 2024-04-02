import React from 'react';

import {
  ChartsProvider,
  generateChartsTheme,
  getTheme,
} from '@perses-dev/components';
import {
  DataQueriesProvider,
  dynamicImportPluginLoader,
  PluginModuleResource,
  PluginRegistry,
  TimeRangeProvider,
} from '@perses-dev/plugin-system';
import { ThemeProvider } from '@mui/material';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  DatasourceStoreProvider,
  TemplateVariableProvider,
} from '@perses-dev/dashboards';
import panelsResource from '@perses-dev/panels-plugin/plugin.json';
import {
  DashboardResource,
  GlobalDatasource,
  ProjectDatasource,
} from '@perses-dev/core';
import { DatasourceApi } from '@perses-dev/dashboards';
import tempoResource from '@perses-dev/tempo-plugin/plugin.json';
import { PersesChartsTheme } from '@perses-dev/components';

import TraceQueryBrowser from './TraceQueryBrowser';

// To configure a different endpoint for your Tempo instance
// you need to modify the env variable 'BRIDGE_PLUGIN_PROXY'
// in the start-console.sh script.
const proxyDatasource: GlobalDatasource = {
  kind: 'GlobalDatasource',
  metadata: { name: 'TempoProxy' },
  spec: {
    default: true,
    plugin: {
      kind: 'TempoDatasource',
      spec: {
        directUrl: '/api/proxy/plugin/distributed-tracing-plugin/backend',
      },
    },
  },
};
class DatasourceApiImpl implements DatasourceApi {
  getDatasource(): Promise<ProjectDatasource | undefined> {
    return Promise.resolve(undefined);
  }
  getGlobalDatasource(): Promise<GlobalDatasource | undefined> {
    return Promise.resolve(proxyDatasource);
  }
  listDatasources(): Promise<ProjectDatasource[]> {
    return Promise.resolve([]);
  }
  listGlobalDatasources(): Promise<GlobalDatasource[]> {
    return Promise.resolve([proxyDatasource]);
  }
  buildProxyUrl(): string {
    return '/';
  }
}
export const datasourceApi = new DatasourceApiImpl();

export const dashboard = {
  kind: 'Dashboard',
  metadata: {},
  spec: {},
} as DashboardResource;

// Override eChart defaults with PatternFly colors.
const patternflyBlue300 = '#2b9af3';
const patternflyBlue400 = '#0066cc';
const patternflyBlue500 = '#004080';
const patternflyBlue600 = '#002952';
const defaultPaletteColors = [
  patternflyBlue400,
  patternflyBlue500,
  patternflyBlue600,
];
const muiTheme = getTheme('light');
const chartsTheme: PersesChartsTheme = generateChartsTheme(muiTheme, {
  thresholds: {
    defaultColor: patternflyBlue300,
    palette: defaultPaletteColors,
  },
});

// PluginRegistry configuration to allow access to
// visualization panels/charts (@perses-dev/panels-plugin)
// and data handlers for tempo (@perses-dev/tempo-plugin).
const pluginLoader = dynamicImportPluginLoader([
  {
    resource: panelsResource as PluginModuleResource,
    importPlugin: () => import('@perses-dev/panels-plugin'),
  },
  {
    resource: tempoResource as PluginModuleResource,
    importPlugin: () => import('@perses-dev/tempo-plugin'),
  },
]);

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 0,
    },
  },
});

function PersesWrapper() {
  const [query, setQuery] = React.useState('{}');

  return (
    <ThemeProvider theme={muiTheme}>
      <ChartsProvider chartsTheme={chartsTheme}>
        <PluginRegistry
          pluginLoader={pluginLoader}
          defaultPluginKinds={{
            Panel: 'ScatterChart',
            TimeSeriesQuery: 'PrometheusTimeSeriesQuery',
            TraceQuery: 'TempoTraceQuery',
          }}
        >
          <QueryClientProvider client={queryClient}>
            <TimeRangeProvider
              refreshInterval="0s"
              timeRange={{ pastDuration: '30m' }}
            >
              <TemplateVariableProvider>
                <DatasourceStoreProvider
                  dashboardResource={dashboard}
                  datasourceApi={datasourceApi}
                >
                  <DataQueriesProvider
                    definitions={[
                      {
                        kind: 'TempoTraceQuery',
                        spec: { query: query },
                      },
                    ]}
                  >
                    <TraceQueryBrowser setQuery={setQuery} />
                  </DataQueriesProvider>
                </DatasourceStoreProvider>
              </TemplateVariableProvider>
            </TimeRangeProvider>
          </QueryClientProvider>
        </PluginRegistry>
      </ChartsProvider>
    </ThemeProvider>
  );
}

export default PersesWrapper;
