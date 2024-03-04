import * as React from 'react';
import {
  Select,
  SelectOption,
  SelectVariant,
  SelectOptionObject,
} from '@patternfly/react-core';
import { K8sResourceCommon } from '@openshift-console/dynamic-plugin-sdk';
import { useTranslation } from 'react-i18next';

type TempoStackDropdownProps = {
  id: string;
  tempoStackOptions: K8sResourceCommon[];
  selectedNamespace: string | undefined;
  selectedTempoList: string | undefined;
  setTempoList: (
    selectedNamespace?: string,
    selectedTempoStack?: string,
  ) => void;
};

class TempoStackSelectOption implements SelectOptionObject {
  constructor(public namespace: string, public name: string) {}
  public toString() {
    return this.namespace + ' / ' + this.name;
  }
  public compareTo(other: TempoStackSelectOption) {
    return this.namespace === other.namespace && this.name === other.name;
  }
}

export const TempoStackDropdown = (props: TempoStackDropdownProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<
    TempoStackSelectOption | undefined
  >(() =>
    props.selectedNamespace && props.selectedTempoList
      ? new TempoStackSelectOption(
          props.selectedNamespace,
          props.selectedTempoList,
        )
      : undefined,
  );
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: TempoStackSelectOption | undefined,
  ) => {
    if (!value) {
      setSelected(undefined);
    }
    props.setTempoList(value.namespace, value.name);
    setSelected(value);
    setIsOpen(false);
  };

  const clearSelection = () => {
    setSelected(null);
    props.setTempoList();
    setIsOpen(false);
  };

  const tempoStackSelectOptions = props.tempoStackOptions.map((tempoStack) => {
    return new TempoStackSelectOption(
      tempoStack.metadata.namespace,
      tempoStack.metadata.name,
    );
  });

  const tempoStackOptionFilter = (
    _: React.ChangeEvent<HTMLInputElement>,
    value: string,
  ) => {
    return tempoStackSelectOptions
      .filter((option) => {
        return !option.toString().search(value);
      })
      .map((item, index) => {
        return <SelectOption key={index} value={item}></SelectOption>;
      });
  };

  const titleId = 'tempo-stack-select';
  return (
    <div>
      <span id={titleId} hidden>
        Select a TempoStack
      </span>
      <Select
        id={props.id}
        variant={SelectVariant.typeahead}
        typeAheadAriaLabel={t('Select a TempoStack')}
        onFilter={tempoStackOptionFilter}
        onToggle={onToggle}
        onSelect={onSelect}
        onClear={clearSelection}
        selections={selected}
        isOpen={isOpen}
        aria-labelledby={titleId}
        placeholderText={t('Select a TempoStack')}
        width={400}
      >
        {tempoStackSelectOptions.map((option, index) => (
          <SelectOption key={index} value={option} />
        ))}
      </Select>
    </div>
  );
};
