import React from 'react';
import {
  Select,
  SelectOption,
  SelectList,
  SelectOptionProps,
  MenuToggle,
  MenuToggleElement,
  TextInputGroup,
  TextInputGroupMain,
  TextInputGroupUtilities,
  Button,
  Spinner,
} from '@patternfly/react-core';
import { TimesIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';

interface TypeaheadSelectProps {
  id: string;
  width: number;
  placeholder: string;
  options: SelectOptionProps[];
  selected?: string;
  setSelected: (value?: string) => void;
  allowClear?: boolean;
  loading?: boolean;
}

// adapted from https://v5-archive.patternfly.org/components/menus/select#typeahead
export function TypeaheadSelect(props: TypeaheadSelectProps) {
  const { selected, setSelected } = props;
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const [isOpen, setIsOpen] = React.useState(false);
  const [inputValue, setInputValue] = React.useState<string>('');
  const [filterValue, setFilterValue] = React.useState<string>('');
  const [selectOptions, setSelectOptions] = React.useState<SelectOptionProps[]>(props.options);
  const [focusedItemIndex, setFocusedItemIndex] = React.useState<number | null>(null);
  const [activeItemId, setActiveItemId] = React.useState<string | null>(null);
  const textInputRef = React.useRef<HTMLInputElement>();

  const NO_RESULTS = 'no results';

  React.useEffect(() => {
    let newSelectOptions: SelectOptionProps[] = props.options;

    // Filter menu items based on the text input value when one exists
    if (filterValue) {
      newSelectOptions = props.options.filter((menuItem) =>
        String(menuItem.children).toLowerCase().includes(filterValue.toLowerCase()),
      );

      // When no options are found after filtering, display 'No results found'
      if (!newSelectOptions.length) {
        newSelectOptions = [
          {
            isAriaDisabled: true,
            children: t('No results found for {{value}}', { value: filterValue }),
            value: NO_RESULTS,
          },
        ];
      }

      // Open the menu when the input value changes and the new value is not empty
      if (!isOpen) {
        setIsOpen(true);
      }
    }

    setSelectOptions(newSelectOptions);
  }, [t, props.options, filterValue, isOpen]);

  React.useEffect(() => {
    const option = props.options.find((o) => o.value === props.selected);
    if (option) {
      setInputValue(String(option.children));
      setFilterValue('');
    }
  }, [props.selected, props.options]);

  const createItemId = (value: string) => `${props.id}-item-${value.replace(' ', '-')}`;

  const setActiveAndFocusedItem = (itemIndex: number) => {
    setFocusedItemIndex(itemIndex);
    const focusedItem = selectOptions[itemIndex];
    setActiveItemId(createItemId(focusedItem.value));
  };

  const resetActiveAndFocusedItem = () => {
    setFocusedItemIndex(null);
    setActiveItemId(null);
  };

  const closeMenu = () => {
    setIsOpen(false);
    resetActiveAndFocusedItem();
  };

  const onInputClick = () => {
    if (!isOpen) {
      setIsOpen(true);
    } else if (!inputValue) {
      closeMenu();
    }
  };

  const selectOption = (value: string | number, content: string | number) => {
    setInputValue(String(content));
    setFilterValue('');
    setSelected(String(value));

    closeMenu();
  };

  const onSelect = (
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: string | number | undefined,
  ) => {
    if (value && value !== NO_RESULTS) {
      const optionText = selectOptions.find((option) => option.value === value)?.children;
      selectOption(value, optionText as string);
    }
  };

  const onTextInputChange = (_event: React.FormEvent<HTMLInputElement>, value: string) => {
    setInputValue(value);
    setFilterValue(value);

    resetActiveAndFocusedItem();

    if (value !== selected) {
      setSelected('');
    }
  };

  const handleMenuArrowKeys = (key: string) => {
    let indexToFocus = 0;

    if (!isOpen) {
      setIsOpen(true);
    }

    if (selectOptions.every((option) => option.isDisabled)) {
      return;
    }

    if (key === 'ArrowUp') {
      // When no index is set or at the first index, focus to the last, otherwise decrement focus index
      if (focusedItemIndex === null || focusedItemIndex === 0) {
        indexToFocus = selectOptions.length - 1;
      } else {
        indexToFocus = focusedItemIndex - 1;
      }

      // Skip disabled options
      while (selectOptions[indexToFocus].isDisabled) {
        indexToFocus--;
        if (indexToFocus === -1) {
          indexToFocus = selectOptions.length - 1;
        }
      }
    }

    if (key === 'ArrowDown') {
      // When no index is set or at the last index, focus to the first, otherwise increment focus index
      if (focusedItemIndex === null || focusedItemIndex === selectOptions.length - 1) {
        indexToFocus = 0;
      } else {
        indexToFocus = focusedItemIndex + 1;
      }

      // Skip disabled options
      while (selectOptions[indexToFocus].isDisabled) {
        indexToFocus++;
        if (indexToFocus === selectOptions.length) {
          indexToFocus = 0;
        }
      }
    }

    setActiveAndFocusedItem(indexToFocus);
  };

  const onInputKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    const focusedItem = focusedItemIndex !== null ? selectOptions[focusedItemIndex] : null;

    switch (event.key) {
      case 'Enter':
        if (
          isOpen &&
          focusedItem &&
          focusedItem.value !== NO_RESULTS &&
          !focusedItem.isAriaDisabled
        ) {
          selectOption(focusedItem.value, focusedItem.children as string);
        }

        if (!isOpen) {
          setIsOpen(true);
        }

        break;
      case 'ArrowUp':
      case 'ArrowDown':
        event.preventDefault();
        handleMenuArrowKeys(event.key);
        break;
    }
  };

  const onToggleClick = () => {
    setIsOpen(!isOpen);
    textInputRef?.current?.focus();
  };

  const onClearButtonClick = () => {
    setSelected('');
    setInputValue('');
    setFilterValue('');
    resetActiveAndFocusedItem();
    textInputRef?.current?.focus();
  };

  const toggle = (toggleRef: React.Ref<MenuToggleElement>) => (
    <MenuToggle
      ref={toggleRef}
      variant="typeahead"
      aria-label="Typeahead menu toggle"
      onClick={onToggleClick}
      isExpanded={isOpen}
      style={{ width: props.width }}
    >
      <TextInputGroup isPlain>
        <TextInputGroupMain
          value={inputValue}
          onClick={onInputClick}
          onChange={onTextInputChange}
          onKeyDown={onInputKeyDown}
          id={`${props.id}-input`}
          autoComplete="off"
          innerRef={textInputRef}
          placeholder={props.placeholder}
          {...(activeItemId && { 'aria-activedescendant': activeItemId })}
          role="combobox"
          isExpanded={isOpen}
          aria-controls="select-typeahead-listbox"
        />

        {props.allowClear && (
          <TextInputGroupUtilities {...(!inputValue ? { style: { display: 'none' } } : {})}>
            <Button variant="plain" onClick={onClearButtonClick} aria-label="Clear input value">
              <TimesIcon aria-hidden />
            </Button>
          </TextInputGroupUtilities>
        )}
      </TextInputGroup>
    </MenuToggle>
  );

  return (
    <Select
      id={props.id}
      isOpen={isOpen}
      selected={selected}
      onSelect={onSelect}
      onOpenChange={(isOpen) => {
        !isOpen && closeMenu();
      }}
      toggle={toggle}
      shouldFocusFirstItemOnOpen={false}
    >
      <SelectList id={`${props.id}-listbox`}>
        {props.loading ? (
          <SelectOption isLoading key="loading" value="loading">
            <Spinner size="lg" />
          </SelectOption>
        ) : (
          selectOptions.map((option, index) => (
            <SelectOption
              key={option.value}
              isFocused={focusedItemIndex === index}
              className={option.className}
              id={createItemId(option.value)}
              {...option}
              ref={null}
            />
          ))
        )}
      </SelectList>
    </Select>
  );
}
