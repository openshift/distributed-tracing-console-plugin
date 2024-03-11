import * as React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {
  Page,
  PageSection,
  Text,
  TextContent,
  Title,
} from '@patternfly/react-core';
import { TempoStackDropdown } from './TempoStackDropdown';
import { useURLState } from '../hooks/useURLState';
import { useTempoStack } from '../hooks/useTempoStack';
import { useTranslation } from 'react-i18next';

import './example.css';

export default function TracingPage() {
  const { tempoStack, namespace, setTempoStackInURL } = useURLState();
  const { tempoStackList } = useTempoStack();
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');

  if (!tempoStackList) {
    return <div>{t('Loading...')}</div>;
  }
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
            selectedTempoList={tempoStack}
            selectedNamespace={namespace}
            setTempoList={setTempoStackInURL}
          />
          {tempoStackList.find(
            (listItem) =>
              listItem.metadata.namespace === namespace &&
              listItem.metadata.name === tempoStack,
          ) && (
            <TextContent>
              <Text component="p">
                {t('You have selected')} {tempoStack}
              </Text>
            </TextContent>
          )}
        </PageSection>
      </Page>
    </>
  );
}
