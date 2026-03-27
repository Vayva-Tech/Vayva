# Lighthouse CI Configuration

## Overview
Lighthouse CI is configured to enforce performance, accessibility, and quality standards across all industry dashboards.

## Performance Targets

### Required Scores (CI will FAIL if not met)
- **Performance**: ≥ 90/100
- **Accessibility**: 100/100 (zero violations)
- **Best Practices**: 100/100
- **SEO**: 100/100

### Core Web Vitals Thresholds
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Total Blocking Time (TBT)**: < 300ms
- **Time to Interactive (TTI)**: < 3.5s

## Monitored Dashboards

The following industry dashboards are audited on every PR:

1. `/dashboard/nonprofit` - Grant Pipeline Dashboard
2. `/dashboard/nightlife` - Nightlife Dashboard
3. `/dashboard/fashion` - Fashion Dashboard
4. `/dashboard/courses` - Education Dashboard
5. `/dashboard/bookings` - Travel Booking Dashboard
6. `/dashboard/restaurant` - Restaurant Dashboard (reference implementation)
7. `/dashboard/travel` - Travel Dashboard
8. `/dashboard/saas` - SaaS Subscription Dashboard

## Running Locally

```bash
# Run full audit suite
pnpm lighthouse

# Run single URL audit
pnpm lighthouse:ci

# Run assertions only (no collection)
pnpm lighthouse:assert
```

## CI Integration

Lighthouse CI runs automatically in GitHub Actions on:
- Every pull request
- Every merge to main branch
- Before deployment to staging/production

### Guardrails
- PRs failing performance thresholds cannot be merged
- Accessibility violations block deployment
- Results are uploaded to temporary public storage for review

## Optimization Strategies Implemented

### 1. Error Boundaries
- Prevents cascading failures
- Graceful degradation with retry logic
- Improves TTI and reduces TBT

### 2. Memoization
- `useMemo` for expensive calculations
- `useCallback` for stable event handlers
- Reduces unnecessary re-renders

### 3. Virtual Scrolling
- `VirtualList` component for large datasets
- Only renders visible items + buffer
- Dramatically reduces DOM nodes and memory usage

### 4. Loading Skeletons
- Custom skeleton screens for each dashboard
- Prevents layout shift (CLS = 0.0)
- Improves perceived performance

### 5. Code Splitting
- Dynamic imports for heavy components
- Route-based code splitting via Next.js App Router
- Reduces initial bundle size

## Troubleshooting

### Performance Score Below 90
1. Check bundle size: `pnpm check:bundle`
2. Analyze dependencies with `webpack-bundle-analyzer`
3. Look for unnecessary re-renders in React DevTools
4. Verify virtual scrolling is enabled for long lists

### Accessibility Violations
1. Run local audit: `pnpm check:a11y`
2. Use axe DevTools browser extension
3. Check color contrast with WebAIM Contrast Checker
4. Verify ARIA labels and roles

### CLS Issues
1. Ensure all images have explicit width/height
2. Use skeleton loaders instead of blank spaces
3. Avoid injecting content above existing content
4. Reserve space for dynamic content

## Configuration Files
- `lighthouserc.js` - Lighthouse CI configuration
- `.github/workflows/lighthouse.yml` - GitHub Actions workflow
- `platform/testing/playwright.config.ts` - Playwright config for a11y tests
