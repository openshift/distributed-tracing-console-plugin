import React from 'react';
import {
  EmptyState,
  EmptyStateBody,
  EmptyStateHeader,
  EmptyStateIcon,
} from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';

import { useTranslation } from 'react-i18next';

export const NoTempoInstanceSelectedState: React.FunctionComponent = () => {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');

  return (
    <EmptyState>
      <EmptyStateHeader
        titleText={t('No Tempo instance selected')}
        headingLevel="h4"
        icon={<EmptyStateIcon icon={CubesIcon} />}
      />
      <EmptyStateBody>
        {t('To explore data, select a Tempo instance and run a query.')}
      </EmptyStateBody>
    </EmptyState>
  );
};
