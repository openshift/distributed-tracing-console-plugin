import React, { useState } from 'react';
import {
  Bullseye,
  Button,
  EmptyState,
  EmptyStateBody,
  Flex,
  FlexItem,
} from '@patternfly/react-core';
import { useTranslation } from 'react-i18next';
import { TraceQueryPanelWrapper } from '../../components/PersesWrapper';
import { ScatterChart } from '@perses-dev/panels-plugin';
import { ExpandIcon, CompressIcon } from '@patternfly/react-icons';
import { useRefWidth } from '../../components/console/utils/ref-width-hook';
import { useNavigate } from 'react-router-dom-v5-compat';
import { linkToTraceDetailPage } from '../../links';

export function ScatterPlot() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const navigate = useNavigate();
  const [isVisible, setVisible] = useState(true);
  const [ref, width] = useRefWidth();

  const clickHandler = (data: { traceId: string }) => {
    navigate(linkToTraceDetailPage(data.traceId));
  };

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
          <Button variant="link" onClick={() => setVisible(!isVisible)}>
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
            border:
              'var(--pf-t--global--border--width--box--default) solid var(--pf-t--global--border--color--default)',
            borderRadius: 'var(--pf-t--global--border--radius--small)',
          }}
        >
          <TraceQueryPanelWrapper noResults={noResults}>
            <ScatterChart.PanelComponent
              contentDimensions={{
                width,
                height: 200,
              }}
              spec={{}}
              onClick={clickHandler}
            />
          </TraceQueryPanelWrapper>
        </div>
      )}
    </div>
  );
}
