import React, { useState } from 'react';
import { Bullseye, Button, EmptyState, Flex, FlexItem, Title } from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { TraceQueryPanelWrapper } from '../../components/PersesWrapper';
import { ScatterChart } from '@perses-dev/panels-plugin';
import { ExpandIcon, CompressIcon } from '@patternfly/react-icons';
import { useRefWidth } from '../../components/console/utils/ref-width-hook';

export function ScatterPlot() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const [isVisible, setVisible] = useState(true);
  const [ref, width] = useRefWidth();

  const noResults = (
    <Bullseye>
      <EmptyState>
        <Title headingLevel="h2" size="lg">
          {t('No results found')}
        </Title>
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
          <TraceQueryPanelWrapper noResults={noResults}>
            <ScatterChart.PanelComponent
              contentDimensions={{
                width,
                height: 200,
              }}
              spec={{}}
            />
          </TraceQueryPanelWrapper>
        </div>
      )}
    </div>
  );
}
