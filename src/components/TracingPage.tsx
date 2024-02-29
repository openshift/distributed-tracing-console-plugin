import * as React from 'react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import {
  Page,
  PageSection,
  SelectOptionProps,
  Text,
  TextContent,
  Title,
} from '@patternfly/react-core';
import { k8sList } from '@openshift-console/dynamic-plugin-sdk';
import { LokiDropdown } from './LokiDropdown';
import { useURLState } from '../hooks/useURLState';

import './example.css';

export const LokiModel = {
  kind: 'LokiStack',
  label: 'LokiStack',
  labelKey: 'public~LokiStack',
  labelPlural: 'LokiStacks',
  labelPluralKey: 'public~LokiStacks',
  apiGroup: 'loki.grafana.com',
  apiVersion: 'v1',
  abbr: 'LS',
  namespaced: true,
  plural: 'lokistacks',
};

export default function TracingPage() {
  const { lokiStack, namespace, setLokiStackInURL } = useURLState();
  const [lokiList, setLokiList] = React.useState<Array<SelectOptionProps>>([]);
  React.useEffect(() => {
    /**
     * TODO: move the data fetching out of a specific component
     * Consider using one of the watch resources rather than a static fetch
     */
    k8sList({ model: LokiModel, queryParams: [] }).then((list) => {
      const dropdownOptions: Array<SelectOptionProps> = [];
      if (Array.isArray(list)) {
        list.forEach((lokiStack) => {
          dropdownOptions.push({
            value:
              lokiStack.metadata.namespace + ' / ' + lokiStack.metadata.name,
            children:
              lokiStack.metadata.namespace + ' / ' + lokiStack.metadata.name,
          });
        });
      } else {
        list.items.forEach((lokiStack) => {
          dropdownOptions.push({
            value: lokiStack.metadata.name,
            children: lokiStack.metadata.name,
          });
        });
      }
      setLokiList(dropdownOptions);
    });
  }, []);
  if (!lokiList) {
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
            selectionOptions={lokiList}
            selectedLokiList={lokiStack}
            selectedNamespace={namespace}
            setLokiList={setLokiStackInURL}
          />
          {lokiList.find(
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
