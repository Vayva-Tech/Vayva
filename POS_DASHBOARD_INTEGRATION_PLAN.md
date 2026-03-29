# 🏪 POS Integration Plan - Dashboard Navigation

## Overview

This document details how to integrate POS access into **every industry dashboard** across the Vayva platform, ensuring merchants can easily access their point-of-sale system from anywhere in their workflow.

---

## 🎯 Integration Strategy

### Three-Tier Approach

1. **Quick Access Button** - Always visible in main navigation
2. **Industry-Specific Route** - Tailored POS screen per vertical
3. **Contextual POS** - POS actions within existing workflows

---

## 📍 POS Button Placement Locations

### 1. Main Sidebar Navigation (Primary)

**File**: `Frontend/merchant/src/config/sidebar.ts`

Add POS as a **core module** in the Commerce group:

```typescript
const MODULE_TO_SIDEBAR: Record<
  string,
  { name: string; href: string; icon: string }
> = {
  // ... existing modules
  pos: { 
    name: "Point of Sale", 
    href: "/dashboard/pos", 
    icon: "MonitorPlay"  // or "CashRegister"
  },
};
```

**Industry-Specific Labels**:
```typescript
// In getSidebar() function
const posLabels: Record<string, string> = {
  retail: "POS Terminal",
  restaurant: "POS & Orders",
  beauty: "Checkout & Booking",
  salon: "POS Register",
  spa: "Treatment Checkout",
  healthcare: "Patient Checkout",
  education: "Enrollment Desk",
  events: "Event Check-in",
  nightlife: "Venue Entry",
  default: "Point of Sale",
};

const posLabel = posLabels[industrySlug] || posLabels.default;
```

**Conditional Display** - Show only for relevant industries:
```typescript
const industriesWithPOS = [
  'retail', 'fashion', 'electronics', 'grocery', 'one_product',
  'food', 'restaurant', 'catering',
  'beauty', 'salon', 'spa', 'wellness',
  'healthcare', 'fitness',
  'events', 'nightlife',
  'education',
  'automotive', 'real_estate',
];

if (industriesWithPOS.includes(industrySlug)) {
  commerceItems.push({
    name: posLabel,
    href: `/dashboard/pos/${industrySlug}`,
    icon: 'MonitorPlay',
  });
}
```

---

### 2. Top Navigation Bar (Quick Actions)

**File**: `Frontend/merchant/src/components/admin-shell.tsx`

Add POS button next to store selector or user menu:

```tsx
<div className="flex items-center gap-4">
  {/* Existing store dropdown */}
  <StoreSelector />
  
  {/* NEW: Quick POS Access */}
  <Button
    variant="outline"
    size="sm"
    onClick={() => router.push(`/dashboard/pos/${merchant?.industrySlug}`)}
    className="hidden md:flex items-center gap-2"
  >
    <MonitorPlay className="w-4 h-4" />
    <span>Open POS</span>
  </Button>
</div>
```

---

### 3. Dashboard Home Page (Quick Actions Card)

**File**: `Frontend/merchant/src/app/(dashboard)/dashboard/page.tsx`

Add POS quick action card:

```tsx
<Card className="glass-panel p-6 border border-white/10">
  <CardHeader>
    <CardTitle className="text-lg font-bold text-white">
      Quick Actions
    </CardTitle>
  </CardHeader>
  <CardContent className="grid grid-cols-2 gap-4">
    <Button
      variant="secondary"
      className="h-auto py-4 flex flex-col items-center gap-2"
      onClick={() => router.push(`/dashboard/pos/${industrySlug}`)}
    >
      <MonitorPlay className="w-8 h-8" />
      <span className="text-sm font-medium">Open POS</span>
    </Button>
    
    {/* Other quick actions */}
    <Button variant="secondary" className="h-auto py-4 flex flex-col items-center gap-2">
      <Package className="w-8 h-8" />
      <span className="text-sm font-medium">Add Product</span>
    </Button>
  </CardContent>
</Card>
```

---

### 4. Mobile Bottom Navigation (High Priority Industries)

For mobile users, add POS to bottom nav for high-frequency industries:

**File**: `Frontend/merchant/src/components/admin-shell.tsx`

```typescript
// Enhanced bottom nav with POS for retail/restaurant
const bottomNavItems = [
  { name: "Home", icon: "LayoutDashboard", href: "/dashboard" },
  
  // POS for relevant industries
  shouldShowPOS(industrySlug) 
    ? { 
        name: "POS", 
        icon: "MonitorPlay", 
        href: `/dashboard/pos/${industrySlug}` 
      }
    : hasBookingsFeature
      ? { name: "Bookings", icon: "Calendar", href: "/dashboard/bookings" }
      : { name: "Orders", icon: "ShoppingBag", href: "/dashboard/orders" },
  
  { name: "Products", icon: "Package", href: "/dashboard/products" },
  { name: "Finance", icon: "Wallet", href: "/dashboard/finance" },
];

function shouldShowPOS(industry: string): boolean {
  const highFrequencyPOS = ['retail', 'restaurant', 'grocery', 'fashion'];
  return highFrequencyPOS.includes(industry);
}
```

---

## 🗺️ Industry-Specific POS Routes

### Route Structure

```
/dashboard/pos/:industrySlug
```

### Route Mapping Table

| Industry | Route | POS Screen Name | Key Features |
|----------|-------|----------------|--------------|
| **Retail** | `/dashboard/pos/retail` | Retail POS Terminal | Barcode scan, quick cart, layaway |
| **Fashion** | `/dashboard/pos/fashion` | Fashion Checkout | Size/color variants, styling add-ons |
| **Electronics** | `/dashboard/pos/electronics` | Electronics POS | Warranty, accessories, IMEI tracking |
| **Grocery** | `/dashboard/pos/grocery` | Quick Checkout | Weigh scale integration, expiry tracking |
| **Restaurant** | `/dashboard/pos/restaurant` | Restaurant POS | Table orders, course firing, split bills |
| **Beauty/Salon** | `/dashboard/pos/beauty` | Beauty Checkout | Services + products, stylist selection, deposits |
| **Spa** | `/dashboard/pos/spa` | Spa Treatment Checkout | Package deals, therapist tips |
| **Healthcare** | `/dashboard/pos/healthcare` | Patient Billing | Insurance co-pay, consultation fees |
| **Education** | `/dashboard/pos/education` | Enrollment Desk | Course enrollment, installment plans |
| **Events** | `/dashboard/pos/events` | Event Check-in | Walk-in tickets, VIP upgrades |
| **Nightlife** | `/dashboard/pos/nightlife` | Venue Entry POS | Cover charge, bottle service, tabs |
| **Automotive** | `/dashboard/pos/automotive` | Service Bay Checkout | Parts + labor, service packages |
| **Real Estate** | `/dashboard/pos/real-estate` | Property Desk | Application fees, booking deposits |
| **Fitness** | `/dashboard/pos/fitness` | Gym Membership Desk | Memberships, personal training, merch |
| **Professional Services** | `/dashboard/pos/professional` | Client Checkout | Consultation billing, retainers |

---

## 🎨 Component Implementation

### Universal POS Launcher Component

Create reusable component:

**File**: `Frontend/merchant/src/components/pos/POSLauncher.tsx`

```typescript
'use client';

import { Button } from '@vayva/ui';
import { MonitorPlay } from '@phosphor-icons/react';
import { useRouter } from 'next/navigation';
import { useMerchant } from '@/hooks/use-merchant';

interface POSLauncherProps {
  variant?: 'button' | 'icon' | 'card';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export function POSLauncher({ variant = 'button', size = 'md', className = '' }: POSLauncherProps) {
  const router = useRouter();
  const { merchant } = useMerchant();
  const industrySlug = merchant?.industrySlug || 'retail';

  const handleClick = () => {
    router.push(`/dashboard/pos/${industrySlug}`);
  };

  if (variant === 'icon') {
    return (
      <button
        onClick={handleClick}
        className={`p-2 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
        title="Open POS"
        aria-label="Open Point of Sale"
      >
        <MonitorPlay className="w-5 h-5 text-gray-600" />
      </button>
    );
  }

  if (variant === 'card') {
    return (
      <button
        onClick={handleClick}
        className={`w-full p-6 bg-white rounded-2xl shadow-sm border border-gray-200 hover:shadow-md transition-shadow text-left ${className}`}
      >
        <div className="flex items-center gap-3 mb-2">
          <div className="p-3 bg-green-50 rounded-xl">
            <MonitorPlay className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h3 className="font-semibold text-gray-900">Point of Sale</h3>
            <p className="text-sm text-gray-500">Process in-person transactions</p>
          </div>
        </div>
      </button>
    );
  }

  // Default button variant
  return (
    <Button
      onClick={handleClick}
      variant="outline"
      size={size}
      className={`flex items-center gap-2 ${className}`}
    >
      <MonitorPlay className="w-4 h-4" />
      <span>Open POS</span>
    </Button>
  );
}
```

---

### Usage Examples Across Dashboard

#### In Header/Toolbar
```tsx
import { POSLauncher } from '@/components/pos/POSLauncher';

function DashboardHeader() {
  return (
    <header className="border-b bg-white">
      <div className="flex items-center justify-between px-6 py-4">
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <POSLauncher variant="icon" />
      </div>
    </header>
  );
}
```

#### In Sidebar
```tsx
// Already covered by sidebar config, but can add as CTA
function SidebarFooter() {
  return (
    <div className="p-4 border-t">
      <POSLauncher variant="button" size="lg" className="w-full" />
    </div>
  );
}
```

#### In Dashboard Home
```tsx
function DashboardHome() {
  return (
    <div className="grid gap-6 md:grid-cols-3">
      <POSLauncher variant="card" className="col-span-1" />
      {/* Other action cards */}
    </div>
  );
}
```

---

## 🔌 Backend API Integration

### POS Route Registration

**File**: `Backend/fastify-server/src/index.ts`

Add industry-specific POS routes:

```typescript
// Import industry POS routes
import { retailPOSRoutes } from './routes/api/v1/pos/retail-pos.routes';
import { restaurantPOSRoutes } from './routes/api/v1/pos/restaurant-pos.routes';
import { beautyPOSRoutes } from './routes/api/v1/pos/beauty-pos.routes';
// ... more imports

// Register routes
await server.register(retailPOSRoutes, { prefix: '/api/v1/pos/retail' });
await server.register(restaurantPOSRoutes, { prefix: '/api/v1/pos/restaurant' });
await server.register(beautyPOSRoutes, { prefix: '/api/v1/pos/beauty' });
```

### Industry-Specific Service Layer

**File**: `Backend/fastify-server/src/services/pos/retail-pos.service.ts`

```typescript
import { prisma } from '@vayva/db';
import { posCoreService } from './pos-core.service';

export class RetailPOSService {
  constructor(private db = prisma) {}

  /**
   * Get retail-specific POS configuration
   */
  async getRetailPOSConfig(storeId: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      include: {
        settings: true,
        inventoryLocations: true,
      },
    });

    if (!store) {
      throw new Error('Store not found');
    }

    return {
      barcodeEnabled: store.settings?.barcodeScanning ?? true,
      quickCheckoutEnabled: store.settings?.quickCheckout ?? false,
      layawayEnabled: store.settings?.layawayPlans ?? false,
      giftCardsEnabled: store.settings?.giftCards ?? false,
      taxRate: store.settings?.taxRate ?? 0.075,
      currency: 'NGN',
    };
  }

  /**
   * Get products optimized for retail POS
   */
  async getPOSProducts(storeId: string, search?: string) {
    const products = await this.db.product.findMany({
      where: {
        storeId,
        status: 'ACTIVE',
        OR: search
          ? [
              { name: { contains: search, mode: 'insensitive' } },
              { sku: { equals: search, mode: 'insensitive' } },
              { barcode: { equals: search, mode: 'insensitive' } },
            ]
          : [],
      },
      include: {
        variants: {
          where: { stock: { gt: 0 } },
        },
        images: {
          take: 1,
        },
      },
      orderBy: { name: 'asc' },
      take: 50,
    });

    return products.map(product => ({
      id: product.id,
      name: product.name,
      price: product.variants[0]?.price ?? product.price,
      sku: product.sku,
      barcode: product.barcode,
      imageUrl: product.images[0]?.url,
      stock: product.variants.reduce((sum, v) => sum + v.stock, 0),
      variants: product.variants,
    }));
  }
}
```

---

## 📱 Frontend Page Implementation

### Retail POS Page Example

**File**: `Frontend/merchant/src/app/(dashboard)/dashboard/pos/retail/page.tsx`

```typescript
'use client';

import React from 'react';
import { RetailPOS } from '@/components/pos/retail/RetailPOS';
import { POSProvider } from '@/components/pos/POSProvider';

export default function RetailPOSPage() {
  return (
    <POSProvider>
      <div className="h-screen w-full overflow-hidden">
        <RetailPOS />
      </div>
    </POSProvider>
  );
}
```

### Restaurant POS Page Example

**File**: `Frontend/merchant/src/app/(dashboard)/dashboard/pos/restaurant/page.tsx`

```typescript
'use client';

import React from 'react';
import { RestaurantPOS } from '@/components/pos/restaurant/RestaurantPOS';
import { POSProvider } from '@/components/pos/POSProvider';

export default function RestaurantPOSPage() {
  return (
    <POSProvider>
      <div className="h-screen w-full overflow-hidden bg-gray-50">
        <RestaurantPOS />
      </div>
    </POSProvider>
  );
}
```

---

## 🎯 Industry-Specific Enhancements

### Restaurant: Table Selector Integration

Add table selector in sidebar when viewing restaurant POS:

```typescript
// In sidebar config for restaurant
if (industrySlug === 'restaurant') {
  posGroup.items.push({
    name: 'Floor Plan',
    href: '/dashboard/pos/restaurant/tables',
    icon: 'Grid',
  });
}
```

### Beauty: Staff & Schedule Integration

```typescript
// In beauty POS screen
const BeautyPOS = () => {
  const [selectedStaff, setSelectedStaff] = useState<string>();
  const [scheduledTime, setScheduledTime] = useState<Date>();
  
  return (
    <div className="space-y-4">
      <StaffSelector value={selectedStaff} onChange={setSelectedStaff} />
      <DateTimePicker value={scheduledTime} onChange={setScheduledTime} />
      {/* Service selection grid */}
    </div>
  );
};
```

### Healthcare: Insurance & Patient Info

```typescript
// In healthcare POS
const HealthcarePOS = () => {
  const [insuranceInfo, setInsuranceInfo] = useState<{
    provider: string;
    policyNumber: string;
    copay: number;
  }>();
  
  return (
    <div>
      <InsuranceSelector onSelect={setInsuranceInfo} />
      <PatientLookup />
      {/* Medical service checkout */}
    </div>
  );
};
```

---

## 🧪 Testing Checklist

### Unit Tests
- [ ] POS launcher renders correctly in all variants
- [ ] Click handler navigates to correct industry route
- [ ] Button disabled for non-POS industries

### Integration Tests
- [ ] Sidebar shows POS button for enabled industries
- [ ] Mobile bottom nav displays POS for retail users
- [ ] Header quick action accessible on all pages

### E2E Tests (Playwright)
```typescript
test('merchant can access POS from sidebar', async ({ page }) => {
  await page.goto('/dashboard');
  
  // Find and click POS in sidebar
  await page.click('[data-sidebar-item="pos"]');
  
  // Verify navigation
  await expect(page).toHaveURL('/dashboard/pos/retail');
  
  // Verify POS screen loads
  await expect(page.locator('[data-pos-cart]')).toBeVisible();
});

test('mobile users can access POS from bottom nav', async ({ page }) => {
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/dashboard');
  
  // Click POS in bottom nav
  await page.click('[data-bottom-nav="pos"]');
  
  // Verify POS opens
  await expect(page.locator('[data-pos-terminal]')).toBeVisible();
});
```

---

## 📊 Rollout Plan

### Phase 1: Core Integration (Week 1)
- [ ] Add POS to sidebar config for all commerce industries
- [ ] Create `POSLauncher` component
- [ ] Update `admin-shell.tsx` with header button
- [ ] Deploy to staging

### Phase 2: Industry Pages (Week 2-3)
- [ ] Build retail POS page (enhance existing)
- [ ] Create restaurant POS page
- [ ] Build beauty/salon POS page
- [ ] Add mobile-responsive layouts

### Phase 3: Advanced Features (Week 4)
- [ ] Contextual POS in order management
- [ ] Quick actions on dashboard home
- [ ] Mobile bottom nav optimization
- [ ] Keyboard shortcuts (Ctrl+P for POS)

### Phase 4: Remaining Industries (Week 5-6)
- [ ] Healthcare POS
- [ ] Education POS
- [ ] Events POS
- [ ] Nightlife POS
- [ ] Automotive POS
- [ ] Real estate POS

---

## 🎨 Design Guidelines

### Button Styling
- **Primary POS button**: Green background (`bg-green-500`) with white text
- **Secondary POS button**: Outline style (`border border-gray-200`)
- **Icon-only**: Gray icon (`text-gray-600`) with hover state

### Iconography
Use Phosphor icons for consistency:
- Primary: `<MonitorPlay />` or `<CashRegister />`
- Alternative: `<ShoppingCart />` for retail contexts
- Mobile: Simplified `<CreditCard />` for payment focus

### Accessibility
- All POS buttons must have `aria-label`
- Keyboard accessible (Tab navigation)
- Focus states clearly visible
- Screen reader friendly labels

---

## 📈 Success Metrics

| Metric | Target | Measurement |
|--------|--------|-------------|
| POS Adoption Rate | 40% in month 1 | % of merchants opening POS weekly |
| Time to First Transaction | < 30 seconds | From dashboard load to checkout complete |
| Navigation Clicks | < 2 clicks | Average clicks to reach POS |
| Mobile POS Usage | 25% of total | Mobile vs desktop POS sessions |
| Error Rate | < 0.5% | Failed POS launches / total attempts |

---

## ✅ Implementation Checklist

### Global Changes
- [ ] Update `sidebar.ts` with POS module
- [ ] Create `POSLauncher.tsx` component
- [ ] Add POS routes to Next.js app router
- [ ] Register Fastify backend routes

### Per-Industry Changes
For each industry (retail, restaurant, beauty, etc.):
- [ ] Create industry-specific POS page
- [ ] Customize POS button label in sidebar
- [ ] Add industry-specific features (tables, staff, insurance)
- [ ] Test with real merchant workflows

### Documentation
- [ ] Update merchant help docs
- [ ] Create video tutorials
- [ ] Add tooltips in UI
- [ ] Prepare support team training

---

## 🚀 Quick Start Commands

```bash
# Generate new industry POS page
pnpm generate page dashboard/pos/[industry]

# Run POS tests
pnpm test -- pos

# Build POS components
pnpm build --filter=@vayva/pos
```

---

## 📞 Support & Resources

- **Design System**: See `@vayva/ui` documentation
- **Backend Services**: Reference `pos-core.service.ts`
- **Frontend Patterns**: Follow existing dashboard patterns
- **API Docs**: Swagger at `/api/docs` on staging

---

**Ready to implement?** Start with Phase 1 and work through the checklist! Each phase builds on the previous one, ensuring a smooth rollout across all 35+ industries. 🚀
