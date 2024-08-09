import * as React from 'react';
import { Select, SelectVariant, SelectOption, SelectOptionObject } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { DurationString } from '@perses-dev/prometheus-plugin';

type TimeRangeSelectOption = {
  display: string;
  value: DurationString;
};

type DurationDropDownProps = {
  duration: DurationString;
  setDuration: (timeRange: DurationString) => void;
};

export const DurationDropdown = ({ duration, setDuration }: DurationDropDownProps) => {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const [isOpen, setIsOpen] = React.useState(false);

  // The time range selection mirrors the options on the Metrics Page
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
    {
      display: t('Last 14 days'),
      value: '14d',
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

  const titleId = 'time-range-select';
  return (
    <Select
      variant={SelectVariant.typeahead}
      typeAheadAriaLabel={t('Select a Time Range')}
      onToggle={onToggle}
      onSelect={onSelect}
      selections={duration}
      isOpen={isOpen}
      aria-labelledby={titleId}
      placeholderText={t('Select a Time Range')}
      width={200}
    >
      {timeRangeSelectOptions.map((option: TimeRangeSelectOption) => (
        <SelectOption key={option.display} value={option.value}>
          {option.display}
        </SelectOption>
      ))}
    </Select>
  );
};
