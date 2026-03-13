# UNIFIED PRO DASHBOARD ARCHITECTURE
## Single Dashboard for All 22 Industries

**Version:** 3.0  
**Date:** March 11, 2026  
**Status:** Consolidation & Expansion Plan  

---

## EXECUTIVE SUMMARY

After auditing the codebase, we have **three dashboard variants** that need consolidation:
1. **DashboardV2Content** (956 lines) - Base dashboard with industry sections
2. **ProDashboardV2** (654 lines) - Advanced features (AI, tasks, enhanced metrics)
3. **DashboardLegacyContent** (192 lines) - Deprecated fallback

**Strategy:** Merge DashboardV2Content + ProDashboardV2 into a single **UniversalProDashboard** that adapts to all 22 industries using the existing design category system.

---

## CURRENT COMPONENT INVENTORY

### From ProDashboardV2.tsx (Components to Universalize)

| Component | Lines | Purpose | Universal? |
|-----------|-------|---------|------------|
| `KeyMetricCard` | 13 | Metric display with trend | ✅ YES |
| `TaskItem` | 11 | Task list item | ✅ YES |
| `SectionHeader` | 16 | Section title with icon | ✅ YES |
| `AIStatsPanel` | ~80 | AI usage statistics | ✅ YES (optional) |
| `OrderStatusPipeline` | ~60 | Order fulfillment stages | ✅ YES |
| `TopCustomersList` | ~40 | Customer ranking | ✅ YES |
| `InventoryAlertsPanel` | ~50 | Low stock warnings | ✅ YES |

### From DashboardV2Content.tsx (Components to Universalize)

| Component | Lines | Purpose | Universal? |
|-----------|-------|---------|------------|
| `KPIBlocks` | 226 | KPI cards grid | ✅ YES |
| `IndustryNativeSections` | 481 | Industry-specific sections | ✅ YES |
| `QuickActions` | 390 | Quick action buttons | ✅ YES |
| `TodosAlerts` | 356 | Tasks & alerts widget | ✅ YES |
| `IncomeExpenseChart` | 144 | Financial charts | ✅ YES |
| `DonutChart` | 145 | Pipeline visualization | ✅ YES |
| `AIUsageChart` | 72 | AI metrics chart | ✅ YES (optional) |

### From IndustryNativeSections.tsx (Already Universal)

| Component | Purpose |
|-----------|---------|
| `PrimaryObjectHealth` | Product/Service health metrics |
| `LiveOperations` | Real-time operations feed |
| `AlertsList` | Bottleneck & alert notifications |
| `SuggestedActionsList` | AI-powered action recommendations |

---

## UNIVERSAL PRO DASHBOARD STRUCTURE

### Single Component Architecture

```typescript
// Frontend/merchant-admin/src/components/dashboard/UniversalProDashboard.tsx

interface UniversalProDashboardProps {
  merchant: Merchant;
  industrySlug: IndustrySlug;
  designCategory: DesignCategory;
  planTier: 'basic' | 'standard' | 'advanced' | 'pro';
}

export function UniversalProDashboard({
  merchant,
  industrySlug,
  designCategory,
  planTier
}: UniversalProDashboardProps) {
  
  // 1. HEADER SECTION (All Industries)
  // - Welcome message
  // - Date/Time context
  // - Quick action buttons (plan-aware)
  
  // 2. KPI GRID SECTION (All Industries)
  // - Revenue/GMV/Donations (industry-aware naming)
  // - Orders/Bookings/Enrollments (industry-aware)
  // - Customers/Clients/Guests (industry-aware)
  // - Conversion/Utilization/Completion (industry-aware)
  // - AI Stats (Pro tier only)
  
  // 3. INDUSTRY-NATIVE SECTIONS (Industry-specific)
  // - Primary Object Health (products/services/content)
  // - Live Operations (real-time metrics)
  // - Alerts & Bottlenecks (threshold-based)
  // - Suggested Actions (AI-powered)
  
  // 4. PIPELINE VISUALIZATION (All Industries)
  // - Order/Booking/Project stages
  // - Donut chart with status breakdown
  
  // 5. FINANCIAL OVERVIEW (Standard+ tiers)
  // - Income vs Expense chart
  // - Invoice overview
  // - Wallet balance (if applicable)
  
  // 6. AI INSIGHTS PANEL (Advanced+ tiers)
  // - AI conversations
  // - Captured conversions
  // - Usage trends
  
  // 7. SIDEBAR WIDGETS (All Industries)
  // - Tasks & Reminders
  // - Inventory Alerts
  // - Top Customers/Clients
  // - Recent Activity
}
```

### Layout Structure (Responsive)

```
┌─────────────────────────────────────────────────────────────────────┐
│ HEADER                                                              │
│ [Welcome] [Date] [Quick Actions] [Notifications]                   │
├─────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐      │
│  │  KPI 1  │ │  KPI 2  │ │  KPI 3  │ │  KPI 4  │ │  KPI 5  │      │
│  │(Revenue)│ │(Orders) │ │(Cust)   │ │(Conv)   │ │(AI Stat)│      │
│  └─────────┘ └─────────┘ └─────────┘ └─────────┘ └─────────┘      │
│                                                                     │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ INDUSTRY-NATIVE SECTION 1   │  │ INDUSTRY-NATIVE SECTION 2   │  │
│  │ (Primary Object Health)     │  │ (Live Operations)           │  │
│  └─────────────────────────────┘  └─────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ ALERTS & BOTTLENECKS        │  │ SUGGESTED ACTIONS           │  │
│  └─────────────────────────────┘  └─────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │ PIPELINE VISUALIZATION (Donut Chart + Legend)               │   │
│  └─────────────────────────────────────────────────────────────┘   │
│                                                                     │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ FINANCIAL CHARTS            │  │ AI INSIGHTS (Pro only)      │  │
│  │ (Income/Expense)            │  │                             │  │
│  └─────────────────────────────┘  └─────────────────────────────┘  │
│                                                                     │
│  ┌─────────────────────────────┐  ┌─────────────────────────────┐  │
│  │ TASKS & REMINDERS           │  │ RECENT ACTIVITY             │  │
│  └─────────────────────────────┘  └─────────────────────────────┘  │
│                                                                     │
└─────────────────────────────────────────────────────────────────────┘
```

---

## DESIGN CATEGORY APPLICATION

Each industry gets one of 5 design categories applied to the Universal Pro Dashboard:

### 1. Signature Clean (10 Industries)
**Industries:** Retail, Electronics, Education, Services, Wholesale, Marketplace, Blog, Professional Services, Healthcare, Legal

**Visual Treatment:**
- White backgrounds, subtle grays
- Clean typography, minimal shadows
- Blue primary accent (#3B82F6)
- Card shadows: `0 4px 16px rgba(0,0,0,0.08)`

### 2. Premium Glass (5 Industries)
**Industries:** Fashion, Beauty, Real Estate, Creative Portfolio, Salon/Spa

**Visual Treatment:**
- Glassmorphism cards with backdrop blur
- Rose-gold/Champagne gradients
- Soft shadows with color tint
- Background: `linear-gradient(135deg, #E0BFB8 0%, #F7E7CE 100%)`

### 3. Modern Dark (5 Industries)
**Industries:** Automotive, SaaS/Tech, Kitchen/KDS, Nightlife, Digital Products

**Visual Treatment:**
- Dark backgrounds (#0D0D0D)
- Neon accents (Electric Blue #6366F1)
- High contrast text
- Glow effects on interactive elements

### 4. Bold Energy (2 Industries)
**Industries:** Restaurant (FOH), Events

**Visual Treatment:**
- Thick borders (2px solid black)
- Solid drop shadows (4px 4px 0px #000)
- Vibrant colors (Red, Orange, Green)
- High visual impact

### 5. Natural Warmth (5 Industries)
**Industries:** Travel, Nonprofit, Wellness/Fitness, Grocery, Bar/Lounge

**Visual Treatment:**
- Warm earth tones (Terracotta, Sage)
- Organic shapes, soft gradients
- Yellow/Amber accents (#D97706)
- Rounded corners (16px+)

---

## UNIVERSAL COMPONENTS WITH DESIGN CATEGORY SUPPORT

### 1. UniversalMetricCard

```typescript
interface UniversalMetricCardProps {
  label: string;
  value: string | number;
  change?: { value: number; trend: 'up' | 'down' };
  format: 'currency' | 'number' | 'percent' | 'duration';
  designCategory: DesignCategory;
  icon?: IconName;
}

// Styling per design category:
// - Signature: Clean white card, subtle shadow
// - Glass: Backdrop blur, gradient border
// - Dark: Dark card, neon glow on hover
// - Bold: Thick border, solid shadow
// - Natural: Warm background, organic shape
```

### 2. UniversalSectionHeader

```typescript
interface UniversalSectionHeaderProps {
  title: string;
  subtitle?: string;
  icon?: IconName;
  designCategory: DesignCategory;
  action?: React.ReactNode;
}

// Styling per design category:
// - Signature: Simple text with icon
// - Glass: Gradient text, glass icon background
// - Dark: Neon icon glow
// - Bold: Thick underline, bold icon
// - Natural: Organic underline, warm icon
```

### 3. UniversalTaskItem

```typescript
interface UniversalTaskItemProps {
  id: string;
  title: string;
  subtitle?: string;
  icon: IconName;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  designCategory: DesignCategory;
  onClick?: () => void;
}

// Styling per design category:
// - Signature: Checkbox + text, subtle hover
// - Glass: Glass background, soft shadow
// - Dark: Neon border on hover
// - Bold: Thick left border for priority
// - Natural: Rounded pill shape
```

### 4. UniversalChartContainer

```typescript
interface UniversalChartContainerProps {
  title: string;
  children: React.ReactNode;
  designCategory: DesignCategory;
  height?: number;
}

// Wraps any chart (Line, Donut, Bar) with design category styling
```

---

## INDUSTRY-SPECIFIC CONFIGURATION

Each industry configures the Universal Pro Dashboard via:

```typescript
// config/industry-dashboard-config.ts

export interface IndustryDashboardConfig {
  industry: IndustrySlug;
  designCategory: DesignCategory;
  
  // KPI Configuration
  kpis: {
    primary: DashboardKpiKey;      // Revenue/GMV/Donations
    secondary: DashboardKpiKey;    // Orders/Bookings/Enrollments
    tertiary: DashboardKpiKey;     // Customers/Clients/Guests
    quaternary: DashboardKpiKey;   // Conversion/Utilization/Completion
    ai?: DashboardKpiKey;          // AI stats (Pro tier)
  };
  
  // Section Visibility
  sections: {
    primaryObjectHealth: boolean;
    liveOperations: boolean;
    alerts: boolean;
    suggestedActions: boolean;
    pipeline: boolean;
    financialCharts: boolean;      // Standard+ only
    aiInsights: boolean;           // Advanced+ only
  };
  
  // Primary Object Configuration
  primaryObject: {
    label: string;                 // "Product", "Service", "Property"
    healthFields: string[];        // Fields to show in health section
  };
  
  // Live Operations Fields
  liveOpsFields: LiveOpsField[];
  
  // Alert Thresholds
  alertThresholds: AlertThreshold[];
  
  // Suggested Actions
  suggestedActions: SuggestedActionRule[];
}
```

---

## API ENDPOINTS FOR UNIVERSAL DASHBOARD

### Core Dashboard APIs (Already Exist)

```typescript
// GET /api/dashboard/aggregate
// Returns: DashboardAggregateData
{
  kpis: DashboardKpiData;
  metrics: DashboardMetricsData;
  overview: DashboardOverviewData;
  industryData?: DashboardIndustryOverviewData;
  alerts: DashboardAlertsData;
  actions: DashboardActionsData;
  recentOrders: RecentOrderItem[];
  topCustomers: CustomerInsightItem[];
  inventoryAlerts: InventoryAlertItem[];
}

// GET /api/dashboard/pro-overview (Merge with aggregate)
// Returns: ProDashboardData
{
  ...aggregateData,
  aiStats: AIStatsData;
  tasks: TaskItem[];
  orderStatus: OrderStatusPipeline;
}
```

### Industry-Specific APIs (Need Creation)

```typescript
// GET /api/industries/{industry}/dashboard-config
// Returns industry-specific configuration for the dashboard

// GET /api/industries/{industry}/live-operations
// Real-time operations data (WebSocket preferred)

// GET /api/industries/{industry}/primary-object-health
// Health metrics for the industry's primary object
```

---

## PLAN TIER FEATURE GATING

### Basic Tier (4 KPIs)
- Revenue, Orders, Customers, Conversion
- Primary Object Health section
- Live Operations (limited)
- Basic alerts
- NO Finance module
- NO Marketing module
- NO AI features

### Standard Tier (6 KPIs)
- All Basic KPIs + 2 additional
- Full Live Operations
- Financial charts (Income/Expense)
- Pipeline visualization
- Finance module enabled
- Marketing module enabled

### Advanced Tier (8 KPIs)
- All Standard KPIs + 2 additional
- AI Insights panel
- Advanced analytics
- Full module access

### Pro Tier (Unlimited)
- All Advanced features
- AI Stats in KPI grid
- Priority support indicators
- Custom dashboard layouts

---

## IMPLEMENTATION PHASES

### Phase 1: Consolidate Components (Week 1)
1. Create `UniversalProDashboard.tsx`
2. Extract reusable components from ProDashboardV2
3. Merge with DashboardV2Content functionality
4. Add design category prop support

### Phase 2: Industry Configuration (Week 2)
1. Create `industry-dashboard-config.ts` with all 22 industries
2. Map each industry to design category
3. Configure KPI mappings per industry
4. Set up section visibility rules

### Phase 3: Design Category Implementation (Week 3)
1. Implement 5 design category style variants
2. Apply to all universal components
3. Test visual rendering per category
4. Ensure accessibility (WCAG 2.1 AA)

### Phase 4: API Integration (Week 4)
1. Merge `/api/dashboard/aggregate` + `/api/dashboard/pro-overview`
2. Create industry-specific endpoints
3. Implement WebSocket for real-time updates
4. Add caching with Redis

### Phase 5: Testing & Rollout (Week 5-6)
1. Test all 22 industries
2. Verify plan tier gating
3. Performance optimization
4. Gradual rollout

---

## FILES TO CREATE/MODIFY

### New Files
```
Frontend/merchant-admin/src/
├── components/dashboard/
│   ├── UniversalProDashboard.tsx          # Main unified dashboard
│   ├── universal/
│   │   ├── UniversalMetricCard.tsx
│   │   ├── UniversalSectionHeader.tsx
│   │   ├── UniversalTaskItem.tsx
│   │   ├── UniversalChartContainer.tsx
│   │   └── index.ts
│   └── index.ts
├── config/
│   └── industry-dashboard-config.ts       # 22 industry configs
└── hooks/
    └── useUniversalDashboard.ts           # Data fetching hook

Backend/core-api/src/
├── app/api/dashboard/
│   └── universal/route.ts                 # Merged aggregate + pro
└── config/
    └── industry-dashboard-config.ts       # Backend configs
```

### Files to Modify
```
Frontend/merchant-admin/src/
├── app/(dashboard)/dashboard/page.tsx     # Use UniversalProDashboard
├── config/industry-archetypes.ts          # Add design categories
└── styles/vayva-design-system.css         # Add design category styles

Backend/core-api/src/
├── services/dashboard.server.ts           # Add universal methods
└── types/dashboard.ts                     # Add universal types
```

### Files to Deprecate (After Migration)
```
Frontend/merchant-admin/src/
├── components/dashboard-v2/
│   ├── DashboardV2Content.tsx             # Merge into Universal
│   ├── ProDashboardV2.tsx                 # Merge into Universal
│   ├── DashboardLegacyContent.tsx         # Remove
│   ├── ProDashboardV2_broken.tsx          # Remove
│   └── ProDashboardV2_original_broken.tsx # Remove
```

---

## SUCCESS METRICS

1. **Single Dashboard**: Only UniversalProDashboard.tsx remains
2. **22 Industries**: All industries render with correct design category
3. **Plan Tier Gating**: Features correctly limited by tier
4. **Performance**: < 2s load time for all industries
5. **Accessibility**: WCAG 2.1 AA compliance across all design categories

---

This architecture provides a single, unified Pro Dashboard that adapts to all 22 industries while maintaining the sophisticated features of the current Pro implementation.
