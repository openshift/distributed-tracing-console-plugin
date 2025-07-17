# Cypress Selector Best Practices for PatternFly Applications

This guide outlines the best practices for element selection in Cypress tests for PatternFly-based applications to ensure maintainable, reliable, and accessible test automation.

## Selector Priority (Recommended Order)

1. **`data-cy` attributes** - Custom test attributes (highest priority)
2. **`data-testid` attributes** - Common testing attributes  
3. **`data-test` attributes** - Legacy test attributes
4. **PatternFly component attributes** - `data-ouia-component-*`, `data-pf-*`
5. **ARIA attributes** - Accessibility attributes (PatternFly components are ARIA-compliant)
6. **Semantic roles** - Role-based selection
7. **Text content** - Visible text
8. **PatternFly CSS classes** - Component-specific classes (better than generic CSS)
9. **Generic CSS classes/IDs** - Last resort (lowest priority)

## PatternFly-Specific Considerations

PatternFly components come with built-in accessibility features and consistent patterns:
- Most components have proper ARIA attributes
- Components follow consistent naming conventions
- Use PatternFly's data attributes when available
- Leverage component-specific selectors over generic CSS classes

## Custom Commands Available

### Test-Specific Selectors
```typescript
// Primary recommendation: data-cy attributes
cy.byCy('submit-button')                    // [data-cy="submit-button"]

// Alternative test attributes
cy.byTestID('username-input')               // [data-test="username-input"]
cy.findByTestId('password-field')           // [data-testid="password-field"]
cy.byTestSelector('menu-dropdown')          // [data-test-selector="menu-dropdown"]
```

### PatternFly Component Selectors
```typescript
// PatternFly-specific helpers
cy.pfMenuToggle('Create a Tempo instance')  // Menu toggle by text
cy.pfMenuItem('TempoStack instance')         // Menu item selection
cy.pfButton('View documentation')            // PatternFly button by text
cy.pfEmptyState()                           // Empty state component
cy.pfToolbarItem(0)                         // First toolbar item
```

### Accessibility-Based Selectors
```typescript
// ARIA labels (PatternFly components have good ARIA support)
cy.byAriaLabel('Close dialog')              // [aria-label="Close dialog"]
cy.byLabelText('Instance Type')             // Form field by label

// Role-based selection
cy.byRole('button')                         // [role="button"]
cy.byRole('button', 'Submit form')          // [role="button"][aria-label="Submit form"]
```

### Content-Based Selectors
```typescript
// Text content (use sparingly, text can change)
cy.byText('View documentation')             // contains('View documentation')
cy.byButtonText('Create instance')          // button[type="button"] containing text
```

## Examples: Converting Brittle Selectors

### ❌ Avoid: Complex CSS Selectors
```typescript
// BAD: Fragile, implementation-dependent
cy.get(':nth-child(1) > .pf-v6-c-toolbar__item > .pf-v6-c-form > .pf-v6-c-form__group')
cy.get('.pf-v6-c-empty-state__title-text')
cy.get('.MuiDataGrid-row--firstVisible > [data-field="name"] > .MuiBox-root')
cy.get('.pf-v6-c-menu-toggle__toggle-icon').click()
```

### ✅ Preferred: Stable, Semantic Selectors
```typescript
// GOOD: Stable and meaningful
cy.byCy('tempo-instance-dropdown')
cy.byAriaLabel('Select Tempo instance')           // PatternFly components have ARIA labels
cy.byRole('button', 'Create a Tempo instance')    // Use semantic roles
cy.byTestID('documentation-link')
cy.pfMenuToggle('Create a Tempo instance')        // PatternFly-specific helper
```

## PatternFly Component Examples

### Empty State
```typescript
// Current (brittle):
cy.get('.pf-v6-c-empty-state__title-text')

// Improved:
cy.byCy('empty-state-title')
// OR leverage PatternFly's semantic structure:
cy.byRole('heading').contains('No Tempo instances yet')
```

### Toolbar & Dropdowns
```typescript
// Current (fragile):
cy.get(':nth-child(1) > .pf-v6-c-toolbar__item > .pf-v6-c-form')

// Improved:
cy.byCy('tempo-instance-selector')
// OR use PatternFly menu patterns:
cy.pfMenuToggle().contains('Select instance')
cy.pfMenuItem('tempo-stack-instance')
```

### Buttons
```typescript
// Current:
cy.get('.pf-v6-c-button__text')

// Improved:
cy.byCy('submit-button')
// OR use ARIA (PatternFly buttons have proper ARIA):
cy.byRole('button', 'Submit')
```

### Forms
```typescript
// Current:
cy.get('.pf-v6-c-form__group-control > .pf-v6-c-menu-toggle')

// Improved:
cy.byCy('form-field-selector')
// OR use form labels (PatternFly forms are accessible):
cy.byLabelText('Instance Type')
```

## Implementation Strategy

### For New Elements
1. **Add data-cy attributes** to UI components:
   ```jsx
   <button data-cy="create-tempo-instance">Create Instance</button>
   <input data-cy="trace-search-input" placeholder="Search traces..." />
   ```

2. **Use custom commands** in tests:
   ```typescript
   cy.byCy('create-tempo-instance').click();
   cy.byCy('trace-search-input').type('my-service');
   ```

### For Existing Tests
1. **Identify brittle selectors** (CSS classes, nth-child, complex paths)
2. **Add data-cy attributes** to corresponding UI components
3. **Replace selectors** with custom commands gradually

## Specific Improvements for Current Tests

Based on your existing test file, here are specific improvements:

### Empty State Testing
```typescript
// Current (brittle):
cy.get('.pf-v6-c-empty-state__title-text')
  .should('be.visible')
  .and('have.text', 'No Tempo instances yet');

// Improved options:
// Option 1: Custom data attribute
cy.byCy('empty-state-title')
  .should('have.text', 'No Tempo instances yet');

// Option 2: PatternFly helper + semantic role
cy.pfEmptyState().within(() => {
  cy.byRole('heading').should('have.text', 'No Tempo instances yet');
});

// Option 3: Direct ARIA/semantic approach
cy.byRole('heading', 'No Tempo instances yet').should('be.visible');
```

### Menu Toggle & Dropdown Selection
```typescript
// Current (fragile):
cy.get(':nth-child(1) > .pf-v6-c-toolbar__item > .pf-v6-c-form > .pf-v6-c-form__group > .pf-v6-c-form__group-control > .pf-v6-c-menu-toggle > .pf-v6-c-menu-toggle__button > .pf-v6-c-menu-toggle__controls > .pf-v6-c-menu-toggle__toggle-icon').click();

// Improved options:
// Option 1: Custom data attribute (best)
cy.byCy('tempo-instance-selector').click();

// Option 2: PatternFly helper
cy.pfMenuToggle('Create a Tempo instance').click();

// Option 3: ARIA label
cy.byAriaLabel('Select Tempo instance').click();
```

### Menu Item Selection
```typescript
// Current (nested and fragile):
cy.get(':nth-child(2) > .pf-v6-c-menu__item > .pf-v6-c-menu__item-main > .pf-v6-c-menu__item-text').click();

// Improved:
// Option 1: Custom data attributes
cy.byCy('tempo-stack-option').click();

// Option 2: PatternFly helper
cy.pfMenuItem('Create a TempoStack instance').click();

// Option 3: Text-based (least preferred, but better than CSS)
cy.byText('Create a TempoStack instance').click();
```

### Button Interactions
```typescript
// Current:
cy.contains('.pf-v6-c-button', 'View documentation')
  .should('be.visible')
  .and('have.text', 'View documentation');

// Improved:
// Option 1: Custom data attribute
cy.byCy('documentation-button')
  .should('have.text', 'View documentation');

// Option 2: PatternFly helper
cy.pfButton('View documentation').should('be.visible');

// Option 3: Semantic role
cy.byRole('button', 'View documentation').should('be.visible');
```

### Complex Toolbar Navigation
```typescript
// Current (extremely fragile):
cy.get('.pf-m-toggle-group > .pf-v6-c-toolbar__group > :nth-child(2) > .pf-v6-c-form > .pf-v6-c-form__group > .pf-v6-c-form__group-control > .pf-v6-c-menu-toggle > .pf-v6-c-menu-toggle__button').click();

// Improved:
// Option 1: Custom data attributes (recommended)
cy.byCy('service-filter-dropdown').click();

// Option 2: Combine PatternFly helpers
cy.pfToolbarItem(1).within(() => {
  cy.pfMenuToggle().click();
});

// Option 3: Label-based for form fields
cy.byLabelText('Service Name').click();
```

### Checkbox Selection in Menus
```typescript
// Current:
cy.contains('.pf-v6-c-menu__item-text', 'http')
  .closest('.pf-v6-c-menu__item')
  .find('input[type="checkbox"]')
  .check();

// Improved:
// Option 1: Custom data attributes
cy.byCy('service-type-http').check();

// Option 2: Semantic approach
cy.byLabelText('http').check();
cy.byRole('checkbox', 'http').check();

// Option 3: Enhanced PatternFly helper
cy.pfMenuItem('http').within(() => {
  cy.get('input[type="checkbox"]').check();
});
```

## Benefits

- **Stability**: Tests survive UI refactoring
- **Maintainability**: Clear intent and easy updates
- **Accessibility**: Encourages proper ARIA usage
- **Performance**: Faster element location
- **Readability**: Self-documenting test code

## Migration Checklist

- [ ] Audit existing selectors for brittleness
- [ ] Add data-cy attributes to critical UI elements
- [ ] Replace CSS selectors with custom commands
- [ ] Update test documentation
- [ ] Train team on new practices

Remember: **The best selector is one that survives code changes and clearly expresses test intent.** 