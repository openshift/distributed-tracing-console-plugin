import * as React from 'react';
import { SelectOptionProps } from '@patternfly/react-core';
import { k8sList } from '@openshift-console/dynamic-plugin-sdk';

const LokiModel = {
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

export const useLokiStack = () => {
  const [lokiStackList, setLokiStackList] = React.useState<
    Array<SelectOptionProps>
  >([]);

  React.useEffect(() => {
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
      setLokiStackList(dropdownOptions);
    });
  }, []);

  return {
    lokiStackList,
  };
};
