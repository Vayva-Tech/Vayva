# Accessibility Violations Fix Plan

**Date:** March 26, 2026  
**Status:** In Progress  
**Target:** WCAG 2.1 AA Compliance

---

## Completed Fixes

### ✅ 1. Skip Link Added to Dashboard Layout
**File:** `/Frontend/merchant/src/app/(dashboard)/layout.tsx`  
**Change:** Added `<SkipLink />` component to main dashboard layout

**Impact:**
- Keyboard users can now skip to main content
- Screen reader users get immediate navigation option
- Meets WCAG 2.4.1 (Skip Link) requirement

**Implementation:**
```tsx
import { SkipLink } from "@/lib/accessibility";

return (
  <>
    <SkipLink />
    <AdminShell>
      <OnboardingWrapper>{children}</OnboardingWrapper>
    </AdminShell>
  </>
);
```

---

## Remaining Fixes by Priority

### P0 - Critical Violations (Fix Immediately)

#### 1. Color Contrast Issues
**Expected Locations:**
- Stat cards with light text on white backgrounds
- Muted text in secondary information
- Badge components with low contrast colors

**Fix Pattern:**
```tsx
// Before
<p className="text-gray-400">Secondary text</p>

// After (WCAG AA requires 4.5:1 for normal text)
<p className="text-gray-600">Secondary text</p>
```

**Files to Check:**
- All industry dashboard main pages
- Stat card components
- Badge components

---

#### 2. Missing Alt Text on Icons
**Expected Locations:**
- Icon-only buttons (edit, delete, view actions)
- Decorative icons that should be hidden from screen readers

**Fix Pattern:**
```tsx
// For functional icons
<Button aria-label={`Edit ${item.name}`}>
  <PencilIcon />
</Button>

// For decorative icons
<div role="presentation">
  <DecorationIcon />
</div>
```

---

#### 3. Form Input Labels
**Expected Locations:**
- Search inputs
- Filter dropdowns
- Quick action forms

**Fix Pattern:**
```tsx
// Always associate labels with inputs
<label htmlFor="search-products" className="sr-only">
  Search products
</label>
<input 
  id="search-products"
  type="search"
  placeholder="Search products..."
/>

// Or use aria-label if visual label not needed
<input 
  type="search"
  aria-label="Search products"
  placeholder="Search..."
/>
```

---

### P1 - Serious Violations (Fix Within 48 Hours)

#### 4. Heading Hierarchy
**Issue:** Skipped heading levels (h1 → h3 without h2)

**Fix:**
```tsx
// Ensure logical heading structure
<h1>Dashboard</h1>        // Level 1
<h2>Analytics</h2>        // Level 2
<h3>Today's Stats</h3>    // Level 3
<h3>This Week</h3>        // Level 3
<h2>Recent Activity</h2>  // Level 2
```

---

#### 5. Focus Management
**Issue:** Focus not visible or trapped in modals

**Fix:**
```tsx
// Ensure focus rings are visible
<button className="focus:ring-2 focus:ring-blue-500 focus:outline-none">
  Click me
</button>

// Modal focus trap
<Modal>
  <FocusTrap>
    {/* Focusable elements only */}
  </FocusTrap>
</Modal>
```

---

#### 6. Button Names
**Issue:** Buttons with only icons lack accessible names

**Fix:**
```tsx
// Already implemented in many places per grep results
<Button aria-label={`Edit ${product.name}`}>
  <PencilIcon />
</Button>

<Button aria-label={`Delete ${product.name}`}>
  <TrashIcon />
</Button>
```

---

### P2 - Moderate Violations (Fix Within 1 Week)

#### 7. Table Headers
**Issue:** Complex tables without proper header associations

**Fix:**
```tsx
<table>
  <thead>
    <tr>
      <th scope="col">Product Name</th>
      <th scope="col">Price</th>
      <th scope="col">Actions</th>
    </tr>
  </thead>
  <tbody>
    {/* Data rows */}
  </tbody>
</table>
```

---

#### 8. Landmark Regions
**Issue:** Missing ARIA landmarks for main regions

**Fix:**
```tsx
<main role="main" id="main-content">
  {/* Main content */}
</main>

<nav role="navigation" aria-label="Main navigation">
  {/* Navigation */}
</nav>

<aside role="complementary">
  {/* Sidebar */}
</aside>
```

---

## Automated Testing Setup

### Run Accessibility Tests
```bash
# Full accessibility audit
pnpm test:e2e accessibility-audit.spec.ts

# Generate HTML report
pnpm test:e2e accessibility-audit.spec.ts --reporter=html

# View report
open playwright-report/index.html
```

### Manual Testing Checklist

#### Keyboard Navigation
- [ ] Tab through all interactive elements
- [ ] Verify focus is visible and logical
- [ ] Test Escape key closes modals/dropdowns
- [ ] Test arrow keys in menus
- [ ] Verify skip link works (Tab on page load)

#### Screen Reader Testing
- [ ] Test with VoiceOver (Mac) or NVDA (Windows)
- [ ] Verify all images have alt text
- [ ] Check form inputs are announced
- [ ] Confirm button actions are clear
- [ ] Test heading navigation

#### Visual Inspection
- [ ] Check color contrast with WebAIM tool
- [ ] Verify text is readable at 200% zoom
- [ ] Test responsive layouts maintain accessibility
- [ ] Check focus indicators are visible

---

## Tools for Verification

### Automated Tools
1. **axe DevTools** - Browser extension for instant feedback
2. **Lighthouse** - Built into Chrome DevTools
3. **WAVE** - Web accessibility evaluation tool
4. **Playwright + axe-core** - Automated testing (already set up)

### Manual Tools
1. **WebAIM Contrast Checker** - https://webaim.org/resources/contrastchecker/
2. **Color Oracle** - Color blindness simulator
3. **NoCoffee Vision Simulator** - Chrome extension
4. **Accessibility Insights** - Microsoft's testing tool

---

## Progress Tracking

### Industries to Audit

| Industry | Skip Link | Color Contrast | Alt Text | Form Labels | Headings | Status |
|----------|-----------|----------------|----------|-------------|----------|--------|
| Retail | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Fashion | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Grocery | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Healthcare | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Legal | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Nonprofit | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Nightlife | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Restaurant | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Beauty | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Pet Care | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Blog-Media | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Wholesale | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Travel | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Education | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Wellness | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Professional | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Creative | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Automotive | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Meal Kit | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| SaaS | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Events | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Real Estate | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Food | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Services | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Specialized | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |
| Industry Analytics | ✅ | ⏳ | ⏳ | ⏳ | ⏳ | In Progress |

**Legend:**
- ✅ Complete
- ⏳ Pending
- ❌ Issues Found (being fixed)

---

## Next Steps

1. **Run Automated Tests** (Complete today)
   ```bash
   pnpm test:e2e accessibility-audit.spec.ts
   ```

2. **Review Test Results** (1-2 hours)
   - Open HTML report
   - List all Critical and Serious violations
   - Prioritize by impact and effort

3. **Fix Critical Violations** (1-2 days)
   - Color contrast issues
   - Missing alt text
   - Form label associations

4. **Fix Serious Violations** (2-3 days)
   - Heading hierarchy
   - Focus management
   - Button names

5. **Manual Testing** (1 day)
   - Keyboard navigation through all industries
   - Screen reader testing with NVDA/JAWS
   - Color contrast spot checks

6. **Re-run Tests** (Verify fixes)
   ```bash
   pnpm test:e2e accessibility-audit.spec.ts
   ```

7. **Document Compliance** (Ongoing)
   - Update this document with fixes
   - Create accessibility statement
   - Add to employee training

---

## Success Criteria

✅ **Zero Critical violations** (color contrast, missing labels, etc.)  
✅ **Zero Serious violations** (heading structure, focus management, etc.)  
✅ **< 10 Moderate violations** (minor enhancements)  
✅ **Keyboard navigable** (all functions accessible via keyboard)  
✅ **Screen reader compatible** (tested with NVDA/JAWS)  
✅ **WCAG 2.1 AA certified** (third-party audit passed)  

---

**Estimated Time to Full Compliance:** 5-7 business days  
**Resources Required:** 1-2 engineers full-time  
**Business Impact:** Enables disabled users, reduces legal risk, improves UX for all

---

*Last Updated: March 26, 2026*  
*Next Review: After automated test results are analyzed*
