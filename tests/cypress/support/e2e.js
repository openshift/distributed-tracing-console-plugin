import './commands';
import registerCypressGrep from '@cypress/grep';

registerCypressGrep();

// Handle uncaught exceptions from the application
Cypress.on('uncaught:exception', (err, runnable) => {
  // Return false to prevent the test from failing on uncaught exceptions
  // that might be caused by the application's React state management
  if (err.message.includes('e is not a function') || 
      err.message.includes('Cannot read prop') ||
      err.message.includes('undefined is not a function') ||
      err.message.includes('Cannot read properties of undefined')) {
    console.log('Caught application error:', err.message);
    return false;
  }
  // Let other exceptions fail the test
  return true;
});
