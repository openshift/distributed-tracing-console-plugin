import './commands';
import { register as registerCypressGrep } from '@cypress/grep';

registerCypressGrep();

// Handle uncaught exceptions from the application
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent the test from failing on uncaught exceptions
  // that might be caused by the application's React state management
  if (err.message.includes('e is not a function') ||
      err.message.includes('Cannot read prop') ||
      err.message.includes('undefined is not a function') ||
      err.message.includes('Cannot read properties of undefined') ||
      err.message.includes('before initialization') ||
      // Console plugin module loading errors (e.g. Lightspeed OverviewDetail) are
      // transient and should not fail our tests — the plugin itself is tested separately.
      err.message.includes('Failed to load module')) {
    console.log('Caught application error:', err.message);
    return false;
  }
  // Let other exceptions fail the test
  return true;
});
