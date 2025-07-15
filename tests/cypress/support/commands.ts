/* eslint-disable @typescript-eslint/no-use-before-define */
import Loggable = Cypress.Loggable;
import Timeoutable = Cypress.Timeoutable;
import Withinable = Cypress.Withinable;
import Shadow = Cypress.Shadow;
import { guidedTour } from '../../views/tour';

export {};
declare global {
  namespace Cypress {
    interface Chainable {
      byTestID(
        selector: string,
        options?: Partial<Loggable & Timeoutable & Withinable & Shadow>,
      ): Chainable<Element>;
      byTestActionID(selector: string): Chainable<JQuery<HTMLElement>>;
      byLegacyTestID(
        selector: string,
        options?: Partial<Loggable & Timeoutable & Withinable & Shadow>,
      ): Chainable<JQuery<HTMLElement>>;
      byButtonText(selector: string): Chainable<JQuery<HTMLElement>>;
      byDataID(selector: string): Chainable<JQuery<HTMLElement>>;
      byTestSelector(
        selector: string,
        options?: Partial<Loggable & Timeoutable & Withinable & Shadow>,
      ): Chainable<JQuery<HTMLElement>>;
      byTestDropDownMenu(selector: string): Chainable<JQuery<HTMLElement>>;
      byTestOperatorRow(
        selector: string,
        options?: Partial<Loggable & Timeoutable & Withinable & Shadow>,
      ): Chainable<JQuery<HTMLElement>>;
      byTestSectionHeading(selector: string): Chainable<JQuery<HTMLElement>>;
      byTestOperandLink(selector: string): Chainable<JQuery<HTMLElement>>;
      // Best practice selector commands
      byCy(selector: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      byAriaLabel(selector: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      byRole(role: string, name?: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      byText(text: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      findByTestId(selector: string): Chainable<JQuery<HTMLElement>>;
      // PatternFly-specific commands
      byLabelText(text: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      pfMenuToggle(text?: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      pfMenuItem(text: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      pfButton(text: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      pfEmptyState(options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      pfToolbarItem(index?: number, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
    }
  }
}

declare global {
  namespace Cypress {
    interface Chainable {
      switchPerspective(perspective: string): Chainable<Element>;
      uiLogin(provider: string, username: string, password: string): Chainable<Element>;
      uiLogout(): Chainable<Element>;
      cliLogin(username?: string, password?: string, hostapi?: string): Chainable<Element>;
      cliLogout(): Chainable<Element>;
      adminCLI(command: string, options?: any): Chainable<Element>;
      login(provider?: string, username?: string, password?: string): Chainable<Element>;
      executeAndDelete(command: string): Chainable<Element>;
    }
  }
}

// Any command added below, must be added to global Cypress interface above

Cypress.Commands.add(
  'byTestID',
  (selector: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    cy.get(`[data-test="${selector}"]`, options);
  },
);

Cypress.Commands.add('byTestActionID', (selector: string) =>
  cy.get(`[data-test-action="${selector}"]:not([disabled])`),
);

// Deprecated!  new IDs should use 'data-test', ie. `cy.byTestID(...)`
Cypress.Commands.add(
  'byLegacyTestID',
  (selector: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    cy.get(`[data-test-id="${selector}"]`, options);
  },
);

Cypress.Commands.add('byButtonText', (selector: string) => {
  cy.get('button[type="button"]').contains(`${selector}`);
});

Cypress.Commands.add('byDataID', (selector: string) => {
  cy.get(`[data-id="${selector}"]`);
});

Cypress.Commands.add(
  'byTestSelector',
  (selector: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    cy.get(`[data-test-selector="${selector}"]`, options);
  },
);

Cypress.Commands.add('byTestDropDownMenu', (selector: string) => {
  cy.get(`[data-test-dropdown-menu="${selector}"]`);
});

Cypress.Commands.add('byTestOperatorRow', (selector: string, options?: object) => {
  cy.get(`[data-test-operator-row="${selector}"]`, options);
});

Cypress.Commands.add('byTestSectionHeading', (selector: string) => {
  cy.get(`[data-test-section-heading="${selector}"]`);
});

Cypress.Commands.add('byTestOperandLink', (selector: string) => {
  cy.get(`[data-test-operand-link="${selector}"]`);
});

// Simplified login command that handles OAuth redirect properly
Cypress.Commands.add(
  'login',
  (
    provider: string = Cypress.env('LOGIN_IDP') || 'kube:admin',
    username: string = Cypress.env('LOGIN_USERNAME') || 'kubeadmin',
    password: string = Cypress.env('LOGIN_PASSWORD'),
  ) => {
    cy.session(
      [provider, username],
      () => {
        cy.visit(Cypress.config('baseUrl'));
        cy.window().then((win: any) => {
          // Check if auth is disabled (for a local development environment)
          if (win.SERVER_FLAGS?.authDisabled) {
            cy.task('log', '  skipping login, console is running with auth disabled');
            return;
          }

          cy.task('log', `  Logging in as ${username}`);
          
          // Get the current URL to determine if we've been redirected to OAuth
          cy.url().then((currentUrl) => {
            const url = new URL(currentUrl);
            const oauthOrigin = `${url.protocol}//${url.hostname.replace('console-openshift-console', 'oauth-openshift')}`;
            
            cy.task('log', `OAuth origin: ${oauthOrigin}`);
            
            // Use cy.origin to handle the OAuth login on different domain
            cy.origin(
              oauthOrigin,
              { args: { provider, username, password } },
              ({ provider, username, password }) => {
                cy.get('[data-test-id="login"]').should('be.visible');
                cy.get('body').then(($body) => {
                  if ($body.text().includes(provider)) {
                    cy.contains(provider).should('be.visible').click();
                  }
                });
                cy.get('#inputUsername').type(username);
                cy.get('#inputPassword').type(password);
                cy.get('button[type=submit]').click();
              }
            );
          });
        });
      },
      {
        cacheAcrossSpecs: true,
        validate() {
          cy.visit(Cypress.config('baseUrl'));
          // Wait for any OAuth redirects to complete and ensure we're on console domain
          cy.url({ timeout: 30000 }).should('contain', 'console-openshift-console');
          cy.byTestID("username", {timeout: 120000}).should('be.visible');
          guidedTour.close();
        },
      },
    );
  },
);

const kubeconfig = Cypress.env('KUBECONFIG_PATH');
Cypress.Commands.add('switchPerspective', (perspective: string) => {
  /* If side bar is collapsed then expand it
  before switching perspecting */
  cy.get('body').then((body) => {
    if (body.find('.pf-m-collapsed').length > 0) {
      cy.get('#nav-toggle').click();
    }
  });
  // Note: nav object would need to be imported or defined elsewhere
  // For now, using direct DOM selectors
  cy.get('[data-test="perspective-switcher-toggle"]').click();
  cy.contains('[data-test="perspective-switcher-menu-option"]', perspective).click();
});

// To avoid influence from upstream login change
Cypress.Commands.add('uiLogin', (provider: string, username: string, password: string) => {
  cy.clearCookie('openshift-session-token');
  cy.visit('/');
  cy.window().then(
    (
      win: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    ) => {
      if (win.SERVER_FLAGS?.authDisabled) {
        cy.task('log', 'Skipping login, console is running with auth disabled');
        return;
      }
      cy.get('[data-test-id="login"]').should('be.visible');
      cy.get('body').then(($body) => {
        if ($body.text().includes(provider)) {
          cy.contains(provider).should('be.visible').click();
        } else if ($body.find('li.idp').length > 0) {
          //Using the last idp if doesn't provider idp name
          cy.get('li.idp').last().click();
        }
      });
      cy.get('#inputUsername').type(username);
      cy.get('#inputPassword').type(password);
      cy.get('button[type=submit]').click();
      cy.byTestID('username', { timeout: 120000 }).should('be.visible');
    },
  );
  cy.switchPerspective('Administrator');
});

Cypress.Commands.add('uiLogout', () => {
  cy.window().then(
    (
      win: any, // eslint-disable-line @typescript-eslint/no-explicit-any
    ) => {
      if (win.SERVER_FLAGS?.authDisabled) {
        cy.log('Skipping logout, console is running with auth disabled');
        return;
      }
      cy.log('Log out UI');
      cy.byTestID('user-dropdown').click();
      cy.byTestID('log-out').should('be.visible');
      cy.byTestID('log-out').click({ force: true });
    },
  );
});

Cypress.Commands.add('cliLogin', (username?, password?, hostapi?) => {
  const loginUsername = username || Cypress.env('LOGIN_USERNAME');
  const loginPassword = password || Cypress.env('LOGIN_PASSWORD');
  const hostapiurl = hostapi || Cypress.env('HOST_API');
  cy.exec(
    `oc login -u ${loginUsername} -p ${loginPassword} ${hostapiurl} --insecure-skip-tls-verify=true`,
    { failOnNonZeroExit: false },
  ).then((result) => {
    cy.log(result.stderr);
    cy.log(result.stdout);
  });
});

Cypress.Commands.add('cliLogout', () => {
  cy.exec(`oc logout`, { failOnNonZeroExit: false }).then((result) => {
    cy.log(result.stderr);
    cy.log(result.stdout);
  });
});

Cypress.Commands.add('adminCLI', (command: string) => {
  cy.log(`Run admin command: ${command}`);
  cy.exec(`${command} --kubeconfig ${kubeconfig}`);
});

Cypress.Commands.add('executeAndDelete', (command: string) => {
  cy.exec(command, { failOnNonZeroExit: false })
    .then(result => {
      if (result.code !== 0) {
        cy.task('logError', `Command "${command}" failed: ${result.stderr || result.stdout}`);
      } else {
        cy.task('log', `Command "${command}" executed successfully`);
      }
    });
});

// Best practice selector commands following accessibility and stability guidelines

Cypress.Commands.add(
  'byCy',
  (selector: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    cy.get(`[data-cy="${selector}"]`, options);
  },
);

Cypress.Commands.add(
  'byAriaLabel', 
  (selector: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    cy.get(`[aria-label="${selector}"]`, options);
  },
);

Cypress.Commands.add(
  'byRole',
  (role: string, name?: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const selector = name ? `[role="${role}"][aria-label="${name}"], [role="${role}"][aria-labelledby*="${name}"]` : `[role="${role}"]`;
    cy.get(selector, options);
  },
);

Cypress.Commands.add(
  'byText',
  (text: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    cy.contains(text, options);
  },
);

Cypress.Commands.add('findByTestId', (selector: string) => {
  return cy.get(`[data-testid="${selector}"]`);
});

// PatternFly-specific commands for common component patterns

Cypress.Commands.add(
  'byLabelText',
  (text: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    // Find form elements by their associated label - with error handling
    cy.get('body').then(($body) => {
      if ($body.find(`label:contains("${text}")`).length > 0) {
        cy.get(`label:contains("${text}")`, options).then(($label) => {
          const forAttr = $label.attr('for');
          if (forAttr) {
            cy.get(`#${forAttr}`, options);
          } else {
            cy.wrap($label).find('input, select, textarea', options);
          }
        });
      } else {
        cy.log(`Label with text "${text}" not found`);
      }
    });
  },
);

Cypress.Commands.add(
  'pfMenuToggle',
  (text?: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 10000, ...options };
    if (text) {
      cy.get('.pf-v6-c-menu-toggle, .pf-v5-c-menu-toggle', defaultOptions).contains(text);
    } else {
      cy.get('.pf-v6-c-menu-toggle, .pf-v5-c-menu-toggle', defaultOptions);
    }
  },
);

Cypress.Commands.add(
  'pfMenuItem',
  (text: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 10000, ...options };
    cy.get('.pf-v6-c-menu__item, .pf-v5-c-menu__item', defaultOptions).contains(text);
  },
);

Cypress.Commands.add(
  'pfButton',
  (text: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 10000, ...options };
    cy.contains('.pf-v6-c-button, .pf-v5-c-button', text, defaultOptions);
  },
);

Cypress.Commands.add(
  'pfEmptyState',
  (options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 10000, ...options };
    cy.get('.pf-v6-c-empty-state, .pf-v5-c-empty-state', defaultOptions);
  },
);

Cypress.Commands.add(
  'pfToolbarItem',
  (index?: number, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const selector = '.pf-v6-c-toolbar__item, .pf-v5-c-toolbar__item';
    const defaultOptions = { timeout: 10000, ...options };
    if (typeof index === 'number') {
      cy.get(selector, defaultOptions).eq(index);
    } else {
      cy.get(selector, defaultOptions);
    }
  },
);