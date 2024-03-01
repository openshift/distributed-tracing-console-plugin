import * as React from 'react';
import {
  Select,
  SelectOption,
  SelectVariant,
  SelectOptionProps,
} from '@patternfly/react-core';

type TempoDropdownProps = {
  id: string;
  selectionOptions: SelectOptionProps[];
  selectedTempoList: string | undefined;
  selectedNamespace: string | undefined;
  setTempoList: (
    selectedTempoStack?: string,
    selectedNamespace?: string,
  ) => void;
};

export const TempoDropdown = (props: TempoDropdownProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>(
    props.selectedTempoList && props.selectedNamespace
      ? props.selectedNamespace + ' / ' + props.selectedTempoList
      : '',
  );

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    if (value && value !== 'no results') {
      setSelected(value as string);
    }
    const [namespace, tempoStackName] = String(value).split(' / ');
    props.setTempoList(tempoStackName, namespace);
    setIsOpen(false);
  };

  const clearSelection = () => {
    setSelected(null);
    props.setTempoList();
    setIsOpen(false);
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
        typeAheadAriaLabel="Select a TempoStack"
        onToggle={onToggle}
        onSelect={onSelect}
        onClear={clearSelection}
        selections={selected}
        isOpen={isOpen}
        aria-labelledby={titleId}
        placeholderText="Select a TempoStack"
        width={400}
      >
        {props.selectionOptions.map((option, index) => (
          <SelectOption
            isDisabled={option.disabled}
            key={index}
            value={option.value}
            {...(option.description && { description: option.description })}
          />
        ))}
      </Select>
    </div>
  );
};
