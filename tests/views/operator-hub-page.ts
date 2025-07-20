import * as helperfuncs from '../views/utils';

export const operatorHubPage = {

  installOperator: (operatorName, csName, installNamespace?) => {
    cy.visit(
      `/operatorhub/subscribe?pkg=${operatorName}&catalog=${csName}&catalogNamespace=openshift-marketplace`,
    );
    cy.get('body').should('be.visible');
    
    // Wait for page to fully load - look for install button as a sign the page is ready
    cy.get('[data-test="install-operator"]').should('be.visible');
    
    // Wait for the radio button to actually be selected
    cy.get('[data-test="All namespaces on the cluster-radio-input"]').should('be.checked');
    
    if (installNamespace) {
      // Custom namespace installation flow
      cy.log(`Installing operator in custom namespace: ${installNamespace}`);
      
      // Step 1: Click "Select a Namespace" radio button (this shows the dropdown)
      cy.get('input[data-test="Select a Namespace-radio-input"]').should('be.visible');
      cy.get('input[data-test="Select a Namespace-radio-input"]').click();
      
      // Step 2: Wait for "Select Project" dropdown to appear and click it
      cy.get('[data-test="dropdown-selectbox"]').should('be.visible').click();
      
      // Step 3: Click "Create Project" button
      cy.get('button[data-test-dropdown-menu="Create_Project"]').click();
      
      // Step 4: Fill in the project name in the modal
      cy.get('input[data-test="input-name"]').should('be.visible').clear().type(installNamespace);
      
      // Step 5: Click Create button to create the project
      cy.get('[data-test="confirm-action"]').click();
      
      // Step 6: Wait for Install button to be available after namespace creation
      cy.get('[data-test="install-operator"]', { timeout: 60000 }).should('be.visible');
    } else {
      // Recommended namespace installation flow
      cy.log('Installing operator using recommended namespace');
      
      // Click operator recommended namespace radio button
      cy.get('[data-test="Operator recommended Namespace:-radio-input"]').click();
      
      // Enable monitoring checkbox if it exists (only for recommended namespace)
      helperfuncs.clickIfExist('[data-test="enable-monitoring"]');
    }
    
    // Final step: Click Install button
    cy.get('[data-test="install-operator"]').should('be.visible').click();
  },

  checkOperatorStatus: (csvName, csvStatus) => {
    // Filter by operator name
    cy.get('input[data-test="name-filter-input"]').clear().type(`${csvName}`);
    
    // Check operator status
    cy.get(`[data-test-operator-row="${csvName}"]`, { timeout: 120000 })
      .parents('tr')
      .children()
      .contains(`${csvStatus}`, { timeout: 120000 });
  },
};
