# Vayva Industry Dashboard Master Design Plan 2026

**Complete Visual Specifications & API Integration Strategy**  
*22 Industries | 10 Design Categories | Unified Vayva Brand*

---

## How to Use This Document

This is your **complete blueprint** for building all 22 industry dashboards. Each section includes:

1. **Visual Layout Diagram** - ASCII wireframe showing exact component placement
2. **Design Category** - Which of the 10 styles it uses
3. **Color Palette** - Specific hex codes and gradients
4. **Component Inventory** - All components needed
5. **API Integration Map** - Which endpoints connect where
6. **Key Features** - Industry-specific functionality
7. **Theme Presets** - 5 color variations per industry

---

## Table of Contents

### Tier 1 Industries (Weeks 1-8)
1. [Fashion/Apparel](#1-fashion-apparel-dashboard)
2. [Restaurant/Food Service](#2-restaurant-food-service-dashboard)
3. [Retail/E-commerce](#3-retail-ecommerce-dashboard)
4. [Real Estate](#4-real-estate-dashboard)
5. [Healthcare/Medical](#5-healthcare-medical-dashboard)

### Tier 2 Industries (Weeks 9-16)
6. [Beauty/Cosmetics](#6-beauty-cosmetics-dashboard)
7. [Events/Nightlife](#7-events-nightlife-dashboard)
8. [Automotive](#8-automotive-dashboard)
9. [Travel/Hospitality](#9-travel-hospitality-dashboard)
10. [Nonprofit](#10-nonprofit-dashboard)
11. [Education/E-Learning](#11-education-e-learning-dashboard)
12. [Services/Booking](#12-services-booking-dashboard)

### Tier 3 Industries (Weeks 17-24)
13-22. [Remaining 11 Industries](#13-22-tier-3-industries)

### API Integration Strategy
- [Existing APIs](#api-integration-strategy)
- [New APIs Needed](#new-apis-needed)
- [Data Flow Architecture](#data-flow-architecture)

---

## 1. Fashion/Apparel Dashboard

### Design Category: **Premium Glass** ✨

### Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                         HEADER (Sticky)                          │
│  ┌──────┐                                    ┌──────────────┐  │
│  │ Logo │    "Fashion Dashboard" subtitle     │ Theme Switch │  │
│  └──────┘                                    └──────────────┘  │
└─────────────────────────────────────────────────────────────────┘
│                    [Animated Gradient Orbs BG]                   │
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║  KPI ROW (4 cards in grid)                               ║  │
│  ║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   ║  │
│  ║  │ Revenue  │ │ Sell-Thru│ │ AOV      │ │ Returns  │   ║  │
│  ║  │ $124,580 │ │  68.4%   │ │  $284    │ │  8.2%    │   ║  │
│  ║  │ ↑ 12.5%  │ │ ↑ 5.2%   │ │ ↓ 2.1%   │ │ ↓ 1.4%   │   ║  │
│  ║  └──────────┘ └──────────┘ └──────────┘ └──────────┘   ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║  SIZE CURVE ANALYSIS (Full Width)                        ║  │
│  ║  ┌────────────────────────────────────────────────────┐  ║  │
│  ║  │ Size: XS │▓▓▓▓▓▓░░░░ 145 units │ Med Risk │      │  ║  │
│  ║  │ Size: S  │▓▓▓▓▓▓▓▓░░ 234 units │ Low Risk │      │  ║  │
│  ║  │ Size: M  │▓▓▓▓▓▓▓▓▓▓ 312 units │ Low Risk │      │  ║  │
│  ║  │ Size: L  │▓▓▓▓▓▓▓░░░ 189 units │ Med Risk │      │  ║  │
│  ║  │ Size: XL │▓▓▓▓░░░░░░  98 units │ High Risk│      │  ║  │
│  ║  └────────────────────────────────────────────────────┘  ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔════════════════════╗ ╔════════════════════╗                  │
│  ║ VISUAL MERCHANDISE ║ ║ COLLECTION PERF.   ║                  │
│  ║  ┌────┐ ┌────┐     ║ ║ Floral Dresses 78% ║                  │
│  ║  │ 📷 │ │ 📷 │     ║ ║ Linen Sets     65% ║                  │
│  ║  ├────┼────┤     ║ ║ Accessories    45% ║                  │
│  ║  │ 📷 │ │ 📷 │     ║ ║ Footwear       92% ║                  │
│  ║  └────┴────┘     ║ ╚════════════════════╝                  │
│  ╚════════════════════╝                                        │
│                                                                  │
│  ╔═══════════╗ ╔═══════════╗ ╔═══════════╗                     │
│  ║ TRENDING  ║ ║ INVENTORY ║ ║ ACTIVITY  ║                     │
│  ║ Maxi +145%║ ║ Low Stock ║ ║ Order +2m ║                     │
│  ║ Crop +98% ║ ║ Critical  ║ ║ Review +1h║                     │
│  ║ Platform  ║ ║ Restock   ║ ║ Publish +3║                     │
│  ╚═══════════╝ ╚═══════════╝ ╚═══════════╝                     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
FashionDashboardPage
├── GradientOrbs (Background)
├── Header (Sticky)
│   ├── Logo
│   ├── TitleSection
│   └── ThemeSwitcher
├── KPIRow
│   └── FashionKPICard × 4
├── SizeCurveChart
│   ├── SizeRow × 6
│   │   ├── SizeLabel
│   │   ├── InventoryBar
│   │   ├── SalesVelocity
│   │   └── RiskBadge
│   └── SummaryStats
├── VisualMerchandisingBoard
│   └── ProductCard × 8
│       ├── ProductImage
│       ├── PerformanceBadge
│       └── StatsOverlay
├── CollectionPerformance
│   └── CollectionItem × 4
├── TrendingProducts
├── InventoryAlerts
└── RecentActivity
```

### Color Palette

**Primary Gradient:** `linear-gradient(135deg, #F472B6 0%, #FDB4A4 50%, #FCD34D 100%)`  
**Background Base:** `#FFF5F7` (Light Pink)  
**Card Background:** `rgba(255, 255, 255, 0.85)` with `backdrop-filter: blur(20px)`  
**Card Border:** `rgba(255, 255, 255, 0.4)`  
**Text Primary:** `#1F2937`  
**Text Secondary:** `#6B7280`  
**Accent Glow:** `rgba(236, 72, 153, 0.3)`

### Theme Presets (5 Variants)

1. **Rose Gold** - Pink → Peach → Yellow
2. **Ocean Breeze** - Blue → Cyan → Teal
3. **Forest Mist** - Green → Emerald (Your Request)
4. **Midnight Luxe** - Purple → Indigo
5. **Sunset Vibes** - Orange → Coral

### API Integration Map

#### Existing APIs to Connect:
```typescript
// Dashboard Overview Data
GET /api/dashboard/overview
  ├── revenue → KPI Card 1
  ├── orders → KPI Card 2
  ├── conversionRate → KPI Card 3
  └── recentActivity → Activity Feed

// Fashion-Specific Endpoints (New)
GET /api/dashboard/fashion/size-curve
  ├── sizes[] → SizeCurveChart
  ├── inventory[] → Bar lengths
  ├── sales[] → Velocity indicators
  └── stockoutRisk → Risk badges

GET /api/dashboard/fashion/collection-performance
  └── collections[] → CollectionPerformance cards

GET /api/dashboard/fashion/trending-products
  └── products[] → TrendingProducts list

GET /api/dashboard/inventory/alerts
  └── alerts[] → InventoryAlerts cards
```

#### New APIs Needed:
```typescript
// Visual Merchandising
POST /api/dashboard/fashion/merchandising/reorder
  Body: { itemIds: string[] }
  
GET /api/dashboard/fashion/visual-merchandise
  Returns: { items: ProductCard[] }

// Analytics
GET /api/dashboard/fashion/sell-through-rate
  Returns: { rate: number, trend: number }

GET /api/dashboard/fashion/return-analysis
  Returns: { rate: number, reasons: PieData[] }
```

### Data Flow Architecture

```
User Opens Fashion Dashboard
         ↓
[Frontend] FashionDashboardPage.tsx mounts
         ↓
[VayvaThemeProvider] Applies 'glass' category + 'rose-gold' preset
         ↓
[Parallel API Calls]
    ├─ GET /api/dashboard/overview → KPIs
    ├─ GET /api/dashboard/fashion/size-curve → SizeChart
    ├─ GET /api/dashboard/fashion/collection-performance → Collections
    ├─ GET /api/dashboard/fashion/visual-merchandise → Product Cards
    ├─ GET /api/dashboard/fashion/trending → Trending List
    └─ GET /api/dashboard/inventory/alerts → Alerts
         ↓
[Components Render]
    ├─ GradientOrbs animate in background
    ├─ KPI cards display with gradient text
    ├─ SizeCurveChart shows inventory bars
    ├─ VisualMerchandisingBoard enables drag-drop
    └─ All widgets show real-time data
         ↓
[User Interactions]
    ├─ Theme switcher → Updates CSS variables
    ├─ Drag product → POST reorder API
    ├─ Click alert → Navigate to inventory
    └─ Export report → Generate PDF
```

### Key Features

1. **Size Curve Analysis** - Prevent stockouts with visual inventory distribution
2. **Visual Merchandising** - Drag-and-drop to curate homepage featuring
3. **Sell-Through Tracking** - Real-time rate calculations
4. **Return Analytics** - Understand why items are returned
5. **Trend Forecasting** - AI-powered trending products

---

## 2. Restaurant/Food Service Dashboard

### Design Category: **Bold Energy (FOH)** + **Modern Dark (KDS)** 🎨

### Visual Layout Diagram - Front of House

```
┌─────────────────────────────────────────────────────────────────┐
│                      HEADER (Black Bold)                         │
│  ════════════════════════════════════════════════════════════  │
│  [Logo]    TODAY'S COVERS: 247    [Manager: Sarah]              │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║ SALES TICKER (Scrolling)                                 ║  │
│  ║ ▶ $12,450 ▲ 18%  |  +$245 (12:34pm Dine-in)             ║  │
│  ║ | +$89 (12:32pm Takeout) | +$312 (12:30pm Delivery)     ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔════════╗ ╔══════════════════════════════════════════════╗  │
│  ║        ║ ║  KPI ROW                                      ║  │
│  ║  NAV   ║ ║  ┌────────┐ ┌────────┐ ┌────────┐           ║  │
│  ║        ║ ║  │ Today  │ │ Labor  │ │ Food   │           ║  │
│  ║ Menu   ║ ║  │ $4.2K  │ │ Cost   │ │ Cost   │           ║  │
│  ║ Orders ║ ║  │ ▲ 15%  │ │ 28% ▼  │ │ 31% ▲  │           ║  │
│  ║ Tables ║ ║  └────────┘ └────────┘ └────────┘           ║  │
│  ║ Reserv.║ ║                                                ║  │
│  ║ Staff  ║ ║  ╔════════════════════════════════════════╗  ║  │
│  ║ Reports║ ║  ║ TOP SELLERS TODAY                     ║  ║  │
│  ║ Settings║║  ║ 1. Truffle Pasta   ▓▓▓▓▓▓▓▓░ 85 orders║  ║  │
│  ╚════════╝ ║  ║ 2. Wagyu Burger    ▓▓▓▓▓▓░░░ 67 orders║  ║  │
│             ║  ║ 3. Caesar Salad    ▓▓▓▓▓░░░░ 45 orders║  ║  │
│             ║  ╚════════════════════════════════════════╝  ║  │
│             ╚══════════════════════════════════════════════╝  │
│                                                                  │
│  ╔══════════════════════╗ ╔══════════════════════╗             │
│  ║ TABLE STATUS GRID    ║ ║ RESERVATIONS TIMELINE║             │
│  ║ ┌────┬────┬────┐    ║ ║ 12:00 ▓▓▓▓▓░░░░░ 8   ║             │
│  ║ │ T1 │ T2 │ T3 │    ║ ║ 12:30 ▓▓▓▓▓▓▓░░░ 12  ║             │
│  ║ │Occ │Avl │Res │    ║ ║ 13:00 ▓▓▓▓▓▓▓▓▓░ 16  ║             │
│  ║ ├────┼────┼────┤    ║ ║ 13:30 ▓▓▓▓▓▓░░░░ 10  ║             │
│  ║ │ T4 │ T5 │ T6 │    ║ ╚══════════════════════╝             │
│  ║ │Occ │Dir │Occ │    ║                                     │
│  ║ └────┴────┴────┘    ║                                     │
│  ╚══════════════════════╝ ╚══════════════════════╝             │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Visual Layout Diagram - Kitchen Display (KDS)

```
┌─────────────────────────────────────────────────────────────────┐
│                    KDS HEADER (Dark Mode)                        │
│  ≡ KDS ACTIVE ORDERS: 14    ████████░░ 78% On Track             │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│ [GRID LINES - Subtle Cyan Glow Background]                      │
│                                                                  │
│  ┌──────────────┐ ┌──────────────┐ ┌──────────────┐            │
│  │ ORDER #247   │ │ ORDER #248   │ │ ORDER #249   │            │
│  │ ⏱️ 12:34    │ │ ⏱️ 12:36    │ │ ⏱️ 12:38    │            │
│  │ 📍 TABLE 5   │ │ 📍 TABLE 12  │ │ 📍 TAKEOUT   │            │
│  ├──────────────┤ ├──────────────┤ ├──────────────┤            │
│  │ APPETIZERS   │ │ STARTERS     │ │ MAIN         │            │
│  │ • 2x Bruschetta│ • 1x Calamari│ │ • 4x Wings   │            │
│  │              │ │              │ │ • 2x Sliders │            │
│  │ MAIN COURSE  │ │ MAIN         │ │              │            │
│  │ • 2x Pasta   │ │ • 1x Steak   │ │ SPECIAL REQ  │            │
│  │ • 1x Salmon  │ │   ● Medium   │ │ • No onions  │            │
│  │ ‼️ ALLERGY  │ │ • 2x Wine    │ │              │            │
│  │   Gluten-free│ │              │ │              │            │
│  ├──────────────┤ ├──────────────┤ ├──────────────┤            │
│  │ [ACCEPT]     │ │ [READY]      │ │ [NEW]        │            │
│  │ [DELAY]      │ │ [PLATE]      │ │ [START]      │            │
│  └──────────────┘ └──────────────┘ └──────────────┘            │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ 86 BOARD (Item Availability)                             │  │
│  │ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐    │  │
│  │ │ Branzino │ │ Lobster  │ │ Duck     │ │ Truffle  │    │  │
│  │ │   86'D   │ │  3 LEFT  │ │   86'D   │ │  8 LEFT  │    │  │
│  │ │   🔴    │ │  🟡     │ │   🔴    │ │  🟢     │    │  │
│  │ └──────────┘ └──────────┘ └──────────┘ └──────────┘    │  │
│  └──────────────────────────────────────────────────────────┘  │
│                                                                  │
│  > Order #246 completed at 12:32                                │
│  > 86'd: Branzino (0 left) - 12:30                              │
│  > New reservation: Table 8, 4 guests, 1:00pm                   │
└─────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy - FOH

```
RestaurantDashboardFOH
├── BoldHeader
│   ├── Logo
│   ├── CoversCounter
│   └── ManagerBadge
├── SalesTicker
│   └── TransactionItem × many
├── NavigationSidebar
│   └── NavItem × 8
├── KPIRow
│   └── RestaurantKPICard × 3
├── TopSellersList
│   └── MenuItemCard × 3
├── TableStatusGrid
│   └── TableCard × 16
└── ReservationsTimeline
    └── TimeSlot × 24
```

### Component Hierarchy - KDS

```
KitchenDisplaySystem
├── KDSHeader
│   ├── ActiveOrdersCount
│   └── OnTrackPercentage
├── GridBackground (Animated)
├── OrderQueue
│   └── OrderCard × 14
│       ├── OrderHeader
│       │   ├── OrderNumber
│       │   ├── Timer
│       │   └── TableInfo
│       ├── CourseSection
│       │   ├── Appetizers[]
│       │   ├── Mains[]
│       │   └── AllergyAlert
│       └── ActionButtons
│           ├── AcceptButton
│           ├── DelayButton
│           └── ReadyButton
├── EightySixBoard
│   └── ItemStatus × many
└── ActivityFeed
    └── ActivityItem × many
```

### Color Palette - FOH (Bold Energy)

**Background:** `#FFFFFF`  
**Accent Primary:** `#DC2626` (Chili Red)  
**Accent Secondary:** `#F59E0B` (Mustard)  
**Accent Tertiary:** `#10B981` (Basil Green)  
**Borders:** `#000000` (3px solid)  
**Shadows:** `#000000` (Hard, no blur)  
**Text Primary:** `#000000`  
**Text Secondary:** `#6B7280`

### Color Palette - KDS (Modern Dark)

**Background:** `#0D0D0D`  
**Card Background:** `rgba(30, 30, 30, 0.95)`  
**Border:** `rgba(99, 102, 241, 0.2)`  
**Neon Cyan:** `#00FFFF` (Timers, accents)  
**Neon Green:** `#39FF14` (Success)  
**Alert Red:** `#FF073A` (Urgent)  
**Warning Orange:** `#FF9F1C`  
**Text Primary:** `#E5E7EB`  
**Text Dim:** `#6B7280`

### Theme Presets - FOH (5 Variants)

1. **Spicy Red** - Red primary, yellow secondary
2. **Citrus Burst** - Orange primary, lime secondary
3. **Basil Green** - Green primary, teal secondary
4. **Charcoal** - Gray primary, blue secondary
5. **Ocean Blue** - Blue primary, cyan secondary

### API Integration Map - Restaurant

#### Existing APIs:
```typescript
// Dashboard Core
GET /api/dashboard/overview
  ├── revenue → Today's Revenue KPI
  ├── orders → Total Orders
  └── recentActivity → Activity Feed

// Orders
GET /api/orders?date=today
  ├── orders[] → Sales Ticker transactions
  └── order.items → Top Sellers calculation

GET /api/dashboard/recent-orders
  └── orders → KDS Order Queue

// Bookings/Reservations
GET /api/bookings?date=today
  └── bookings[] → Reservations Timeline
```

#### New APIs Needed - FOH:
```typescript
// Real-time Sales
GET /api/dashboard/restaurant/sales-ticker
  Returns: { 
    todayTotal: number,
    percentChange: number,
    recentTransactions: Transaction[]
  }

GET /api/dashboard/restaurant/top-sellers
  Returns: { items: MenuItem[] }

GET /api/dashboard/restaurant/table-status
  Returns: { tables: TableStatus[] }

GET /api/dashboard/restaurant/labor-cost
  Returns: { 
    currentCost: number,
    projectedCost: number,
    percentOfSales: number
  }

GET /api/dashboard/restaurant/food-cost
  Returns: { 
    currentCost: number,
    idealCost: number,
    variance: number
  }
```

#### New APIs Needed - KDS:
```typescript
// Kitchen Display
GET /api/dashboard/restaurant/kds/active-orders
  Returns: { 
    orders: Order[],
    avgPrepTime: number,
    onTrackPercent: number
  }

POST /api/dashboard/restaurant/kds/order/:id/status
  Body: { status: 'accepted' | 'delayed' | 'ready' | 'plated' }

// 86 Board
GET /api/dashboard/restaurant/eighty-six
  Returns: { items: EightySixItem[] }

PUT /api/dashboard/restaurant/eighty-six/:itemId
  Body: { quantity: number, status: 'available' | 'low' | '86d' }

// Course Timing
GET /api/dashboard/restaurant/course-timing
  Returns: { 
    avgAppetizerTime: number,
    avgMainTime: number,
    bottlenecks: string[]
  }

// WebSocket for Real-time Updates
WS /ws/kds-updates
  Events: 
    - new-order
    - order-status-change
    - item-86d
    - reservation-seated
```

### Data Flow Architecture - Restaurant

```
User Opens Restaurant Dashboard
         ↓
[FOH Flow]
├─ Apply 'bold' design category
├─ Parallel API calls:
│   ├─ GET /dashboard/overview → KPIs
│   ├─ GET /orders?date=today → Sales Ticker + Top Sellers
│   ├─ GET /bookings?date=today → Reservations
│   ├─ GET /restaurant/table-status → Table Grid
│   └─ GET /restaurant/labor-cost → Labor KPI
└─ Render Bold components with hard shadows

[KDS Flow - Separate Screen]
├─ Apply 'dark' design category
├─ WebSocket connection: /ws/kds-updates
├─ Initial load:
│   └─ GET /kds/active-orders → Order Queue
├─ Real-time updates:
│   ├─ new-order → Add OrderCard
│   ├─ order-status-change → Update timer color
│   └─ item-86d → Flash 86 Board
└─ User actions:
    ├─ Click Accept → POST order/:id/status
    ├─ Toggle 86 item → PUT eighty-six/:id
    └─ Complete course → Emit course-complete WS
```

### Key Features - Restaurant

**Front of House:**
1. **Live Sales Ticker** - Scrolling real-time transaction feed
2. **Table Status Grid** - Visual table availability (color-coded)
3. **Top Sellers Tracker** - Menu performance rankings
4. **Labor/Food Cost Monitoring** - Real-time margin tracking
5. **Reservation Timeline** - Upcoming bookings visualization

**Kitchen Display (KDS):**
1. **Order Queue Management** - Multi-card order tracking
2. **Course Timing** - Appetizer → Main coordination
3. **Allergy Alerts** - Pulsing red borders for allergies
4. **86 Board** - Real-time item availability toggles
5. **Timer System** - Color-coded urgency (green → yellow → red pulse)
6. **Multi-Screen Sync** - WebSocket real-time updates

---

*(Continuing with remaining 20 industries in next message due to length...)*

---

## API Integration Strategy

### Current API Audit

Based on your existing codebase, you have these endpoints already built:

#### ✅ Existing Dashboard APIs:
```
GET  /api/dashboard/kpis
GET  /api/dashboard/metrics
GET  /api/dashboard/overview
GET  /api/dashboard/pro-overview
GET  /api/dashboard/aggregate (optimized single call)
GET  /api/dashboard/industry-overview
GET  /api/dashboard/recent-orders
GET  /api/dashboard/recent-bookings
GET  /api/dashboard/todos-alerts
GET  /api/dashboard/inventory-alerts
GET  /api/dashboard/customer-insights
GET  /api/dashboard/earnings
GET  /api/dashboard/activity
```

#### ✅ Existing Services:
```typescript
services/dashboard.server.ts (35.6 KB)
services/dashboard-industry.server.ts (29.1 KB)
services/dashboard-optimized.server.ts (12.8 KB)
services/dashboard-alerts.ts
services/dashboard-actions.ts
```

### Integration Approach: Don't Rebuild, Extend!

**Strategy:** Use existing aggregate endpoint as base, add industry-specific extensions

#### Example: Fashion Dashboard API Call

**Before (Current):**
```typescript
const overview = await fetch('/api/dashboard/overview');
```

**After (Industry-Aware):**
```typescript
const overview = await fetch('/api/dashboard/industry-overview?industry=fashion');
// Returns base overview + fashion-specific metrics
```

### New API Structure Pattern

```typescript
// Pattern for all new industry endpoints
GET /api/dashboard/{industry}/{feature}

Examples:
GET /api/dashboard/fashion/size-curve
GET /api/dashboard/restaurant/kds/active-orders
GET /api/dashboard/retail/product-grid
```

### Data Aggregation Strategy

**Use existing `/api/dashboard/aggregate` pattern:**

```typescript
// Backend: dashboard-industry.server.ts
export async function getIndustryAggregate(industry: string, businessId: string) {
  // Get base dashboard data
  const baseData = await getDashboardAggregate(businessId);
  
  // Add industry-specific data
  const industryData = await getIndustrySpecificData(industry, businessId);
  
  return {
    ...baseData,
    industry,
    ...industryData,
  };
}

// Industry resolvers
async function getFashionData(businessId: string) {
  const [sizeCurve, collections, trends] = await Promise.all([
    getSizeCurveData(businessId),
    getCollectionPerformance(businessId),
    getTrendingProducts(businessId),
  ]);
  
  return {
    sizeCurve,
    collections,
    trends,
  };
}

async function getRestaurantData(businessId: string) {
  const [kdsOrders, topSellers, tableStatus, laborCost] = await Promise.all([
    getKDSActiveOrders(businessId),
    getTopSellers(businessId),
    getTableStatus(businessId),
    getLaborCost(businessId),
  ]);
  
  return {
    kdsOrders,
    topSellers,
    tableStatus,
    laborCost,
  };
}
```

### WebSocket Architecture for Real-Time

**For KDS, Live Sales, Activity Feeds:**

```typescript
// Backend: WebSocket server
import { WebSocketServer } from 'ws';

const wss = new WebSocketServer({ path: '/ws/kds-updates' });

wss.on('connection', (ws, req) => {
  const businessId = extractBusinessId(req);
  
  // Subscribe to business channel
  subscribeToUpdates(businessId, (update) => {
    ws.send(JSON.stringify(update));
  });
  
  ws.on('message', async (message) => {
    const data = JSON.parse(message);
    
    // Handle user actions
    if (data.type === 'ORDER_STATUS_CHANGE') {
      await updateOrderStatus(data.orderId, data.status);
      broadcastToBusiness(businessId, {
        type: 'ORDER_UPDATED',
        orderId: data.orderId,
      });
    }
  });
});

// Frontend: Hook for KDS
function useKDSUpdates(businessId: string) {
  useEffect(() => {
    const ws = new WebSocket(`wss://vayva.com/ws/kds-updates?businessId=${businessId}`);
    
    ws.onmessage = (event) => {
      const update = JSON.parse(event.data);
      // Update React Query cache
      queryClient.setQueryData(['kds-orders', businessId], (old) => {
        return applyUpdate(old, update);
      });
    };
    
    return () => ws.close();
  }, [businessId]);
}
```

### Migration Plan for Existing Dashboards

**Phase 1: Run Parallel (Weeks 1-4)**
- New industry dashboards use new components
- Old dashboards continue using existing design
- No breaking changes

**Phase 2: Gradual Migration (Weeks 5-12)**
- Invite existing users to try new dashboards
- Collect feedback
- Iterate on design

**Phase 3: Sunset Old Design (Weeks 13-24)**
- Redirect old URLs to new dashboards
- Keep feature parity
- Deprecate old components

---

## Implementation Checklist

### For Each Industry Dashboard:

**Design Phase:**
- [ ] Create ASCII layout diagram
- [ ] Define design category
- [ ] Specify color palette (hex codes)
- [ ] List 5 theme presets
- [ ] Document all components needed

**Development Phase:**
- [ ] Build industry-specific components
- [ ] Implement theme presets
- [ ] Create dashboard page layout
- [ ] Add animations/transitions

**API Integration:**
- [ ] Audit existing endpoints that can be reused
- [ ] Define new API endpoints needed
- [ ] Implement backend resolvers
- [ ] Set up WebSocket for real-time features
- [ ] Test data flow end-to-end

**Testing:**
- [ ] Test all 5 theme presets
- [ ] Verify responsive design
- [ ] Check accessibility (WCAG AA)
- [ ] Load test API endpoints
- [ ] User acceptance testing

**Deployment:**
- [ ] Deploy to staging
- [ ] QA sign-off
- [ ] Deploy to production
- [ ] Monitor error rates
- [ ] Gather user feedback

---

**Document Status:** In Progress - 2 of 22 industries detailed  
**Next:** Complete remaining 20 industry diagrams + API specs

Would you like me to continue with the remaining 20 industries in this same detailed format?
