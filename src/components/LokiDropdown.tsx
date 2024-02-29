import * as React from 'react';
import {
  Select,
  SelectOption,
  SelectVariant,
  SelectOptionProps,
} from '@patternfly/react-core';

type LokiDropdownProps = {
  id: string;
  selectionOptions: SelectOptionProps[];
  selectedLokiList: string | undefined;
  selectedNamespace: string | undefined;
  setLokiList: (selectedLokiStack?: string, selectedNamespace?: string) => void;
};

export const LokiDropdown = (props: LokiDropdownProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>(
    props.selectedLokiList && props.selectedNamespace
      ? props.selectedNamespace + ' / ' + props.selectedLokiList
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
    const [namespace, lokiStackName] = String(value).split(' / ');
    props.setLokiList(lokiStackName, namespace);
    setIsOpen(false);
  };

  const clearSelection = () => {
    setSelected(null);
    props.setLokiList();
    setIsOpen(false);
  };
  const titleId = 'loki-stack-select';
  return (
    <div>
      <span id={titleId} hidden>
        Select a LokiStack
      </span>
      <Select
        id={props.id}
        variant={SelectVariant.typeahead}
        typeAheadAriaLabel="Select a LokiStack"
        onToggle={onToggle}
        onSelect={onSelect}
        onClear={clearSelection}
        selections={selected}
        isOpen={isOpen}
        aria-labelledby={titleId}
        placeholderText="Select a LokiStack"
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
