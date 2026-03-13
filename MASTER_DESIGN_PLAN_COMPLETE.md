# VAYVA INDUSTRY DASHBOARD - MASTER DESIGN PLAN
## Complete Specifications for All 22 Industries

**Document Version:** 1.0  
**Last Updated:** March 10, 2026  
**Purpose:** Comprehensive visual diagrams, component specifications, and API integration strategy for all industry dashboards

---

## TABLE OF CONTENTS

1. [Design System Overview](#design-system-overview)
2. [5 Design Categories](#5-design-categories)
3. [Industry Assignments](#industry-assignments)
4. [Fashion Dashboard (Premium Glass)](#fashion-dashboard-premium-glass)
5. [Restaurant Dashboard (Bold Energy + Modern Dark)](#restaurant-dashboard-bold-energy--modern-dark)
6. [API Integration Strategy](#api-integration-strategy)

---

## DESIGN SYSTEM OVERVIEW

### Foundation Components (Already Built)

All dashboards leverage these core components from `/Frontend/merchant-admin/src/components/vayva-ui/`:

- **VayvaCard.tsx**: 5 variants (default, glass, bold, dark, natural)
- **VayvaButton.tsx**: 5 variants (primary, secondary, outline, ghost, danger)
- **VayvaThemeProvider.tsx**: Theme context with category switching
- **vayva-design-system.css**: 100+ CSS variables for design tokens

### Visual Design Principles

1. **8px Grid System**: All spacing uses 4px, 8px, 12px, 16px, 24px, 32px increments
2. **Soft Shadows**: `0 4px 24px rgba(0,0,0,0.08)` standard for cards
3. **Accessible Contrast**: WCAG 2.1 AA compliance (4.5:1 minimum)
4. **Smooth Transitions**: `200ms cubic-bezier(0.4, 0, 0.2, 1)` default
5. **Responsive First**: Mobile breakpoints at 640px, 768px, 1024px, 1280px

---

## 5 DESIGN CATEGORIES

### 1. Signature Clean (10 Industries)
**Characteristics:** White backgrounds, subtle grays, clean typography, minimal shadows  
**Best For:** Professional services, SaaS, education, healthcare, retail  
**CSS Selector:** `[data-design-category="signature"]`

### 2. Premium Glass (5 Industries)
**Characteristics:** Glassmorphism, backdrop blur, rose-gold/purple gradients, ethereal feel  
**Best For:** Fashion, beauty, real estate, luxury brands  
**CSS Selector:** `[data-design-category="glass"]`

### 3. Modern Dark (5 Industries)
**Characteristics:** Dark backgrounds (#0D0D0D), neon accents, high contrast  
**Best For:** KDS, automotive, SaaS analytics, tech platforms  
**CSS Selector:** `[data-design-category="dark"]`

### 4. Bold Energy (2 Industries)
**Characteristics:** Thick borders, solid shadows, vibrant colors, dynamic layouts  
**Best For:** Restaurant FOH, events/nightlife  
**CSS Selector:** `[data-design-category="bold"]`

### 5. Natural Warmth (5 Industries)
**Characteristics:** Earth tones, warm yellows, organic shapes, soft gradients  
**Best For:** Grocery, wellness, travel, nonprofit, food markets  
**CSS Selector:** `[data-design-category="natural"]`

---

## INDUSTRY ASSIGNMENTS

| Industry | Design Category | Priority | Status |
|----------|----------------|----------|--------|
| 1. Fashion | Premium Glass | High | ✅ Spec Complete |
| 2. Restaurant (FOH) | Bold Energy | High | ✅ Spec Complete |
| 2b. Restaurant (KDS) | Modern Dark | High | ✅ Spec Complete |
| 3. Retail/E-commerce | Signature Clean | High | ⏳ Pending |
| 4. Real Estate | Premium Glass | Medium | ⏳ Pending |
| 5. Healthcare | Signature Clean | Medium | ⏳ Pending |
| 6. Beauty/Cosmetics | Premium Glass | Medium | ⏳ Pending |
| 7. Events/Nightlife | Bold Energy | Medium | ⏳ Pending |
| 8. Automotive | Modern Dark | Medium | ⏳ Pending |
| 9. Travel/Hospitality | Natural Warmth | Low | ⏳ Pending |
| 10. Nonprofit | Natural Warmth | Low | ⏳ Pending |
| 11. Education | Signature Clean | Low | ⏳ Pending |
| 12. Services | Signature Clean | Low | ⏳ Pending |
| 13. Creative/Arts | Premium Glass | Low | ⏳ Pending |
| 14. Grocery/Food Market | Natural Warmth | Low | ⏳ Pending |
| 15. Wholesale/B2B | Signature Clean | Low | ⏳ Pending |
| 16. Marketplace | Signature Clean | Low | ⏳ Pending |
| 17. Blog/Media | Signature Clean | Low | ⏳ Pending |
| 18. SaaS/Tech | Modern Dark | Low | ⏳ Pending |
| 19. Bar/Lounge | Bold Energy | Low | ⏳ Pending |
| 20. Wellness/Fitness | Natural Warmth | Low | ⏳ Pending |
| 21. Professional Services | Signature Clean | Low | ⏳ Pending |
| 22. Salon/Spa | Premium Glass | Low | ⏳ Pending |

---

## FASHION DASHBOARD - PREMIUM GLASS

### Industry Context
Fashion merchants need visual merchandising tools, size curve analytics, trend forecasting, and inventory visualization with an elegant, aspirational aesthetic.

### Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VAYVA HEADER                                                               │
│  [Logo]  Fashion Dashboard    [+ New Collection]  [🔔] [⚙️] [👤]           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📊 SALES PERFORMANCE (Today vs Last Week)                            │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │   $12,450    │  │    +18.5%    │  │     342      │              │   │
│  │  │  Revenue     │  │  Conversion  │  │   Orders     │              │   │
│  │  │   ↑ 12.3%    │  │   ↑ 3.2%     │  │   ↑ 8.7%     │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  │                                                                      │   │
│  │  [▇▇▇▇▇▇▇▇▇▇ Line Chart: Hourly Sales Trend ▇▇▇▇▇▇▇▇▇▇]            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐  ┌────────────────────────────────────┐   │
│  │ 👗 SIZE CURVE ANALYSIS      │  │ 🎨 VISUAL MERCHANDISING BOARD      │   │
│  │                             │  │                                    │   │
│  │      XS  S  M  L  XL        │  │  ┌────┐ ┌────┐ ┌────┐ ┌────┐     │   │
│  │     ▃▅▇▆▄                   │  │  │IMG │ │IMG │ │IMG │ │IMG │     │   │
│  │    ─────────────────        │  │  └────┘ └────┘ └────┘ └────┘     │   │
│  │    Best Sellers: M, L       │  │  Summer '26 Collection Grid      │   │
│  │    Restock Alert: S         │  │                                    │   │
│  │                             │  │  [View All Products →]            │   │
│  │  [View Size Report →]       │  └────────────────────────────────────┘   │
│  └─────────────────────────────┘                                            │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📦 INVENTORY BY CATEGORY                                           │   │
│  │                                                                     │   │
│  │  Dresses    [████████░░]  78%  ↓ Low Stock                        │   │
│  │  Tops       [██████░░░░]  62%  ✓ Healthy                          │   │
│  │  Bottoms    [█████░░░░░]  54%  ✓ Healthy                          │   │
│  │  Accessories[███░░░░░░░]  31%  ⚠ Reorder Soon                     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐  ┌────────────────────────────────────┐   │
│  │ 🔥 TRENDING PRODUCTS        │  │ 📈 FORECAST & INSIGHTS            │   │
│  │                             │  │                                    │   │
│  │  1. Floral Maxi Dress      │  │  Next Week Prediction:            │   │
│  │     $89 | 234 sold         │  │  • Revenue: $145K (+12%)          │   │
│  │  2. Denim Jacket           │  │  • Top Category: Dresses          │   │
│  │     $129 | 189 sold        │  │  • Recommended Action:            │   │
│  │  3. Linen Pants            │  │    Restock size M in bestsellers  │   │
│  │     $79 | 156 sold         │  │                                    │   │
│  │                             │  │  [View Full Forecast →]           │   │
│  │  [See All →]                │  └────────────────────────────────────┘   │
│  └─────────────────────────────┘                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
FashionDashboard
├── VayvaThemeProvider (category="glass", preset="rose-gold")
├── DashboardHeader
│   ├── VayvaLogo
│   ├── PageTitle ("Fashion Dashboard")
│   ├── PrimaryButton ("+ New Collection")
│   └── IconButtonGroup (Notifications, Settings, Profile)
├── SalesPerformanceSection
│   ├── VayvaCard (variant="glass")
│   │   ├── CardHeader (title="Sales Performance", subtitle="Today vs Last Week")
│   │   ├── KPICardGrid
│   │   │   ├── FashionKPICard (value="$12,450", label="Revenue", trend="+12.3%")
│   │   │   ├── FashionKPICard (value="+18.5%", label="Conversion", trend="+3.2%")
│   │   │   └── FashionKPICard (value="342", label="Orders", trend="+8.7%")
│   │   └── LineChart (hourly sales data)
│   └── GradientOrbs (decorative background elements)
├── SizeCurveAnalysisPanel
│   └── VayvaCard (variant="glass")
│       ├── CardHeader (title="Size Curve Analysis")
│       ├── SizeCurveChart (XS-XL distribution)
│       └── SizeInsightsList (best sellers, restock alerts)
├── VisualMerchandisingBoard
│   └── VayvaCard (variant="glass")
│       ├── CardHeader (title="Visual Merchandising Board")
│       ├── ProductImageGrid (4-column layout)
│       └── ViewAllLink
├── InventoryByCategory
│   └── VayvaCard (variant="glass")
│       ├── CardHeader (title="Inventory by Category")
│       └── ProgressBarList (stock levels with status indicators)
├── TrendingProductsWidget
│   └── VayvaCard (variant="glass")
│       ├── CardHeader (title="Trending Products")
│       ├── ProductListItem (rank, name, price, units sold)
│       └── SeeAllLink
└── ForecastInsightsPanel
    └── VayvaCard (variant="glass")
        ├── CardHeader (title="Forecast & Insights")
        ├── PredictionList (AI-powered recommendations)
        └── ViewFullReportLink
```

### Color Palette

**Primary Colors:**
- Rose Gold: `#E0BFB8`
- Dusty Rose: `#D4A59A`
- Champagne: `#F7E7CE`
- Soft Blush: `#FFE5E5`

**Accent Colors:**
- Deep Burgundy: `#800020` (for CTAs, important states)
- Muted Lavender: `#B8A8D6` (secondary accent)

**Neutral Base:**
- Pure White: `#FFFFFF` (card backgrounds)
- Warm Gray: `#F5F5F5` (section backgrounds)
- Cool Gray: `#9CA3AF` (text secondary)
- Charcoal: `#374151` (text primary)

**Gradient Presets:**
```css
--gradient-rose: linear-gradient(135deg, #E0BFB8 0%, #F7E7CE 100%);
--gradient-sunset: linear-gradient(135deg, #FFE5E5 0%, #D4A59A 100%);
--gradient-lavender: linear-gradient(135deg, #B8A8D6 0%, #E0BFB8 100%);
```

### Theme Presets (5 Options)

1. **Rose Gold** (Default): Soft pinks, champagne, elegant warmth
2. **Midnight Luxe**: Deep navy, gold accents, sophisticated darkness
3. **Minimal Chic**: Stark white, black text, single accent color
4. **Earth Tone**: Terracotta, sage green, natural materials feel
5. **Monochrome**: Grayscale with texture variation

### API Integration Map

#### Existing Endpoints to Leverage

```typescript
// From Backend/core-api/src/routes/analytics.ts
GET /api/analytics/sales?period=today&compare=last_week
GET /api/analytics/conversion?startDate=&endDate=
GET /api/analytics/products/trending?limit=10&category=fashion

// From Backend/core-api/src/routes/inventory.ts
GET /api/inventory/levels?category=all&lowStock=true
GET /api/inventory/categories/summary

// From Backend/core-api/src/routes/products.ts
GET /api/products?status=active&sortBy=soldCount&order=desc
GET /api/products/:id/images
```

#### New Endpoints to Create

```typescript
// Fashion-specific analytics
GET /api/industries/fashion/size-curve
  Response: {
    sizes: { XS: number, S: number, M: number, L: number, XL: number },
    bestSellers: string[],
    restockAlerts: Array<{ productId: string, size: string, currentStock: number }>
  }

GET /api/industries/fashion/visual-merchandising
  Response: {
    featuredCollection: { id, name, images: string[] },
    gridLayout: '2x2' | '4x1' | 'masonry',
    lastUpdated: timestamp
  }

GET /api/industries/fashion/inventory-by-category
  Response: {
    categories: Array<{
      name: string,
      stockLevel: number,
      totalCapacity: number,
      percentage: number,
      status: 'low' | 'healthy' | 'overstocked'
    }>
  }

GET /api/industries/fashion/forecast
  Response: {
    nextWeekRevenue: number,
    growthPercentage: number,
    topCategory: string,
    recommendedActions: string[],
    confidenceScore: number
  }
```

#### WebSocket Integration

```typescript
// Real-time updates for time-sensitive data
ws://localhost:3001/ws/fashion-dashboard

// Subscribe to channels
{ action: 'subscribe', channels: ['sales-live', 'inventory-alerts'] }

// Receive updates
{
  type: 'sales-update',
  payload: { currentHour: '$1,234', change: '+5.2%' }
}

{
  type: 'inventory-alert',
  payload: { productId: '123', size: 'M', newStockLevel: 3 }
}
```

### Key Features

1. **Size Curve Visualization**: Interactive bar chart showing size distribution
2. **Visual Merchandising Board**: Drag-and-drop product image grid
3. **Glassmorphism Cards**: Backdrop blur with rose-gold gradient overlays
4. **Trend Forecasting**: AI-powered predictions based on historical data
5. **Real-time Sales Ticker**: Live revenue updates via WebSocket

---

## RESTAURANT DASHBOARD - BOLD ENERGY + MODERN DARK

**Note:** Restaurant industry requires TWO separate dashboards:
1. **FOH (Front of House)**: Bold Energy design for managers/servers
2. **KDS (Kitchen Display System)**: Modern Dark design for kitchen staff

---

### RESTAURANT FOH - BOLD ENERGY DESIGN

#### Industry Context
Fast-paced restaurant environment needs high-contrast, easy-to-read displays with bold colors indicating table status, order urgency, and server performance.

#### Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VAYVA HEADER - BOLD                                                        │
│  [Logo]  Restaurant Manager    [⚡ Quick Order]  [🔔 3] [⚙️] [👤]           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ⏰ TODAY'S PERFORMANCE                                              │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │   $8,924     │  │     142      │  │    4.8★      │              │   │
│  │  │   REVENUE    │  │   GUESTS     │  │   RATING     │              │   │
│  │  │   vs $7.2K   │  │   vs 118     │  │   vs 4.6     │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 🪑 FLOOR PLAN - LIVE STATUS                                        │   │
│  │                                                                      │   │
│  │   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                              │   │
│  │   │ T1  │  │ T2  │  │ T3  │  │ T4  │                              │   │
│  │   │●Occ │  │○Avl │  │◐Turn│  │●Occ │                              │   │
│  │   │Smith│  │     │  │Cleaning│ │Jones│                              │   │
│  │   └─────┘  └─────┘  └─────┘  └─────┘                              │   │
│  │                                                                      │   │
│  │   ┌─────┐  ┌─────┐  ┌─────┐  ┌─────┐                              │   │
│  │   │ T5  │  │ T6  │  │ T7  │  │ T8  │                              │   │
│  │   │●Occ │  │●Occ │  │○Avl │  │◐Res │                              │   │
│  │   │Davis│  │Wilson│  │     │  │7:30pm│                              │   │
│  │   └─────┘  └─────┘  └─────┘  └─────┘                              │   │
│  │                                                                      │   │
│  │  Legend: ● Occupied  ○ Available  ◐ Turning  ■ Reserved            │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐  ┌────────────────────────────────────┐   │
│  │ 📋 ACTIVE ORDERS            │  │ 👥 SERVER STATION                 │   │
│  │                             │  │                                    │   │
│  │  T3 - 12 min wait          │  │  Sarah: 6 tables | $2.1K sales   │   │
│  │  T7 - 8 min wait           │  │  Mike: 5 tables | $1.8K sales    │   │
│  │  T1 - Order up! 🚨         │  │  Jen: 4 tables | $1.4K sales     │   │
│  │                             │  │                                    │   │
│  │  [View All Orders →]        │  │  [View Shift Report →]            │   │
│  └─────────────────────────────┘  └────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📊 SALES MIX                                                       │   │
│  │                                                                     │   │
│  │  Food Sales    [████████░░]  $6,234  (70%)                        │   │
│  │  Beverage      [████░░░░░░]  $2,145  (24%)                        │   │
│  │  Gratuity      [█░░░░░░░░░]   $545   (6%)                         │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Component Hierarchy (FOH)

```
RestaurantFOHDashboard
├── VayvaThemeProvider (category="bold", preset="high-energy")
├── DashboardHeader (bold variant with thick borders)
├── TodaysPerformanceSection
│   └── VayvaCard (variant="bold")
│       ├── KPICardGrid (3 columns)
│       │   ├── RevenueBlock (current vs target)
│       │   ├── GuestCountBlock (covers turned)
│       │   └── RatingBlock (average review score)
│       └── SolidShadowWrapper
├── FloorPlanGrid
│   └── VayvaCard (variant="bold", fullWidth)
│       ├── TableStatusGrid (4x2 layout)
│       │   ├── TableCard (status, guest name, duration)
│       │   └── StatusIndicator (color-coded dots)
│       └── LegendRow
├── ActiveOrdersWidget
│   └── VayvaCard (variant="bold")
│       ├── OrderAlertList (urgency-based sorting)
│       └── ViewAllLink
├── ServerStationPanel
│   └── VayvaCard (variant="bold")
│       ├── ServerPerformanceList (name, tables, sales)
│       └── ViewShiftReportLink
└── SalesMixBreakdown
    └── VayvaCard (variant="bold")
        └── ProgressBarList (food/beverage/gratuity)
```

#### Color Palette (FOH - Bold Energy)

**Primary Colors:**
- Vibrant Red: `#DC2626` (occupied tables, urgent orders)
- Energetic Orange: `#F97316` (turning tables, warnings)
- Fresh Green: `#10B981` (available tables, positive metrics)

**Neutral Base:**
- Pure White: `#FFFFFF` (card backgrounds)
- Jet Black: `#000000` (borders, text primary)
- Light Gray: `#F3F4F6` (section backgrounds)

**Status Colors:**
- Occupied: `#DC2626` with black border
- Available: `#10B981` with black border
- Turning: `#F97316` with black border
- Reserved: `#3B82F6` with black border

**Bold Design Tokens:**
```css
--border-thick: 2px solid #000000;
--shadow-solid: 4px 4px 0px #000000;
--shadow-hover: 6px 6px 0px #000000;
```

---

### KITCHEN DISPLAY SYSTEM (KDS) - MODERN DARK DESIGN

#### Industry Context
Kitchen environment requires high-contrast dark mode for reduced eye strain, color-coded timers for order urgency, and clear ticket organization during high-volume periods.

#### Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  KDS - KITCHEN DISPLAY                                                     │
│  [Vayva Logo]  Kitchen View    [🔊 Sound On] [🌙 Dark] [👨‍🍳 Chef Mode]    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📊 KITCHEN METRICS                                                  │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │    12:34     │  │      24      │  │    8:42      │              │   │
│  │  │  Avg Ticket  │  │  Active      │  │  Avg Prep    │              │   │
│  │  │    Time      │  │  Tickets     │  │    Time      │              │   │
│  │  │   ↓ 1:23     │  │   +3 pending │  │   ↓ 2:15     │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐           │   │
│  │ 🔥 GRILL STATION│  │ 🍳 COLD STATION │  │ 🍝 HOT STATION  │           │   │
│  │                 │  │                 │  │                 │           │   │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │           │   │
│  │ │ TBL 12      │ │  │ │ TBL 5       │ │  │ │ TBL 8       │ │           │   │
│  │ │ 2x Ribeye   │ │  │ │ 1x Caesar   │ │  │ │ 2x Pasta    │ │           │   │
│  │ │ 1x Salmon   │ │  │ │ 2x Wedge    │ │  │ │ 1x Risotto  │ │           │   │
│  │ │ ⏱ 14 MIN    │ │  │ │ ⏱ 6 MIN     │ │  │ │ ⏱ 11 MIN    │ │           │   │
│  │ │ [STARTED]   │ │  │ │ [PREP]      │ │  │ │ [COOKING]   │ │           │   │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │           │   │
│  │                 │  │                 │  │                 │           │   │
│  │ ┌─────────────┐ │  │ ┌─────────────┐ │  │ ┌─────────────┐ │           │   │
│  │ │ TBL 3       │ │  │ │ TBL 15      │ │  │ │ TBL 21      │ │           │   │
│  │ │ 1x Burger   │ │  │ │ 1x Soup     │ │  │ │ 2x Gnocchi  │ │           │   │
│  │ │ ⏱ 9 MIN     │ │  │ │ ⏱ 4 MIN     │ │  │ │ ⏱ 16 MIN    │ │           │   │
│  │ │ [PREP]      │ │  │ │ [READY] ✓   │ │  │ │ [QUEUED]    │ │           │   │
│  │ └─────────────┘ │  │ └─────────────┘ │  │ └─────────────┘ │           │   │
│  └─────────────────┘  └─────────────────┘  └─────────────────┘           │   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ⚠️ 86 BOARD - OUT OF STOCK                                         │   │
│  │                                                                      │   │
│  │  [Chilean Sea Bass]  [Lobster Tail]  [Truffle Oil]                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

#### Component Hierarchy (KDS)

```
KitchenDisplaySystem
├── VayvaThemeProvider (category="dark", preset="kitchen-contrast")
├── KDSHeader
│   ├── VayvaLogo (neon variant)
│   ├── Title ("Kitchen Display")
│   ├── ToggleGroup (Sound, Theme, Chef Mode)
│   └── EmergencyStopButton (red, prominent)
├── KitchenMetricsBar
│   └── VayvaCard (variant="dark", compact)
│       ├── MetricCard (avg ticket time with trend)
│       ├── MetricCard (active tickets count)
│       └── MetricCard (avg prep time with trend)
├── StationGrid (3 columns)
│   ├── GrillStationColumn
│   │   └── VayvaCard (variant="dark", vertical)
│   │       ├── StationHeader (icon + title)
│   │       └── OrderTicketList
│   │           ├── OrderTicketCard
│   │           │   ├── TableNumber (large, bold)
│   │           │   ├── OrderItemList (quantity + item name)
│   │           │   ├── TimerDisplay (color-coded by urgency)
│   │           │   └── StatusBadge (prep/cooking/ready)
│   │           └── OrderTicketCard (multiple)
│   ├── ColdStationColumn (same structure)
│   └── HotStationColumn (same structure)
├── EightySixBoard
│   └── VayvaCard (variant="dark", full height)
│       ├── OutOfStockList (horizontal pills)
│       └── LastUpdatedTimestamp
└── WebSocketConnection (hidden, manages real-time updates)
```

#### Color Palette (KDS - Modern Dark)

**Background Colors:**
- Void Black: `#0D0D0D` (main background)
- Charcoal: `#1A1A1A` (card backgrounds)
- Gunmetal: `#2D2D2D` (elevated surfaces)

**Neon Accent Colors:**
- Electric Blue: `#6366F1` (primary actions, highlights)
- Neon Pink: `#EC4899` (urgent timers < 5 min)
- Cyber Green: `#10B981` (ready orders, positive metrics)
- Hot Orange: `#F97316` (warning timers 5-10 min)

**Timer Color Logic:**
```css
--timer-urgent: #EF4444;    /* < 5 minutes - red pulse */
--timer-warning: #F97316;   /* 5-10 minutes - orange */
--timer-normal: #10B981;    /* 10+ minutes - green */
--timer-complete: #6EE7B7;  /* ready - teal with checkmark */
```

**Glow Effects:**
```css
--neon-glow-blue: 0 0 10px rgba(99, 102, 241, 0.5);
--neon-glow-pink: 0 0 10px rgba(236, 72, 153, 0.5);
--neon-glow-green: 0 0 10px rgba(16, 185, 129, 0.5);
```

#### API Integration Map (Restaurant)

##### Existing Endpoints to Leverage

```typescript
// From Backend/core-api/src/routes/orders.ts
GET /api/orders?status=active&location=dining-room
GET /api/orders/:id/items
PUT /api/orders/:id/status

// From Backend/core-api/src/routes/tables.ts
GET /api/tables?status=all
PUT /api/tables/:id/status

// From Backend/core-api/src/routes/staff.ts
GET /api/staff/servers/performance?date=today
```

##### New Endpoints to Create

```typescript
// FOH-specific endpoints
GET /api/industries/restaurant/foh/dashboard
  Response: {
    todayRevenue: number,
    guestCount: number,
    averageRating: number,
    floorPlan: {
      tables: Array<{
        id: string,
        number: string,
        status: 'occupied' | 'available' | 'turning' | 'reserved',
        guestName?: string,
        reservationTime?: string,
        duration?: number
      }>
    },
    activeOrders: Array<{
      tableNumber: string,
      waitTime: number,
      items: string[],
      isUrgent: boolean
    }>,
    serverPerformance: Array<{
      name: string,
      tableCount: number,
      salesTotal: number
    }>
  }

// KDS-specific endpoints
GET /api/industries/restaurant/kds/tickets
  Response: {
    stations: Array<{
      name: 'grill' | 'cold' | 'hot' | 'expo',
      tickets: Array<{
        id: string,
        tableNumber: string,
        items: Array<{ name: string, quantity: number, modifiers: string[] }>,
        startTime: timestamp,
        estimatedReady: timestamp,
        status: 'queued' | 'prep' | 'cooking' | 'ready' | 'completed',
        priority: 'normal' | 'rush' | 'asap'
      }>
    }>,
    averageTicketTime: number,
    averagePrepTime: number
  }

GET /api/industries/restaurant/86-board
  Response: {
    outOfStockItems: string[],
    lowStockItems: Array<{ name: string, remaining: number }>,
    lastUpdated: timestamp
  }
```

##### WebSocket Integration (KDS)

```typescript
ws://localhost:3001/ws/kds

// Subscribe to station updates
{ action: 'subscribe', channels: ['grill', 'cold', 'hot', 'expo'] }

// Receive ticket updates
{
  type: 'ticket-created',
  station: 'grill',
  payload: {
    tableNumber: '15',
    items: [{ name: 'Ribeye', qty: 2, temp: 'medium-rare' }],
    priority: 'asap',
    timestamp: '2026-03-10T19:23:45Z'
  }
}

{
  type: 'ticket-status-change',
  ticketId: 'abc123',
  newStatus: 'ready',
  elapsedMinutes: 12
}

{
  type: '86-item',
  itemName: 'Chilean Sea Bass'
}
```

### Key Features (Restaurant)

**FOH Features:**
1. **Interactive Floor Plan**: Click tables to view details, change status
2. **Server Performance Tracker**: Real-time sales per server
3. **Order Alerts**: Automatic highlighting of expiring orders
4. **Sales Mix Breakdown**: Food vs beverage vs gratuity tracking

**KDS Features:**
1. **Color-Coded Timers**: Visual urgency indicators (green → orange → red pulse)
2. **Station Organization**: Separate columns for grill, cold, hot stations
3. **86 Board**: Real-time out-of-stock notifications
4. **Modifier Support**: Display special requests (no onions, extra sauce)
5. **Audio Cues**: Optional sound alerts for new tickets, ready orders
6. **Chef Mode**: Enlarged text, simplified UI for busy periods

---

## API INTEGRATION STRATEGY

### Architecture Overview

```
┌─────────────────────────────────────────────────────────────────┐
│                    FRONTEND (Next.js)                           │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Industry Dashboards (22 implementations)                │  │
│  │  - Fashion, Restaurant, Retail, Real Estate, etc.        │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │ HTTP/WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                   API GATEWAY (Express)                         │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  Route Handlers                                         │  │
│  │  - /api/analytics/*                                      │  │
│  │  - /api/inventory/*                                      │  │
│  │  - /api/products/*                                       │  │
│  │  - /api/industries/:industry/*                           │  │
│  └──────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
                              │
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                     ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   PostgreSQL │    │    Redis     │    │  Third-Party │
│   (Primary   │    │   (Cache,    │    │   APIs       │
│    Data)     │    │   Sessions)  │    │   (Stripe,   │
│              │    │              │    │    Twilio)   │
└──────────────┘    └──────────────┘    └──────────────┘
```

### Endpoint Reuse Strategy

#### Tier 1: Universal Endpoints (Use As-Is)

These endpoints work for ALL industries without modification:

```typescript
// Authentication & User Management
POST /api/auth/login
GET /api/users/me
PUT /api/users/me/settings

// Basic Analytics
GET /api/analytics/sales?startDate=&endDate=&groupBy=day
GET /api/analytics/customers?limit=50
GET /api/analytics/products/top-selling?limit=10

// Inventory (Core)
GET /api/inventory/items
PUT /api/inventory/items/:id
POST /api/inventory/items

// Orders
GET /api/orders?status=pending
POST /api/orders
PUT /api/orders/:id/status
```

#### Tier 2: Configurable Endpoints (Add Industry Filters)

Extend existing endpoints with industry-specific query parameters:

```typescript
// BEFORE: Generic products endpoint
GET /api/products?category=all

// AFTER: Industry-aware filtering
GET /api/products?industry=fashion&category=dresses&size=M
GET /api/products?industry=restaurant&category=menu-items&availability=available
```

Implementation in controller:
```typescript
// Backend/core-api/src/controllers/products.controller.ts
export const getProducts = async (req: Request, res: Response) => {
  const { industry, ...filters } = req.query;
  
  if (industry) {
    // Apply industry-specific filtering logic
    const industryConfig = await getIndustryConfig(industry as string);
    filters.categoryType = industryConfig.productCategoryType;
  }
  
  const products = await Product.findAll({ where: filters });
  res.json(products);
};
```

#### Tier 3: Industry-Specific Endpoints (New Routes)

Create dedicated routes under `/api/industries/:industry/`:

```typescript
// Backend/core-api/src/routes/industries/index.ts
import { Router } from 'express';
const router = Router();

// Dynamic route handler
router.use('/:industry', (req, res, next) => {
  req.industry = req.params.industry;
  next();
});

// Industry-specific modules
router.use('/fashion', fashionRoutes);
router.use('/restaurant', restaurantRoutes);
router.use('/retail', retailRoutes);
// ... 19 more industries

export default router;
```

### Data Flow Patterns

#### Pattern 1: Real-Time Dashboard Updates (WebSocket)

```typescript
// Frontend: Initialize WebSocket connection
const ws = new WebSocket('ws://localhost:3001/ws/dashboard');

ws.onopen = () => {
  // Subscribe to industry-specific channels
  ws.send(JSON.stringify({
    action: 'subscribe',
    channels: ['sales-live', 'inventory-updates', 'order-alerts']
  }));
};

ws.onmessage = (event) => {
  const data = JSON.parse(event.data);
  
  switch(data.type) {
    case 'sales-update':
      updateSalesTicker(data.payload);
      break;
    case 'inventory-low':
      showRestockAlert(data.payload);
      break;
    case 'order-urgent':
      playAlertSound();
      highlightOrder(data.payload.tableNumber);
      break;
  }
};
```

#### Pattern 2: Optimistic UI Updates

```typescript
// Frontend: Update table status with optimistic UI
const updateTableStatus = async (tableId: string, newStatus: TableStatus) => {
  // Optimistically update UI
  setTables(prev => prev.map(t => 
    t.id === tableId ? { ...t, status: newStatus } : t
  ));
  
  try {
    // Send to server
    await fetch(`/api/tables/${tableId}/status`, {
      method: 'PUT',
      body: JSON.stringify({ status: newStatus })
    });
  } catch (error) {
    // Rollback on failure
    setTables(prev => prev.map(t => 
      t.id === tableId ? { ...t, status: t.previousStatus } : t
    ));
    showErrorToast('Failed to update table status');
  }
};
```

#### Pattern 3: Cached API Responses (React Query)

```typescript
// Frontend: Use React Query for caching
import { useQuery } from '@tanstack/react-query';

export function useFashionDashboard() {
  return useQuery({
    queryKey: ['fashion-dashboard'],
    queryFn: async () => {
      const response = await fetch('/api/industries/fashion/dashboard');
      return response.json();
    },
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchInterval: 30 * 1000, // Refetch every 30 seconds
  });
}
```

### Caching Strategy

#### Redis Cache Layers

```typescript
// Backend: Multi-level caching
import { redis } from '../lib/redis';

export const getDashboardData = async (industry: string, merchantId: string) => {
  const cacheKey = `dashboard:${industry}:${merchantId}`;
  
  // Level 1: Try Redis cache (5 minute TTL)
  const cached = await redis.get(cacheKey);
  if (cached) {
    return JSON.parse(cached);
  }
  
  // Level 2: Database query
  const data = await db.query(getDashboardQuery, { industry, merchantId });
  
  // Set cache with 5 minute expiration
  await redis.setex(cacheKey, 300, JSON.stringify(data));
  
  return data;
};
```

#### Cache Invalidation Rules

```typescript
// Invalidate cache on data changes
const invalidateDashboardCache = async (industry: string, merchantId: string) => {
  const pattern = `dashboard:${industry}:${merchantId}*`;
  const keys = await redis.keys(pattern);
  
  if (keys.length > 0) {
    await redis.del(...keys);
  }
};

// Usage examples
await invalidateDashboardCache('fashion', 'merchant_123'); // After inventory update
await invalidateDashboardCache('restaurant', 'merchant_456'); // After order created
```

### Error Handling Strategy

#### Global Error Handler

```typescript
// Backend: Centralized error handling
export const errorHandler = async (err: Error, req: Request, res: Response, next: NextFunction) => {
  console.error(`[${req.industry || 'global'}] ${err.message}`, err.stack);
  
  // Industry-specific error messages
  const errorMessages: Record<string, Record<string, string>> = {
    fashion: {
      'INVENTORY_NOT_FOUND': 'Product inventory not found. Please check the SKU.',
      'SIZE_CURVE_ERROR': 'Unable to load size curve data. Please refresh.'
    },
    restaurant: {
      'TABLE_NOT_AVAILABLE': 'This table is currently occupied or reserved.',
      'KDS_SYNC_ERROR': 'Kitchen display sync failed. Reconnecting...'
    }
  };
  
  const industryErrors = errorMessages[req.industry] || {};
  const message = industryErrors[err.code] || err.message;
  
  res.status(err.statusCode || 500).json({
    success: false,
    error: {
      code: err.code,
      message,
      industry: req.industry
    }
  });
};
```

#### Frontend Error Boundaries

```typescript
// Frontend: Industry-aware error boundary
class DashboardErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error: Error) {
    return { hasError: true, error };
  }
  
  render() {
    if (this.state.hasError) {
      return (
        <VayvaCard variant={this.props.designCategory}>
          <EmptyState
            icon="⚠️"
            title="Dashboard Unavailable"
            description={getIndustryErrorMessage(this.props.industry, this.state.error)}
            actionButton={
              <VayvaButton onClick={() => window.location.reload()}>
                Refresh Dashboard
              </VayvaButton>
            }
          />
        </VayvaCard>
      );
    }
    
    return this.props.children;
  }
}
```

---

## NEXT STEPS

The remaining 20 industry dashboards follow similar specification patterns with:
- ASCII layout diagrams
- Component hierarchies
- Color palettes with hex codes
- 5 theme presets each
- API integration maps (existing + new endpoints)
- WebSocket specifications where applicable

**Proceed to MASTER_DESIGN_PLAN_PART2.md for:**
- Retail/E-commerce (Signature Clean)
- Real Estate (Premium Glass)
- Healthcare (Signature Clean)

---

*Document continues in PART2...*
