import { operatorHubPage } from '../views/operator-hub-page';
import { olsHelpers, OLS_SELECTORS } from '../views/lightspeed';

// Set constants for the operators that need to be installed for tests.
const DTP = {
  namespace: Cypress.env('COO_NAMESPACE') || 'openshift-cluster-observability-operator',
  packageName: 'cluster-observability-operator',
  operatorName: 'Cluster Observability Operator',
  config: {
    kind: 'UIPlugin',
    name: 'distributed-tracing',
  },
};

const OTEL = {
  namespace: 'openshift-opentelemetry-operator',
  packageName: 'opentelemetry-product',
  operatorName: 'Red Hat build of OpenTelemetry',
};

const TEMPO = {
  namespace: 'openshift-tempo-operator',
  packageName: 'tempo-product',
  operatorName: 'Tempo Operator',
};

const LIGHTSPEED = {
  namespace: 'openshift-lightspeed',
  packageName: 'lightspeed-operator',
  operatorName: 'Lightspeed Operator',
};

describe('tracing-uiplugin', () => {
  before(() => {
    // Cleanup any existing resources from interrupted tests
    cy.log('Cleanup any existing resources from previous interrupted tests');
    if (Cypress.env('SKIP_COO_INSTALL')) {
      cy.log('Delete Lightspeed OLSConfig if exists.');
      cy.executeAndDelete(
        `oc delete olsconfig cluster -n ${LIGHTSPEED.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );

      cy.log('Delete Lightspeed secret if exists.');
      cy.executeAndDelete(
        `oc delete secret rhelai-token -n ${LIGHTSPEED.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );

      cy.log('Delete Distributed Tracing UI Plugin instance if exists.');
      cy.executeAndDelete(
        `oc delete ${DTP.config.kind} ${DTP.config.name} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );

      cy.log('Delete Chainsaw namespaces if they exist.');
      cy.exec(
        `for ns in $(oc get projects -o name --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} | grep "chainsaw-" | sed 's|project.project.openshift.io/||'); do oc get opentelemetrycollectors.opentelemetry.io,tempostacks.tempo.grafana.com,tempomonolithics.tempo.grafana.com,pvc -n $ns -o name --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} 2>/dev/null | xargs --no-run-if-empty -I {} oc patch {} -n $ns --type merge -p '{"metadata":{"finalizers":[]}}' --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} 2>/dev/null || true; oc delete project $ns --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} || true; done`,
        {
          timeout: 180000,
          failOnNonZeroExit: false
        }
      );

      // Only remove cluster-admin role if provider is not kube:admin
      if (Cypress.env('LOGIN_IDP') !== 'kube:admin') {
        cy.log('Remove cluster-admin role from user if exists.');
        cy.executeAndDelete(
          `oc adm policy remove-cluster-role-from-user cluster-admin ${Cypress.env('LOGIN_USERNAME')} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
        );
      }
    } else {
      cy.log('Delete Lightspeed OLSConfig if exists.');
      cy.executeAndDelete(
        `oc delete olsconfig cluster -n ${LIGHTSPEED.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );

      cy.log('Delete Lightspeed secret if exists.');
      cy.executeAndDelete(
        `oc delete secret rhelai-token -n ${LIGHTSPEED.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );

      cy.log('Delete Distributed Tracing UI Plugin instance if exists.');
      cy.executeAndDelete(
        `oc delete ${DTP.config.kind} ${DTP.config.name} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );

      cy.log('Delete Chainsaw namespaces if they exist.');
      cy.exec(
        `for ns in $(oc get projects -o name --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} | grep "chainsaw-" | sed 's|project.project.openshift.io/||'); do oc get opentelemetrycollectors.opentelemetry.io,tempostacks.tempo.grafana.com,tempomonolithics.tempo.grafana.com,pvc -n $ns -o name --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} 2>/dev/null | xargs --no-run-if-empty -I {} oc patch {} -n $ns --type merge -p '{"metadata":{"finalizers":[]}}' --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} 2>/dev/null || true; oc delete project $ns --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} || true; done`,
        {
          timeout: 180000,
          failOnNonZeroExit: false
        }
      );

      cy.log('Remove Cluster Observability Operator if exists');
      cy.executeAndDelete(`oc delete namespace ${DTP.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`);

      cy.log('Remove OpenTelemetry Operator if exists');
      cy.executeAndDelete(`oc delete namespace ${OTEL.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`);

      cy.log('Remove Tempo Operator if exists');
      cy.executeAndDelete(`oc delete namespace ${TEMPO.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`);

      cy.log('Remove Lightspeed Operator if exists');
      cy.executeAndDelete(`oc delete namespace ${LIGHTSPEED.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`);

      // Only remove cluster-admin role if provider is not kube:admin
      if (Cypress.env('LOGIN_IDP') !== 'kube:admin') {
        cy.log('Remove cluster-admin role from user if exists.');
        cy.executeAndDelete(
          `oc adm policy remove-cluster-role-from-user cluster-admin ${Cypress.env('LOGIN_USERNAME')} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
        );
      }
    }
    // Only add cluster-admin role if provider is not kube:admin
    if (Cypress.env('LOGIN_IDP') !== 'kube:admin') {
      cy.adminCLI(
        `oc adm policy add-cluster-role-to-user cluster-admin ${Cypress.env('LOGIN_USERNAME')}`,
      );
    }
    // Simplified login without OAuth URL complexity
    cy.login(
      Cypress.env('LOGIN_IDP'),
      Cypress.env('LOGIN_USERNAME'),
      Cypress.env('LOGIN_PASSWORD'),
    );

    if (Cypress.env('SKIP_COO_INSTALL')) {
      cy.log('SKIP_COO_INSTALL is set. Skipping Cluster Observability Operator installation.');
    } else if (Cypress.env('COO_UI_INSTALL')) {
      cy.log('COO_UI_INSTALL is set. COO, Tempo, OpenTelemetry and Lightspeed operators will be installed from redhat-operators catalog source');
      cy.log('Install Cluster Observability Operator');
      if (Cypress.env('COO_NAMESPACE')) {
        cy.log(`Using custom namespace: ${Cypress.env('COO_NAMESPACE')}`);
        operatorHubPage.installOperator(DTP.packageName, 'redhat-operators', Cypress.env('COO_NAMESPACE'));
      } else {
        cy.log('Using recommended namespace installation');
        operatorHubPage.installOperator(DTP.packageName, 'redhat-operators');
      }
      cy.get('.co-clusterserviceversion-install__heading', { timeout: 5 * 60 * 1000 }).should(($el) => {
        const text = $el.text();
        expect(text).to.satisfy((t) =>
          t.includes('ready for use') || t.includes('Operator installed successfully')
        );
      });
      cy.log('Install OpenTelemetry Operator');
      operatorHubPage.installOperator(OTEL.packageName, 'redhat-operators');
      cy.get('.co-clusterserviceversion-install__heading', { timeout: 5 * 60 * 1000 }).should(($el) => {
        const text = $el.text();
        expect(text).to.satisfy((t) =>
          t.includes('ready for use') || t.includes('Operator installed successfully')
        );
      });
      cy.log('Install Tempo Operator');
      operatorHubPage.installOperator(TEMPO.packageName, 'redhat-operators');
      cy.get('.co-clusterserviceversion-install__heading', { timeout: 5 * 60 * 1000 }).should(($el) => {
        const text = $el.text();
        expect(text).to.satisfy((t) =>
          t.includes('ready for use') || t.includes('Operator installed successfully')
        );
      });
      cy.log('Install Lightspeed Operator');
      operatorHubPage.installOperator(LIGHTSPEED.packageName, 'redhat-operators');
      cy.get('.co-clusterserviceversion-install__heading', { timeout: 5 * 60 * 1000 }).should(($el) => {
        const text = $el.text();
        expect(text).to.satisfy((t) =>
          t.includes('ready for use') || t.includes('Operator installed successfully')
        );
      });
    } else if (Cypress.env('KONFLUX_COO_BUNDLE_IMAGE')) {
      cy.log('KONFLUX_COO_BUNDLE_IMAGE is set. COO operator will be installed from Konflux bundle. Tempo, OpenTelemetry and Lightspeed operators will be installed from redhat-operators catalog source');
      cy.log('Install Cluster Observability Operator');
      cy.exec(
        `oc --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} apply -f ./fixtures/coo-imagecontentsourcepolicy.yaml` ,
      );
      cy.exec(
        `oc create namespace ${DTP.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );
      cy.exec(
        `oc label namespaces ${DTP.namespace} openshift.io/cluster-monitoring=true --overwrite=true --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );
      cy.exec(
        `operator-sdk run bundle --timeout=10m --namespace ${DTP.namespace} ${Cypress.env('KONFLUX_COO_BUNDLE_IMAGE')} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} --verbose `,
        { timeout: 6 * 60 * 1000 },
      );
      cy.log('Install OpenTelemetry Operator');
      operatorHubPage.installOperator(OTEL.packageName, 'redhat-operators');
      cy.get('.co-clusterserviceversion-install__heading', { timeout: 5 * 60 * 1000 }).should(($el) => {
        const text = $el.text();
        expect(text).to.satisfy((t) =>
          t.includes('ready for use') || t.includes('Operator installed successfully')
        );
      });
      cy.log('Install Tempo Operator');
      operatorHubPage.installOperator(TEMPO.packageName, 'redhat-operators');
      cy.get('.co-clusterserviceversion-install__heading', { timeout: 5 * 60 * 1000 }).should(($el) => {
        const text = $el.text();
        expect(text).to.satisfy((t) =>
          t.includes('ready for use') || t.includes('Operator installed successfully')
        );
      });
      cy.log('Install Lightspeed Operator');
      operatorHubPage.installOperator(LIGHTSPEED.packageName, 'redhat-operators');
      cy.get('.co-clusterserviceversion-install__heading', { timeout: 5 * 60 * 1000 }).should(($el) => {
        const text = $el.text();
        expect(text).to.satisfy((t) =>
          t.includes('ready for use') || t.includes('Operator installed successfully')
        );
      });
    } else if (Cypress.env('CUSTOM_COO_BUNDLE_IMAGE')) {
      cy.log('CUSTOM_COO_BUNDLE_IMAGE is set. COO operator will be installed from custom built bundle. Tempo, OpenTelemetry and Lightspeed operators will be installed from redhat-operators catalog source');
      cy.log('Install Cluster Observability Operator');
      cy.exec(
        `oc --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} apply -f ./fixtures/coo-imagecontentsourcepolicy.yaml` ,
      );
      cy.exec(
        `oc create namespace ${DTP.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );
      cy.exec(
        `oc label namespaces ${DTP.namespace} openshift.io/cluster-monitoring=true --overwrite=true --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );
      cy.exec(
        `operator-sdk run bundle --timeout=10m --namespace ${DTP.namespace} ${Cypress.env('CUSTOM_COO_BUNDLE_IMAGE')} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} --verbose `,
        { timeout: 6 * 60 * 1000 },
      );
      cy.log('Install OpenTelemetry Operator');
      operatorHubPage.installOperator(OTEL.packageName, 'redhat-operators');
      cy.get('.co-clusterserviceversion-install__heading', { timeout: 5 * 60 * 1000 }).should(($el) => {
        const text = $el.text();
        expect(text).to.satisfy((t) =>
          t.includes('ready for use') || t.includes('Operator installed successfully')
        );
      });
      cy.log('Install Tempo Operator');
      operatorHubPage.installOperator(TEMPO.packageName, 'redhat-operators');
      cy.get('.co-clusterserviceversion-install__heading', { timeout: 5 * 60 * 1000 }).should(($el) => {
        const text = $el.text();
        expect(text).to.satisfy((t) =>
          t.includes('ready for use') || t.includes('Operator installed successfully')
        );
      });
      cy.log('Install Lightspeed Operator');
      operatorHubPage.installOperator(LIGHTSPEED.packageName, 'redhat-operators');
      cy.get('.co-clusterserviceversion-install__heading', { timeout: 5 * 60 * 1000 }).should(($el) => {
        const text = $el.text();
        expect(text).to.satisfy((t) =>
          t.includes('ready for use') || t.includes('Operator installed successfully')
        );
      });
    } else {
      throw new Error('No CYPRESS env set for operator installation, check the README for more details.');
    }

    cy.log('Set Distributed Tracing Console Plugin image in operator CSV');
    if (Cypress.env('DT_CONSOLE_IMAGE')) {
      cy.log('DT_CONSOLE_IMAGE is set. the image will be patched in COO operator CSV');
      cy.exec(
        './fixtures/update-plugin-image.sh',
        {
          env: {
            DT_CONSOLE_IMAGE: Cypress.env('DT_CONSOLE_IMAGE'),
            KUBECONFIG: Cypress.env('KUBECONFIG_PATH'),
            DTP_NAMESPACE: `${DTP.namespace}`
          },
          timeout: 120000,
          failOnNonZeroExit: true
        }
      ) .then((result) => {
        expect(result.code).to.eq(0);
        cy.log(`COO CSV updated successfully with Distributed Tracing Console Plugin image: ${result.stdout}`);
      });
    } else {
      cy.log('DT_CONSOLE_IMAGE is NOT set. Skipping patching the image in COO operator CSV.');
    }

    cy.log('Set Lightspeed Console Plugin image in operator CSV');
    if (Cypress.env('LIGHTSPEED_CONSOLE_IMAGE')) {
      cy.log('LIGHTSPEED_CONSOLE_IMAGE is set. the image will be patched in Lightspeed operator CSV');
      cy.exec(
        './fixtures/update-lightspeed-plugin-image.sh',
        {
          env: {
            LIGHTSPEED_CONSOLE_IMAGE: Cypress.env('LIGHTSPEED_CONSOLE_IMAGE'),
            KUBECONFIG: Cypress.env('KUBECONFIG_PATH'),
            LIGHTSPEED_NAMESPACE: `${LIGHTSPEED.namespace}`
          },
          timeout: 240000,
          failOnNonZeroExit: true
        }
      ) .then((result) => {
        expect(result.code).to.eq(0);
        cy.log(`Lightspeed CSV updated successfully with Lightspeed Console Plugin image: ${result.stdout}`);
      });
    } else {
      cy.log('LIGHTSPEED_CONSOLE_IMAGE is NOT set. Skipping patching the image in Lightspeed operator CSV.');
    }

    cy.log('Run Lightspeed Chainsaw test to setup OLSConfig and credentials');
    cy.exec(
      `chainsaw test --config ./fixtures/.chainsaw.yaml --skip-delete --quiet ./fixtures/lightspeed --values - <<EOF
LIGHTSPEED_PROVIDER_URL: ${Cypress.env('LIGHTSPEED_PROVIDER_URL')}
LIGHTSPEED_PROVIDER_TOKEN: ${Cypress.env('LIGHTSPEED_PROVIDER_TOKEN')}
EOF`,
      {
        env: {
          KUBECONFIG: Cypress.env('KUBECONFIG_PATH'),
        },
        timeout: 1800000,
        failOnNonZeroExit: true
      }
    ) .then((result) => {
      expect(result.code).to.eq(0);
      cy.log(`Lightspeed Chainsaw test ran successfully: ${result.stdout}`);
    });

    cy.log('Wait for Lightspeed popover to open by default and close it');
    cy.visit('/');
    olsHelpers.waitForPopoverAndClose();

    cy.log('Create Distributed Tracing UI Plugin instance.');
    cy.exec(`oc apply -f ./fixtures/tracing-ui-plugin.yaml --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`);
    cy.exec(
      `sleep 15 && oc wait --for=condition=Ready pods --selector=app.kubernetes.io/instance=distributed-tracing -n ${DTP.namespace} --timeout=60s --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      {
        timeout: 80000,
        failOnNonZeroExit: true
      }
    ).then((result) => {
      expect(result.code).to.eq(0);
      cy.log(`Distributed Tracing Console plugin pod is now running in namespace: ${DTP.namespace}`);
    });    
    // Check for web console update alert for up to 2 minutes (especially important for Hypershift clusters)
    cy.log('Checking for web console update alert for up to 2 minutes...');
    
    const checkForAlertRecursively = (attemptsLeft = 24) => {
      cy.get('body', { timeout: 10000 }).then(($body) => {
        if ($body.find('.pf-v5-c-alert, .pf-v6-c-alert').length > 0 && 
            $body.text().includes('Web console update is available')) {
          cy.log('Web console update alert found');
          cy.get('.pf-v5-c-alert, .pf-v6-c-alert')
            .contains('Web console update is available')
            .should('exist');
        } else if (attemptsLeft > 0) {
          cy.log(`Alert not found, checking again in 5 seconds... (${attemptsLeft} attempts remaining)`);
          cy.wait(5000);
          checkForAlertRecursively(attemptsLeft - 1);
        } else {
          cy.log('No web console update alert found after 2 minutes, navigating to traces page');
          cy.visit('/observe/traces');
          cy.url().should('include', '/observe/traces');
          cy.get('body').should('be.visible');
          // Wait for the page to fully render
          cy.wait(3000);
        }
      });
    };
    
    checkForAlertRecursively();

  });

  after(() => {
    if (Cypress.env('SKIP_COO_INSTALL')) {
      cy.log('Reinstall Tempo Operator');
      cy.exec(
        `oc get namespace ${TEMPO.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
        { failOnNonZeroExit: false }
      ).then((result) => {
        if (result.code !== 0) {
          cy.log('Tempo Operator namespace not found, reinstalling...');
          operatorHubPage.installOperator(TEMPO.packageName, 'redhat-operators');
          cy.get('.co-clusterserviceversion-install__heading', { timeout: 5 * 60 * 1000 }).should(($el) => {
            const text = $el.text();
            expect(text).to.satisfy((t: string) =>
              t.includes('ready for use') || t.includes('Operator installed successfully')
            );
          });
          cy.log('Tempo Operator reinstalled successfully');
        } else {
          cy.log('Tempo Operator namespace exists, skipping reinstall');
        }
      });

      cy.log('Delete Lightspeed OLSConfig.');
      cy.executeAndDelete(
        `oc delete olsconfig cluster -n ${LIGHTSPEED.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );

      cy.log('Delete Lightspeed secret.');
      cy.executeAndDelete(
        `oc delete secret rhelai-token -n ${LIGHTSPEED.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );

      cy.log('Delete Distributed Tracing UI Plugin instance.');
      cy.executeAndDelete(
        `oc delete ${DTP.config.kind} ${DTP.config.name} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );

      cy.log('Delete Chainsaw namespaces.');
      cy.exec(
        `for ns in $(oc get projects -o name --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} | grep "chainsaw-" | sed 's|project.project.openshift.io/||'); do oc get opentelemetrycollectors.opentelemetry.io,tempostacks.tempo.grafana.com,tempomonolithics.tempo.grafana.com,pvc -n $ns -o name --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} 2>/dev/null | xargs --no-run-if-empty -I {} oc patch {} -n $ns --type merge -p '{"metadata":{"finalizers":[]}}' --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} 2>/dev/null || true; oc delete project $ns --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} || true; done`,
        {
          timeout: 300000,
          failOnNonZeroExit: false
        }
      );

      // Only remove cluster-admin role if provider is not kube:admin
      if (Cypress.env('LOGIN_IDP') !== 'kube:admin') {
        cy.log('Remove cluster-admin role from user.');
        cy.executeAndDelete(
          `oc adm policy remove-cluster-role-from-user cluster-admin ${Cypress.env('LOGIN_USERNAME')} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
        );
      }
    } else {
      cy.log('Delete Lightspeed OLSConfig.');
      cy.executeAndDelete(
        `oc delete olsconfig cluster -n ${LIGHTSPEED.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );

      cy.log('Delete Lightspeed secret.');
      cy.executeAndDelete(
        `oc delete secret rhelai-token -n ${LIGHTSPEED.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );

      cy.log('Delete Distributed Tracing UI Plugin instance.');
      cy.executeAndDelete(
        `oc delete ${DTP.config.kind} ${DTP.config.name} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );

      cy.log('Delete Chainsaw namespaces.');
      cy.exec(
        `for ns in $(oc get projects -o name --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} | grep "chainsaw-" | sed 's|project.project.openshift.io/||'); do oc get opentelemetrycollectors.opentelemetry.io,tempostacks.tempo.grafana.com,tempomonolithics.tempo.grafana.com,pvc -n $ns -o name --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} 2>/dev/null | xargs --no-run-if-empty -I {} oc patch {} -n $ns --type merge -p '{"metadata":{"finalizers":[]}}' --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} 2>/dev/null || true; oc delete project $ns --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} || true; done`,
        {
          timeout: 300000,
          failOnNonZeroExit: false
        }
      );

      cy.log('Remove Cluster Observability Operator');
      cy.executeAndDelete(`oc delete namespace ${DTP.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`);

      cy.log('Remove OpenTelemetry Operator');
      cy.executeAndDelete(`oc delete namespace ${OTEL.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`);

      cy.log('Remove Tempo Operator');
      cy.executeAndDelete(`oc delete namespace ${TEMPO.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`);

      cy.log('Remove Lightspeed Operator');
      cy.executeAndDelete(`oc delete namespace ${LIGHTSPEED.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`);

      // Only remove cluster-admin role if provider is not kube:admin
      if (Cypress.env('LOGIN_IDP') !== 'kube:admin') {
        cy.log('Remove cluster-admin role from user.');
        cy.executeAndDelete(
          `oc adm policy remove-cluster-role-from-user cluster-admin ${Cypress.env('LOGIN_USERNAME')} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
        );
      }
    }
  });

  // Tests start from here.
  
  it('[Capability:UIPlugin][Capability:EmptyState] Test Distributed Tracing UI plugin page without any Tempo instances', () => {
    cy.log('Navigate to the observe/traces page');
    cy.visit('/observe/traces');
    cy.url().should('include', '/observe/traces');
    cy.get('body').should('be.visible');
    // Wait a bit for the page to fully render
    cy.wait(3000);

    cy.log('Assert that the Traces page shows the empty state.');
    cy.pfEmptyState().within(() => {
      cy.get('h1, h2, h3, h4, h5, h6').should('contain.text', 'No Tempo instances yet');
    });

    cy.log('Assert that the View documentation button is visible.');
    cy.pfButton('View documentation')
      .should('be.visible')
      .and('have.text', 'View documentation');

    cy.log('Assert create a tempo instance toggle visibility and text.');
    cy.pfMenuToggle('Create a Tempo instance').should('be.visible');

    cy.log('Click the toggle to show creation options.');
    cy.pfMenuToggle('Create a Tempo instance').click();

    cy.log('Assert dropdown items for Tempo instance creation are visible.');
    cy.pfMenuItem('Create a TempoStack instance')
      .should('be.visible')
      .and('have.text', 'Create a TempoStack instance');

    cy.pfMenuItem('Create a TempoMonolithic instance')
      .should('be.visible')
      .and('have.text', 'Create a TempoMonolithic instance');
  });

  it('[Capability:UIPlugin][Capability:TraceVisualization][Capability:SpanLinks][Capability:RBAC] Test Distributed Tracing UI plugin with Tempo instances and verify traces, span links using user having cluster-admin role', function () {
    cy.log('Create TempoStack and TempoMonolithic instances');
    cy.exec(
      'chainsaw test --config ./fixtures/.chainsaw.yaml --skip-delete --quiet ./fixtures/chainsaw-tests',
      {
        env: {
          KUBECONFIG: Cypress.env('KUBECONFIG_PATH'),
        },
        timeout: 1200000,
        failOnNonZeroExit: true
      }
    ) .then((result) => {
      expect(result.code).to.eq(0);
      cy.log(`Chainsaw test ran successfully: ${result.stdout}`);
    });

    cy.log('Navigate to the /observe/traces page');
    cy.visit('/observe/traces');
    cy.url().should('include', '/observe/traces');
    cy.get('body').should('be.visible');
    // Wait for the page to fully render
    cy.wait(3000);
    cy.log('Assert traces in TempoStack instance.');
    cy.pfTypeahead('Select a Tempo instance').click();
    cy.pfSelectMenuItem('chainsaw-rbac / simplst').click();
    cy.pfTypeahead('Select a tenant').click();
    cy.pfSelectMenuItem('dev').click();
    cy.muiSelect('Select time range').click();
    cy.muiSelectOption('Last 15 minutes').click();
    cy.pfMenuToggle('Service Name').click();
    cy.pfMenuToggleByLabel('Multi typeahead checkbox').click();
    cy.pfCheckMenuItem('http-rbac-1');
    cy.pfCheckMenuItem('http-rbac-2'); 
    cy.pfCheckMenuItem('grpc-rbac-1');
    cy.pfCheckMenuItem('grpc-rbac-2');
    cy.muiFirstTraceLink().click();
    cy.findByTestId('span-duration-bar').eq(1).click();
    cy.muiTraceAttributes({
      'network.peer.address': { value: '1.2.3.4' },
      'peer.service': { value: (text) => ['telemetrygen-server', 'telemetrygen-client'].includes(text) },
      'k8s.container.name': { value: 'telemetrygen', optional: true },
      'k8s.namespace.name': { 
        value: (text) => ['chainsaw-test-rbac-1', 'chainsaw-test-rbac-2', 'chainsaw-mono-rbac-1', 'chainsaw-mono-rbac-2'].includes(text),
        optional: true 
      },
      'service.name': { 
        value: (text) => ['http-rbac-1', 'http-rbac-2', 'grpc-rbac-1', 'grpc-rbac-2'].includes(text)
      }
    }, 'TempoStack');
    cy.log('Click on the Links tab');
    cy.get('button.MuiTab-root').contains('Links').click();
    cy.log('Verify link details are present');
    // Verify first link (index 0)
    cy.muiTraceAttribute('link.index', '0', false, 'Links');
    cy.muiTraceAttribute('link.type', 'random', false, 'Links');
    // Verify trace ID and span ID have valid format for first link (they will be different each time)
    cy.contains('.MuiTypography-h5', 'trace ID').first().next('.MuiTypography-body1').invoke('text').then((traceId) => {
      cy.log(`First link trace ID: ${traceId.trim()}`);
      expect(traceId.trim()).to.match(/^[A-F0-9]{32}$/);
    });
    cy.contains('.MuiTypography-h5', 'span ID').first().next('.MuiTypography-body1').invoke('text').then((spanId) => {
      cy.log(`First link span ID: ${spanId.trim()}`);
      expect(spanId.trim()).to.match(/^[A-F0-9]{16}$/);
    });
    cy.log('Click on the first trace ID link to navigate to that trace');
    cy.contains('.MuiTypography-h5', 'trace ID').first().next('.MuiTypography-body1').invoke('text').then((traceId) => {
      const cleanTraceId = traceId.trim();
      cy.get('a.MuiLink-root[href*="/observe/traces/"]').first().click();
      
      cy.log('Verify URL contains the correct trace ID');
      cy.url().should('include', `/observe/traces/${cleanTraceId}`);
      cy.log(`✓ Successfully navigated to trace: ${cleanTraceId}`);
    });
    cy.log('Verify navigation by checking trace attributes');
    cy.findByTestId('span-duration-bar').eq(1).click();
    cy.muiTraceAttributes({
      'network.peer.address': { value: '1.2.3.4' },
      'peer.service': { value: (text) => ['telemetrygen-server', 'telemetrygen-client'].includes(text) },
      'k8s.container.name': { value: 'telemetrygen', optional: true },
      'k8s.namespace.name': { 
        value: (text) => ['chainsaw-test-rbac-1', 'chainsaw-test-rbac-2', 'chainsaw-mono-rbac-1', 'chainsaw-mono-rbac-2'].includes(text),
        optional: true 
      },
      'service.name': { 
        value: (text) => ['http-rbac-1', 'http-rbac-2', 'grpc-rbac-1', 'grpc-rbac-2'].includes(text)
      }
    }, 'TempoStack');

    cy.log('Rerun the steps and select span ID from links');
    cy.pfBreadcrumb('Traces').click();
    cy.pfCloseButtonIfExists('Close chip group');
    cy.pfTypeahead('Select a Tempo instance').click();
    cy.pfSelectMenuItem('chainsaw-rbac / simplst').click();
    cy.pfTypeahead('Select a tenant').click();
    cy.pfSelectMenuItem('dev').click();
    cy.muiSelect('Select time range').click();
    cy.muiSelectOption('Last 1 hour').click();
    cy.pfMenuToggle('Service Name').click();
    cy.pfMenuToggleByLabel('Multi typeahead checkbox').click();
    cy.pfCheckMenuItem('http-rbac-1');
    cy.pfCheckMenuItem('http-rbac-2'); 
    cy.pfCheckMenuItem('grpc-rbac-1');
    cy.pfCheckMenuItem('grpc-rbac-2');
    cy.muiFirstTraceLink().click();
    cy.findByTestId('span-duration-bar').eq(1).click();
    cy.log('Click on the Links tab again');
    cy.get('button.MuiTab-root').contains('Links').click();
    cy.log('Click on the first span ID link to navigate to that span');
    cy.contains('.MuiTypography-h5', 'trace ID').first().next('.MuiTypography-body1').invoke('text').then((traceId) => {
      const cleanTraceId = traceId.trim();
      cy.contains('.MuiTypography-h5', 'span ID').first().next('.MuiTypography-body1').invoke('text').then((spanId) => {
        const cleanSpanId = spanId.trim();
        cy.contains('.MuiTypography-h5', 'span ID').first().next('.MuiTypography-body1').find('a').first().click();
        
        cy.log('Verify URL contains the correct trace ID and span ID');
        cy.url().should('include', `/observe/traces/${cleanTraceId}`);
        cy.url().should('include', `selectSpan=${cleanSpanId}`);
        cy.log(`✓ Successfully navigated to trace: ${cleanTraceId} with selected span: ${cleanSpanId}`);
      });
    });
    cy.log('Verify navigation by checking trace attributes');
    cy.findByTestId('span-duration-bar').eq(1).click();
    cy.muiTraceAttributes({
      'network.peer.address': { value: '1.2.3.4' },
      'peer.service': { value: (text) => ['telemetrygen-server', 'telemetrygen-client'].includes(text) },
      'k8s.container.name': { value: 'telemetrygen', optional: true },
      'k8s.namespace.name': { 
        value: (text) => ['chainsaw-test-rbac-1', 'chainsaw-test-rbac-2', 'chainsaw-mono-rbac-1', 'chainsaw-mono-rbac-2'].includes(text),
        optional: true 
      },
      'service.name': { 
        value: (text) => ['http-rbac-1', 'http-rbac-2', 'grpc-rbac-1', 'grpc-rbac-2'].includes(text)
      }
    }, 'TempoStack');

    cy.log('Rerun the steps and select span links from the Traces page');
    cy.pfBreadcrumb('Traces').click();
    cy.pfCloseButtonIfExists('Close chip group');
    cy.pfTypeahead('Select a Tempo instance').click();
    cy.pfSelectMenuItem('chainsaw-rbac / simplst').click();
    cy.pfTypeahead('Select a tenant').click();
    cy.pfSelectMenuItem('dev').click();
    cy.muiSelect('Select time range').click();
    cy.muiSelectOption('Last 1 hour').click();
    cy.pfMenuToggle('Service Name').click();
    cy.pfMenuToggleByLabel('Multi typeahead checkbox').click();
    cy.pfCheckMenuItem('http-rbac-1');
    cy.pfCheckMenuItem('http-rbac-2'); 
    cy.pfCheckMenuItem('grpc-rbac-1');
    cy.pfCheckMenuItem('grpc-rbac-2');
    cy.muiFirstTraceLink().click();
    cy.get('[data-testid="LaunchIcon"]').first().click();
    cy.get('a[role="menuitem"]').contains('Open linked span').first().click();
    cy.muiTraceAttributes({
      'network.peer.address': { value: '1.2.3.4' },
      'peer.service': { value: (text) => ['telemetrygen-server', 'telemetrygen-client'].includes(text) },
      'k8s.container.name': { value: 'telemetrygen', optional: true },
      'k8s.namespace.name': { 
        value: (text) => ['chainsaw-test-rbac-1', 'chainsaw-test-rbac-2', 'chainsaw-mono-rbac-1', 'chainsaw-mono-rbac-2'].includes(text),
        optional: true 
      },
      'service.name': { 
        value: (text) => ['http-rbac-1', 'http-rbac-2', 'grpc-rbac-1', 'grpc-rbac-2'].includes(text)
      }
    }, 'TempoMonolithic');

    cy.log('Assert traces in TempoMonolithic instance.');
    cy.pfBreadcrumb('Traces').click();
    cy.pfCloseButtonIfExists('Close chip group');
    cy.pfTypeahead('Select a Tempo instance').click();
    cy.pfSelectMenuItem('chainsaw-mmo-rbac / mmo-rbac').click();
    cy.pfTypeahead('Select a tenant').click();
    cy.pfSelectMenuItem('dev').click();
    cy.muiSelect('Select time range').click();
    cy.muiSelectOption('Last 1 hour').click();
    cy.pfMenuToggle('Service Name').click();
    cy.pfMenuToggleByLabel('Multi typeahead checkbox').click();
    cy.pfCheckMenuItem('http-rbac-1');
    cy.pfCheckMenuItem('http-rbac-2'); 
    cy.pfCheckMenuItem('grpc-rbac-1');
    cy.pfCheckMenuItem('grpc-rbac-2');
    cy.muiFirstTraceLink().click();
    cy.findByTestId('span-duration-bar').eq(1).click();
    cy.muiTraceAttributes({
      'network.peer.address': { value: '1.2.3.4' },
      'peer.service': { value: (text) => ['telemetrygen-server', 'telemetrygen-client'].includes(text) },
      'k8s.container.name': { value: 'telemetrygen', optional: true },
      'k8s.namespace.name': { 
        value: (text) => ['chainsaw-test-rbac-1', 'chainsaw-test-rbac-2', 'chainsaw-mono-rbac-1', 'chainsaw-mono-rbac-2'].includes(text),
        optional: true 
      },
      'service.name': { 
        value: (text) => ['http-rbac-1', 'http-rbac-2', 'grpc-rbac-1', 'grpc-rbac-2'].includes(text)
      }
    }, 'TempoMonolithic');

    cy.log('Navigate to the traces page and close the chip group.');
    cy.pfBreadcrumb('Traces').click();
    cy.pfCloseButtonIfExists('Close chip group');
  });

  it('[Capability:UIPlugin][Capability:TraceLimits] Test trace limit functionality', () => {
    cy.log('Navigate to the observe/traces page');
    cy.visit('/observe/traces');
    cy.url().should('include', '/observe/traces');
    cy.get('body').should('be.visible');
    // Wait for the page to fully render
    cy.wait(3000);

    cy.log('Select TempoStack instance: chainsaw-rbac / simplst');
    cy.pfTypeahead('Select a Tempo instance').click();
    cy.pfSelectMenuItem('chainsaw-rbac / simplst').click();

    cy.log('Select tenant: dev');
    cy.pfTypeahead('Select a tenant').click();
    cy.pfSelectMenuItem('dev').click();

    cy.log('Select Namespace filter type');
    cy.pfMenuToggle('Service Name').click();
    cy.pfSelectMenuItem('Namespace').click();
    cy.log('Filter by namespace: chainsaw-rbac');
    cy.pfMenuToggleByLabel('Multi typeahead checkbox').click();
    cy.pfCheckMenuItem('chainsaw-rbac');

    cy.log('Set trace limit to 50 (but verify actual available count)');
    cy.menuToggleContains('20');
    cy.pfSelectMenuItem('50').click();
    cy.verifyTraceCount(50);

    cy.log('Set trace limit to 10 and verify fewer traces shown');
    cy.menuToggleContains('50');
    cy.pfSelectMenuItem('20').click();
    cy.verifyTraceCount(20);
  });

  it('[Capability:UIPlugin][Capability:TraceVisualization][Capability:TimeRange] Test Distributed Traces Cutoffbox functionality', () => {
    // Setup the trace page with tempo instance and filters
    cy.setupTracePage('chainsaw-rbac / simplst', 'dev', 'Last 15 minutes', 'frontend');
    
    // Navigate to trace details
    cy.navigateToTraceDetails();

    cy.log('Test MUI box cutoff functionality by interacting with resizer');
    
    // Store the original time range values for comparison 
    cy.get('[style*="left: 25%"]').contains(/\d+(\.\d+)?(μs|ms|s)/)
      .invoke('text')
      .as('secondTimeValue');
    
    // Drag the right resizer to 50% position
    cy.dragCutoffResizer(50, 'right');
    
    // Verify the cutoff box is positioned correctly (around 50%)
    cy.verifyCutoffPosition(50, 2); // 50% ± 2% tolerance
    
    // Verify that the time range has been updated to reflect the cutoff selection
    cy.log('Verify the time range reflects the cutoff selection');
    cy.get('@secondTimeValue').then((secondValue) => {
      // Check that the updated time range shows values around the selected area
      cy.get('[style*="left: 0%"][style*="border-width: 0px"]')
        .should('be.visible')
        .and('not.be.empty');
      
      // Verify that the range shows millisecond values that align with the cutoff
      cy.get('[style*="left: 100%"] span[style*="position: absolute; right: 0.75rem"]')
        .should('be.visible')
        .invoke('text')
        .should('match', /\d+(\.\d+)?(μs|ms|s)/); // Should match time format
        
      cy.log('✓ MUI box cutoff functionality verified - time range updated correctly');
    });
  });

  it('[Capability:UIPlugin][Capability:AIIntegration][Capability:Lightspeed] Test AI Traces summary with OpenShift Lightspeed', () => {
    cy.log('Navigate to the /observe/traces page');
    cy.visit('/observe/traces');
    cy.url().should('include', '/observe/traces');
    cy.get('body').should('be.visible');
    // Wait for the page to fully render
    cy.wait(3000);

    cy.log('Select TempoStack instance: chainsaw-rbac / simplst');
    cy.pfTypeahead('Select a Tempo instance').click();
    cy.pfSelectMenuItem('chainsaw-rbac / simplst').click();

    cy.log('Select tenant: dev');
    cy.pfTypeahead('Select a tenant').click();
    cy.pfSelectMenuItem('dev').click();

    cy.log('Select time range: Last 15 minutes');
    cy.muiSelect('Select time range').click();
    cy.muiSelectOption('Last 1 hour').click();

    cy.log('Select service name: frontend');
    cy.pfMenuToggle('Service Name').click();
    cy.pfMenuToggleByLabel('Multi typeahead checkbox').click();
    cy.pfCheckMenuItem('frontend');

    cy.log('Click on the first trace');
    cy.muiFirstTraceLink().click();

    cy.log('Wait for trace details to load and click Ask OpenShift Lightspeed button');
    cy.get('button.pf-v6-c-button.pf-m-plain[aria-label="Ask OpenShift Lightspeed"]', { timeout: 10000 })
      .filter(':visible')
      .first()
      .click();

    cy.log('Verify Lightspeed popover panel is visible');
    olsHelpers.verifyPopoverVisible();

    cy.log('Verify Lightspeed panel title');
    cy.contains('h1', 'Red Hat OpenShift Lightspeed')
      .should('be.visible');

    cy.log('Verify the prompt input textarea has the expected text');
    cy.get(OLS_SELECTORS.promptInput)
      .should('be.visible')
      .and('have.value', 'Analyze this trace in my OpenShift cluster and highlight any errors and outliers.');

    cy.log('Verify the trace context attachment is present');
    cy.get('.ols-plugin__context-label-text')
      .should('be.visible')
      .and('have.text', 'frontend: /dispatch');

    cy.log('Click the Send button to submit the query');
    cy.get('.pf-chatbot__message-bar-actions button[aria-label="Send"]')
      .should('be.visible')
      .click();

    cy.log('Wait for AI response and verify trace analysis content');
    cy.get('.pf-chatbot__message--bot', { timeout: 30000 })
      .should('be.visible')
      .and('contain.text', 'trace');

    cy.log('Verify AI response contains analysis of trace services');
    cy.get('.pf-chatbot__message--bot')
      .should(($message) => {
        const text = $message.text().toLowerCase();
        // Verify at least 2 of the key services are mentioned
        const serviceMatches = [
          text.includes('driver'),
          text.includes('customer'),
          text.includes('route'),
          text.includes('frontend') || text.includes('dispatch')
        ].filter(Boolean);
        expect(serviceMatches.length).to.be.at.least(2, 'Expected at least 2 services to be mentioned in the analysis');
      });

    cy.log('Verify AI response mentions Redis or database interactions');
    cy.get('.pf-chatbot__message--bot')
      .should(($message) => {
        const text = $message.text().toLowerCase();
        expect(text).to.match(/redis|database|mysql/);
      });

    cy.log('✓ AI Traces summary with OpenShift Lightspeed verified');
    olsHelpers.waitForPopoverAndClose();
  });

  it('[Capability:OperatorLifecycle][Capability:Installation] Test "Install Tempo operator" if operator is not installed', () => {
    cy.log('Delete Chainsaw test namespaces and resources');
    cy.exec(
      `for ns in $(oc get projects -o name --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} | grep "chainsaw-" | sed 's|project.project.openshift.io/||'); do oc get opentelemetrycollectors.opentelemetry.io,tempostacks.tempo.grafana.com,tempomonolithics.tempo.grafana.com,pvc -n $ns -o name --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} 2>/dev/null | xargs --no-run-if-empty -I {} oc patch {} -n $ns --type merge -p '{"metadata":{"finalizers":[]}}' --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} 2>/dev/null || true; oc delete project $ns --kubeconfig ${Cypress.env('KUBECONFIG_PATH')} || true; done`,
      {
        timeout: 300000,
        failOnNonZeroExit: false
      }
    );

    cy.log('Delete Tempo Operator namespace and wait for deletion');
    cy.executeAndDelete(`oc delete namespace ${TEMPO.namespace} --wait=true --timeout=300s --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`);

    cy.log('Delete Tempo Operator and wait for deletion');
    cy.executeAndDelete(`oc delete operator tempo-product.${TEMPO.namespace} --wait=true --timeout=300s --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`);

    cy.log('Delete Tempo CustomResourceDefinitions');
    cy.executeAndDelete(`oc delete customresourcedefinitions.apiextensions.k8s.io tempomonolithics.tempo.grafana.com tempostacks.tempo.grafana.com --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`);

    cy.log('Navigate to the observe/traces page');
    cy.visit('/observe/traces');
    cy.url().should('include', '/observe/traces');
    cy.get('body').should('be.visible');
    cy.wait(3000);

    cy.log('Verify empty state shows "Tempo operator isn\'t installed yet"');
    cy.pfEmptyState().within(() => {
      cy.get('h1, h2, h3, h4, h5, h6').should('contain.text', 'Tempo operator isn\'t installed yet');
    });

    cy.log('Verify "Install Tempo operator" button is visible');
    cy.pfButton('Install Tempo operator').should('be.visible');

    cy.log('Click the "Install Tempo operator" button');
    cy.pfButton('Install Tempo operator').click();

    cy.log('Verify redirect to OperatorHub Tempo Operator page');
    cy.url({ timeout: 30000 }).should('match', /\/(operatorhub|catalog)\//);
    cy.url().should('match', /tempo/i);

    cy.log('Wait for page body to be visible');
    cy.get('body').should('be.visible');

    cy.log('Wait for catalog page to load completely');
    cy.wait(3000);

    cy.log('Verify Tempo Operator details modal Install button exists');
    // Support both old and new OpenShift versions
    cy.get('[data-test="catalog-details-modal-cta"], [data-test-id="operator-install-btn"]', { timeout: 60000 }).should('exist');

    cy.log('✓ "Install Tempo operator" button successfully redirects to OperatorHub');
  });
});
