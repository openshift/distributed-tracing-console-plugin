import * as React from 'react';
import { Form, FormGroup } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { TimeRangeControls } from '@perses-dev/plugin-system';
import './TimeRangeSelect.css';

export const TimeRangeSelect = () => {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');

  return (
    <Form className="dt-plugin-time-range-select">
      <FormGroup label={t('Time range')}>
        <TimeRangeControls
          showRefreshInterval={false}
          showRefreshButton={false}
          showZoomButtons={false}
        />
      </FormGroup>
    </Form>
  );
};
