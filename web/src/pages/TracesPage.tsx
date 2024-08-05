import { Page, PageSection, Title } from '@patternfly/react-core';
import * as React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useURLState } from '../hooks/useURLState';
import { PersesWrapper } from '../components/PersesWrapper';
import { TempoStackDropdown } from '../components/TempoStackDropdown';
import { useTempoStack } from '../hooks/useTempoStack';
import { DurationDropdown } from '../components/DurationDropdown';
import { Grid, GridItem } from '@patternfly/react-core';
import { DurationString } from '@perses-dev/prometheus-plugin';
import { TraceQueryBrowser } from '../components/TraceQueryBrowser';

export function TracesPage() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const { tempoStack, namespace, setTempoStackInURL } = useURLState();
  const { loading, tempoStackList } = useTempoStack();
  const [duration, setDuration] = React.useState<DurationString>('30m');
  const [query, setQuery] = React.useState('{}');

  const handleDurationChange = (timeRange: DurationString) => {
    setDuration(timeRange);
  };

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title data-test="distributed-tracing-page-title">
            {t('Tracing')}
          </title>
        </Helmet>
      </HelmetProvider>
      <Page>
        <PageSection variant="light">
          <Title headingLevel="h1"> {t('Tracing')} </Title>
        </PageSection>
        <PageSection variant="light">
          <Grid>
            <GridItem span={7}>
              <TempoStackDropdown
                id="tempostack-dropdown"
                tempoStackOptions={tempoStackList}
                selectedTempoStackName={tempoStack}
                selectedNamespace={namespace}
                setTempoList={setTempoStackInURL}
                isLoading={loading}
              />
            </GridItem>
            <GridItem span={5}>
              <DurationDropdown handleDurationChange={handleDurationChange} />
            </GridItem>
          </Grid>
          <PersesWrapper
            queries={[{ kind: 'TempoTraceQuery', spec: { query } }]}
            duration={duration}
          >
            <TraceQueryBrowser setQuery={setQuery} />
          </PersesWrapper>
        </PageSection>
      </Page>
    </>
  );
}
