# Phase 3 Dashboard Integration Guide

## 🎯 Overview

This guide shows you how to integrate the new Phase 3 dashboard components into your merchant application.

---

## 📁 File Locations

### **Backend Endpoints**
All endpoints are available at `/api/v1/dashboard/*`:
- `GET /aggregate` - All-in-one dashboard data
- `GET /kpis` - KPI metrics only
- `GET /alerts` - Active alerts
- `GET /actions` - Suggested actions
- `GET /trends/:metric` - Trend data
- `POST /refresh` - Cache refresh

### **Frontend Components**
Location: `/Frontend/merchant/src/features/dashboard/`

```
dashboard/
├── components/          # UI components
│   ├── core/           # Shell, Header, Sidebar, etc.
│   ├── kpis/           # KPI cards
│   ├── charts/         # Chart components
│   ├── panels/         # Alert/action panels
│   ├── layouts/        # Plan-based layouts
│   └── utils/          # Error boundaries, skeletons
├── hooks/              # React Query hooks
├── api/                # API client
├── types/              # TypeScript types
├── config/             # Configuration & constants
└── pages/              # Example pages
```

---

## 🚀 Quick Start

### **Option 1: Use Complete Dashboard Page**

Replace your existing dashboard page with the new implementation:

```tsx
// app/(dashboard)/dashboard/page.tsx
export { default } from '@/features/dashboard/pages/DashboardPageNew';
```

### **Option 2: Build Custom Dashboard**

Import individual components:

```tsx
import {
  AdaptiveDashboardLayout,
  RevenueKPICard,
  OrdersKPICard,
  useDashboardAggregate,
} from '@/features/dashboard';

export default function MyCustomDashboard() {
  const { data, isLoading } = useDashboardAggregate('month');

  return (
    <AdaptiveDashboardLayout title="My Dashboard">
      <div className="grid grid-cols-4 gap-6">
        <RevenueKPICard 
          value={data?.kpiData.revenue || 0}
          change={data?.kpiData.revenueChange || 0}
        />
        <OrdersKPICard 
          value={data?.kpiData.orders || 0}
          change={data?.kpiData.ordersChange || 0}
        />
      </div>
    </AdaptiveDashboardLayout>
  );
}
```

---

## 🔧 Component Usage Examples

### **KPI Cards**

```tsx
import { KPICard, RevenueKPICard, OrdersKPICard } from '@/features/dashboard';

// Generic KPI Card
<KPICard
  title="Total Sales"
  value={5000}
  change={12.5}
  icon="DollarSign"
  formatValue={(v) => `$${v.toLocaleString()}`}
/>

// Specialized Cards
<RevenueKPICard 
  title="Monthly Revenue" 
  value={10000} 
  change={8.3} 
/>

<OrdersKPICard 
  title="Total Orders" 
  value={250} 
  change={-2.1} 
/>
```

### **Charts**

```tsx
import { RevenueChart, OrderTrendChart } from '@/features/dashboard';

<RevenueChart
  title="Revenue Over Time"
  description="Last 30 days"
  data={[
    { date: '2024-01-01', value: 1000 },
    { date: '2024-01-02', value: 1500 },
    // ... more data points
  ]}
/>
```

### **Alerts & Actions**

```tsx
import { DashboardNotifications } from '@/features/dashboard';

<DashboardNotifications
  alerts={[
    {
      id: '1',
      type: 'warning',
      title: 'Low Stock',
      message: '5 products are running low',
      action: { label: 'View Products', href: '/inventory' }
    }
  ]}
  actions={[
    {
      id: '1',
      title: 'Complete Onboarding',
      description: 'Finish setting up your store',
      priority: 'high',
      icon: 'CheckCircle',
      action: { label: 'Continue', href: '/onboarding' }
    }
  ]}
/>
```

---

## 🪝 Hooks Usage

### **useDashboardAggregate**

Fetch all dashboard data in one call:

```tsx
import { useDashboardAggregate } from '@/features/dashboard/hooks';

const { data, isLoading, error, refetch } = useDashboardAggregate('month');

// Access data
console.log(data?.kpiData.revenue);
console.log(data?.todosAlertsData.alerts);
```

### **useDashboardKpis**

Fetch only KPIs:

```tsx
import { useDashboardKpis } from '@/features/dashboard/hooks';

const { data } = useDashboardKpis();
console.log(data?.revenue);
```

### **useRefreshDashboard**

Force cache refresh:

```tsx
import { useRefreshDashboard } from '@/features/dashboard/hooks';

const refresh = useRefreshDashboard();

const handleRefresh = async () => {
  await refresh.mutateAsync();
};
```

---

## 🎨 Customization

### **Plan-Based Layouts**

Automatically adapts based on subscription tier:

```tsx
import { AdaptiveDashboardLayout } from '@/features/dashboard';

// Free plan sees upgrade prompts
// Pro plan sees full features
// Pro+ sees premium features
<AdaptiveDashboardLayout>
  {/* Your content */}
</AdaptiveDashboardLayout>
```

### **Manual Layout Selection**

```tsx
import { 
  FreeDashboardLayout,
  ProDashboardLayout,
  ProPlusDashboardLayout 
} from '@/features/dashboard';

{currentPlan === 'free' && (
  <FreeDashboardLayout>{/* content */}</FreeDashboardLayout>
)}
```

---

## ⚙️ Configuration

### **Feature Matrix**

Control what features each plan sees:

```ts
// features/dashboard/config/dashboard.config.ts
export const DASHBOARD_FEATURE_MATRIX = {
  starter: {
    kpis: ['revenue', 'orders'],
    analytics: false,
    realtimeUpdates: false,
  },
  pro: {
    kpis: ['revenue', 'orders', 'customers', 'conversion'],
    analytics: true,
    realtimeUpdates: true,
  },
  // ...
};
```

### **Refresh Intervals**

```ts
export const REFRESH_INTERVALS = {
  kpis: 2 * 60 * 1000,      // 2 minutes
  alerts: 1 * 60 * 1000,    // 1 minute
  aggregate: 5 * 60 * 1000, // 5 minutes
};
```

---

## 🧪 Testing

### **Unit Tests**

Tests are located in `__tests__/` folders:

```bash
pnpm test KPICards.test
pnpm test useDashboard.test
```

### **Storybook Stories**

View component stories in Storybook:

```bash
pnpm storybook
```

Stories available for:
- KPICard variants
- Loading states
- Different data scenarios

---

## 🐛 Error Handling

### **Error Boundaries**

Wrap your dashboard with error boundary:

```tsx
import { DashboardErrorBoundary } from '@/features/dashboard';

<DashboardErrorBoundary>
  <YourDashboard />
</DashboardErrorBoundary>
```

### **Loading States**

Use skeleton loaders:

```tsx
import { DashboardSkeleton, KPICardSkeleton } from '@/features/dashboard';

{isLoading ? <DashboardSkeleton /> : <YourDashboard />}
```

---

## 📊 Backend Integration

### **API Client Setup**

The API client is already configured. Just make sure your backend is running:

```bash
# Backend should be running on port 3001
curl http://localhost:3001/api/v1/dashboard/aggregate
```

### **Environment Variables**

Ensure these are set:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001/api
```

---

## 🎯 Migration Path

### **From Old Dashboard**

1. Keep old dashboard at `/old-dashboard`
2. Create new route at `/dashboard-v2`
3. Test thoroughly
4. Redirect `/dashboard` to new implementation
5. Remove old dashboard after verification

### **Gradual Adoption**

You can use new components alongside old code:

```tsx
// Mix new KPI cards with old layout
import { RevenueKPICard } from '@/features/dashboard';
import { OldDashboardContainer } from '@/components/old-dashboard';

<OldDashboardContainer>
  <RevenueKPICard value={revenue} />
  {/* Other old components */}
</OldDashboardContainer>
```

---

## 📈 Performance Tips

1. **Use aggregate endpoint** - One API call instead of multiple
2. **React Query caching** - Already configured, don't override
3. **Lazy load charts** - Charts are already lazy-loaded
4. **Debounce refreshes** - Use the built-in refresh logic
5. **Monitor bundle size** - Components are tree-shakeable

---

## 🆘 Troubleshooting

### **"Failed to fetch dashboard data"**

- Check backend is running
- Verify API URL in environment
- Check network tab for 401 errors (auth issue)

### **Components not rendering**

- Ensure you're inside `<QueryClientProvider>`
- Check that auth context is providing user data
- Verify industry slug is set

### **Styling issues**

- Make sure Tailwind CSS is configured
- Check dark mode context
- Verify component imports are correct

---

## 📚 Additional Resources

- **Component docs**: See inline JSDoc comments
- **Type definitions**: `/features/dashboard/types/index.ts`
- **API reference**: Backend Swagger docs at `/api/docs`
- **Examples**: `/features/dashboard/pages/DashboardPageNew.tsx`

---

## ✅ Checklist

Before going live:

- [ ] Backend endpoints responding correctly
- [ ] Frontend environment variables set
- [ ] Auth context providing user data
- [ ] Subscription plan detected
- [ ] All components rendering
- [ ] Loading states working
- [ ] Error handling tested
- [ ] Mobile responsive checked
- [ ] Dark mode tested

---

**Need help?** Check the example implementation in `DashboardPageNew.tsx` or reach out to the platform team.
