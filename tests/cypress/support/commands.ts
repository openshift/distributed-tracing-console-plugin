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
      pfBreadcrumb(text: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      pfTypeahead(placeholder?: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      pfSelectMenuItem(text: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      pfMenuToggleByLabel(ariaLabel: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      pfCheckMenuItem(text: string, shouldCheck?: boolean, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      muiTraceLink(serviceName: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      muiFirstTraceLink(options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      muiSpanBar(serviceName: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      muiFirstSpanBar(options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      muiTraceAttribute(attributeName: string, expectedValue: string | string[] | ((text: string) => boolean), isOptional?: boolean, logPrefix?: string): Chainable<void>;
      muiTraceAttributes(attributes: { [key: string]: { value: string | string[] | ((text: string) => boolean), optional?: boolean } }, logPrefix?: string): Chainable<void>;
      pfCloseButton(ariaLabel?: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      pfCloseButtonIfExists(ariaLabel?: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<void>;
      menuToggleContains(text: string | RegExp, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      verifyTraceCount(expectedCount: number | string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<void>;
      // Material-UI specific commands
      muiSelect(ariaLabel: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      muiSelectOption(optionText: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>): Chainable<JQuery<HTMLElement>>;
      // Tracing-specific commands
      setupTracePage(tempoInstance: string, tenant: string, timeframe?: string, serviceFilter?: string): Chainable<void>;
      navigateToTraceDetails(): Chainable<void>;
      dragCutoffResizer(position: number, resizerType?: 'left' | 'right'): Chainable<void>;
      verifyCutoffPosition(expectedWidthPercent: number, tolerance?: number): Chainable<void>;
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
      // Lightspeed/OLS specific commands
      interceptFeedback(
        alias: string,
        conversationId: string,
        sentiment: number,
        userFeedback: string,
        userQuestionStartsWith: string,
      ): Chainable<Element>;
      interceptQuery(
        alias: string,
        query: string,
        conversationId?: string | null,
        attachments?: Array<{ attachment_type: string; content_type: string }>,
      ): Chainable<Element>;
      interceptQueryWithError(
        alias: string,
        query: string,
        errorMessage: string,
      ): Chainable<Element>;
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
        // Check if this is a Hypershift cluster
        cy.exec(
          `oc get node --selector=hypershift.openshift.io/managed --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
          { failOnNonZeroExit: false }
        ).then((result) => {
          const isHypershift = result.code === 0 && result.stdout.trim() !== '' && result.stdout.includes('Ready');
          cy.task('log', `Hypershift cluster detected: ${isHypershift}`);
          
          cy.visit(Cypress.config('baseUrl'));
          cy.window().then((win: any) => {
            // Check if auth is disabled (for a local development environment)
            if (win.SERVER_FLAGS?.authDisabled) {
              cy.task('log', '  skipping login, console is running with auth disabled');
              return;
            }

            cy.task('log', `  Logging in as ${username}`);
            
            // Get OAuth URL based on cluster type
            if (isHypershift) {
              // For Hypershift, get OAuth URL from oauthclient
              cy.exec(
                `oc get oauthclient openshift-browser-client -o go-template --template="{{index .redirectURIs 0}}" --kubeconfig ${Cypress.env('KUBECONFIG_PATH')}`,
                { failOnNonZeroExit: false }
              ).then((oauthResult) => {
                if (oauthResult.code === 0 && oauthResult.stdout.trim()) {
                  // Trim /oauth/token/display from the end to get the base OAuth URL
                  const oauthOrigin = oauthResult.stdout.trim().replace('/oauth/token/display', '');
                  cy.task('log', `Hypershift OAuth URL: ${oauthOrigin}`);
                  performLogin(oauthOrigin);
                } else {
                  // Fallback to current URL method if OAuth URL detection fails
                  cy.url().then((currentUrl) => {
                    const url = new URL(currentUrl);
                    const oauthOrigin = `${url.protocol}//${url.hostname.replace('console-openshift-console', 'oauth-openshift')}`;
                    cy.task('log', `Fallback OAuth origin: ${oauthOrigin}`);
                    performLogin(oauthOrigin);
                  });
                }
              });
            } else {
              // For regular OpenShift, derive OAuth URL from console URL
              cy.url().then((currentUrl) => {
                const url = new URL(currentUrl);
                const oauthOrigin = `${url.protocol}//${url.hostname.replace('console-openshift-console', 'oauth-openshift')}`;
                cy.task('log', `OAuth origin: ${oauthOrigin}`);
                performLogin(oauthOrigin);
              });
            }
          });
          
          function performLogin(oauthOrigin) {
            // Use cy.origin to handle the OAuth login on different domain
            cy.origin(
              oauthOrigin,
              { args: { provider, username, password, isHypershift } },
              ({ provider, username, password, isHypershift }) => {
                cy.get('[data-test-id="login"]').should('be.visible');
                cy.get('body').then(($body) => {
                  // For Hypershift clusters, skip provider selection and go directly to login
                  if (!isHypershift && $body.text().includes(provider)) {
                    cy.contains(provider).should('be.visible').click();
                  }
                });
                cy.get('#inputUsername').type(username);
                cy.get('#inputPassword').type(password);
                cy.get('button[type=submit]').click();
              }
            );
          }
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
    const defaultOptions = { timeout: 30000, ...options };
    // Wait for page to load completely first
    cy.get('body').should('be.visible');
    // Then look for empty state with extended timeout
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

Cypress.Commands.add(
  'pfBreadcrumb',
  (text: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 10000, ...options };
    // Find breadcrumb anchor by text directly
    cy.get('.pf-v6-c-breadcrumb__item a, .pf-v5-c-breadcrumb__item a', defaultOptions)
      .contains(text);
  },
);

Cypress.Commands.add(
  'pfTypeahead',
  (placeholder?: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 20000, ...options };
    
    if (placeholder) {
      // Find typeahead by placeholder text
      cy.get('input[placeholder="' + placeholder + '"]', defaultOptions)
        .closest('.pf-v6-c-menu-toggle, .pf-v5-c-menu-toggle')
        .find('.pf-v6-c-menu-toggle__button, .pf-v5-c-menu-toggle__button');
    } else {
      // Find any typeahead toggle button
      cy.get('.pf-v6-c-menu-toggle.pf-m-typeahead .pf-v6-c-menu-toggle__button, .pf-v5-c-menu-toggle.pf-m-typeahead .pf-v5-c-menu-toggle__button', defaultOptions);
    }
  },
);

Cypress.Commands.add(
  'pfSelectMenuItem',
  (text: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 10000, ...options };
    // Find menu item by text and click its button
    cy.get('.pf-v6-c-menu__item-text, .pf-v5-c-menu__item-text', defaultOptions)
      .contains(text)
      .closest('.pf-v6-c-menu__item, .pf-v5-c-menu__item');
  },
);

Cypress.Commands.add(
  'pfMenuToggleByLabel',
  (ariaLabel: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 10000, ...options };
    // Find menu toggle button by aria-label (partial match)
    cy.get(`button[aria-label*="${ariaLabel}"], .pf-v6-c-menu-toggle__button[aria-label*="${ariaLabel}"], .pf-v5-c-menu-toggle__button[aria-label*="${ariaLabel}"]`, defaultOptions);
  },
);

Cypress.Commands.add(
  'pfCheckMenuItem',
  (text: string, shouldCheck: boolean = true, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 10000, ...options };
    // Find menu item by text and check/uncheck its checkbox
    cy.contains('.pf-v6-c-menu__item-text, .pf-v5-c-menu__item-text', text, defaultOptions)
      .closest('.pf-v6-c-menu__item, .pf-v5-c-menu__item')
      .find('input[type="checkbox"]')
      .then(($checkbox) => {
        if (shouldCheck) {
          cy.wrap($checkbox).check();
        } else {
          cy.wrap($checkbox).uncheck();
        }
      });
  },
);

Cypress.Commands.add(
  'muiTraceLink',
  (serviceName: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 10000, ...options };
    // Find Material-UI trace link by service name
    cy.contains('a.MuiLink-root', serviceName, defaultOptions);
  },
);

Cypress.Commands.add(
  'muiFirstTraceLink',
  (options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 10000, ...options };
    // Click the first Material-UI trace link found
    cy.get('a.MuiLink-root', defaultOptions).first();
  },
);

Cypress.Commands.add(
  'muiSpanBar',
  (serviceName: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 10000, ...options };
    // Find span by service name and return the container with duration bar
    cy.contains('strong', serviceName, defaultOptions)
      .closest('.MuiStack-root');
  },
);

Cypress.Commands.add(
  'muiFirstSpanBar',
  (options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 10000, ...options };
    // Click the first span duration bar found
    cy.findByTestId('span-duration-bar').first();
  },
);

Cypress.Commands.add(
  'muiTraceAttribute',
  (attributeName: string, expectedValue: string | string[] | ((text: string) => boolean), isOptional: boolean = false, logPrefix: string = '') => {
    if (isOptional) {
      // Handle optional attributes with conditional check
      cy.get('body').then(($body) => {
        if ($body.find(`.MuiTypography-h5:contains("${attributeName}")`).length > 0) {
          cy.contains('.MuiTypography-h5', attributeName).next('.MuiTypography-body1').then(($el) => {
            const actualText = $el.text();
            if (logPrefix) {
              cy.log(`Actual text in ${attributeName} (${logPrefix}): ${actualText}`);
            }
            
            if (typeof expectedValue === 'string') {
              expect(actualText).to.equal(expectedValue);
            } else if (Array.isArray(expectedValue)) {
              expect(expectedValue).to.include(actualText);
            } else if (typeof expectedValue === 'function') {
              expect(actualText).to.satisfy(expectedValue);
            }
          });
        }
      });
    } else {
      // Handle required attributes
      cy.contains('.MuiTypography-h5', attributeName).next('.MuiTypography-body1').then(($el) => {
        const actualText = $el.text();
        if (logPrefix) {
          cy.log(`Actual text in ${attributeName} (${logPrefix}): ${actualText}`);
        }
        
        if (typeof expectedValue === 'string') {
          cy.wrap($el).should('have.text', expectedValue);
        } else if (Array.isArray(expectedValue)) {
          expect(expectedValue).to.include(actualText);
        } else if (typeof expectedValue === 'function') {
          expect(actualText).to.satisfy(expectedValue);
        }
      });
    }
  },
);

Cypress.Commands.add(
  'muiTraceAttributes',
  (attributes: { [key: string]: { value: string | string[] | ((text: string) => boolean), optional?: boolean } }, logPrefix: string = '') => {
    // Check multiple trace attributes in one command
    Object.entries(attributes).forEach(([attributeName, config]) => {
      cy.muiTraceAttribute(attributeName, config.value, config.optional || false, logPrefix);
    });
  },
);

// Material-UI Select commands

Cypress.Commands.add(
  'muiSelect',
  (ariaLabel: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 10000, ...options };
    // Find Material-UI Select component by aria-label (supports partial match)
    cy.get(`[role="combobox"][aria-label*="${ariaLabel}"]`, defaultOptions);
  },
);

Cypress.Commands.add(
  'muiSelectOption',
  (optionText: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 10000, ...options };
    // Find Material-UI Select option by text in the listbox
    cy.get('[role="listbox"] [role="option"]', defaultOptions).contains(optionText);
  },
);

Cypress.Commands.add(
  'pfCloseButton',
  (ariaLabel?: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 10000, ...options };
    
    if (ariaLabel) {
      // Find close button by specific aria-label (supports both PF5 and PF6)
      cy.get(`button[aria-label="${ariaLabel}"], .pf-v6-c-button[aria-label="${ariaLabel}"], .pf-v5-c-button[aria-label="${ariaLabel}"]`, defaultOptions);
    } else {
      // Find any close button by common aria-label patterns (supports both PF5 and PF6)
      cy.get('button[aria-label*="Close"], button[aria-label*="close"], button[aria-label*="Remove"], .pf-v6-c-button[aria-label*="Close"], .pf-v5-c-button[aria-label*="Close"], .pf-v6-c-button[aria-label*="Remove"], .pf-v5-c-button[aria-label*="Remove"]', defaultOptions);
    }
  },
);

// Conditional close button command that only clicks if the element exists
Cypress.Commands.add(
  'pfCloseButtonIfExists',
  (ariaLabel?: string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 10000, ...options };
    
    const selector = ariaLabel 
      ? `button[aria-label="${ariaLabel}"], .pf-v6-c-button[aria-label="${ariaLabel}"], .pf-v5-c-button[aria-label="${ariaLabel}"]`
      : 'button[aria-label*="Close"], button[aria-label*="close"], button[aria-label*="Remove"], .pf-v6-c-button[aria-label*="Close"], .pf-v5-c-button[aria-label*="Close"], .pf-v6-c-button[aria-label*="Remove"], .pf-v5-c-button[aria-label*="Remove"]';
    
    // Check if element exists and click it if found
    cy.get('body').then(($body) => {
      if ($body.find(selector).length > 0) {
        cy.log(`pfCloseButtonIfExists: Found and clicking (${ariaLabel || 'generic close button'})`);
        cy.get(selector, defaultOptions).click();
      } else {
        cy.log(`pfCloseButtonIfExists: Element not found (${ariaLabel || 'generic close button'}), skipping`);
      }
    });
  },
);

// Generic command to find and click menu toggle that contains specific text
Cypress.Commands.add(
  'menuToggleContains',
  (text: string | RegExp, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 10000, ...options };
    
    cy.log(`Finding menu toggle containing: ${text}`);
    
    // Find and click the menu toggle with specified content (PatternFly version agnostic)
    return cy.get('.pf-v6-c-menu-toggle, .pf-v5-c-menu-toggle', defaultOptions)
      .contains(text)
      .click();
  },
);

// Simple command to verify trace count in MUI pagination display
Cypress.Commands.add(
  'verifyTraceCount',
  (expectedCount: number | string, options?: Partial<Loggable & Timeoutable & Withinable & Shadow>) => {
    const defaultOptions = { timeout: 10000, ...options };
    const countStr = expectedCount.toString();
    
    cy.log(`Verifying trace count is ${countStr}`);
    
    // Simple direct check - same as the working example
    cy.get('.MuiTablePagination-displayedRows', defaultOptions)
      .should('contain', `of ${countStr}`);
    
    cy.log(`✓ Verified trace count: ${countStr} traces found`);
  },
);

// Tracing-specific commands for common operations

Cypress.Commands.add(
  'setupTracePage',
  (tempoInstance: string, tenant: string, timeframe?: string, serviceFilter?: string) => {
    cy.log(`Setting up trace page: ${tempoInstance} / ${tenant}`);

    // Navigate to traces page
    cy.reload();
    cy.visit('/observe/traces');
    cy.url().should('include', '/observe/traces');
    // Wait for the Tempo instance typeahead to confirm the page is fully loaded
    cy.get('input[placeholder="Select a Tempo instance"]', { timeout: 30000 }).should('exist');

    // Select Tempo instance
    cy.pfTypeahead('Select a Tempo instance').click();
    cy.pfSelectMenuItem(tempoInstance).click();
    
    // Select tenant
    cy.pfTypeahead('Select a tenant').click();
    cy.pfSelectMenuItem(tenant).click();
    
    // Set timeframe if provided
    if (timeframe) {
      cy.muiSelect('Select time range').click();
      cy.muiSelectOption(timeframe).click();
    }
    
    // Set service filter if provided
    if (serviceFilter) {
      cy.pfMenuToggle('Service Name').click();
      cy.pfMenuToggleByLabel('Multi typeahead checkbox').click();
      cy.pfCheckMenuItem(serviceFilter);
    }
    
    cy.log(`✓ Trace page setup complete for ${tempoInstance} / ${tenant}`);
  },
);

Cypress.Commands.add(
  'navigateToTraceDetails',
  () => {
    cy.log('Navigating to trace details');
    cy.muiFirstTraceLink().click();
    // Wait for trace detail page to fully render span bars before clicking
    cy.findByTestId('span-duration-bar', { timeout: 30000 }).should('have.length.greaterThan', 1);
    cy.findByTestId('span-duration-bar').eq(1).click();
    cy.log('✓ In trace details view');
  },
);

Cypress.Commands.add(
  'dragCutoffResizer',
  (position: number, resizerType: 'left' | 'right' = 'right') => {
    cy.log(`Dragging ${resizerType} resizer to ${position}% position`);

    // Wait for the trace timeline to be fully loaded
    cy.get(`[data-elem="resizer${resizerType === 'right' ? 'Right' : 'Left'}"]`).should('be.visible');

    // Perform the drag operation
    cy.get(`[data-elem="resizer${resizerType === 'right' ? 'Right' : 'Left'}"]`)
      .first()
      .then(($resizer) => {
        const resizerRect = $resizer[0].getBoundingClientRect();

        // Get the timeline container using canvas as a stable reference point
        cy.get('canvas[height="60"]')
          .parent()
          .then(($timeline) => {
            const timelineRect = $timeline[0].getBoundingClientRect();
            const targetX = timelineRect.left + (timelineRect.width * (position / 100));

            cy.log(`Timeline bounds: left=${timelineRect.left}, width=${timelineRect.width}`);
            cy.log(`Target position: ${position}% = ${targetX}px (timeline left + ${timelineRect.width * (position / 100)}px)`);

            // Drag the resizer to the specified position
            cy.wrap($resizer)
              .trigger('mousedown', { which: 1, force: true })
              .wait(100) // Small delay between mousedown and mousemove
              .trigger('mousemove', {
                clientX: targetX,
                clientY: resizerRect.top + resizerRect.height / 2,
                force: true
              })
              .wait(100) // Small delay before mouseup
              .trigger('mouseup', { force: true });
          });
      });

    // Wait for the timeline to update after the drag operation
    cy.wait(1000);
    cy.log(`✓ ${resizerType} resizer dragged to ${position}% position`);
  },
);

Cypress.Commands.add(
  'verifyCutoffPosition',
  (expectedWidthPercent: number, tolerance: number = 2) => {
    cy.log(`Verifying cutoff box position is around ${expectedWidthPercent}%`);

    // Verify the cutoff box is positioned correctly
    cy.get('[data-elem="cutoffBox"]')
      .last() // Get the right cutoff box
      .invoke('attr', 'style')
      .then((style) => {
        // Extract the width percentage value
        const widthMatch = style.match(/width:\s*(\d+(?:\.\d+)?)%/);
        expect(widthMatch).to.not.be.null;
        const widthValue = parseFloat(widthMatch[1]);

        // Check within tolerance
        const minWidth = expectedWidthPercent - tolerance;
        const maxWidth = expectedWidthPercent + tolerance;
        expect(widthValue).to.be.within(minWidth, maxWidth);

        cy.log(`✓ Cutoff box width is ${widthValue}% (within acceptable range of ${minWidth}-${maxWidth}%)`);
      });
  },
);

// Lightspeed/OLS API intercept commands
// Based on lightspeed-console/cypress/support/commands.ts

const OLS_API_BASE_URL = '/api/proxy/plugin/lightspeed-console-plugin/ols';
const getOlsApiUrl = (path: string): string => `${OLS_API_BASE_URL}${path}`;

const MOCK_STREAMED_RESPONSE_BODY = `data: {"event": "start", "data": {"conversation_id": "5f424596-a4f9-4a3a-932b-46a768de3e7c"}}

data: {"event": "token", "data": {"id": 0, "token": "Mock"}}

data: {"event": "token", "data": {"id": 1, "token": " OLS"}}

data: {"event": "token", "data": {"id": 2, "token": " response"}}

data: {"event": "end", "data": {"referenced_documents": [], "truncated": false}}
`;

type OlsAttachment = { attachment_type: string; content_type: string };

Cypress.Commands.add(
  'interceptQuery',
  (
    alias: string,
    query: string,
    conversationId: string | null = null,
    attachments: Array<OlsAttachment> = [],
  ) => {
    cy.intercept('POST', getOlsApiUrl('/v1/streaming_query'), (request) => {
      expect(request.body.media_type).to.equal('application/json');
      expect(request.body.conversation_id).to.equal(conversationId);
      expect(request.body.query).to.equal(query);

      expect(request.body.attachments).to.have.lengthOf(attachments.length);
      attachments.forEach((a, i) => {
        expect(request.body.attachments[i].attachment_type).to.equal(a.attachment_type);
        expect(request.body.attachments[i].content_type).to.equal(a.content_type);
      });

      request.reply({ body: MOCK_STREAMED_RESPONSE_BODY, delay: 1000 });
    }).as(alias);
  },
);

const MOCK_STREAMED_RESPONSE_WITH_ERROR_BODY = `data: {"event": "start", "data": {"conversation_id": "5f424596-a4f9-4a3a-932b-46a768de3e7c"}}

data: {"event": "token", "data": {"id": 0, "token": "Partial"}}

data: {"event": "token", "data": {"id": 1, "token": " response"}}

data: {"event": "tool_call", "data": {"id": 123, "name": "ABC", "args": {"some_key": "some_value"}}}

data: {"event": "tool_result", "data": {"id": 123,  "content": "Tool response", "status": "success"}}

data: {"event": "error", "data": "MOCK_ERROR_MESSAGE"}
`;

Cypress.Commands.add(
  'interceptQueryWithError',
  (alias: string, query: string, errorMessage: string) => {
    cy.intercept('POST', getOlsApiUrl('/v1/streaming_query'), (request) => {
      expect(request.body.query).to.equal(query);
      const responseBody = MOCK_STREAMED_RESPONSE_WITH_ERROR_BODY.replace(
        'MOCK_ERROR_MESSAGE',
        errorMessage,
      );
      request.reply({ body: responseBody, delay: 500 });
    }).as(alias);
  },
);

const USER_FEEDBACK_MOCK_RESPONSE = { body: { message: 'Feedback received' } };

Cypress.Commands.add(
  'interceptFeedback',
  (
    alias: string,
    conversationId: string,
    sentiment: number,
    userFeedback: string,
    userQuestionStartsWith: string,
  ) => {
    cy.intercept('POST', getOlsApiUrl('/v1/feedback'), (request) => {
      const bodyWithoutUserQuestion = { ...request.body };
      delete bodyWithoutUserQuestion.user_question;

      expect(bodyWithoutUserQuestion).to.deep.equal({
        /* eslint-disable camelcase */
        conversation_id: conversationId,
        sentiment,
        user_feedback: userFeedback,
        llm_response: 'Mock OLS response',
        /* eslint-enable camelcase */
      });
      expect(request.body.user_question.startsWith(userQuestionStartsWith)).to.equal(true);

      request.reply(USER_FEEDBACK_MOCK_RESPONSE);
    }).as(alias);
  },
);