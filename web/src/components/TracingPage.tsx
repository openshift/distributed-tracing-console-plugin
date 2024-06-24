import { Page, PageSection, Title } from '@patternfly/react-core';
import * as React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';
import { useURLState } from '../hooks/useURLState';
import { PersesWrapper } from './PersesWrapper';
import { TempoStackDropdown } from './TempoStackDropdown';

import { useTempoStack } from '../hooks/useTempoStack';

export default function TracingPage() {
  const { tempoStack, namespace, setTempoStackInURL } = useURLState();

  const { loading, tempoStackList } = useTempoStack();

  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');

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
          <label htmlFor="tempostack-dropdown">
            {t('Select a TempoStack')}
          </label>
          <TempoStackDropdown
            id="tempostack-dropdown"
            tempoStackOptions={tempoStackList}
            selectedTempoStackName={tempoStack}
            selectedNamespace={namespace}
            setTempoList={setTempoStackInURL}
            isLoading={loading}
          />
          <PersesWrapper
            selectedNamespace={namespace}
            selectedTempoStack={tempoStack}
          />
        </PageSection>
      </Page>
    </>
  );
}
