import React, { useCallback, useState } from 'react';
import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { PersesPanelPluginWrapper } from '../../components/PersesWrapper';
import { ExpandIcon, CompressIcon } from '@patternfly/react-icons';
import { useRefWidth } from '../../components/console/utils/ref-width-hook';
import { useHistory } from 'react-router-dom';
import { linkToTraceDetailPage } from '../../links';
import { ScatterChart } from '@perses-dev/scatter-chart-plugin';

export function ScatterPlot() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const history = useHistory();
  const [isVisible, setVisible] = useState(true);
  const [ref, width] = useRefWidth();

  const clickHandler = useCallback(
    (data: { traceId: string }) => {
      history.push(linkToTraceDetailPage(data.traceId));
    },
    [history],
  );

  const noResults = (
    <Bullseye>
      <EmptyState>
        <EmptyStateBody>{t('No datapoints found.')}</EmptyStateBody>
      </EmptyState>
    </Bullseye>
  );

  return (
    <div>
      <Flex>
        <FlexItem align={{ default: 'alignRight' }}>
          <Button
            variant="link"
            className="pf-m-link pf-v5-u-text-align-right"
            onClick={() => setVisible(!isVisible)}
          >
            {isVisible ? (
              <>
                <CompressIcon /> {t('Hide graph')}
              </>
            ) : (
              <>
                <ExpandIcon /> {t('Show graph')}
              </>
            )}
          </Button>
        </FlexItem>
      </Flex>

      {isVisible && (
        <div
          ref={ref}
          style={{
            height: '200px',
            flexShrink: 0,
            border: 'var(--pf-global--BorderWidth--sm) solid var(--pf-global--BorderColor--100)',
          }}
        >
          <PersesPanelPluginWrapper
            plugin={ScatterChart}
            noResults={noResults}
            contentDimensions={{
              width,
              height: 200,
            }}
            spec={{}}
            onClick={clickHandler}
          />
        </div>
      )}
    </div>
  );
}
