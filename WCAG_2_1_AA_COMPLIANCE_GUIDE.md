# WCAG 2.1 AA Compliance Guide - Phase 3 Issue #9

**Status:** ✅ IMPLEMENTED  
**Date:** March 26, 2026  
**Standard:** Web Content Accessibility Guidelines (WCAG) 2.1 Level AA  
**Compliance Target:** Zero critical/serious violations across all 26 industries

---

## Executive Summary

This guide provides actionable patterns and checklists for achieving WCAG 2.1 AA compliance across the Vayva platform. Accessibility is not optional—it's a legal requirement and moral imperative that enables **15% of the global population** (people with disabilities) to use our platform effectively.

### Business Impact
- **Legal Compliance:** Reduces ADA lawsuit risk
- **Market Expansion:** Enables 1+ billion disabled users globally
- **SEO Benefits:** Many accessibility improvements boost search rankings
- **Better UX:** Accessible design improves usability for everyone

---

## Quick Start Checklist

Use this checklist for every new component or feature:

### ✅ Perceivable (Information must be presentable to users' senses)
- [ ] All images have alt text
- [ ] Icons have aria-labels
- [ ] Videos have captions
- [ ] Color contrast meets 4.5:1 ratio (normal text) or 3:1 (large text)
- [ ] Content doesn't rely on color alone to convey meaning
- [ ] Text can be resized up to 200% without loss of functionality

### ✅ Operable (UI components must be operable by all users)
- [ ] All functionality available via keyboard
- [ ] Focus indicators are visible (2px minimum)
- [ ] No keyboard traps
- [ ] Skip links provided for repetitive content
- [ ] Users have enough time to read and interact
- [ ] No content flashes more than 3 times per second

### ✅ Understandable (Information and operation must be clear)
- [ ] Language is declared in HTML (`lang="en"`)
- [ ] Form fields have associated labels
- [ ] Error messages are clear and helpful
- [ ] Navigation is consistent across pages
- [ ] Functionality is predictable

### ✅ Robust (Content must work with assistive technologies)
- [ ] Valid HTML with proper semantic structure
- [ ] ARIA roles used correctly (when needed)
- [ ] Dynamic content changes are announced
- [ ] Compatible with screen readers (NVDA, JAWS, VoiceOver)
- [ ] Works with browser assistive modes

---

## Common Violations & Fixes

### 1. Missing Alt Text on Images

**❌ VIOLATION:**
```tsx
<img src="/chart.png" />
```

**✅ FIX:**
```tsx
// Decorative image (add empty alt)
<img src="/chart.png" alt="" role="presentation" />

// Informative image (describe content)
<img src="/chart.png" alt="Revenue chart showing 25% growth from Q1 to Q2 2026" />
```

**Rule:** Every `<img>` needs an `alt` attribute. Use empty alt (`alt=""`) for decorative images.

---

### 2. Insufficient Color Contrast

**❌ VIOLATION:**
```tsx
<p className="text-gray-400">Light gray text on white background</p>
// Contrast ratio: 2.8:1 (FAILS - requires 4.5:1)
```

**✅ FIX:**
```tsx
<p className="text-gray-600">Darker gray text on white background</p>
// Contrast ratio: 5.2:1 (PASSES)
```

**Tools to Check:**
- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- axe-core DevTools extension
- Chrome DevTools > Elements > Styles > color

---

### 3. Missing Form Labels

**❌ VIOLATION:**
```tsx
<input type="email" placeholder="Enter your email" />
// Placeholder disappears when typing - NOT a label!
```

**✅ FIX:**
```tsx
<div className="space-y-1">
  <label htmlFor="email" className="block text-sm font-medium text-gray-700">
    Email Address
  </label>
  <input 
    id="email" 
    type="email" 
    aria-describedby="email-help"
    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
  />
  <p id="email-help" className="text-sm text-gray-500">
    We'll never share your email with anyone else.
  </p>
</div>
```

**Best Practice:** Always use explicit `<label>` elements with matching `for`/`id` attributes.

---

### 4. Keyboard Inaccessible Components

**❌ VIOLATION:**
```tsx
<div onClick={handleClick} className="cursor-pointer">
  Click me
</div>
// Not focusable, no keyboard access
```

**✅ FIX:**
```tsx
<button 
  onClick={handleClick}
  className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
>
  Click me
</button>
```

**If you MUST use div/span:**
```tsx
<div
  role="button"
  tabIndex={0}
  onClick={handleClick}
  onKeyDown={(e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      handleClick();
    }
  }}
  className="cursor-pointer focus:outline-none focus:ring-2 focus:ring-blue-500"
>
  Click me
</div>
```

---

### 5. Missing Focus Indicators

**❌ VIOLATION:**
```tsx
<button className="focus:outline-none">
  No visible focus ring
</button>
```

**✅ FIX:**
```tsx
<button className="focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
  Clear 2px focus ring
</button>
```

**Minimum Requirement:** 2px outline with 3:1 contrast ratio against background.

---

### 6. Screen Reader Incompatible Dynamic Content

**❌ VIOLATION:**
```tsx
{loading && <div>Loading...</div>}
// Screen reader users won't know content is loading
```

**✅ FIX:**
```tsx
{loading && (
  <>
    <div>Loading...</div>
    <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
      Loading dashboard data, please wait
    </div>
  </>
)}
```

**When to Use:**
- `aria-live="polite"`: Non-urgent updates (new content loaded)
- `aria-live="assertive"`: Urgent updates (errors, alerts)
- `aria-atomic="true"`: Announce entire region, not just changed part

---

### 7. Improper Heading Hierarchy

**❌ VIOLATION:**
```tsx
<h1>Dashboard</h1>
<h3>Analytics Overview</h3> {/* Skipped h2! */}
```

**✅ FIX:**
```tsx
<h1>Dashboard</h1>
<h2>Analytics Overview</h2>
<h3>Traffic Sources</h3>
```

**Rule:** Headings should form a logical outline (h1 → h2 → h3 → h4). Never skip levels.

---

### 8. Tables Without Headers

**❌ VIOLATION:**
```tsx
<table>
  <tr>
    <td>Product</td>
    <td>Sales</td>
  </tr>
  <tr>
    <td>Widget A</td>
    <td>$10,000</td>
  </tr>
</table>
```

**✅ FIX:**
```tsx
<table>
  <caption>Product Sales by Quarter</caption>
  <thead>
    <tr>
      <th scope="col">Product</th>
      <th scope="col">Sales</th>
    </tr>
  </thead>
  <tbody>
    <tr>
      <td>Widget A</td>
      <td>$10,000</td>
    </tr>
  </tbody>
</table>
```

**For complex tables:** Use `id`/`headers` attributes to associate cells with multiple headers.

---

## Restaurant Dashboard Accessibility Fixes

### Applied Fixes

#### 1. Added Skip Link
```tsx
import { SkipLink } from '@/utils/accessibility';

export function RestaurantDashboard() {
  return (
    <>
      <SkipLink targetId="main-content" />
      <nav aria-label="Main navigation">
        {/* Navigation */}
      </nav>
      <main id="main-content">
        {/* Main content */}
      </main>
    </>
  );
}
```

#### 2. Live Region for Data Refresh
```tsx
import { LiveRegion } from '@/utils/accessibility';

const [refreshing, setRefreshing] = useState(false);

const handleRefresh = async () => {
  setRefreshing(true);
  await fetchData();
  setRefreshing(false);
};

return (
  <>
    <button onClick={handleRefresh} aria-busy={refreshing}>
      {refreshing ? 'Refreshing...' : 'Refresh'}
    </button>
    <LiveRegion>
      {refreshing ? 'Updating dashboard data' : 'Dashboard data updated'}
    </LiveRegion>
  </>
);
```

#### 3. Accessible Metric Tiles
```tsx
function RestaurantMetricTile({ title, value, change, icon }) {
  const isPositive = change >= 0;
  
  return (
    <Card 
      role="article"
      aria-label={`${title}: ${value}, ${isPositive ? '+' : ''}${change}% change`}
    >
      <div className="flex justify-between items-start gap-2">
        <div>
          <p className="text-sm text-orange-600">{title}</p>
          <p className="text-2xl font-bold text-orange-900 mt-1">{value}</p>
          {change !== 0 && (
            <p className={`text-xs mt-1 ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
              <span className="sr-only">Change:</span>
              {isPositive ? '↑' : '↓'} {Math.abs(change)}%
            </p>
          )}
        </div>
        <div className="text-orange-500 shrink-0" aria-hidden="true">
          {icon}
        </div>
      </div>
    </Card>
  );
}
```

#### 4. Keyboard Accessible View Switcher
```tsx
<div role="tablist" aria-label="Dashboard views">
  <button
    role="tab"
    aria-selected={activeView === 'foh'}
    aria-controls="foh-panel"
    onClick={() => handleViewChange('foh')}
    onKeyDown={(e) => {
      if (e.key === 'ArrowRight') handleViewChange('kds');
      if (e.key === 'ArrowLeft') handleViewChange('foh');
    }}
  >
    FOH View
  </button>
  <button
    role="tab"
    aria-selected={activeView === 'kds'}
    aria-controls="kds-panel"
    onClick={() => handleViewChange('kds')}
    onKeyDown={(e) => {
      if (e.key === 'ArrowRight') handleViewChange('foh');
      if (e.key === 'ArrowLeft') handleViewChange('kds');
    }}
  >
    KDS View
  </button>
</div>
```

---

## Testing Tools & Workflow

### Automated Testing

#### 1. Local Audit Script
```bash
# Run accessibility audit on all dashboards
pnpm check:a11y

# Run audit on specific dashboard
node scripts/run-accessibility-audit.js --dashboard=restaurant

# Generate JSON report
node scripts/run-accessibility-audit.js --report=json
```

#### 2. Playwright E2E Tests
```bash
# Run all accessibility tests
pnpm test:a11y

# Run with HTML report
pnpm test:a11y:report
```

#### 3. Browser Extensions
- **axe DevTools** (Chrome/Firefox) - Free automated testing
- **WAVE** (Chrome/Firefox) - Visual accessibility feedback
- **Lighthouse** (Chrome DevTools) - Performance + accessibility

### Manual Testing

#### Keyboard Testing Checklist
- [ ] Press Tab - focus moves forward through interactive elements
- [ ] Press Shift+Tab - focus moves backward
- [ ] Press Enter/Space - activates buttons and links
- [ ] Press Escape - closes modals/dropdowns
- [ ] Arrow keys - navigate within components (menus, tabs, trees)
- [ ] Focus is always visible (no "Where am I?" moments)

#### Screen Reader Testing
Test with at least one screen reader:
- **NVDA** (Windows, free) - Most popular worldwide
- **JAWS** (Windows, paid) - Enterprise standard
- **VoiceOver** (Mac/iOS, built-in) - Apple users

**Basic Screen Reader Commands:**
- Read entire page: Insert + Down Arrow (NVDA), VO + A (VoiceOver)
- Next heading: H (all screen readers)
- Next button: B (all screen readers)
- Next link: K (all screen readers)
- List links: Insert + F7 (NVDA), VO + U (VoiceOver)

#### Mobile Accessibility Testing
- [ ] Test with VoiceOver (iOS) / TalkBack (Android)
- [ ] Verify touch targets are at least 44x44px
- [ ] Check zoom/magnification works (up to 200%)
- [ ] Test landscape and portrait orientations
- [ ] Verify no horizontal scrolling on mobile

---

## Industry-Specific Considerations

### Charts & Graphs (All Industries)
- Provide text alternatives (data tables or descriptions)
- Use patterns in addition to colors
- Ensure keyboard navigable data points
- Announce trends via live regions

```tsx
<div role="figure" aria-labelledby="chart-title" aria-describedby="chart-desc">
  <h3 id="chart-title">Monthly Revenue</h3>
  <p id="chart-desc" className="sr-only">
    Line chart showing revenue growth from $10K in January to $25K in June, 
    a 150% increase over 6 months.
  </p>
  {/* Chart visualization */}
</div>
```

### Forms (Restaurant Reservations, Retail Checkout)
- Group related fields with fieldset/legend
- Provide inline validation with accessible error messages
- Auto-focus first error field on submit
- Associate all inputs with labels

```tsx
<fieldset className="border border-gray-200 rounded-md p-4">
  <legend className="text-sm font-semibold text-gray-700 px-2">
    Reservation Details
  </legend>
  {/* Form fields */}
</fieldset>
```

### Modal Dialogs (Confirmations, Alerts)
- Trap focus inside modal
- Return focus to trigger element on close
- Announce modal opening to screen readers
- Close on Escape key

```tsx
import { Modal, useFocusTrap, useEscapeKey } from '@/utils/accessibility';

<Modal isOpen={isOpen} onClose={close} title="Confirm Order">
  Are you sure you want to place this order?
</Modal>
```

### Data Tables (Inventory, Analytics)
- Use proper table markup with th, scope, caption
- Make sortable columns keyboard accessible
- Announce sort direction changes
- Provide alternative views for complex data

```tsx
<button
  onClick={() => handleSort(column)}
  aria-sort={sortColumn === column ? sortDirection : 'none'}
>
  {column}
  {sortColumn === column && (
    <span aria-hidden="true">{sortDirection === 'asc' ? '↑' : '↓'}</span>
  )}
</button>
```

---

## Compliance Verification Process

### Before Deployment

1. **Automated Scan**
   ```bash
   pnpm check:a11y
   ```

2. **Manual Keyboard Test**
   - Navigate entire page with Tab/Shift+Tab
   - Open/close all modals and dropdowns
   - Test all interactive elements

3. **Screen Reader Spot Check**
   - Test critical user flows
   - Verify dynamic announcements
   - Check heading structure

4. **Color Contrast Audit**
   - Run Lighthouse audit
   - Check all text/background combinations
   - Verify UI component contrast (3:1 minimum)

### Quarterly Audits

Every quarter, run comprehensive audits:
1. Full axe-core scan on all dashboards
2. Manual testing with NVDA/VoiceOver
3. User testing with disabled participants
4. Document and prioritize fixes

---

## Resources & Training

### Documentation
- [WCAG 2.1 Guidelines (Official)](https://www.w3.org/WAI/WCAG21/quickref/)
- [WAI-ARIA Authoring Practices](https://www.w3.org/WAI/ARIA/apg/)
- [WebAIM Accessibility Tutorials](https://webaim.org/intro/)
- [A11y Project Checklist](https://www.a11yproject.com/checklist/)

### Tools
- **axe DevTools** - Browser extension for automated testing
- **WAVE** - Visual accessibility feedback tool
- **Color Oracle** - Color blindness simulator
- **Stark** - Contrast checker plugin for Figma/Sketch

### Training Courses
- **LinkedIn Learning:** "Accessibility for Web Designers"
- **Udemy:** "Web Accessibility Fundamentals"
- **egghead.io:** "Accessible React Applications"
- **Deque University:** Comprehensive accessibility training

### Communities
- **#a11y Slack channel** (internal)
- **A11y Project** (community-driven resources)
- **WebAIM Community** (forum and mailing list)

---

## Enforcement & Accountability

### Definition of Done
A feature is NOT complete until it:
- ✅ Passes automated accessibility tests (axe-core)
- ✅ Is fully keyboard accessible
- ✅ Works with screen readers
- ✅ Meets WCAG 2.1 AA standards

### Pull Request Requirements
All PRs must:
- Include accessibility testing notes in description
- Pass CI accessibility checks
- Be reviewed for accessibility by at least one team member

### Escalation Path
1. Engineer identifies accessibility issue
2. Team lead prioritizes fix (same sprint for critical issues)
3. VP Engineering notified of any critical/serious violations
4. Legal/compliance informed of potential liability

---

## Success Metrics

| Metric | Target | Current Status |
|--------|--------|----------------|
| Critical Violations | 0 | ⏳ In Progress |
| Serious Violations | 0 | ⏳ In Progress |
| Moderate Violations | < 10 per dashboard | ⏳ In Progress |
| Keyboard Accessibility | 100% | ⏳ In Progress |
| Screen Reader Compatibility | 100% | ⏳ In Progress |
| Color Contrast Compliance | 100% | ⏳ In Progress |
| Lighthouse Accessibility Score | > 90 | ⏳ In Progress |

---

## Implementation Timeline

### Week 1 (March 24-28): Foundation
- ✅ Create accessibility utilities
- ✅ Set up automated audit script
- ✅ Train team on WCAG basics
- 🔲 Audit all 26 dashboards

### Week 2-3 (March 31-April 11): Remediation
- 🔲 Fix critical violations (Priority 1)
- 🔲 Fix serious violations (Priority 2)
- 🔲 Implement missing ARIA labels
- 🔲 Improve keyboard navigation

### Week 4 (April 14-18): Validation
- 🔲 Re-run automated audits
- 🔲 Manual screen reader testing
- 🔲 Document known issues
- 🔲 Achieve compliance certification

---

**Document Prepared By:** Vayva Engineering AI  
**Last Updated:** March 26, 2026  
**Review Cycle:** Quarterly or after major UI changes  
**Distribution:** All Engineering, Product, and Design Teams

---

🎯 **Goal:** Zero barriers to access. Every user, regardless of ability, deserves a world-class experience.
