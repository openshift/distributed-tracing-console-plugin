import { Page, PageSection, Title } from '@patternfly/react-core';
import * as React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useURLState } from '../hooks/useURLState';
import { PersesWrapper } from './PersesWrapper';
import { TempoStackDropdown } from './TempoStackDropdown';
import { useTempoStack } from '../hooks/useTempoStack';
import { DurationDropdown } from './DurationDropdown';
import { Grid, GridItem } from '@patternfly/react-core';
import { DurationString } from '@perses-dev/prometheus-plugin';

export default function TracingPage() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const { tempoStack, namespace, setTempoStackInURL } = useURLState();
  const { loading, tempoStackList } = useTempoStack();
  const [duration, setDuration] = React.useState<DurationString>('30m');

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
            selectedNamespace={namespace}
            selectedTempoStack={tempoStack}
            duration={duration}
          />
        </PageSection>
      </Page>
    </>
  );
}
