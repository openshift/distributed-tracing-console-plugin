import React, { useState } from 'react';
import { useTempoResources } from '../../hooks/useTempoResources';
import { QueryBrowser } from './QueryBrowser';
import {
  Button,
  Divider,
  Dropdown,
  DropdownItem,
  DropdownList,
  EmptyState,
  EmptyStateActions,
  EmptyStateBody,
  EmptyStateFooter,
  EmptyStateHeader,
  EmptyStateIcon,
  MenuToggle,
  Page,
  PageSection,
  Stack,
  Title,
} from '@patternfly/react-core';
import { PlusCircleIcon, WrenchIcon, ExternalLinkAltIcon } from '@patternfly/react-icons';
import { useTranslation } from 'react-i18next';
import { useTempoInstance } from '../../hooks/useTempoInstance';
import { ErrorAlert } from '../../components/ErrorAlert';
import { LoadingState } from '../../components/LoadingState';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { Link } from 'react-router-dom-v5-compat';
import { QueryParamProvider } from 'use-query-params';
import { ReactRouterAdapter } from '../../react_router_adapter';

const installOperatorLink =
  '/operatorhub/all-namespaces?keyword=Tempo&details-item=tempo-product-redhat-operators-openshift-marketplace';
const createTempoStackLink =
  '/api-resource/all-namespaces/tempo.grafana.com~v1alpha1~TempoStack/instances';
const createTempoMonolithicLink =
  '/api-resource/all-namespaces/tempo.grafana.com~v1alpha1~TempoMonolithic/instances';
const viewInstallationDocsLink =
  'https://docs.redhat.com/en/documentation/openshift_container_platform/latest/html/distributed_tracing/distributed-tracing-platform-tempo';

export default function TracesPage() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');

  return (
    <QueryParamProvider adapter={ReactRouterAdapter}>
      <HelmetProvider>
        <Helmet>
          <title>{t('Tracing')}</title>
        </Helmet>
      </HelmetProvider>
      <Page>
        <TracesPageBody />
      </Page>
    </QueryParamProvider>
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
        <EmptyState>
          <EmptyStateHeader
            titleText={t("Tempo operator isn't installed yet")}
            headingLevel="h4"
            icon={<EmptyStateIcon icon={WrenchIcon} />}
          />
          <EmptyStateBody>
            {t(
              'To get started, install the Tempo operator and create a TempoStack or TempoMonolithic instance with multi-tenancy enabled.',
            )}
          </EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Button component={(props) => <Link {...props} to={installOperatorLink} />}>
                {t('Install Tempo operator')}
              </Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
      </PageSection>
    </>
  );
}

function NoTempoInstance() {
  const { t } = useTranslation('plugin__distributed-tracing-console-plugin');
  const [isOpen, setOpen] = useState(false);

  return (
    <>
      <PageSection variant="light">
        <Title headingLevel="h1">{t('Traces')}</Title>
      </PageSection>
      <PageSection>
        <EmptyState>
          <EmptyStateHeader
            titleText={t('No Tempo instances yet')}
            headingLevel="h4"
            icon={<EmptyStateIcon icon={PlusCircleIcon} />}
          />
          <EmptyStateBody>
            {t(
              'To get started, create a TempoStack or TempoMonolithic instance with multi-tenancy enabled.',
            )}
          </EmptyStateBody>
          <EmptyStateFooter>
            <EmptyStateActions>
              <Dropdown
                isOpen={isOpen}
                onOpenChange={setOpen}
                toggle={(toggleRef) => (
                  <MenuToggle
                    ref={toggleRef}
                    variant="primary"
                    onClick={() => setOpen(!isOpen)}
                    isExpanded={isOpen}
                  >
                    {t('Create a Tempo instance')}
                  </MenuToggle>
                )}
              >
                <DropdownList>
                  <DropdownItem key="createTempoStackLink" to={createTempoStackLink}>
                    {t('Create a TempoStack instance')}
                  </DropdownItem>
                  <DropdownItem key="createTempoMonolithicLink" to={createTempoMonolithicLink}>
                    {t('Create a TempoMonolithic instance')}
                  </DropdownItem>
                </DropdownList>
              </Dropdown>
            </EmptyStateActions>
            <EmptyStateActions>
              <Button
                variant="link"
                component="a"
                href={viewInstallationDocsLink}
                icon={<ExternalLinkAltIcon />}
                iconPosition="right"
              >
                {t('View documentation')}
              </Button>
            </EmptyStateActions>
          </EmptyStateFooter>
        </EmptyState>
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
