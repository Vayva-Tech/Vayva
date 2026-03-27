# Accessibility (WCAG 2.1 AA) Audit Checklist

## Quick Start

```bash
# Install axe-core for automated testing
pnpm add -D @axe-core/playwright

# Run accessibility tests
pnpm test:accessibility
```

## Manual Audit Process

### Level A Compliance (Required)

#### 1. Perceivable
- [ ] **Text Alternatives**: All images have alt text
- [ ] **Captions**: Videos have closed captions
- [ ] **Color Contrast**: Minimum 4.5:1 for normal text, 3:1 for large text
- [ ] **Resize Text**: Text can be resized to 200% without loss
- [ ] **Images of Text**: Only used for decoration or essential

#### 2. Operable
- [ ] **Keyboard Access**: All functions work via keyboard
- [ ] **No Keyboard Traps**: Users can exit components with Tab/Shift+Tab
- [ ] **Skip Links**: "Skip to main content" link present
- [ ] **Focus Order**: Logical tab order
- [ ] **Link Purpose**: Link text describes destination
- [ ] **Page Titles**: Descriptive and unique

#### 3. Understandable
- [ ] **Language**: HTML lang attribute set
- [ ] **Consistent Navigation**: Same across all pages
- [ ] **Input Labels**: All form fields labeled
- [ ] **Error Identification**: Errors clearly described
- [ ] **Error Suggestions**: How to fix errors explained

#### 4. Robust
- [ ] **Valid HTML**: No parsing errors
- [ ] **Name, Role, Value**: ARIA attributes used correctly
- [ ] **Compatible**: Works with assistive technologies

### Level AA Compliance (Required)

#### Additional Requirements
- [ ] **Audio Control**: Auto-play audio can be paused
- [ ] **Contrast Enhanced**: 7:1 for normal text, 4.5:1 for large text
- [ ] **Low Contrast Text**: 3:1 minimum for UI components
- [ ] **Reflow**: Content works at 320px width
- [ ] **Non-text Contrast**: 3:1 for icons, graphs, charts
- [ ] **Content on Hover**: Dismissible, hoverable, persistent
- [ ] **Pointer Gestures**: Alternative to complex gestures
- [ ] **Pointer Cancellation**: No accidental activation
- [ ] **Target Size**: 44x44px minimum touch targets
- [ ] **Multiple Ways**: Multiple ways to find pages
- [ ] **Headings & Labels**: Descriptive and organized
- [ ] **Focus Visible**: Clear focus indicators
- [ ] **Section Headings**: Organized by headings

## Automated Testing Tools

### 1. axe DevTools Extension
```bash
# Chrome extension
https://chrome.google.com/webstore/detail/axe-devtools/gjcennehdbimgdjaefebdkkpddnhbcem
```

**Usage:**
1. Install Chrome extension
2. Open DevTools → axe tab
3. Click "Analyze"
4. Fix all critical/serious issues

### 2. WAVE Evaluation Tool
```
https://wave.webaim.org/extension/
```

### 3. Lighthouse Accessibility Score
```bash
# Already configured in lighthouserc.js
--assert.assertions."categories.accessibility".minScore=0.9
```

## Common Fixes

### Fix Color Contrast
```tsx
// Before - fails WCAG AA
<p className="text-gray-400">Light gray text</p>

// After - passes WCAG AA (4.5:1)
<p className="text-gray-600">Darker gray text</p>
```

### Fix Focus Indicators
```tsx
// Before - no visible focus
<button className="px-4 py-2">Click me</button>

// After - clear focus ring
<button className="px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Click me
</button>
```

### Fix Alt Text
```tsx
// Before - missing alt
<img src="/logo.png" />

// After - descriptive alt
<img src="/logo.png" alt="Vayva company logo" />

// Decorative image - empty alt
<img src="/decorative-line.png" alt="" aria-hidden="true" />
```

### Fix Form Labels
```tsx
// Before - unlabeled input
<input type="email" placeholder="Enter email" />

// After - properly labeled
<label htmlFor="email">Email Address</label>
<input 
  id="email"
  type="email" 
  aria-describedby="email-help"
/>
<span id="email-help">We'll never share your email</span>
```

### Fix Keyboard Navigation
```tsx
// Before - div not keyboard accessible
<div onClick={handleClick}>Click me</div>

// After - keyboard accessible
<button 
  onClick={handleClick}
  onKeyDown={(e) => e.key === 'Enter' && handleClick()}
  tabIndex={0}
>
  Click me
</button>
```

### Fix Skip Links
```tsx
// Add at top of page layout
<a 
  href="#main-content" 
  className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-white p-4 z-50"
>
  Skip to main content
</a>

<main id="main-content">
  {/* Page content */}
</main>
```

## Testing Checklist by Component

### Dashboard Pages
- [ ] Heading hierarchy (H1 → H2 → H3)
- [ ] Landmark regions (<header>, <main>, <nav>, <footer>)
- [ ] Skip links present
- [ ] Focus management on page load
- [ ] Error announcements for screen readers

### Forms
- [ ] All inputs have labels
- [ ] Required fields marked with aria-required
- [ ] Error messages linked with aria-describedby
- [ ] Form validation announced to screen readers
- [ ] Success messages announced

### Tables
- [ ] Table headers with <th scope="col">
- [ ] Captions or summaries for complex tables
- [ ] Row/column headers for data tables
- [ ] Responsive design doesn't hide headers

### Charts & Graphs
- [ ] Text alternatives describing data
- [ ] High contrast colors (3:1 minimum)
- [ ] Patterns in addition to colors
- [ ] Data tables as alternatives

### Modals & Dialogs
- [ ] Focus trapped inside modal when open
- [ ] Return focus to trigger element on close
- [ ] aria-modal="true" and role="dialog"
- [ ] Escape key closes modal
- [ ] Background content inert (aria-hidden)

### Navigation
- [ ] Current page indicated with aria-current
- [ ] Collapsible menus keyboard accessible
- [ ] Dropdowns operable via keyboard
- [ ] Breadcrumb navigation present

## Priority Issues to Fix

### Critical (Must Fix Immediately)
1. Missing alt text on images
2. Insufficient color contrast
3. Missing form labels
4. Keyboard traps
5. Missing focus indicators

### High Priority
1. Missing skip links
2. Poor heading structure
3. Inaccessible custom components
4. Missing error descriptions
5. Small touch targets

### Medium Priority
1. Link purpose unclear
2. Inconsistent navigation
3. Missing landmarks
4. Poor focus order
5. Missing language attribute

## Acceptance Criteria

All dashboards must pass:

✅ WCAG 2.1 Level AA compliance  
✅ axe DevTools: 0 critical/serious violations  
✅ Lighthouse Accessibility: >90  
✅ Keyboard navigable throughout  
✅ Screen reader tested (NVDA/JAWS)  
✅ Color contrast: 4.5:1 minimum  
✅ Touch targets: 44x44px minimum  

## Testing Schedule

- **Every PR**: Automated accessibility tests
- **Weekly**: Manual keyboard testing
- **Monthly**: Screen reader testing
- **Quarterly**: Full WCAG audit

## Resources

- [WCAG 2.1 Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)
- [Inclusive Components](https://inclusive-components.design/)
