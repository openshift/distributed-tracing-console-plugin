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
  const { lokiStack, setLokiStackInURL } = useURLState();
  const [lokiList, setLokiList] = React.useState<Array<SelectOptionProps>>([]);
  React.useEffect(() => {
    /**
     * TODO: move the data fetching out of a specific component
     * Consider using one of the watch resources rather than a static fetch
     */
    k8sList({ model: LokiModel, queryParams: [] }).then((list) => {
      console.log(list);
      const dropdownOptions: Array<SelectOptionProps> = [];
      if (Array.isArray(list)) {
        /**
         * TODO: Name isn't unique across namespaces, so find some display which
         * includes both name and namespace. Might need to have this moved into the select
         *
         * may also want to include some information on the state of the lokistack (is it active
         * or is it down) here?
         */
        list.forEach((lokiStack) => {
          dropdownOptions.push({
            value: lokiStack.metadata.name,
            children: lokiStack.metadata.name,
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
  /**
   * TODO: Move dropdown content upwards in the page, similar to the namespace selector
   * in the Developer > Topology view
   */
  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title data-test="distributed-tracing-page-title"> Tracing</title>
        </Helmet>
      </HelmetProvider>
      <Page>
        <PageSection variant="light">
          <Title headingLevel="h1"> Hello, Tracing Plugin! </Title>
        </PageSection>
        <PageSection variant="light">
          <TextContent>
            <Text component="p">
              <span className="console-plugin-template__nice">Nice!</span> Your
              plugin is working.
            </Text>
            <Text component="p">
              This is a custom page contributed by the console plugin template.
              The extension that adds the page is declared in
              console-extensions.json in the project root along with the
              corresponding nav item. Update console-extensions.json to change
              or add extensions. Code references in console-extensions.json must
              have a corresonding property <code>exposedModules</code> in
              package.json mapping the reference to the module.
            </Text>
            <Text component="p">
              After cloning this project, replace references to{' '}
              <code>console-template-plugin</code> and other plugin metadata in
              package.json with values for your plugin.
            </Text>
            <LokiDropdown
              selectionOptions={lokiList}
              selectedLokiList={lokiStack}
              setLokiList={setLokiStackInURL}
            />
          </TextContent>
        </PageSection>
      </Page>
    </>
  );
}
