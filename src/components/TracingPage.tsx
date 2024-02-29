import * as React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {
  Page,
  PageSection,
  Text,
  TextContent,
  Title,
} from '@patternfly/react-core';
import { LokiDropdown } from './LokiDropdown';
import { useURLState } from '../hooks/useURLState';
import { useLokiStack } from '../hooks/useLokiStack';

import './example.css';

export default function TracingPage() {
  const { lokiStack, namespace, setLokiStackInURL } = useURLState();
  const { lokiStackList } = useLokiStack();

  if (!lokiStackList) {
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
          <label htmlFor="lokistack-dropdown">Select a LokiStack</label>
          <LokiDropdown
            id="lokistack-dropdown"
            selectionOptions={lokiStackList}
            selectedLokiList={lokiStack}
            selectedNamespace={namespace}
            setLokiList={setLokiStackInURL}
          />
          {lokiStackList.find(
            (listItem) => listItem.value === namespace + ' / ' + lokiStack,
          ) && (
            <TextContent>
              <Text component="p">You have selected {lokiStack}</Text>
            </TextContent>
          )}
        </PageSection>
      </Page>
    </>
  );
}
