# Phase 3 Quick Start Guide

## 🚀 Running Tests

### Prerequisites
```bash
# Install test dependencies
pnpm add -D @axe-core/playwright axe-core @lhci/cli
```

### Run All E2E Tests
```bash
# Run complete test suite
pnpm test:e2e

# Run specific industry tests
pnpm test:e2e tests/e2e/industries/healthcare-dashboard.spec.ts
pnpm test:e2e tests/e2e/industries/legal-dashboard.spec.ts
pnpm test:e2e tests/e2e/industries/restaurant-dashboard.spec.ts

# Run integration tests
pnpm test:e2e tests/e2e/integration/cross-industry-flows.spec.ts
pnpm test:e2e tests/e2e/integration/analytics-integration.spec.ts

# Run accessibility audits
pnpm test:e2e tests/e2e/accessibility/accessibility-audit.spec.ts
```

### Run Performance Audit
```bash
# Complete performance audit (build + bundle check + lighthouse)
pnpm check:performance

# Individual checks
node scripts/check-bundle-size.mjs
npx lhci autorun
```

---

## 📊 Test Coverage

### Industry Dashboard Tests (8 files, 65+ tests)

| Dashboard | Tests | Key Features Tested |
|-----------|-------|---------------------|
| Healthcare | 8 | Patient intake, HIPAA compliance, treatment planning, insurance verification |
| Legal | 8 | Matter management, client portal, time tracking, billing |
| Restaurant | 6 | Table management, reservations, POS, inventory |
| Retail | 7 | Inventory, POS transactions, CRM, sales reports |
| Creative | 9 | Portfolio, client proofing, annotations, workflow |
| Professional | 8 | Matter tracking, client updates, billing, utilization |
| Food | 9 | Recipe costing, menu engineering, kitchen ops, inventory |
| Analytics | 10 | Metrics, trends, cohorts, A/B testing, ROI |

### Integration Tests (2 files, 14 tests)

| Test Suite | Tests | Coverage |
|------------|-------|----------|
| Cross-Industry Flows | 8 | Multi-industry switching, data sharing, unified auth |
| Analytics Integration | 6 | Event collection, real-time updates, visualization |

### Accessibility Tests (1 file, 9 tests)

- WCAG 2.1 AA compliance for all 8 dashboards
- Keyboard navigation verification
- Screen reader compatibility
- Color contrast analysis
- Focus management validation

---

## ✅ Success Criteria

### Test Passing Requirements
- **All tests pass**: 0 failures in CI/CD
- **Accessibility**: No critical or serious WCAG violations
- **Performance**: Lighthouse score ≥ 90
- **Bundle Size**: Within defined budgets

### Performance Budgets
```
Merchant Admin Chunks: < 800KB
Storefront Chunks:     < 600KB
Industry Packages:     < 200KB each
```

### Lighthouse Thresholds
```
Performance:      ≥ 90
Accessibility:    ≥ 95
Best Practices:   ≥ 90
SEO:              ≥ 90

FCP:              < 1.5s
LCP:              < 2.5s
CLS:              < 0.1
TBT:              < 300ms
```

---

## 🔧 Troubleshooting

### Tests Failing Due to Selectors
If tests fail because selectors aren't found:
1. Ensure dashboard components have `data-testid` attributes
2. Check that test URLs are correct (`/dashboard/{industry}`)
3. Verify authentication state is properly mocked

### Accessibility Audit Failures
```typescript
// Common fix: Add missing aria-labels
<div aria-label="Dashboard widgets">
  {/* content */}
</div>

// Add role attributes
<button role="button" aria-label="Submit forms">
```

### Performance Issues
```bash
# Analyze bundle composition
pnpm --filter merchant-admin analyze

# Check individual package sizes
node scripts/check-bundle-size.mjs

# View detailed Lighthouse report
open .lighthouseci/reports/*.html
```

---

## 📈 Continuous Integration

### GitHub Actions Workflow
```yaml
name: Phase 3 Tests
on: [push, pull_request]

jobs:
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:e2e
      
  accessibility:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm test:e2e tests/e2e/accessibility/
      
  performance:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: pnpm/action-setup@v2
      - run: pnpm install
      - run: pnpm check:performance
```

---

## 🎯 Next Steps

### After Tests Pass
1. **Day 8-9**: Performance optimizations
   - Code splitting
   - Lazy loading
   - Memoization
   
2. **Day 10**: Documentation
   - API docs with TypeDoc
   - Component Storybook
   - Best practices guides

### Monitoring
- Add Lighthouse CI to CI/CD pipeline
- Set up performance regression alerts
- Schedule weekly accessibility audits

---

## 📞 Support

**Documentation:**
- [Phase 3 Implementation Summary](./PHASE_3_IMPLEMENTATION_SUMMARY.md)
- [GAP_CLOSURE_IMPLEMENTATION_PLAN.md](./GAP_CLOSURE_IMPLEMENTATION_PLAN.md)

**Team Contacts:**
- Testing Lead: Team A
- Performance Lead: Team B
- Accessibility Lead: Team C

---

*Last Updated: End of Day 7*  
*Status: 60% Complete - On Track*
