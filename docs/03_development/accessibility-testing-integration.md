# Accessibility Testing Integration Guide

**For:** Engineering Team, QA Team, DevOps  
**Version:** 1.0 (March 2026)  
**Purpose:** Integrate accessibility testing into CI/CD and development workflow

---

## Quick Start

### Run Accessibility Checks

```bash
# Run automated accessibility verification
pnpm check:a11y

# Or use the full command
pnpm validate:accessibility
```

---

## CI/CD Integration

### GitHub Actions Workflow

Add to `.github/workflows/accessibility.yml`:

```yaml
name: Accessibility Check

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  accessibility:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup pnpm
        uses: pnpm/action-setup@v2
        with:
          version: 10.2.0
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'pnpm'
      
      - name: Install dependencies
        run: pnpm install
      
      - name: Run accessibility check
        run: pnpm check:a11y
      
      - name: Upload accessibility report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: accessibility-report
          path: .tmp/accessibility-report.json
```

### GitLab CI

Add to `.gitlab-ci.yml`:

```yaml
accessibility:
  stage: test
  image: node:20-alpine
  script:
    - npm install -g pnpm
    - pnpm install
    - pnpm check:a11y
  artifacts:
    when: always
    paths:
      - .tmp/accessibility-report.json
    reports:
      accessibility: .tmp/accessibility-report.json
```

### Jenkins Pipeline

```groovy
pipeline {
    agent any
    
    stages {
        stage('Accessibility Check') {
            steps {
                sh 'pnpm install'
                sh 'pnpm check:a11y'
            }
            post {
                always {
                    junit '.tmp/accessibility-report.xml'
                }
            }
        }
    }
}
```

---

## Pre-commit Hook

Add to `.husky/pre-commit`:

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

# Run accessibility checks before commit
pnpm check:a11y || exit 1
```

Or add to `package.json` husky configuration:

```json
{
  "husky": {
    "hooks": {
      "pre-commit": "pnpm check:a11y"
    }
  }
}
```

---

## Development Workflow

### Before Every PR

Developers should run:

```bash
# Full validation including accessibility
pnpm validate:ship

# Or just accessibility
pnpm check:a11y
```

### During Development

Watch mode for accessibility issues (future enhancement):

```bash
# Run accessibility check in watch mode
pnpm check:a11y --watch
```

---

## Test Coverage

### What's Checked

The automated verification script checks:

1. **Icon Component Accessibility**
   - Role prop defined
   - Decorative icons hidden from screen readers
   - Focus prevention on decorative icons

2. **Button Component Accessibility**
   - Minimum 44px height touch targets
   - Minimum 44px width touch targets
   - Aria-label support for icon buttons
   - Special handling for icon buttons

3. **Theme Color Contrast**
   - Secondary text passes 4.5:1 contrast
   - Tertiary text passes 4.5:1 contrast

4. **Chart Styles Accessibility**
   - Accessible chart color palette defined
   - Blue-600 primary color (passes contrast)
   - Red-600 secondary color (passes contrast)

5. **Form Autocomplete Support**
   - Autocomplete constants defined
   - Shipping address autocomplete
   - Billing address autocomplete
   - Payment form autocomplete

6. **Dynamic Content Announcements**
   - Loading announcement component exists
   - Status announcement component exists
   - Progress announcement component exists
   - ARIA live regions implemented

7. **High Contrast Mode Support**
   - High contrast media query
   - Focus visible styles
   - Strong outline for high contrast

8. **Gesture Alternatives**
   - Carousel with button alternatives
   - Zoomable image with controls
   - Product card with info button

9. **Logo Alt Text Implementation**
   - Descriptive logo alt text

### What Requires Manual Testing

The following require manual testing and are NOT covered by automated checks:

- Screen reader compatibility (NVDA, JAWS, VoiceOver)
- Keyboard navigation flow through complete user journeys
- Visual appearance in high contrast mode
- Touch target size measurement on physical devices
- Browser zoom behavior at 200%
- Cognitive load and readability
- Video captions and audio descriptions
- Complex widget interactions

---

## Manual Testing Checklist

### Keyboard Navigation

```markdown
## Keyboard Testing Checklist

### Global Navigation
- [ ] Tab through header navigation
- [ ] Skip link works and focuses main content
- [ ] All menu items accessible via keyboard
- [ ] Dropdown menus open/close with Enter/Space
- [ ] Arrow keys navigate dropdown items
- [ ] Escape closes dropdowns
- [ ] Focus returns to trigger on close

### Forms
- [ ] All form fields focusable
- [ ] Form validation errors announced to screen readers
- [ ] Error messages associated with inputs via aria-describedby
- [ ] Autocomplete attributes working
- [ ] Form submission possible with Enter key

### Interactive Components
- [ ] Modal dialogs trap focus correctly
- [ ] Tab panels navigable with arrow keys
- [ ] Accordion expandable with Enter/Space
- [ ] Custom select/options navigable
- [ ] Date pickers accessible

### Content
- [ ] All links have descriptive text
- [ ] Images have meaningful alt text
- [ ] Tables have proper headers
- [ ] Lists are semantic HTML
```

### Screen Reader Testing

```markdown
## Screen Reader Testing Guide

### NVDA (Windows)
1. Install NVDA from https://www.nvaccess.org/
2. Navigate to page/component
3. Use these commands:
   - Tab/Shift+Tab: Navigate forward/backward
   - Arrow Up/Down: Read previous/next line
   - Arrow Left/Right: Read previous/next character
   - Insert+Tab: Read current element
   - Insert+B: Read current browser window
4. Verify:
   - All interactive elements announced correctly
   - Images described with alt text
   - Form errors announced
   - Dynamic updates announced

### JAWS (Windows)
1. Install JAWS from Freedom Scientific
2. Use similar navigation as NVDA
3. Check Virtual Cursor mode vs Forms mode

### VoiceOver (macOS/iOS)
1. Enable in System Preferences > Accessibility
2. Commands:
   - Cmd+Opt+Arrow: Navigate
   - Ctrl+Opt+Space: Activate
   - Ctrl+Opt+Shift+M: Open rotor
3. Verify all features accessible
```

### High Contrast Mode

```markdown
## High Contrast Mode Testing

### Windows High Contrast
1. Settings > Ease of Access > High Contrast
2. Turn on High Contrast
3. Verify:
   - All focus indicators visible
   - Text readable on backgrounds
   - Images still understandable
   - No information lost

### macOS Increase Contrast
1. System Preferences > Accessibility > Display
2. Check "Increase contrast"
3. Verify similar points as Windows
```

---

## Accessibility Acceptance Criteria

Add to Definition of Done:

### For New Features

```markdown
## Accessibility Acceptance Criteria

- [ ] All images have descriptive alt text
- [ ] All interactive elements keyboard accessible
- [ ] Focus indicators visible in normal and high contrast modes
- [ ] Color contrast meets 4.5:1 ratio
- [ ] Form fields have associated labels
- [ ] Error messages programmatically associated with inputs
- [ ] Loading states announced to screen readers
- [ ] Touch targets minimum 44x44px (mobile)
- [ ] Gesture alternatives provided for complex gestures
- [ ] Semantic HTML used appropriately
- [ ] ARIA attributes correct where needed
- [ ] Tested with at least one screen reader
```

### For Bug Fixes

```markdown
## Accessibility Regression Prevention

When fixing bugs:
- [ ] Verify fix doesn't break keyboard navigation
- [ ] Verify fix doesn't remove alt text or labels
- [ ] Verify fix maintains color contrast
- [ ] Run automated accessibility check
- [ ] Document any accessibility trade-offs
```

---

## Reporting Accessibility Issues

### Issue Template

```markdown
## Accessibility Issue Report

### Description
Brief description of the accessibility barrier

### WCAG Criterion
Which WCAG success criterion is affected (e.g., 1.1.1 Non-text Content)

### Severity
- Critical: Prevents task completion
- Major: Significant barrier
- Minor: Inconvenience

### Steps to Reproduce
1. 
2. 
3. 

### Assistive Technology Used
- Screen reader: [NVDA/JAWS/VoiceOver/TalkBack]
- Browser: [Chrome/Firefox/Safari/Edge]
- OS: [Windows/macOS/iOS/Android]

### Expected Behavior
What should happen

### Actual Behavior
What actually happens

### Suggested Fix
How to resolve the issue

### Screenshots/Recordings
If applicable
```

---

## Tools & Resources

### Automated Testing Tools

```bash
# axe-core - Browser extension and CLI
npm install -g @axe-core/cli
axe http://localhost:3000

# Lighthouse
lighthouse http://localhost:3000 --only-categories=accessibility

# WAVE - Web Accessibility Evaluation Tool
# Browser extension available
```

### Color Contrast Checkers

- [WebAIM Contrast Checker](https://webaim.org/resources/contrastchecker/)
- [Accessible Colors](https://accessible-colors.com/)
- [WhoCanUse](https://whocanuse.com/)

### Screen Readers

- **NVDA** (Free, Windows) - https://www.nvaccess.org/
- **JAWS** (Paid, Windows) - https://www.freedomscientific.com/
- **VoiceOver** (Free, macOS/iOS) - Built-in
- **TalkBack** (Free, Android) - Built-in

### Browser Extensions

- **axe DevTools** - Chrome, Firefox
- **WAVE** - Chrome, Firefox
- **Accessibility Insights** - Chrome, Edge
- **Lighthouse** - Chrome DevTools

---

## Training Resources

### Required Training

All developers must complete:
- [WebAIM Accessibility Fundamentals](https://webaim.org/intro/)
- [WCAG 2.1 Quick Reference](https://www.w3.org/WAI/WCAG21/quickref/)
- [Inclusive Components](https://inclusive-components.design/)

### Recommended Reading

- [A11Y Project](https://www.a11yproject.com/)
- [MDN Accessibility Guide](https://developer.mozilla.org/en-US/docs/Web/Accessibility)
- [Smashing Magazine Accessibility](https://www.smashingmagazine.com/category/accessibility/)

### Internal Resources

- Accessibility Quick Reference: `/docs/03_development/accessibility-quick-reference.md`
- Implementation Summary: `/ACCESSIBILITY_IMPLEMENTATION_SUMMARY.md`
- Status Report: `/ACCESSIBILITY_STATUS_REPORT.md`

---

## Enforcement

### Accessibility Gate

Starting Q2 2026, the following gates will be enforced:

1. **Pre-merge:** Accessibility check must pass
2. **Pre-deployment:** Zero critical accessibility issues
3. **Production monitoring:** Monthly axe-core scans

### Exceptions Process

If accessibility must be delayed:

1. Document the issue in accessibility statement
2. Provide workaround for users
3. Set remediation deadline (max 30 days)
4. Get VP Engineering approval

---

## Contact & Support

**Accessibility Team:**
- Email: accessibility@vayva.ng
- Slack: #accessibility
- Office Hours: Tuesdays 2-4pm WAT

**Escalation:**
- Critical issues: Tag @accessibility-team in PR
- Blocking issues: Contact VP Engineering
- User complaints: Forward to Customer Support

---

## Metrics & Reporting

### Monthly Accessibility Report

Generated automatically:
- axe-core score trends
- Lighthouse accessibility scores
- Number of accessibility issues opened/closed
- Time to resolution for accessibility bugs

### Quarterly Review

Review with leadership:
- Progress toward WCAG 2.1 AA conformance
- User feedback analysis
- Third-party audit results
- Training completion rates

---

**Last Updated:** March 20, 2026  
**Next Review:** June 2026  
**Owner:** Accessibility Task Force
