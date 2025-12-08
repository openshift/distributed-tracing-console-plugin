export const guidedTour = {
  close: () => {
    cy.get('body').then(($body) => {
      if ($body.find(`[data-test="guided-tour-modal"]`).length > 0) {
        // Handle both PatternFly v5 and v6 button structures
        // Try multiple selectors to ensure compatibility
        cy.get('button[data-test="tour-step-footer-secondary"], button#tour-step-footer-secondary, button:contains("Skip tour")')
          .first()
          .click();
      }
    });
  },
  isOpen: () => {
    cy.get('body').then(($body) => {
      if ($body.find(`[data-test="guided-tour-modal"]`).length > 0) {
        cy.byTestID('guided-tour-modal').should('be.visible');
      }
    });
  },
};
