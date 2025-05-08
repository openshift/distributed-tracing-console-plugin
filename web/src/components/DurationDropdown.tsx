import * as React from 'react';
import { Form, FormGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { DurationString } from '@perses-dev/core';
import { ControlledSimpleSelect } from './ControlledSelects';

type DurationDropDownProps = {
  duration: DurationString;
  setDuration: (timeRange: DurationString) => void;
};

export const DEFAULT_DURATION = '30m';

// Keep this list in sync with timeRangeSelectOptions below
// (due to the translation we can't move TimeRangeSelectOption[] outside of the component)
export const DurationValues = ['5m', '15m', '30m', '1h', '6h', '12h', '1d', '7d'];

export const DurationDropdown = ({ duration, setDuration }: DurationDropDownProps) => {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');

  // The time range selection mirrors the options on the Metrics Page
  // Keep this list in sync with DurationValues above
  const timeRangeSelectOptions = [
    {
      content: t('Last 5 minutes'),
      value: '5m',
    },
    {
      content: t('Last 15 minutes'),
      value: '15m',
    },
    {
      content: t('Last 30 minutes'),
      value: '30m',
    },
    {
      content: t('Last 1 hour'),
      value: '1h',
    },
    {
      content: t('Last 6 hours'),
      value: '6h',
    },
    {
      content: t('Last 12 hours'),
      value: '12h',
    },
    {
      content: t('Last 1 day'),
      value: '1d',
    },
    {
      content: t('Last 7 days'),
      value: '7d',
    },
  ];

  return (
    <Form>
      <FormGroup fieldId="duration-dropdown" label={t('Time range')}>
        <ControlledSimpleSelect
          id="duration-dropdown"
          toggleWidth="12em"
          placeholder={t('Select a time range')}
          options={timeRangeSelectOptions}
          value={duration}
          setValue={(value) => setDuration(value as DurationString)}
        />
      </FormGroup>
    </Form>
  );
};
