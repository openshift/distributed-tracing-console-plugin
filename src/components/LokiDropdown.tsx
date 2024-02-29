import * as React from 'react';
import {
  Select,
  SelectOption,
  SelectVariant,
  SelectOptionProps,
} from '@patternfly/react-core';

type LokiDropdownProps = {
  selectionOptions: SelectOptionProps[];
  selectedLokiList: string | undefined;
  setLokiList: (selectedLokiStack?: string) => void;
};

export const LokiDropdown = (props: LokiDropdownProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>(
    props.selectedLokiList ?? '',
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
    props.setLokiList(value as string);
    setIsOpen(false);
  };

  const clearSelection = () => {
    setSelected(null);
    setIsOpen(false);
  };
  const titleId = 'loki-stack-select';
  return (
    <div>
      <span id={titleId} hidden>
        Select a LokiStack
      </span>
      <Select
        variant={SelectVariant.typeahead}
        typeAheadAriaLabel="Select a LokiStack"
        onToggle={onToggle}
        onSelect={onSelect}
        onClear={clearSelection}
        selections={selected}
        isOpen={isOpen}
        aria-labelledby={titleId}
        placeholderText="Select a LokiStack"
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
