import * as React from 'react';
import { Select, SelectVariant, SelectOption } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { DurationString } from '@perses-dev/prometheus-plugin';

type TimeRangeSelectOption = {
  display: string;
  value: DurationString;
};

type DurationDropDownProps = {
  handleDurationChange: (timeRange: DurationString) => void;
};

export const DurationDropdown = (props: DurationDropDownProps) => {
  const [isOpen, setIsOpen] = React.useState(false);
  const [selected, setSelected] = React.useState('30m');

  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');

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
    _event: React.MouseEvent<Element, MouseEvent> | undefined,
    value: DurationString | undefined,
  ) => {
    if (!value) {
      setSelected(undefined);
    }
    setSelected(value);
    setIsOpen(false);
    props.handleDurationChange(value);
  };

  const titleId = 'time-range-select';
  return (
    <Select
      id={selected}
      variant={SelectVariant.typeahead}
      typeAheadAriaLabel={t('Select a Time Range')}
      onToggle={onToggle}
      onSelect={onSelect}
      selections={selected}
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
