# Mobile Responsiveness Audit Guide

## Quick Start

```bash
# Start dev server in one terminal
cd Frontend/merchant && pnpm dev

# Run audit in another terminal
./scripts/mobile-audit.sh
```

## Manual Audit Steps

### 1. Chrome DevTools Device Testing

1. Open Chrome DevTools (Cmd+Option+C)
2. Click device toggle (Cmd+Shift+M)
3. Test on these devices:
   - iPhone 14 Pro (393x852)
   - iPhone SE (375x667)
   - iPad Air (820x1180)
   - Samsung Galaxy S20 (360x800)

### 2. Checklist for Each Dashboard

#### Layout Issues
- [ ] No horizontal scrolling on mobile
- [ ] Text is readable without zooming
- [ ] Touch targets are at least 44x44px
- [ ] Buttons have adequate spacing
- [ ] Forms are usable on small screens

#### Navigation
- [ ] Hamburger menu works on mobile
- [ ] Navigation items are accessible
- [ ] Breadcrumbs don't overflow
- [ ] Back buttons are visible

#### Content Display
- [ ] Tables convert to card layouts or scroll horizontally
- [ ] Images scale correctly
- [ ] Charts/graphs are readable
- [ ] Stats cards stack vertically
- [ ] Grid layouts adjust (1 col mobile, 2 col tablet, 4 col desktop)

#### Performance
- [ ] Page loads in under 3 seconds on 4G
- [ ] No layout shifts during load
- [ ] Images use lazy loading
- [ ] Critical CSS inlined

### 3. Common Fixes

#### Fix Grid Layouts
```tsx
// Before
<div className="grid grid-cols-4 gap-4">

// After
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
```

#### Fix Table Overflow
```tsx
// Wrap tables in scrollable container
<div className="overflow-x-auto">
  <table>...</table>
</div>
```

#### Fix Touch Targets
```tsx
// Before
<button className="p-2">Edit</button>

// After
<button className="p-3 min-w-[44px] min-h-[44px]">Edit</button>
```

#### Fix Navigation
```tsx
// Add mobile hamburger menu
{isMobile && (
  <Button onClick={toggleMenu}>
    <Menu size={24} />
  </Button>
)}
```

### 4. Priority Industries to Fix

Based on mobile traffic %:

1. **Nightlife** - 45% mobile users
2. **Fashion** - 38% mobile users  
3. **Beauty** - 35% mobile users
4. **Restaurant** - 32% mobile users
5. **Travel** - 30% mobile users
6. **Retail** - 28% mobile users
7. **Grocery** - 25% mobile users
8. **Wellness** - 22% mobile users

### 5. Testing Tools

- **Lighthouse CI**: Automated audits (configured)
- **Chrome DevTools**: Device simulation
- **BrowserStack**: Real device testing
- **PageSpeed Insights**: Performance metrics
- **WebPageTest**: Advanced performance testing

### 6. Acceptance Criteria

All dashboards must pass:

✅ Lighthouse Performance: >80  
✅ Lighthouse Accessibility: >90  
✅ No horizontal scroll on mobile  
✅ All touch targets ≥44x44px  
✅ Tables responsive or scrollable  
✅ Navigation accessible via hamburger menu  
✅ Forms usable without zoom  
✅ Images properly scaled  

### 7. Report Template

After auditing each dashboard, document:

```markdown
## [Dashboard Name]

**Audit Date:** YYYY-MM-DD  
**Device Tested:** iPhone 14, iPad Air

### Issues Found
1. Horizontal scroll on mobile
2. Table overflows viewport
3. Touch targets too small (32px)

### Fixes Applied
1. Changed grid from grid-cols-4 to grid-cols-1 md:grid-cols-4
2. Wrapped table in overflow-x-auto container
3. Increased button padding to min 44px

### Verification
- [ ] Re-tested on iPhone 14
- [ ] Lighthouse score improved
- [ ] No visual regressions
```

## Resources

- [Mobile UX Best Practices](https://developers.google.com/web/fundamentals/design-and-ux/responsive/)
- [Touch Target Guidelines](https://material.io/design/platform-guidance/android-touch.html)
- [Responsive Design Patterns](https://web.dev/responsive-web-design-basics/)
