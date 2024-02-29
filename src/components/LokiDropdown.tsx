import * as React from 'react';
import {
  Select,
  SelectOption,
  SelectVariant,
  SelectOptionProps,
} from '@patternfly/react-core';

export const LokiDropdown = (props: {
  selectionOptions: SelectOptionProps[];
}) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState<string>('');

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    // eslint-disable-next-line no-console
    console.log('selected', value);

    /**
     * TODO: Migrate this selection to also update some global state
     * much like how dashboard dropdown works in the monitoring-plugin
     */
    if (value && value !== 'no results') {
      setSelected(value as string);
    }
    setIsOpen(false);
  };

  const clearSelection = () => {
    setSelected(null);
    setIsOpen(false);
  };
  const titleId = 'type-ahead-select-id-1';
  return (
    <div>
      <span id={titleId} hidden>
        Select a state
      </span>
      <Select
        variant={SelectVariant.typeahead}
        typeAheadAriaLabel="Select a state"
        onToggle={onToggle}
        onSelect={onSelect}
        onClear={clearSelection}
        selections={selected}
        isOpen={isOpen}
        aria-labelledby={titleId}
        placeholderText="Select a state"
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
