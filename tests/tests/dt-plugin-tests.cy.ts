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
          failOnNonZeroExit: false
        }
      ) .then((result) => {
        // The command has completed
        // 'result' is an object containing:
        // - stdout: The standard output of the command
        // - stderr: The standard error of the command
        // - code:   The exit code of the command (0 for success)
        // - signal: The signal that terminated the command, if any

        expect(result.code).to.eq(0);  // Assert that the command was successful
        cy.log(`COO CSV updated successfully with Distributed Tracing Console Plugin image: ${result.stdout}`);
      });
    } else {
      cy.log('DT_CONSOLE_IMAGE is NOT set. Skipping patching the image in COO operator CSV.');
    }

    cy.log('Create Distributed Tracing UI Plugin instance.');
    cy.exec(`oc apply -f ./fixtures/tracing-ui-plugin.yaml --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`);
    cy.get('.pf-v5-c-alert', { timeout: 2 * 60 * 1000 })
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
  it('(Test Distributed Tracing UI plugin page without any Tempo instances)', function () {
    cy.log('Navigate to the observe/traces page');
    cy.visit('/observe/traces');

    cy.log('Assert that the page contains the text No Tempo instances yet');
    cy.contains('No Tempo instances yet').should('be.visible');

    cy.log('Click on the Create a Tempo instance button');
    cy.get('button.pf-v5-c-menu-toggle.pf-m-primary').click();
  
    cy.log('Check the dropdown for Create a Tempo instance');
    cy.get('.pf-v5-c-menu__item-text').contains('Create a TempoStack instance').should('have.class', 'pf-v5-c-menu__item-text');
    cy.get('.pf-v5-c-menu__item-text').contains('Create a TempoMonolithic instance').should('have.class', 'pf-v5-c-menu__item-text');
  });

  it('(Test Distributed Tracing UI plugin)', function () {
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
      // The command has completed
      // 'result' is an object containing:
      // - stdout: The standard output of the command
      // - stderr: The standard error of the command
      // - code:   The exit code of the command (0 for success)
      // - signal: The signal that terminated the command, if any
      
      expect(result.code).to.eq(0);  // Assert that the command was successful
      cy.log(`Chainsaw test ran successfully: ${result.stdout}`);
    });
    // Navigate to the /observe/traces page
    cy.visit('/observe/traces');

    cy.log('Check traces from TempoStack instance from Tracing UI');
    cy.get('.pf-v5-c-menu-toggle__button > .pf-v5-c-menu-toggle__controls > .pf-v5-c-menu-toggle__toggle-icon').click();
    cy.get('#tempoinstance-dropdown-item-chainsaw-multitenancy__simplest > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
    cy.get('#tenant-dropdown-input > .pf-v5-c-text-input-group__text > .pf-v5-c-text-input-group__text-input').click();
    cy.get('#tenant-dropdown-item-prod > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
    cy.get('[style="height: auto; flex-direction: column-reverse;"] > .pf-v5-c-button').click();
    cy.get('#tenant-dropdown-input > .pf-v5-c-text-input-group__text > .pf-v5-c-text-input-group__text-input').click();
    cy.get('#tenant-dropdown-item-dev > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
    cy.get('.pf-v5-l-stack > .pf-v5-c-menu-toggle > .pf-v5-c-menu-toggle__text').click();
    cy.get(':nth-child(1) > .pf-v5-c-menu__item > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
    cy.get('[style="height: auto; flex-direction: column-reverse;"] > .pf-v5-c-button').click();
    cy.get('.MuiDataGrid-row--firstVisible > [data-field="name"] > .MuiBox-root > .MuiTypography-root').click();
    cy.get('[data-index="1"] > .css-1cqmfcw > .MuiStack-root > .MuiBox-root').click({ force: true });
    cy.get('.css-tgncor').then(($el) => {
      cy.log(`Actual text in .css-tgncor (TempoStack): ${$el.text()}`);
      expect($el.text()).to.satisfy((text) => text === 'http' || text === 'grpc');
    });
    cy.get('.MuiTypography-h2').should('have.text', 'okey-dokey');
    cy.get('.MuiTabs-flexContainer > .MuiButtonBase-root').should('be.visible');
    cy.get(':nth-child(5) > :nth-child(1) > .MuiListItemText-root > .MuiTypography-h5').should('have.text', 'net.peer.ip');
    cy.get(':nth-child(5) > :nth-child(1) > .MuiListItemText-root > .MuiTypography-body1').should('have.text', '1.2.3.4');
    cy.get(':nth-child(2) > .MuiListItemText-root > .MuiTypography-h5').should('have.text', 'peer.service');
    cy.get(':nth-child(2) > .MuiListItemText-root > .MuiTypography-body1').should('have.text', 'telemetrygen-client');
    cy.get(':nth-child(7) > .MuiListItem-root > .MuiListItemText-root > .MuiTypography-h5').should('have.text', 'service.name');
    cy.get(':nth-child(7) > .MuiListItem-root > .MuiListItemText-root > .MuiTypography-body1').then(($el) => {
      cy.log(`Actual text in service.name (TempoStack): ${$el.text()}`);
      expect($el.text()).to.satisfy((text) => text === 'http' || text === 'grpc');
    });

    cy.log('Check traces from TempoMonolithc instance from Tracing UI');
    cy.get('.pf-v5-c-breadcrumb__list > :nth-child(1) > a').click();
    cy.get('#tempoinstance-dropdown-input > .pf-v5-c-text-input-group__text > .pf-v5-c-text-input-group__text-input').click();
    cy.get('#tempoinstance-dropdown-item-chainsaw-monolithic-multitenancy__monolithic-multitenancy-openshift > .pf-v5-c-menu__item-main > .pf-v5-c-menu__item-text').click();
    cy.get('#tenant-dropdown-input > .pf-v5-c-text-input-group__text > .pf-v5-c-text-input-group__text-input').click();
    cy.get('#tenant-dropdown-item-prod').click();
    cy.get('[style="height: auto; flex-direction: column-reverse;"] > .pf-v5-c-button').click();
    cy.get('#tenant-dropdown-input > .pf-v5-c-text-input-group__text > .pf-v5-c-text-input-group__text-input').click();
    cy.get('#tenant-dropdown-item-dev').click();
    cy.get('[style="height: auto; flex-direction: column-reverse;"] > .pf-v5-c-button').click();
    cy.get('.MuiDataGrid-row--firstVisible > [data-field="name"] > .MuiBox-root > .MuiTypography-root').click();
    cy.get('[data-index="1"] > .css-1cqmfcw > .MuiStack-root > .MuiBox-root').click({ force: true });
    cy.get('.css-tgncor').then(($el) => {
      cy.log(`Actual text in .css-tgncor (TempoMonolithic): ${$el.text()}`);
      expect($el.text()).to.satisfy((text) => text === 'http' || text === 'grpc');
    });
    cy.get('.MuiTypography-h2').should('have.text', 'okey-dokey');
    cy.get('.MuiTabs-flexContainer > .MuiButtonBase-root').should('be.visible');
    cy.get(':nth-child(5) > :nth-child(1) > .MuiListItemText-root > .MuiTypography-h5').should('have.text', 'net.peer.ip');
    cy.get(':nth-child(5) > :nth-child(1) > .MuiListItemText-root > .MuiTypography-body1').should('have.text', '1.2.3.4');
    cy.get(':nth-child(2) > .MuiListItemText-root > .MuiTypography-h5').should('have.text', 'peer.service');
    cy.get(':nth-child(2) > .MuiListItemText-root > .MuiTypography-body1').should('have.text', 'telemetrygen-client');
    cy.get(':nth-child(7) > .MuiListItem-root > .MuiListItemText-root > .MuiTypography-h5').should('have.text', 'service.name');
    cy.get(':nth-child(7) > .MuiListItem-root > .MuiListItemText-root > .MuiTypography-body1').then(($el) => {
      cy.log(`Actual text in service.name (TempoMonolithic): ${$el.text()}`);
      expect($el.text()).to.satisfy((text) => text === 'http' || text === 'grpc');
    });
    cy.get('.pf-v5-c-breadcrumb__list > :nth-child(1) > a').click();
  });

});
