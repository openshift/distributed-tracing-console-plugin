import * as React from 'react';
import { SelectOptionProps } from '@patternfly/react-core';
import { k8sList } from '@openshift-console/dynamic-plugin-sdk';

const TempoModel = {
  kind: 'TempoStack',
  label: 'TempoStack',
  labelKey: 'public~TempoStack',
  labelPlural: 'TempoStacks',
  labelPluralKey: 'public~TempoStacks',
  apiGroup: 'tempo.grafana.com',
  apiVersion: 'v1alpha1',
  abbr: 'TS',
  namespaced: true,
  plural: 'tempostacks',
};

export const useTempoStack = () => {
  const [tempoStackList, setTempoStackList] = React.useState<
    Array<SelectOptionProps>
  >([]);

  React.useEffect(() => {
    k8sList({ model: TempoModel, queryParams: [] }).then((list) => {
      const dropdownOptions: Array<SelectOptionProps> = [];
      if (Array.isArray(list)) {
        list.forEach((tempoStack) => {
          dropdownOptions.push({
            value:
              tempoStack.metadata.namespace + ' / ' + tempoStack.metadata.name,
            children:
              tempoStack.metadata.namespace + ' / ' + tempoStack.metadata.name,
          });
        });
      } else {
        list.items.forEach((tempoStack) => {
          dropdownOptions.push({
            value: tempoStack.metadata.name,
            children: tempoStack.metadata.name,
          });
        });
      }
      setTempoStackList(dropdownOptions);
    });
  }, []);

  return {
    tempoStackList,
  };
};
