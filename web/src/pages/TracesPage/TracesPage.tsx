import React from 'react';
import { useTempoResources } from '../../hooks/useTempoResources';
import { QueryBrowser } from './QueryBrowser';
import {
  Bullseye,
  Button,
  Divider,
  EmptyState,
  EmptyStateBody,
  EmptyStateIcon,
  EmptyStateSecondaryActions,
  Page,
  PageSection,
  Stack,
  Title,
} from '@patternfly/react-core';
import { PlusCircleIcon, WrenchIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useTempoInstance } from '../../hooks/useTempoInstance';
import { ErrorAlert } from '../../components/ErrorAlert';
import { LoadingState } from '../../components/LoadingState';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Link } from 'react-router-dom';

const installOperatorLink =
  '/operatorhub/all-namespaces?keyword=Tempo&details-item=tempo-product-redhat-operators-openshift-marketplace';
const createTempoInstanceLink =
  '/api-resource/all-namespaces/tempo.grafana.com~v1alpha1~TempoStack/instances';
const readInstallationDocsLink =
  'https://docs.openshift.com/container-platform/4.16/observability/distr_tracing/distr_tracing_tempo/distr-tracing-tempo-installing.html';

export function TracesPage() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');

  return (
    <>
      <HelmetProvider>
        <Helmet>
          <title>{t('Tracing')}</title>
        </Helmet>
      </HelmetProvider>
      <Page>
        <TracesPageBody />
      </Page>
    </>
  );
}

// TracesPageBody handles empty states like "Tempo Operator not installed" or "No Tempo instances created yet".
function TracesPageBody() {
  const { loading, error, tempoResources } = useTempoResources();
  const [tempo] = useTempoInstance();

  // show loading state (loading the list of Tempo CRs in the cluster)
  // only if no Tempo instance is selected (from the query params)
  if (!tempo && loading) {
    return <LoadingState />;
  }

  if (error) {
    if (error.errorType === 'TempoCRDNotFound') {
      return <TempoOperatorNotInstalledState />;
    } else {
      return <ErrorState errorType={error.errorType} error={error.error} />;
    }
  }

  if (!loading && tempoResources && tempoResources.length === 0) {
    return <NoTempoInstance />;
  }

  return <QueryBrowser />;
}

function TempoOperatorNotInstalledState() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1">{t('Traces')}</Title>
      </PageSection>
      <PageSection>
        <Bullseye>
          <EmptyState>
            <EmptyStateIcon icon={WrenchIcon} />
            <Title headingLevel="h2" size="lg">
              {t('Install Tempo Operator')}
            </Title>
            <EmptyStateBody>
              {t(
                'To get started, install the Tempo Operator and create a TempoStack or TempoMonolithic instance with multi-tenancy enabled.',
              )}
            </EmptyStateBody>
            <Button component={(props) => <Link {...props} to={installOperatorLink} />}>
              {t('Install operator')}
            </Button>
            <EmptyStateSecondaryActions>
              <Button variant="link" component="a" href={readInstallationDocsLink}>
                {t('Read the documentation')}
              </Button>
            </EmptyStateSecondaryActions>
          </EmptyState>
        </Bullseye>
      </PageSection>
    </>
  );
}

function NoTempoInstance() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1">{t('Traces')}</Title>
      </PageSection>
      <PageSection>
        <Bullseye>
          <EmptyState>
            <EmptyStateIcon icon={PlusCircleIcon} />
            <Title headingLevel="h2" size="lg">
              {t('No Tempo instances yet')}
            </Title>
            <EmptyStateBody>
              {t(
                'To get started, create a TempoStack or TempoMonolithic instance with multi-tenancy enabled.',
              )}
            </EmptyStateBody>
            <Button component={(props) => <Link {...props} to={createTempoInstanceLink} />}>
              {t('Create a TempoStack instance')}
            </Button>
            <EmptyStateSecondaryActions>
              <Button variant="link" component="a" href={readInstallationDocsLink}>
                {t('Read the documentation')}
              </Button>
            </EmptyStateSecondaryActions>
          </EmptyState>
        </Bullseye>
      </PageSection>
    </>
  );
}

interface ErrorStateProps {
  errorType?: string;
  error: string;
}

function ErrorState({ errorType, error }: ErrorStateProps) {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  return (
    <PageSection variant="light">
      <Stack hasGutter>
        <Title headingLevel="h1">{t('Tracing')}</Title>
        <Divider />
        <ErrorAlert error={{ name: errorType ?? t('Error'), message: error }} />
      </Stack>
    </PageSection>
  );
}
