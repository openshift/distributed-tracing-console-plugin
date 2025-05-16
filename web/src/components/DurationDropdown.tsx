import * as React from 'react';
import {
  Select,
  SelectVariant,
  SelectOption,
  SelectOptionObject,
  Stack,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { DurationString } from '@perses-dev/core';

type TimeRangeSelectOption = {
  display: string;
  value: DurationString;
};

type DurationDropDownProps = {
  duration: DurationString;
  setDuration: (timeRange: DurationString) => void;
};

// Keep this list in sync with timeRangeSelectOptions below
// (due to the translation we can't move TimeRangeSelectOption[] outside of the component)
export const DurationValues = ['5m', '15m', '30m', '1h', '6h', '12h', '1d', '7d'];

export const DurationDropdown = ({ duration, setDuration }: DurationDropDownProps) => {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const [isOpen, setIsOpen] = React.useState(false);

  // The time range selection mirrors the options on the Metrics Page
  // Keep this list in sync with DurationValues above
  const timeRangeSelectOptions: TimeRangeSelectOption[] = [
    {
      display: t('Last 5 minutes'),
      value: '5m',
    },
    {
      display: t('Last 15 minutes'),
      value: '15m',
    },
    {
      display: t('Last 30 minutes'),
      value: '30m',
    },
    {
      display: t('Last 1 hour'),
      value: '1h',
    },
    {
      display: t('Last 6 hours'),
      value: '6h',
    },
    {
      display: t('Last 12 hours'),
      value: '12h',
    },
    {
      display: t('Last 1 day'),
      value: '1d',
    },
    {
      display: t('Last 7 days'),
      value: '7d',
    },
  ];

  const onToggle = () => {
    setIsOpen(!isOpen);
  };

  const onSelect = (
    _event: React.MouseEvent | React.ChangeEvent,
    value: string | SelectOptionObject,
  ) => {
    setDuration(value.toString() as DurationString);
    setIsOpen(false);
  };

  return (
    <Stack>
      <label htmlFor="duration-dropdown">{t('Time Range')}</label>
      <Select
        id="duration-dropdown"
        variant={SelectVariant.typeahead}
        typeAheadAriaLabel={t('Select a Time Range')}
        onToggle={onToggle}
        onSelect={onSelect}
        selections={duration}
        isOpen={isOpen}
        placeholderText={t('Select a Time Range')}
        width={200}
      >
        {timeRangeSelectOptions.map((option: TimeRangeSelectOption) => (
          <SelectOption key={option.display} value={option.value}>
            {option.display}
          </SelectOption>
        ))}
      </Select>
    </Stack>
  );
};
