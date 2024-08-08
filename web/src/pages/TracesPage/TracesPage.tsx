import React, { useState } from 'react';
import {
  Divider,
  Page,
  PageSection,
  Split,
  Stack,
  Title,
} from '@patternfly/react-core';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { DurationDropdown } from '../../components/DurationDropdown';
import { QueryEditor } from './QueryEditor/QueryEditor';
import { ScatterPlot } from './ScatterPlot';
import { TraceTable } from './TraceTable';
import { PersesWrapper } from '../../components/PersesWrapper';
import { DurationString } from '@perses-dev/core';
import { TempoStackDropdown } from '../../components/TempoStackDropdown';
import { useURLState } from '../../hooks/useURLState';
import { useTempoStack } from '../../hooks/useTempoStack';

export function TracesPage() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const { tempoStack, namespace, setTempoStackInURL } = useURLState();
  const { loading, tempoStackList } = useTempoStack();
  const [duration, setDuration] = useState<DurationString>('30m');
  const [query, setQuery] = React.useState('{}');

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
              <TempoStackDropdown
                id="tempostack-dropdown"
                tempoStackOptions={tempoStackList}
                selectedTempoStackName={tempoStack}
                selectedNamespace={namespace}
                setTempoList={setTempoStackInURL}
                isLoading={loading}
              />
              <DurationDropdown handleDurationChange={setDuration} />
            </Split>
            <PersesWrapper
              definitions={[{ kind: 'TempoTraceQuery', spec: { query } }]}
              duration={duration}
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
