import { operatorHubPage } from '../views/operator-hub-page';

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

describe('OpenShift Distributed Tracing UI Plugin tests', () => {
  before(() => {
    // Cleanup any existing resources from interrupted tests
    cy.log('Cleanup any existing resources from previous interrupted tests');
    if (Cypress.env('SKIP_COO_INSTALL')) {
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
      cy.log('COO_UI_INSTALL is set. COO, Tempo and OpenTelemetry operators will be installed from redhat-operators catalog source');
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
    } else if (Cypress.env('KONFLUX_COO_BUNDLE_IMAGE')) {
      cy.log('KONFLUX_COO_BUNDLE_IMAGE is set. COO operator will be installed from Konflux bundle. Tempo and OpenTelemetry operators will be installed from redhat-operators catalog source');
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
    } else if (Cypress.env('CUSTOM_COO_BUNDLE_IMAGE')) {
      cy.log('CUSTOM_COO_BUNDLE_IMAGE is set. COO operator will be installed from custom built bundle. Tempo and OpenTelemetry operators will be installed from redhat-operators catalog source');
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
        }
      });
    };
    
    checkForAlertRecursively();

  });

  after(() => {
    if (Cypress.env('SKIP_COO_INSTALL')) {
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
  
  it('Test Distributed Tracing UI plugin page without any Tempo instances', () => {
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

  it('Test Distributed Tracing UI plugin with Tempo instances and verify traces using user having cluster-admin role', function () {
    cy.log('Create TempoStack and TempoMonolithic instances');
    cy.exec(
      'chainsaw test --config ./fixtures/.chainsaw.yaml --skip-delete ./fixtures/chainsaw-tests',
      {
        env: {
          KUBECONFIG: Cypress.env('KUBECONFIG_PATH'),
        },
        timeout: 1800000,
        failOnNonZeroExit: true
      }
    ) .then((result) => {
      expect(result.code).to.eq(0);
      cy.log(`Chainsaw test ran successfully: ${result.stdout}`);
    });
    cy.log('Navigate to the observe/traces page');
    cy.visit('/observe/traces');

    cy.log('Assert traces in TempoStack instance.');
    cy.pfTypeahead('Select a Tempo instance').click();
    cy.pfSelectMenuItem('chainsaw-rbac / simplst').click();
    cy.pfTypeahead('Select a tenant').click();
    cy.pfSelectMenuItem('dev').click();
    cy.pfMenuToggle('Last 30 minutes').click();
    cy.pfSelectMenuItem('Last 15 minutes').click();
    cy.pfMenuToggle('Service Name').click();
    cy.pfMenuToggleByLabel('Multi typeahead checkbox').click();
    cy.pfCheckMenuItem('http-rbac-1');
    cy.pfCheckMenuItem('http-rbac-2'); 
    cy.pfCheckMenuItem('grpc-rbac-1');
    cy.pfCheckMenuItem('grpc-rbac-2');
    cy.muiFirstTraceLink().click();
    cy.findByTestId('span-duration-bar').eq(1).click();
    cy.muiTraceAttributes({
      'net.peer.ip': { value: '1.2.3.4' },
      'peer.service': { value: 'telemetrygen-client' },
      'k8s.container.name': { value: 'telemetrygen', optional: true },
      'k8s.namespace.name': { 
        value: (text) => ['chainsaw-test-rbac-1', 'chainsaw-test-rbac-2', 'chainsaw-mono-rbac-1', 'chainsaw-mono-rbac-2'].includes(text),
        optional: true 
      },
      'service.name': { 
        value: (text) => ['http-rbac-1', 'http-rbac-2', 'grpc-rbac-1', 'grpc-rbac-2'].includes(text)
      }
    }, 'TempoStack');

    cy.log('Assert traces in TempoMonolithic instance.');
    cy.pfBreadcrumb('Traces').click();
    cy.pfCloseButtonIfExists('Close chip group');
    cy.pfTypeahead('Select a Tempo instance').click();
    cy.pfSelectMenuItem('chainsaw-mmo-rbac / mmo-rbac').click();
    cy.pfTypeahead('Select a tenant').click();
    cy.pfSelectMenuItem('dev').click();
    cy.pfMenuToggle('Last').click();
    cy.pfSelectMenuItem('Last 1 hour').click();
    cy.pfMenuToggle('Service Name').click();
    cy.pfMenuToggleByLabel('Multi typeahead checkbox').click();
    cy.pfCheckMenuItem('http-rbac-1');
    cy.pfCheckMenuItem('http-rbac-2'); 
    cy.pfCheckMenuItem('grpc-rbac-1');
    cy.pfCheckMenuItem('grpc-rbac-2');
    cy.muiFirstTraceLink().click();
    cy.findByTestId('span-duration-bar').eq(1).click();
    cy.muiTraceAttributes({
      'net.peer.ip': { value: '1.2.3.4' },
      'peer.service': { value: 'telemetrygen-client' },
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

});
