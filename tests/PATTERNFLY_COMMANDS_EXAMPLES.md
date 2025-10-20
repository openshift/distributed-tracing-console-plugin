# PatternFly Cypress Commands - Usage Examples

This file provides comprehensive examples of PatternFly-aware Cypress commands for distributed tracing UI testing, focusing on semantic selectors and efficient testing patterns.

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

## 🆕 New Distributed Tracing UI Commands

### Menu & Dropdown Interactions

```typescript
// Tempo instance selection
cy.pfTypeahead('Select a Tempo instance').click();
cy.pfSelectMenuItem('chainsaw-rbac / simplst').click();

// Service filtering with checkboxes
cy.pfMenuToggleByLabel('Multi typeahead checkbox').click();
cy.pfCheckMenuItem('http-rbac-1');
cy.pfCheckMenuItem('http-rbac-2', true);    // Explicitly check
cy.pfCheckMenuItem('grpc-rbac-1', false);   // Uncheck

// Time range selection
cy.pfMenuToggle('Last 30 minutes').click();
cy.pfSelectMenuItem('Last 1 hour').click();
```

### Navigation Commands

```typescript
// Breadcrumb navigation
cy.pfBreadcrumb('Traces').click();
cy.pfBreadcrumb('Observability').should('be.visible');

// Close buttons (chip groups, modals, etc.)
cy.pfCloseButton('Close chip group').click();      // PatternFly 5
cy.pfCloseButton('Close label group').click();     // PatternFly 6
cy.pfCloseButton().click();                        // First close button found (any version)
```

### Trace & Span Interactions

```typescript
// Click on traces
cy.muiFirstTraceLink().click();                    // First trace in list
cy.muiTraceLink('http-rbac-2').click();            // Specific service trace

// Interact with span bars
cy.muiFirstSpanBar().click();                      // First span bar
cy.muiSpanBar('http-rbac-2').click();              // Specific service span
cy.findByTestId('span-duration-bar').first().click(); // By test ID (multiple spans)
```

### Trace Attribute Validation

```typescript
// Single attribute validation
cy.muiTraceAttribute('network.peer.address', '1.2.3.4');
cy.muiTraceAttribute('peer.service', 'telemetrygen-client');
cy.muiTraceAttribute('k8s.container.name', 'telemetrygen', true); // Optional attribute

// Custom validation with function
cy.muiTraceAttribute('service.name', (text) => {
  return ['http-rbac-1', 'http-rbac-2', 'grpc-rbac-1', 'grpc-rbac-2'].includes(text);
}, false, 'TempoStack'); // Required attribute with logging

// Bulk attribute validation (recommended for multiple attributes)
cy.muiTraceAttributes({
  'network.peer.address': { value: '1.2.3.4' },
  'peer.service': { value: 'telemetrygen-client' },
  'k8s.container.name': { 
    value: 'telemetrygen', 
    optional: true 
  },
  'k8s.namespace.name': { 
    value: (text) => text.startsWith('chainsaw-'),
    optional: true 
  },
  'service.name': { 
    value: ['http-rbac-1', 'http-rbac-2', 'grpc-rbac-1', 'grpc-rbac-2']
  }
}, 'Debug'); // Log prefix for debugging
```

### Complete Workflow Examples

```typescript
// Complete trace inspection workflow
describe('Trace inspection', () => {
  it('should navigate and validate trace details', () => {
    // Navigate to traces page
    cy.visit('/observe/traces');
    
    // Select Tempo instance
    cy.pfTypeahead('Select a Tempo instance').click();
    cy.pfSelectMenuItem('chainsaw-rbac / simplst').click();
    
    // Set time range
    cy.pfMenuToggle('Last 30 minutes').click();
    cy.pfSelectMenuItem('Last 1 hour').click();
    
    // Filter by services
    cy.pfMenuToggleByLabel('Multi typeahead checkbox').click();
    cy.pfCheckMenuItem('http-rbac-1');
    cy.pfCheckMenuItem('http-rbac-2');
    
    // Click first trace
    cy.muiFirstTraceLink().click();
    
    // Click on span for details
    cy.muiFirstSpanBar().click();
    
    // Validate trace attributes efficiently
    cy.muiTraceAttributes({
      'network.peer.address': { value: '1.2.3.4' },
      'peer.service': { value: 'telemetrygen-client' },
      'service.name': { 
        value: (text) => text.includes('rbac')
      }
    });
    
    // Navigate back
    cy.pfBreadcrumb('Traces').click();
  });
});
```

## 🔄 PatternFly 5 & 6 Compatibility

Our commands seamlessly support both PatternFly 5 and PatternFly 6 components:

### Close Buttons

```typescript
// PatternFly 5 - Chip Group
// <button aria-label="Close chip group" class="pf-v5-c-button pf-m-plain">
cy.pfCloseButton('Close chip group').click();

// PatternFly 6 - Label Group  
// <button aria-label="Close label group" class="pf-v6-c-button pf-m-plain pf-m-no-padding">
cy.pfCloseButton('Close label group').click();

// Works with both versions automatically
cy.pfCloseButton('Close').click();  // Finds any close button
```

### Menu Components

```typescript
// Both PF5 and PF6 menu structures supported
cy.pfMenuToggle('Select Instance').click();     // Works with .pf-v5-c-menu-toggle or .pf-v6-c-menu-toggle
cy.pfSelectMenuItem('tempo-stack').click();     // Works with .pf-v5-c-menu__item or .pf-v6-c-menu__item
cy.pfCheckMenuItem('service-name');             // Handles both PF5/PF6 checkbox patterns
```

### Button Components

```typescript
// PatternFly button targeting (version-agnostic)
cy.pfButton('Create Instance').click();         // Targets .pf-v5-c-button or .pf-v6-c-button
cy.pfEmptyState().should('be.visible');         // Works with both .pf-v5-c-empty-state and .pf-v6-c-empty-state
```

### Key Benefits

- ✅ **Automatic detection** - Commands work with both PF5 and PF6 automatically
- ✅ **Future-proof** - Ready for PatternFly version upgrades
- ✅ **Consistent API** - Same command syntax across versions
- ✅ **Robust selectors** - Uses semantic attributes over version-specific classes

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