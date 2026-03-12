# Dashboard V2 Implementation Guide

**Status:** ✅ Complete and Production-Ready  
**Date:** January 31, 2026

---

## Overview

Dashboard V2 enhances the merchant experience with modern KPI blocks, smart todos/alerts, and quick action shortcuts. The implementation is feature-flagged for controlled rollout and A/B testing.

---

## Feature Flag

### Configuration

```typescript
// lib/env-validation.ts
DASHBOARD_V2_ENABLED: true  // Enabled by default
```

### Runtime Check

```typescript
// Available in /api/auth/merchant/me response
features: {
  dashboard: {
    v2Enabled: true
  }
}
```

### Toggle Control

Dashboard V2 can be toggled via:
1. **Environment variable** (not implemented, uses hardcoded `true`)
2. **Feature flag service** — `FlagService.isEnabled("dashboard.v2.enabled", { merchantId })`
3. **Per-merchant override** in database (via feature flags table)

---

## Components

### 1. KPIBlocks

**Location:** `src/components/dashboard-v2/KPIBlocks.tsx`

**Features:**
- Revenue (with % change)
- Total Orders (with % change)
- Customers (with % change)
- Conversion Rate (with % change)

**Data Source:** `/api/dashboard/kpis`

**Metrics Calculation:**
- Current period: Last 30 days
- Previous period: 30-60 days ago
- Percentage change: `((current - previous) / previous) * 100`

**Visual Design:**
- Color-coded icons (green for revenue, blue for orders, purple for customers, orange for conversion)
- Trend indicators (up/down arrows)
- Loading skeletons
- Hover animations

---

### 2. TodosAlerts

**Location:** `src/components/dashboard-v2/TodosAlerts.tsx`

**Features:**
- **Pending Actions** (left panel)
  - Complete onboarding
  - Publish store
  - Add first product
  - Review pending orders

- **Important Alerts** (right panel)
  - Plan upgrade suggestions
  - System notifications

**Data Source:** `/api/dashboard/todos-alerts`

**Smart Logic:**
- Todos generated based on store state
- Priority levels: high, medium, low
- Contextual actions with deep links
- Empty states when all caught up

**Visual Design:**
- Priority-coded badges
- Icon-based visual hierarchy
- Actionable buttons
- Alert type colors (error, warning, info, success)

---

### 3. QuickActions

**Location:** `src/components/dashboard-v2/QuickActions.tsx`

**Features:**
- Add Product
- New Order
- Analytics
- Customers
- Marketing
- Settings

**Visual Design:**
- 6-column responsive grid
- Icon-based cards
- Hover scale animations
- Color-coded backgrounds

---

## API Endpoints

### GET /api/dashboard/kpis

**Permission:** `DASHBOARD_VIEW`

**Response:**
```json
{
  "success": true,
  "data": {
    "revenue": 150000,
    "orders": 45,
    "customers": 32,
    "conversionRate": 3.5,
    "revenueChange": 12.5,
    "ordersChange": -5.2,
    "customersChange": 8.0,
    "conversionChange": 0
  }
}
```

**Performance:**
- Uses parallel Prisma queries
- Optimized with select clauses
- Caches via SWR on frontend

---

### GET /api/dashboard/todos-alerts

**Permission:** `DASHBOARD_VIEW`

**Response:**
```json
{
  "success": true,
  "data": {
    "todos": [
      {
        "id": "complete-onboarding",
        "title": "Complete Onboarding",
        "description": "Finish setting up your store",
        "priority": "high",
        "icon": "CheckCircle",
        "action": {
          "label": "Continue Setup",
          "href": "/onboarding"
        }
      }
    ],
    "alerts": [
      {
        "id": "upgrade-plan",
        "type": "info",
        "title": "Upgrade Your Plan",
        "message": "Unlock advanced features",
        "action": {
          "label": "View Plans",
          "href": "/dashboard/billing"
        }
      }
    ]
  }
}
```

**Logic:**
- Checks onboarding completion
- Checks store live status
- Counts pending orders
- Counts total products
- Evaluates plan tier

---

## RBAC Permissions

### New Permission

```typescript
DASHBOARD_VIEW: "dashboard:view"
```

### Role Assignments

- ✅ **OWNER** — Full access (wildcard)
- ✅ **ADMIN** — Has DASHBOARD_VIEW
- ✅ **STAFF** — No dashboard access
- ✅ **FINANCE** — No dashboard access
- ✅ **SUPPORT** — No dashboard access
- ✅ **VIEWER** — Has DASHBOARD_VIEW

---

## Integration Guide

### Step 1: Import Components

```typescript
import { KPIBlocks } from "@/components/dashboard-v2/KPIBlocks";
import { TodosAlerts } from "@/components/dashboard-v2/TodosAlerts";
import { QuickActions } from "@/components/dashboard-v2/QuickActions";
```

### Step 2: Check Feature Flag

```typescript
const { merchant } = useAuth();
const isDashboardV2Enabled = merchant?.features?.dashboard?.v2Enabled;
```

### Step 3: Conditional Rendering

```typescript
{isDashboardV2Enabled ? (
  <div className="space-y-6">
    <KPIBlocks />
    <TodosAlerts />
    <QuickActions />
  </div>
) : (
  <LegacyDashboard />
)}
```

---

## Testing

### Manual Testing

1. **Enable feature flag** (already enabled by default)
2. **Navigate to** `/dashboard`
3. **Verify KPI blocks** display with real data
4. **Check todos/alerts** show contextual actions
5. **Test quick actions** navigation works
6. **Toggle feature flag** and verify fallback

### Automated Testing

```bash
# Unit tests (all passing)
pnpm --filter merchant-admin test

# E2E tests (to be added)
pnpm --filter merchant-admin playwright test e2e/dashboard-v2.spec.ts
```

---

## Performance Considerations

### Frontend
- Components use SWR for caching
- Loading states prevent layout shift
- Optimistic UI updates
- Lazy loading for heavy components

### Backend
- Parallel Prisma queries
- Minimal data selection
- No N+1 queries
- Proper indexing on frequently queried fields

### Recommendations
- Add Redis caching for KPI data (5-minute TTL)
- Implement real-time updates via WebSockets
- Add pagination for large datasets

---

## Rollout Strategy

### Phase 1: Internal Testing
- Enable for internal stores only
- Gather feedback from team
- Monitor performance metrics

### Phase 2: Beta Release
- Enable for 10% of merchants
- A/B test against legacy dashboard
- Track engagement metrics

### Phase 3: General Availability
- Gradual rollout to 100%
- Monitor error rates
- Prepare rollback plan

### Rollback Plan
If issues arise:
1. Set `DASHBOARD_V2_ENABLED: false`
2. Deploy configuration change
3. Verify legacy dashboard works
4. Investigate and fix issues
5. Re-enable after validation

---

## Monitoring

### Key Metrics
- Dashboard load time
- API response times (`/api/dashboard/kpis`, `/api/dashboard/todos-alerts`)
- Error rates
- User engagement (clicks on todos, quick actions)

### Alerts
- API response time > 1s
- Error rate > 1%
- KPI calculation failures

### Dashboards
- Grafana: Dashboard V2 Performance
- Sentry: Error tracking
- Analytics: User engagement

---

## Known Limitations

1. **No real-time updates** — Data refreshes on page load or manual refresh
2. **Limited customization** — Merchants cannot rearrange blocks
3. **Fixed time periods** — KPIs always show 30-day comparison
4. **No export** — Cannot export KPI data to CSV/PDF

---

## Future Enhancements

### Short Term
- [ ] Add date range selector for KPIs
- [ ] Real-time updates via WebSockets
- [ ] Customizable dashboard layout
- [ ] More KPI metrics (AOV, LTV, churn rate)

### Medium Term
- [ ] Dashboard templates by industry
- [ ] Widget marketplace
- [ ] Advanced filtering and segmentation
- [ ] Export to PDF/CSV

### Long Term
- [ ] AI-powered insights and recommendations
- [ ] Predictive analytics
- [ ] Custom dashboards per user role
- [ ] Mobile-optimized dashboard

---

## Troubleshooting

### Issue: KPIs show zero values
**Cause:** No orders in last 30 days  
**Solution:** Normal behavior for new stores

### Issue: Todos not appearing
**Cause:** Store already completed all actions  
**Solution:** Normal behavior, shows "All caught up" state

### Issue: API returns 403 Forbidden
**Cause:** User lacks DASHBOARD_VIEW permission  
**Solution:** Check user role and permissions

### Issue: Components not rendering
**Cause:** Feature flag disabled  
**Solution:** Check `features.dashboard.v2Enabled` in auth response

---

## Files Modified/Created

### Components
- ✅ `src/components/dashboard-v2/KPIBlocks.tsx`
- ✅ `src/components/dashboard-v2/TodosAlerts.tsx`
- ✅ `src/components/dashboard-v2/QuickActions.tsx`

### API Routes
- ✅ `src/app/api/dashboard/kpis/route.ts`
- ✅ `src/app/api/dashboard/todos-alerts/route.ts`

### Configuration
- ✅ `src/lib/env-validation.ts`
- ✅ `src/app/api/auth/merchant/me/route.ts`
- ✅ `src/lib/team/permissions.ts`

### Documentation
- ✅ `docs/DASHBOARD_V2_IMPLEMENTATION.md` (this file)

---

## Support

For questions or issues:
1. Check this documentation
2. Review component source code
3. Check API endpoint implementation
4. Consult V2 architecture docs

---

**Last Updated:** January 31, 2026  
**Status:** ✅ Production Ready
