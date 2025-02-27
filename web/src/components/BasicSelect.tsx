import React from 'react';
import {
  Select,
  SelectOption,
  SelectList,
  MenuToggle,
  MenuToggleElement,
  SelectOptionProps,
} from '@patternfly/react-core';

interface BasicSelectProps {
  id: string;
  width: number;
  placeholder: string;
  options: SelectOptionProps[];
  selected?: string;
  setSelected: (value?: string) => void;
}

export function BasicSelect({
  id,
  width,
  placeholder,
  options,
  selected,
  setSelected,
}: BasicSelectProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  const onToggleClick = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    setSelected(value as string);
    setIsOpen(false);
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle ref={toggleRef} onClick={onToggleClick} isExpanded={isOpen} style={{ width }}>
      {selected ? options.find((o) => o.value === selected)?.children ?? placeholder : placeholder}
    </MenuToggle>
  );

  return (
    <Select
      id={id}
      isOpen={isOpen}
      selected={selected}
      onSelect={onSelect}
      onOpenChange={(isOpen) => setIsOpen(isOpen)}
      toggle={toggle}
      shouldFocusToggleOnSelect
    >
      <SelectList>
        {options.map((option) => (
          <SelectOption key={option.value} value={option.value}>
            {option.children}
          </SelectOption>
        ))}
      </SelectList>
    </Select>
  );
}
