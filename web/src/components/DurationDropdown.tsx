import * as React from 'react';
import { Stack } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { DurationString } from '@perses-dev/prometheus-plugin';
import { BasicSelect } from './BasicSelect';

type TimeRangeSelectOption = {
  children: string;
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

  // The time range selection mirrors the options on the Metrics Page
  // Keep this list in sync with DurationValues above
  const timeRangeSelectOptions: TimeRangeSelectOption[] = [
    {
      children: t('Last 5 minutes'),
      value: '5m',
    },
    {
      children: t('Last 15 minutes'),
      value: '15m',
    },
    {
      children: t('Last 30 minutes'),
      value: '30m',
    },
    {
      children: t('Last 1 hour'),
      value: '1h',
    },
    {
      children: t('Last 6 hours'),
      value: '6h',
    },
    {
      children: t('Last 12 hours'),
      value: '12h',
    },
    {
      children: t('Last 1 day'),
      value: '1d',
    },
    {
      children: t('Last 7 days'),
      value: '7d',
    },
  ];

  return (
    <Stack>
      <label htmlFor="duration-dropdown">{t('Time Range')}</label>
      <BasicSelect
        id="duration-dropdown"
        width={200}
        placeholder={t('Select a Time Range')}
        options={timeRangeSelectOptions}
        selected={duration}
        setSelected={(value) => setDuration(value as DurationString)}
      />
    </Stack>
  );
};
