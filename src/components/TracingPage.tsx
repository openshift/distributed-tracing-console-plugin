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
import { SelectOptionProps } from '@patternfly/react-core';

import './example.css';

export default function TracingPage() {
  const { tempoStack, namespace, setTempoStackInURL } = useURLState();
  const { tempoStackList } = useTempoStack();
  const dropdownOptions: Array<SelectOptionProps> = tempoStackList.map(
    (tempoStack) => {
      return {
        value: tempoStack.metadata.namespace + ' / ' + tempoStack.metadata.name,
        children:
          tempoStack.metadata.namespace + ' / ' + tempoStack.metadata.name,
      };
    },
  );

  if (!tempoStackList) {
    return <div>Loading...</div>;
  }
  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title data-test="distributed-tracing-page-title"> Tracing</title>
        </Helmet>
      </HelmetProvider>
      <Page>
        <PageSection variant="light">
          <Title headingLevel="h1"> Tracing </Title>
        </PageSection>
        <PageSection variant="light">
          <label htmlFor="tempostack-dropdown">Select a TempoStack</label>
          <TempoStackDropdown
            id="tempostack-dropdown"
            selectionOptions={dropdownOptions}
            selectedTempoList={tempoStack}
            selectedNamespace={namespace}
            setTempoList={setTempoStackInURL}
          />
          {dropdownOptions.find(
            (listItem) => listItem.value === namespace + ' / ' + tempoStack,
          ) && (
            <TextContent>
              <Text component="p">You have selected {tempoStack}</Text>
            </TextContent>
          )}
        </PageSection>
      </Page>
    </>
  );
}
