import React from 'react';
import { EmptyState, EmptyStateBody, EmptyStateIcon, Title } from '@patternfly/react-core';
import { CubesIcon } from '@patternfly/react-icons';

import { useTranslation } from 'react-i18next';

export const NoTempoInstanceSelectedState: React.FunctionComponent = () => {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');

  return (
    <EmptyState>
      <EmptyStateIcon icon={CubesIcon} />
      <Title headingLevel="h2" size="lg">
        {t('No Tempo instance selected')}
      </Title>
      <EmptyStateBody>
        {t('To explore data, select a Tempo instance and run a query.')}
      </EmptyStateBody>
    </EmptyState>
  );
};
