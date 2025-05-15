import { operatorHubPage } from '../views/operator-hub-page';
import { Pages } from '../views/pages';
import { searchPage } from '../views/search';

// Set constants for the operators that need to be installed for tests.
const DTP = {
  namespace: 'openshift-cluster-observability-operator',
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
    cy.adminCLI(
      `oc adm policy add-cluster-role-to-user cluster-admin ${Cypress.env('LOGIN_USERNAME')}`,
    );
    // Getting the oauth url for hypershift cluster login
    cy.exec(
      `oc get oauthclient openshift-browser-client -o go-template --template="{{index .redirectURIs 0}}" --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
    ).then((result) => {
      if (expect(result.stderr).to.be.empty) {
        const oauth = result.stdout;
        // Trimming the origin part of the url
        const oauthurl = new URL(oauth);
        const oauthorigin = oauthurl.origin;
        cy.log(oauthorigin);
        cy.wrap(oauthorigin).as('oauthorigin');
      } else {
        throw new Error(`Execution of oc get oauthclient failed
          Exit code: ${result.code}
          Stdout:\n${result.stdout}
          Stderr:\n${result.stderr}`);
      }
    });
    cy.get('@oauthorigin').then((oauthorigin) => {
      cy.login(
        Cypress.env('LOGIN_IDP'),
        Cypress.env('LOGIN_USERNAME'),
        Cypress.env('LOGIN_PASSWORD'),
        oauthorigin,
      );
    });

    if (Cypress.env('SKIP_COO_INSTALL')) {
      cy.log('SKIP_COO_INSTALL is set. Skipping Cluster Observability Operator installation.');
    } else if (Cypress.env('COO_UI_INSTALL')) {
      cy.log('COO_UI_INSTALL is set. COO, Tempo and OpenTelemetry operators will be installed from redhat-operators catalog source');
      cy.log('Install Cluster Observability Operator');
      operatorHubPage.installOperator(DTP.packageName, 'redhat-operators');
      cy.get('.co-clusterserviceversion-install__heading', { timeout: 5 * 60 * 1000 }).should(
        'include.text',
        'ready for use',
      );
      cy.log('Install OpenTelemetry Operator');
      operatorHubPage.installOperator(OTEL.packageName, 'redhat-operators');
      cy.get('.co-clusterserviceversion-install__heading', { timeout: 5 * 60 * 1000 }).should(
        'include.text',
        'ready for use',
      );
      cy.log('Install Tempo Operator');
      operatorHubPage.installOperator(TEMPO.packageName, 'redhat-operators');
      cy.get('.co-clusterserviceversion-install__heading', { timeout: 5 * 60 * 1000 }).should(
        'include.text',
        'ready for use',
      );
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
      cy.get('.co-clusterserviceversion-install__heading', { timeout: 5 * 60 * 1000 }).should(
        'include.text',
        'ready for use',
      );
      cy.log('Install Tempo Operator');
      operatorHubPage.installOperator(TEMPO.packageName, 'redhat-operators');
      cy.get('.co-clusterserviceversion-install__heading', { timeout: 5 * 60 * 1000 }).should(
        'include.text',
        'ready for use',
      );
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
      cy.get('.co-clusterserviceversion-install__heading', { timeout: 5 * 60 * 1000 }).should(
        'include.text',
        'ready for use',
      );
      cy.log('Install Tempo Operator');
      operatorHubPage.installOperator(TEMPO.packageName, 'redhat-operators');
      cy.get('.co-clusterserviceversion-install__heading', { timeout: 5 * 60 * 1000 }).should(
        'include.text',
        'ready for use',
      );
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
      cy.log(`Pods are now running in namespace: ${Cypress.env('DTP_NAMESPACE')}`);
    });    
    cy.get('.pf-v5-c-alert, .pf-v6-c-alert', { timeout: 120000 })
    .contains('Web console update is available')
    .then(($alert) => {
      // If the alert is found, assert that it exists
      expect($alert).to.exist;
    }, () => {
      // If the alert is not found within the timeout, visit and assert the /observe/traces page
      cy.visit('/observe/traces');
      cy.url().should('include', '/observe/traces');
    });

  });

  after(() => {
    if (Cypress.env('SKIP_COO_INSTALL')) {
      cy.log('Delete Distributed Tracing UI Plugin instance.');
      cy.executeAndDelete(
        `oc delete ${DTP.config.kind} ${DTP.config.name} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );

      cy.log('Delete Chainsaw namespaces.');
      cy.executeAndDelete(
        `oc delete project chainsaw-multitenancy chainsaw-monolithic-multitenancy --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );

      cy.log('Remove cluster-admin role from user.');
      cy.executeAndDelete(
        `oc adm policy remove-cluster-role-from-user cluster-admin ${Cypress.env('LOGIN_USERNAME')} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );
    } else {
      cy.log('Delete Distributed Tracing UI Plugin instance.');
      cy.executeAndDelete(
        `oc delete ${DTP.config.kind} ${DTP.config.name} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );

      cy.log('Delete Chainsaw namespaces.');
      cy.executeAndDelete(
        `oc delete project chainsaw-multitenancy chainsaw-monolithic-multitenancy --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );

      cy.log('Remove Cluster Observability Operator');
      cy.executeAndDelete(`oc delete namespace ${DTP.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`);

      cy.log('Remove OpenTelemetry Operator');
      cy.executeAndDelete(`oc delete namespace ${OTEL.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`);

      cy.log('Remove Tempo Operator');
      cy.executeAndDelete(`oc delete namespace ${TEMPO.namespace} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`);

      cy.log('Remove cluster-admin role from user.');
      cy.executeAndDelete(
        `oc adm policy remove-cluster-role-from-user cluster-admin ${Cypress.env('LOGIN_USERNAME')} --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
      );
    }
  });

  // Tests start from here.
  it('Test Distributed Tracing UI plugin page without any Tempo instances', () => {
    cy.log('Navigate to the observe/traces page');
    cy.visit('/observe/traces');

    cy.log('Assert that the Traces page shows the empty state.');
    cy.get('.pf-v6-c-empty-state__title-text')
      .should('be.visible')
      .and('have.text', 'No Tempo instances yet');

    cy.log('Assert that the View documentation button is visible.');
    cy.contains('.pf-v6-c-button', 'View documentation')
      .should('be.visible')
      .and('have.text', 'View documentation');

    cy.log('Assert create a tempo instance toggle visibility and text.');
    const createTempoToggle = cy.contains('.pf-v6-c-menu-toggle', 'Create a Tempo instance');
    createTempoToggle.should('be.visible');

    cy.log('Click the toggle to show creation options.');
    createTempoToggle.click();

    cy.log('Assert dropdown items for Tempo instance creation are visible.');
    cy.contains('.pf-v6-c-menu__item-text', 'Create a TempoStack instance')
      .should('be.visible')
      .and('have.text', 'Create a TempoStack instance');

    cy.contains('.pf-v6-c-menu__item-text', 'Create a TempoMonolithic instance')
      .should('be.visible')
      .and('have.text', 'Create a TempoMonolithic instance');
  });

  it('(Test Distributed Tracing UI plugin with Tempo instances and verify traces)', function () {
    cy.log('Create TempoStack and TempoMonolithic instances');
    cy.exec(
      'chainsaw test --config ./fixtures/.chainsaw.yaml --skip-delete ./fixtures/chainsaw-tests/multitenancy ./fixtures/chainsaw-tests/monolithic-multitenancy-openshift',
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
    cy.get(':nth-child(1) > .pf-v6-c-toolbar__item > .pf-v6-c-form > .pf-v6-c-form__group > .pf-v6-c-form__group-control > .pf-v6-c-menu-toggle > .pf-v6-c-menu-toggle__button > .pf-v6-c-menu-toggle__controls > .pf-v6-c-menu-toggle__toggle-icon').click();
    cy.get(':nth-child(2) > .pf-v6-c-menu__item > .pf-v6-c-menu__item-main > .pf-v6-c-menu__item-text').click();
    cy.get(':nth-child(1) > :nth-child(2) > .pf-v6-c-form > .pf-v6-c-form__group > .pf-v6-c-form__group-control > .pf-v6-c-menu-toggle > .pf-v6-c-menu-toggle__button').click();
    cy.get(':nth-child(2) > .pf-v6-c-menu__item > .pf-v6-c-menu__item-main > .pf-v6-c-menu__item-text').click();
    cy.get(':nth-child(2) > .pf-v6-c-form__group > .pf-v6-c-form__group-control > .pf-v6-c-menu-toggle > .pf-v6-c-menu-toggle__controls > .pf-v6-c-menu-toggle__toggle-icon').click();
    cy.get(':nth-child(1) > .pf-v6-c-menu__item > .pf-v6-c-menu__item-main > .pf-v6-c-menu__item-text').click();
    cy.get(':nth-child(1) > :nth-child(2) > .pf-v6-c-form > .pf-v6-c-form__group > .pf-v6-c-form__group-control > .pf-v6-c-menu-toggle > .pf-v6-c-menu-toggle__button > .pf-v6-c-menu-toggle__controls > .pf-v6-c-menu-toggle__toggle-icon').click();
    cy.get(':nth-child(1) > .pf-v6-c-menu__item > .pf-v6-c-menu__item-main > .pf-v6-c-menu__item-text').click();
    cy.get('.pf-v6-c-toolbar__group > :nth-child(1) > .pf-v6-c-form > .pf-v6-c-form__group > .pf-v6-c-form__group-control > .pf-v6-c-menu-toggle > .pf-v6-c-menu-toggle__controls > .pf-v6-c-menu-toggle__toggle-icon').click();
    cy.get(':nth-child(1) > .pf-v6-c-menu__item > .pf-v6-c-menu__item-main > .pf-v6-c-menu__item-text').click();
    cy.get('.pf-m-toggle-group > .pf-v6-c-toolbar__group > :nth-child(2) > .pf-v6-c-form > .pf-v6-c-form__group > .pf-v6-c-form__group-control > .pf-v6-c-menu-toggle > .pf-v6-c-menu-toggle__button').click();
    cy.contains('.pf-v6-c-menu__item-text', 'http')
      .closest('.pf-v6-c-menu__item')
      .find('input[type="checkbox"]')
      .check();
    cy.contains('.pf-v6-c-menu__item-text', 'grpc')
      .closest('.pf-v6-c-menu__item')
      .find('input[type="checkbox"]')
      .check();
    cy.get('.MuiDataGrid-row--firstVisible > [data-field="name"] > .MuiBox-root > .MuiTypography-root').click();
    cy.contains('div', 'okey-dokey').click({ force: true });
    cy.get('.css-1bmckj4').then(($el) => {
      cy.log(`Actual text in .css-1bmckj4 (TempoMonolithic): ${$el.text()}`);
      expect($el.text()).to.satisfy((text) => text === 'http' || text === 'grpc');
    });
    cy.get('.MuiTypography-h2').should('have.text', 'okey-dokey');
    cy.get('.MuiTabs-list > .MuiButtonBase-root').should('be.visible');
    cy.get(':nth-child(5) > :nth-child(1) > .MuiListItemText-root > .MuiTypography-h5').should('have.text', 'net.peer.ip');
    cy.get(':nth-child(5) > :nth-child(1) > .MuiListItemText-root > .MuiTypography-body1').should('have.text', '1.2.3.4');
    cy.get(':nth-child(2) > .MuiListItemText-root > .MuiTypography-h5').should('have.text', 'peer.service');
    cy.get(':nth-child(2) > .MuiListItemText-root > .MuiTypography-body1').should('have.text', 'telemetrygen-client');
    cy.get(':nth-child(7) > .MuiListItem-root > .MuiListItemText-root > .MuiTypography-h5').should('have.text', 'service.name');
    cy.get(':nth-child(7) > .MuiListItem-root > .MuiListItemText-root > .MuiTypography-body1').then(($el) => {
      cy.log(`Actual text in service.name (TempoStack): ${$el.text()}`);
      expect($el.text()).to.satisfy((text) => text === 'http' || text === 'grpc');
    });
    cy.get('.pf-v6-c-breadcrumb__list > :nth-child(1) > a').click();

    cy.log('Assert traces in TempoMonolithic instance.');
    cy.get(':nth-child(1) > .pf-v6-c-form > .pf-v6-c-form__group > .pf-v6-c-form__group-control > .pf-v6-c-menu-toggle > .pf-v6-c-menu-toggle__button').click();
    cy.get(':nth-child(1) > .pf-v6-c-menu__item > .pf-v6-c-menu__item-main > .pf-v6-c-menu__item-text').click();
    cy.get(':nth-child(2) > .pf-v6-c-form__group > .pf-v6-c-form__group-control > .pf-v6-c-menu-toggle').click();
    cy.get(':nth-child(3) > .pf-v6-c-menu__item > .pf-v6-c-menu__item-main > .pf-v6-c-menu__item-text').click();
    cy.get('.pf-v6-c-form__group-control > .pf-v6-c-button > .pf-v6-c-button__text').click();
    cy.get('.pf-m-toggle-group > .pf-m-action-group > .pf-v6-c-toolbar__item > .pf-v6-c-form > .pf-v6-c-form__group > .pf-v6-c-form__group-control > .pf-v6-c-button > .pf-v6-c-button__text').click();
    cy.get('.MuiDataGrid-row--firstVisible > [data-field="name"] > .MuiBox-root > .MuiTypography-root').click();
    cy.contains('div', 'okey-dokey').click({ force: true });
    cy.get('.css-1bmckj4').then(($el) => {
      cy.log(`Actual text in .css-1bmckj4 (TempoMonolithic): ${$el.text()}`);
      expect($el.text()).to.satisfy((text) => text === 'http' || text === 'grpc');
    });
    cy.get('.MuiTypography-h2').should('have.text', 'okey-dokey');
    cy.get('.MuiTabs-list > .MuiButtonBase-root').should('be.visible');
    cy.get(':nth-child(5) > :nth-child(1) > .MuiListItemText-root > .MuiTypography-h5').should('have.text', 'net.peer.ip');
    cy.get(':nth-child(5) > :nth-child(1) > .MuiListItemText-root > .MuiTypography-body1').should('have.text', '1.2.3.4');
    cy.get(':nth-child(2) > .MuiListItemText-root > .MuiTypography-h5').should('have.text', 'peer.service');
    cy.get(':nth-child(2) > .MuiListItemText-root > .MuiTypography-body1').should('have.text', 'telemetrygen-client');
    cy.get(':nth-child(7) > .MuiListItem-root > .MuiListItemText-root > .MuiTypography-h5').should('have.text', 'service.name');
    cy.get(':nth-child(7) > .MuiListItem-root > .MuiListItemText-root > .MuiTypography-body1').then(($el) => {
      cy.log(`Actual text in service.name (TempoMonolithic): ${$el.text()}`);
      expect($el.text()).to.satisfy((text) => text === 'http' || text === 'grpc');
    });
    cy.get('.pf-v6-c-breadcrumb__list > :nth-child(1) > a').click();
  });

});
