import React, { useState } from 'react';
import { Select, SelectOption, SelectOptionObject, Spinner } from '@patternfly/react-core';

interface TypeaheadSelectProps {
  width: number;
  label: string;
  isLoading?: boolean;
  allowClear?: boolean;
  options: string[];
  selected: string | undefined;
  setSelected: (value: string | undefined) => void;
}

export function TypeaheadSelect({
  width,
  label,
  isLoading = false,
  allowClear = true,
  options,
  selected,
  setSelected,
}: TypeaheadSelectProps) {
  const [isOpen, setOpen] = useState(false);

  function onFilter(_event: React.ChangeEvent<HTMLInputElement> | null, value: string) {
    return options
      .filter((option) => option.includes(value))
      .map((item, i) => <SelectOption key={i} value={item}></SelectOption>);
  }

  function onSelect(
    _event: React.MouseEvent | React.ChangeEvent,
    value: string | SelectOptionObject,
  ) {
    setSelected(value.toString());
    setOpen(false);
  }

  function onToggle() {
    setOpen(!isOpen);
  }

  function onClear() {
    setSelected(undefined);
    setOpen(false);
  }

  return (
    <Select
      variant="typeahead"
      width={width}
      isOpen={isOpen}
      selections={selected}
      onFilter={onFilter}
      onSelect={onSelect}
      onToggle={onToggle}
      onClear={allowClear ? onClear : undefined}
      placeholderText={label}
    >
      {isLoading
        ? [
            <SelectOption isLoading key="custom-loading" value="loading">
              <Spinner size="lg" />
            </SelectOption>,
          ]
        : options.map((option, i) => <SelectOption key={i} value={option} />)}
    </Select>
  );
}
