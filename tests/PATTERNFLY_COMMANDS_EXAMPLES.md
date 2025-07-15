# PatternFly Cypress Commands - Usage Examples

This file demonstrates how to properly use the PatternFly-aware Cypress commands to avoid React state management issues.

## ✅ Recommended Usage Patterns

### 1. Simple Component Interactions

```typescript
// Empty State - Clean and reliable
cy.pfEmptyState().within(() => {
  cy.byRole('heading').should('contain', 'No items found');
});

// Buttons - Direct and stable
cy.pfButton('Create Instance').click();
cy.pfButton('Save Changes').should('be.disabled');
cy.pfButton('Cancel').should('be.visible');
```

### 2. Menu Navigation

```typescript
// Basic menu toggle
cy.pfMenuToggle('Select Instance').click();
cy.pfMenuItem('TempoStack').click();

// Or with error handling for dynamic content
cy.get('body').then(($body) => {
  if ($body.find('.pf-v6-c-menu-toggle:contains("Create Instance")').length > 0) {
    cy.pfMenuToggle('Create Instance').click();
    cy.pfMenuItem('TempoStack Instance').click();
  }
});
```

### 3. Toolbar Interactions (Recommended Approach)

```typescript
// Simple toolbar item selection
cy.pfToolbarItem(0).within(() => {
  cy.get('.pf-v6-c-menu-toggle, .pf-v5-c-menu-toggle').first().click();
});
cy.get('.pf-v6-c-menu__item, .pf-v5-c-menu__item').contains('Option 1').click();

// Wait for stability between interactions
cy.wait(1000);
cy.pfToolbarItem(1).within(() => {
  cy.get('.pf-v6-c-menu-toggle, .pf-v5-c-menu-toggle').first().click();
});
```

### 4. Form Interactions

```typescript
// Using label-based selection
cy.byLabelText('Instance Name').type('my-instance');
cy.byLabelText('Namespace').select('default');

// Form submission
cy.pfButton('Submit').click();
```

## ⚠️ Patterns to Avoid

### 1. Complex Chained Operations

```typescript
// ❌ AVOID: Too many chained operations without waits
cy.pfToolbarItem(0).within(() => {
  cy.pfMenuToggle().click();
}).then(() => {
  cy.pfMenuItem('Item').click();
}).then(() => {
  cy.pfToolbarItem(1).within(() => {
    cy.pfMenuToggle().click();
  });
});

// ✅ BETTER: Break into separate operations with waits
cy.pfToolbarItem(0).within(() => {
  cy.get('.pf-v6-c-menu-toggle').first().click();
});
cy.get('.pf-v6-c-menu__item').contains('Item').click();
cy.wait(1000); // Allow React state to stabilize
cy.pfToolbarItem(1).within(() => {
  cy.get('.pf-v6-c-menu-toggle').first().click();
});
```

### 2. Rapid Sequential Clicks

```typescript
// ❌ AVOID: Multiple rapid interactions
cy.pfMenuToggle().click();
cy.pfMenuItem('Item1').click();
cy.pfMenuToggle().click(); // Too fast, React state not updated
cy.pfMenuItem('Item2').click();

// ✅ BETTER: Add stabilization waits
cy.pfMenuToggle().click();
cy.pfMenuItem('Item1').click();
cy.wait(500); // Let React update
cy.pfMenuToggle().click();
cy.pfMenuItem('Item2').click();
```

## 🛡️ Defensive Programming Patterns

### 1. Check Element Existence

```typescript
// Safe menu interaction
cy.get('body').then(($body) => {
  if ($body.find('.pf-v6-c-menu-toggle:contains("Actions")').length > 0) {
    cy.pfMenuToggle('Actions').click();
    if ($body.find('.pf-v6-c-menu__item:contains("Delete")').length > 0) {
      cy.pfMenuItem('Delete').click();
    }
  }
});
```

### 2. Wait for Stability

```typescript
// Wait for page load and React hydration
cy.visit('/traces');
cy.wait(2000); // Allow initial React state to settle

// Perform interactions
cy.pfEmptyState().should('be.visible');
cy.pfButton('Create Instance').click();
```

### 3. Use Timeouts

```typescript
// Custom timeouts for slow-loading components
cy.pfMenuToggle('Select Instance', { timeout: 15000 }).click();
cy.pfMenuItem('TempoStack', { timeout: 10000 }).click();
```

## 🎯 Best Practices Summary

1. **Add waits between complex interactions** to let React state stabilize
2. **Use defensive checks** for dynamic content
3. **Prefer direct PatternFly commands** over complex CSS selectors
4. **Break complex operations** into smaller, testable steps
5. **Handle uncaught exceptions** gracefully in support files
6. **Use timeouts** for components that load asynchronously

## 🔧 Troubleshooting

If you encounter "e is not a function" errors:

1. **Add `cy.wait(1000-2000)`** between interactions
2. **Check if elements exist** before interacting
3. **Use more specific selectors** instead of nth-child
4. **Verify React components have finished rendering**
5. **Review browser console** for additional React errors

These patterns will make your tests more reliable and less prone to React state management issues. 