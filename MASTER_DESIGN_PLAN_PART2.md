# VAYVA INDUSTRY DASHBOARD - MASTER DESIGN PLAN PART 2
## Industries 3-5: Retail, Real Estate, Healthcare

**Document Version:** 1.0  
**Last Updated:** March 10, 2026  
**Previous Part:** MASTER_DESIGN_PLAN_COMPLETE.md (Industries 1-2)

---

## RETAIL/E-COMMERCE DASHBOARD - SIGNATURE CLEAN

### Industry Context
Retail merchants need inventory oversight, sales performance tracking across channels, product analytics, and customer insights with a clean, product-focused interface that doesn't compete with merchandise visuals.

### Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VAYVA HEADER                                                               │
│  [Logo]  Retail Dashboard    [+ Add Product]  [📦 Orders 12] [🔔] [⚙️]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📊 SALES OVERVIEW (Last 30 Days)                                    │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │   $45,280    │  │    1,234     │  │    $36.70    │              │   │
│  │  │  Revenue     │  │   Orders     │  │  Avg Order   │              │   │
│  │  │   ↑ 23.4%    │  │   ↑ 15.2%    │  │    Value     │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  │                                                                      │   │
│  │  [▇▇▇▇▇▇▇▇▇▇▇▇▇▇ Daily Sales Trend ▇▇▇▇▇▇▇▇▇▇▇▇▇▇]                 │   │
│  │  Jan 1 ───────────────────────────────────────── Jan 30             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐  ┌────────────────────────────────────┐   │
│  │ 📦 INVENTORY STATUS         │  │ 🛍️ SALES BY CHANNEL               │   │
│  │                             │  │                                    │   │
│  │  Total Products: 2,847      │  │   Online Store    [████████░░]    │   │
│  │  Low Stock: 23 ⚠️           │  │   68% ($30,790)                   │   │
│  │  Out of Stock: 5 🚨         │  │                                    │   │
│  │  Overstocked: 12 ℹ️          │  │   Marketplace     [███░░░░░░░]    │   │
│  │                             │  │   22% ($9,962)                    │   │
│  │  [View Inventory Report →]  │  │                                    │   │
│  │                             │  │   POS (In-Store)  [██░░░░░░░░]    │   │
│  │                             │  │   10% ($4,528)                    │   │
│  │                             │  │                                    │   │
│  │                             │  │  [View Channel Details →]         │   │
│  └─────────────────────────────┘  └────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 🏆 TOP PERFORMING PRODUCTS                                         │   │
│  │                                                                     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │  IMAGE   │  │  IMAGE   │  │  IMAGE   │  │  IMAGE   │          │   │
│  │  │Product A │  │Product B │  │Product C │  │Product D │          │   │
│  │  │  $49.99  │  │  $89.99  │  │  $34.99  │  │  $129.99 │          │   │
│  │  │  423 sold│  │  312 sold│  │  289 sold│  │  201 sold│          │   │
│  │  │  ★★★★☆  │  │  ★★★★★  │  │  ★★★★☆  │  │  ★★★★☆  │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │   │
│  │                                                                     │   │
│  │  [View All Products →]                                             │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐  ┌────────────────────────────────────┐   │
│  │ 🛒 ABANDONED CARTS          │  │ 📈 FORECAST & INSIGHTS            │   │
│  │                             │  │                                    │   │
│  │  128 carts (24h)           │  │  Next Month Prediction:           │   │
│  │  $8,432 potential revenue  │  │  • Revenue: $52K (+15%)           │   │
│  │                             │  │  • Best Category: Electronics     │   │
│  │  Top Items in Carts:       │  │  • Recommended Action:            │   │
│  │  • Wireless Headphones (34)│  │    Increase ad spend on top items │   │
│  │  • Running Shoes (28)      │  │                                    │   │
│  │                             │  │  [View Full Analytics →]          │   │
│  │  [Send Recovery Emails →]   │  └────────────────────────────────────┘   │
│  └─────────────────────────────┘                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
RetailDashboard
├── VayvaThemeProvider (category="signature", preset="clean-blue")
├── DashboardHeader
│   ├── VayvaLogo
│   ├── PageTitle ("Retail Dashboard")
│   ├── PrimaryButton ("+ Add Product")
│   ├── OrderBadge (count=12)
│   └── IconButtonGroup (Notifications, Settings)
├── SalesOverviewSection
│   └── VayvaCard (variant="default")
│       ├── CardHeader (title="Sales Overview", subtitle="Last 30 Days")
│       ├── KPICardGrid (3 columns)
│       │   ├── RevenueCard (value, trend percentage)
│       │   ├── OrdersCard (count, trend)
│       │   └── AOCCard (average order value)
│       └── DailySalesChart (line chart with date range)
├── TwoColumnGrid
│   ├── InventoryStatusPanel
│   │   └── VayvaCard (variant="default")
│   │       ├── CardHeader (title="Inventory Status")
│   │       ├── InventorySummaryList (total, low stock, out of stock, overstocked)
│   │       └── ViewInventoryReportLink
│   └── SalesByChannelPanel
│       └── VayvaCard (variant="default")
│           ├── CardHeader(title="Sales by Channel")
│           ├── ChannelProgressBarList (online, marketplace, POS)
│           └── ViewChannelDetailsLink
├── TopProductsSection
│   └── VayvaCard (variant="default", fullWidth)
│       ├── CardHeader (title="Top Performing Products")
│       ├── ProductGrid (4 columns)
│       │   └── ProductCard (image, name, price, units sold, rating)
│       └── ViewAllProductsLink
├── BottomTwoColumnGrid
│   ├── AbandonedCartsWidget
│   │   └── VayvaCard (variant="default")
│   │       ├── CardHeader (title="Abandoned Carts")
│   │       ├── CartSummary (count, potential revenue)
│   │       ├── TopCartItemsList (product name, count)
│   │       └── SendRecoveryEmailsButton
│   └── ForecastInsightsPanel
│       └── VayvaCard (variant="default")
│           ├── CardHeader(title="Forecast & Insights")
│           ├── PredictionList (revenue forecast, best category, recommendations)
│           └── ViewFullAnalyticsLink
└── WebSocketConnection (real-time order updates)
```

### Color Palette

**Primary Colors:**
- Clean Blue: `#3B82F6` (primary actions, links)
- Sky Blue: `#60A5FA` (hover states, highlights)
- Navy: `#1E40AF` (text primary, headers)

**Neutral Base:**
- Pure White: `#FFFFFF` (card backgrounds)
- Cool Gray 50: `#F9FAFB` (section backgrounds)
- Cool Gray 200: `#E5E7EB` (borders, dividers)
- Cool Gray 500: `#6B7280` (text secondary)
- Cool Gray 900: `#111827` (text primary)

**Status Colors:**
- Success: `#10B981` (positive trends, in stock)
- Warning: `#F59E0B` (low stock alerts)
- Error: `#EF4444` (out of stock, urgent)
- Info: `#3B82F6` (informational badges)

**Design Tokens:**
```css
--retail-primary: #3B82F6;
--retail-primary-light: #60A5FA;
--retail-primary-dark: #1E40AF;
--retail-bg-gradient: linear-gradient(180deg, #F9FAFB 0%, #FFFFFF 100%);
--retail-card-shadow: 0 4px 16px rgba(59, 130, 246, 0.08);
```

### Theme Presets (5 Options)

1. **Clean Blue** (Default): Professional blue tones, trustworthy
2. **Minimal Gray**: Monochrome with single accent color
3. **Green Growth**: Success-oriented green accents for positive metrics
4. **Purple Premium**: Sophisticated purple for luxury retail
5. **Orange Energy**: Vibrant orange for high-energy promotions

### API Integration Map

#### Existing Endpoints to Leverage

```typescript
// From Backend/core-api/src/routes/analytics.ts
GET /api/analytics/sales?period=30d&groupBy=day
GET /api/analytics/orders?status=all&limit=100
GET /api/analytics/products/top-selling?limit=10&period=30d

// From Backend/core-api/src/routes/inventory.ts
GET /api/inventory/items?lowStock=true
GET /api/inventory/items?outOfStock=true
GET /api/inventory/summary

// From Backend/core-api/src/routes/orders.ts
GET /api/orders?status=pending&limit=50
```

#### New Endpoints to Create

```typescript
// Retail-specific analytics
GET /api/industries/retail/dashboard
  Response: {
   revenue: number,
   revenueGrowth: number,
    orders: number,
    ordersGrowth: number,
    averageOrderValue: number,
    dailySales: Array<{ date: string, revenue: number, orders: number }>
  }

GET /api/industries/retail/inventory-status
  Response: {
   totalProducts: number,
   lowStock: Array<{ id: string, name: string, currentStock: number, minStock: number }>,
   outOfStock: Array<{ id: string, name: string }>,
    overstocked: Array<{ id: string, name: string, currentStock: number, maxStock: number }>
  }

GET /api/industries/retail/sales-by-channel
  Response: {
    channels: Array<{
     name: 'online' | 'marketplace' | 'pos',
     revenue: number,
      percentage: number,
      orders: number
    }>
  }

GET /api/industries/retail/abandoned-carts
  Response: {
    count: number,
    potentialRevenue: number,
   topItems: Array<{ productId: string, name: string, cartCount: number }>,
   carts: Array<{
      id: string,
      customerId: string,
      items: Array<{ productId, quantity, price }>,
     total: number,
      abandonedAt: timestamp
    }>
  }

GET /api/industries/retail/forecast
  Response: {
   nextMonthRevenue: number,
   growthPercentage: number,
    bestCategory: string,
   recommendedActions: string[],
    confidenceScore: number
  }
```

#### WebSocket Integration

```typescript
ws://localhost:3001/ws/retail-dashboard

// Subscribe to channels
{ action: 'subscribe', channels: ['orders-live', 'inventory-alerts'] }

// Receive order notifications
{
  type: 'new-order',
  payload: {
    orderId: 'ORD-12345',
   total: 149.99,
    channel: 'online',
    items: 3
  }
}

{
  type: 'inventory-low',
  payload: {
    productId: 'PROD-789',
   name: 'Wireless Headphones',
    currentStock: 5,
    minStock: 10
  }
}
```

### Key Features

1. **Multi-Channel Sales Tracking**: Online, marketplace, and POS integration
2. **Inventory Health Monitoring**: Low stock, out of stock, overstocked alerts
3. **Product Performance Grid**: Visual product cards with sales data
4. **Abandoned Cart Recovery**: Email campaign integration
5. **AI-Powered Forecasting**: Revenue predictions and actionable insights
6. **Real-Time Order Ticker**: Live order notifications via WebSocket

---

## REAL ESTATE DASHBOARD - PREMIUM GLASS

### Industry Context
Real estate professionals need property showcase tools, market analytics, lead management, and comparative market analysis (CMA) with an elegant, aspirational aesthetic that reflects luxury properties.

### Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VAYVA HEADER - GLASS                                                       │
│  [Logo]  Real Estate Pro    [+ List Property]  [🔔 5] [💬 Messages] [⚙️]   │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 🏠 FEATURED PROPERTY                                                │   │
│  │                                                                      │   │
│  │  ┌─────────────────────────────────────────────────────────────┐    │   │
│  │  │                                                             │    │   │
│  │  │              LARGE HERO IMAGE OF LUXURY HOME                │    │   │
│  │  │                                                             │    │   │
│  │  │  123 Beverly Hills Drive, Los Angeles, CA 90210            │    │   │
│  │  │  $4,250,000 | 5 bed | 4 bath | 4,200 sqft                  │    │   │
│  │  │                                                             │    │   │
│  │  │  [View Details] [Schedule Tour] [Edit Listing]             │    │   │
│  │  │                                                             │    │   │
│  │  └─────────────────────────────────────────────────────────────┘    │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐  ┌────────────────────────────────────┐   │
│  │ 📊 MARKET PERFORMANCE       │  │ 👥 LEAD PIPELINE                   │   │
│  │                             │  │                                    │   │
│  │  Active Listings: 24        │  │  ┌──────────────────────────┐     │   │
│  │  Pending Sales: 8           │  │  │ 🔵 Sarah Johnson         │     │   │
│  │  Closed This Month: 12      │  │  │   Buying | $500K-$650K   │     │   │
│  │  Avg Days on Market: 32     │  │  │   Hot Lead • 2 showings  │     │   │
│  │                             │  │  └──────────────────────────┘     │   │
│  │  [View Market Report →]     │  │                                    │   │
│  │                             │  │  ┌──────────────────────────┐     │   │
│  │                             │  │  │ 🟡 Mike Chen             │     │   │
│  │                             │  │  │   Selling | $750K home   │     │   │
│  │                             │  │  │   Warm Lead • Follow up  │     │   │
│  │                             │  │  └──────────────────────────┘     │   │
│  │                             │  │                                    │   │
│  │                             │  │  [View All Leads (47) →]          │   │
│  └─────────────────────────────┘  └────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📈 COMPARATIVE MARKET ANALYSIS (CMA)                               │   │
│  │                                                                     │   │
│  │  Subject Property: 123 Beverly Hills Dr                            │   │
│  │                                                                     │   │
│  │  Comp 1: 125 Beverly Hills Dr    $4.1M   4,100 sqft   Sold 12d ago │   │
│  │            [──────────●──────────] +2.4%                           │   │
│  │                                                                     │   │
│  │  Comp 2: 456 Rodeo Drive       $4.5M   4,500 sqft   Sold 28d ago   │   │
│  │            [───────●───────────] -5.6%                              │   │
│  │                                                                     │   │
│  │  Comp 3: 789 Sunset Blvd       $3.9M   3,900 sqft   Active         │   │
│  │            [─────────●─────────] +9.0%                              │   │
│  │                                                                     │   │
│  │  Suggested List Price: $4,250,000 - $4,400,000                     │   │
│  │                                                                     │   │
│  │  [Generate Full CMA Report →]                                       │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐  ┌────────────────────────────────────┐   │
│  │ 📅 UPCOMING SHOWINGS        │  │ 🏘️ NEIGHBORHOOD INSIGHTS         │   │
│  │                             │  │                                    │   │
│  │  Today, 2:00 PM            │  │  School Rating: 9/10 ★★★★★       │   │
│  │  123 Beverly Hills Dr      │  │  Walk Score: 88 (Very Walkable)   │   │
│  │  Johnson Family (4)        │  │  Transit Score: 72 (Excellent)    │   │
│  │                             │  │                                    │   │
│  │  Tomorrow, 11:00 AM        │  │  Median Home Value: $2.1M         │   │
│  │  456 Ocean Ave             │  │  +12.5% YoY                       │   │
│  │  Smith Couple (2)          │  │                                    │   │
│  │                             │  │  [View Neighborhood Report →]     │   │
│  │  [View Calendar (8) →]      │  └────────────────────────────────────┘   │
│  └─────────────────────────────┘                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
RealEstateDashboard
├── VayvaThemeProvider (category="glass", preset="luxury-gold")
├── DashboardHeader (glass variant)
│   ├── VayvaLogo (glass styling)
│   ├── PageTitle ("Real Estate Pro")
│   ├── PrimaryButton ("+ List Property")
│   ├── NotificationBadge (count=5)
│   ├── MessageButton
│   └── SettingsIconButton
├── FeaturedPropertyHero
│   └── VayvaCard (variant="glass", fullBleed)
│       ├── PropertyImageCarousel (hero images, virtual tour link)
│       ├── PropertyDetailsOverlay (address, price, specs)
│       └── ActionButtonGroup (View Details, Schedule Tour, Edit)
├── MarketPerformancePanel
│   └── VayvaCard (variant="glass")
│       ├── CardHeader (title="Market Performance")
│       ├── StatsGrid (active listings, pending, closed, DOM)
│       └── ViewMarketReportLink
├── LeadPipelineWidget
│   └── VayvaCard (variant="glass")
│       ├── CardHeader (title="Lead Pipeline")
│       ├── LeadCardList
│       │   ├── LeadCard (name, type, budget, temperature, activity)
│       │   └── LeadCard (multiple)
│       └── ViewAllLeadsLink
├── ComparativeMarketAnalysis
│   └── VayvaCard (variant="glass", fullWidth)
│       ├── CardHeader(title="Comparative Market Analysis (CMA)")
│       ├── SubjectPropertyInfo (address, suggested price range)
│       ├── ComparablePropertiesList
│       │   ├── CompRow (address, price, sqft, status, comparison bar)
│       │   └── CompRow (multiple)
│       └── GenerateFullCMALink
├── UpcomingShowingsWidget
│   └── VayvaCard (variant="glass")
│       ├── CardHeader (title="Upcoming Showings")
│       ├── ShowingListItem (date/time, property, client info)
│       └── ViewCalendarLink
└── NeighborhoodInsightsPanel
    └── VayvaCard (variant="glass")
        ├── CardHeader (title="Neighborhood Insights")
        ├── InsightList (school rating, walk score, transit score, median value)
        └── ViewNeighborhoodReportLink
```

### Color Palette

**Primary Colors:**
- Luxury Gold: `#D4AF37` (primary actions, premium accents)
- Champagne: `#F7E7CE` (gradient overlays, highlights)
- Bronze: `#CD7F32` (secondary accents, hover states)

**Neutral Base:**
- Pure White: `#FFFFFF` (glass card base)
- Warm Gray: `#F5F5F5` (section backgrounds)
- Taupe: `#B8A8A0` (text secondary)
- Charcoal: `#374151` (text primary)

**Gradient Presets:**
```css
--gradient-gold: linear-gradient(135deg, #D4AF37 0%, #F7E7CE 100%);
--gradient-sunset: linear-gradient(135deg, #F7E7CE 0%, #CD7F32 100%);
--gradient-champagne: linear-gradient(135deg, #FFE5B4 0%, #D4AF37 100%);
```

**Glass Effect:**
```css
background: rgba(255, 255, 255, 0.85);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(212, 175, 55, 0.2);
box-shadow: 0 8px 32px rgba(212, 175, 55, 0.1);
```

### Theme Presets (5 Options)

1. **Luxury Gold** (Default): Rich gold accents, premium feel
2. **Silver Elite**: Cool silver tones for modern luxury
3. **Rose Gold Elegance**: Soft rose gold for boutique agencies
4. **Platinum Professional**: Sleek platinum grays, corporate feel
5. **Bronze Classic**: Warm bronze tones, traditional elegance

### API Integration Map

#### Existing Endpoints to Leverage

```typescript
// From Backend/core-api/src/routes/properties.ts
GET /api/properties?status=active&limit=24
GET /api/properties/:id
PUT /api/properties/:id

// From Backend/core-api/src/routes/leads.ts
GET /api/leads?status=all&sortBy=temperature
GET /api/leads/:id
PUT /api/leads/:id/status

// From Backend/core-api/src/routes/calendar.ts
GET /api/calendar/events?type=showings&startDate=&endDate=
```

#### New Endpoints to Create

```typescript
// Real Estate-specific analytics
GET /api/industries/realestate/dashboard
  Response: {
    activeListings: number,
    pendingSales: number,
    closedThisMonth: number,
    averageDaysOnMarket: number,
   featuredProperty: {
      id: string,
      address: string,
      price: number,
      beds: number,
      baths: number,
      sqft: number,
      images: string[]
    }
  }

GET /api/industries/realestate/market-performance
  Response: {
   totalActiveListings: number,
    pendingCount: number,
    closedCount: number,
    avgDaysOnMarket: number,
    medianSalePrice: number,
    pricePerSqft: number,
    monthlyTrend: Array<{ month: string, sales: number, avgPrice: number }>
  }

GET /api/industries/realestate/lead-pipeline
  Response: {
   totalLeads: number,
    leads: Array<{
      id: string,
     name: string,
      type: 'buying' | 'selling' | 'both',
      budgetRange: { min: number, max: number },
      temperature: 'hot' | 'warm' | 'cold',
     recentActivity: string,
      upcomingActions: string[]
    }>
  }

GET /api/industries/realestate/cma?propertyId=:id
  Response: {
    subjectProperty: {
      address: string,
      estimatedValue: number,
      valueRange: { min: number, max: number },
      sqft: number,
      beds: number,
      baths: number
    },
    comparables: Array<{
      address: string,
      soldPrice: number,
      sqft: number,
      soldDate: timestamp,
     status: 'sold' | 'active',
      differencePercentage: number,
      distanceFromSubject: number
    }>,
    suggestedListPrice: { min: number, max: number }
  }

GET /api/industries/realestate/neighborhood-insights?zipCode=:code
  Response: {
    schoolRating: number,
    walkScore: number,
    transitScore: number,
    medianHomeValue: number,
    yearOverYearChange: number,
    crimeRating: string,
    amenities: string[]
  }
```

#### WebSocket Integration

```typescript
ws://localhost:3001/ws/realestate-dashboard

// Subscribe to channels
{ action: 'subscribe', channels: ['leads-live', 'showings-reminder', 'price-alerts'] }

// Receive lead notifications
{
  type: 'new-lead',
  payload: {
    leadId: 'LEAD-456',
   name: 'Emily Watson',
    type: 'buying',
    source: 'website',
    temperature: 'warm'
  }
}

{
  type: 'showing-reminder',
  payload: {
    showingId: 'SHOW-789',
    propertyAddress: '123 Beverly Hills Dr',
    clientName: 'Johnson Family',
    time: '2026-03-10T14:00:00Z',
    minutesUntil: 30
  }
}

{
  type: 'price-change-alert',
  payload: {
    propertyId: 'PROP-123',
    address: '456 Rodeo Drive',
    oldPrice: 4500000,
   newPrice: 4350000,
    changePercentage: -3.3
  }
}
```

### Key Features

1. **Featured Property Hero**: Large visual showcase with image carousel
2. **Lead Temperature Tracking**: Hot/warm/cold lead indicators with activity history
3. **Interactive CMA Tool**: Automated comparable property analysis with visual comparisons
4. **Neighborhood Insights**: School ratings, walk scores, market trends integration
5. **Showing Reminders**: Calendar integration with push notifications
6. **Glassmorphism Aesthetic**: Premium backdrop blur with gold gradient overlays

---

## HEALTHCARE DASHBOARD - SIGNATURE CLEAN

### Industry Context
Healthcare providers need patient management tools, appointment scheduling, medical records access, and practice analytics with a clean, trustworthy interface that prioritizes clarity and HIPAA compliance.

### Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VAYVA HEADER - HEALTHCARE                                                  │
│  [Logo]  Practice Manager    [+ New Patient]  [📅 Appts] [🔔 3] [⚙️]       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📊 TODAY'S PRACTICE OVERVIEW (March 10, 2026)                       │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │     42       │  │     38       │  │    95.2%     │              │   │
│  │  │  Scheduled   │  │   Checked    │  │  On-Time     │              │   │
│  │  │  Appointments│  │    In        │  │  Rate        │              │   │
│  │  │              │  │              │  │              │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  │                                                                      │   │
│  │  Next Appointment: John Smith -2:30 PM (Room 204) - Dr. Johnson   │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐  ┌────────────────────────────────────┐   │
│  │ 📋 PATIENT QUEUE            │  │ 🩺 PROVIDER AVAILABILITY          │   │
│  │                             │  │                                    │   │
│  │  ✅ Room 201 - Mary Jones  │  │  Dr. Sarah Johnson                │   │
│  │     Check-in: 1:45 PM      │  │  ████████░░ 8/10 slots filled     │   │
│  │    Reason: Annual Physical│  │  Available: 2:00, 4:30            │   │
│  │                             │  │                                    │   │
│  │  ⏳ Room 202 - Tom Wilson  │  │  Dr. Michael Chen                 │   │
│  │     Check-in: 2:00 PM      │  │  ██████████ 10/10 slots filled    │   │
│  │    Reason: Follow-up      │  │  Fully booked                     │   │
│  │                             │  │                                    │   │
│  │  ⚠️  Room 203 - Lisa Brown │  │  Dr. Emily Rodriguez              │   │
│  │     Check-in: 2:15 PM      │  │  ██████░░░░ 6/10 slots filled     │   │
│  │     Waiting 25 min         │  │  Available: 3:00, 3:30, 4:00      │   │
│  │                             │  │                                    │   │
│  │  [View All Patients →]      │  │  [View Provider Schedule →]       │   │
│  └─────────────────────────────┘  └────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📈 PRACTICE METRICS (Last 30 Days)                                 │   │
│  │                                                                     │   │
│  │  Total Patients: 487       Revenue: $124,560                      │   │
│  │  ↑ 12.3% vs last month      ↑ 8.7% vs last month                   │   │
│  │                                                                     │   │
│  │  Most Common Diagnoses:                                            │   │
│  │  1. Hypertension (124 patients)  [████████░░] 25%                 │   │
│  │  2. Diabetes Type 2 (89 patients) [██████░░░░] 18%                │   │
│  │  3. Upper Respiratory (67 patients) [████░░░░░░] 14%              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐  ┌────────────────────────────────────┐   │
│  │ 💊 PRESCRIPTION REFILLS     │  │ 🔔 ACTION REQUIRED                 │   │
│  │                             │  │                                    │   │
│  │  Pending Approval: 14       │  │  🚨 STAT Lab Results (3)          │   │
│  │  Processed Today: 28        │  │     • Critical: 0                 │   │
│  │                             │  │     • Urgent: 3                   │   │
│  │  [Approve Refills (14) →]   │  │                                    │   │
│  │                             │  │  📋 Unsigned Documents (7)         │   │
│  │                             │  │     • Discharge Summaries: 4      │   │
│  │                             │  │     • Referral Letters: 3         │   │
│  │                             │  │                                    │   │
│  │                             │  │  [Review All (10) →]              │   │
│  └─────────────────────────────┘  └────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
HealthcareDashboard
├── VayvaThemeProvider (category="signature", preset="trustworthy-blue")
├── DashboardHeader
│   ├── VayvaLogo
│   ├── PageTitle ("Practice Manager")
│   ├── PrimaryButton ("+ New Patient")
│   ├── AppointmentsButton
│   ├── NotificationBadge (count=3)
│   └── SettingsIconButton
├── TodaysOverviewSection
│   └── VayvaCard (variant="default", fullWidth)
│       ├── CardHeader (title="Today's Practice Overview", subtitle=date)
│       ├── KPICardGrid (3 columns)
│       │   ├── ScheduledAppointmentsCard (count)
│       │   ├── CheckedInCard (count)
│       │   └── OnTimeRateCard (percentage)
│       └── NextAppointmentBanner (patient name, time, room, provider)
├── TwoColumnGrid
│   ├── PatientQueuePanel
│   │   └── VayvaCard (variant="default")
│   │       ├── CardHeader (title="Patient Queue")
│   │       ├── PatientQueueList
│   │       │   ├── PatientQueueItem (room, name, check-in time, reason, wait status)
│   │       │   └── PatientQueueItem (multiple)
│   │       └── ViewAllPatientsLink
│   └── ProviderAvailabilityPanel
│       └── VayvaCard (variant="default")
│           ├── CardHeader(title="Provider Availability")
│           ├── ProviderSlotList
│           │   ├── ProviderRow (name, fill bar, available times, status)
│           │   └── ProviderRow (multiple)
│           └── ViewProviderScheduleLink
├── PracticeMetricsSection
│   └── VayvaCard (variant="default", fullWidth)
│       ├── CardHeader (title="Practice Metrics (Last 30 Days)")
│       ├── MetricsSummary (total patients, revenue with trends)
│       └── DiagnosisFrequencyList (top diagnoses with percentages)
├── BottomTwoColumnGrid
│   ├── PrescriptionRefillsWidget
│   │   └── VayvaCard (variant="default")
│   │       ├── CardHeader (title="Prescription Refills")
│   │       ├── RefillSummary (pending, processed today)
│   │       └── ApproveRefillsLink
│   └── ActionRequiredPanel
│       └── VayvaCard (variant="default")
│           ├── CardHeader (title="Action Required")
│           ├── AlertList
│           │   ├── StatLabResultsAlert (count, critical count, urgent count)
│           │   └── UnsignedDocumentsAlert (count, breakdown by type)
│           └── ReviewAllLink
└── HIPAAComplianceWrapper (audit logging, session timeout)
```

### Color Palette

**Primary Colors:**
- Trustworthy Blue: `#0EA5E9` (primary actions, healthcare standard)
- Sky Blue: `#38BDF8` (hover states, highlights)
- Deep Ocean: `#0369A1` (text primary, headers)

**Neutral Base:**
- Pure White: `#FFFFFF` (card backgrounds, clinical cleanliness)
- Cool Gray 50: `#F9FAFB` (section backgrounds)
- Cool Gray 200: `#E5E7EB` (borders, dividers)
- Cool Gray 500: `#6B7280` (text secondary)
- Cool Gray 900: `#111827` (text primary)

**Status Colors:**
- Success: `#10B981` (checked-in, completed)
- Warning: `#F59E0B` (waiting too long, pending)
- Error: `#EF4444` (STAT alerts, critical)
- Info: `#0EA5E9` (informational, neutral)

**Design Tokens:**
```css
--healthcare-primary: #0EA5E9;
--healthcare-primary-light: #38BDF8;
--healthcare-primary-dark: #0369A1;
--healthcare-bg: #FFFFFF;
--healthcare-card-shadow: 0 4px 16px rgba(14, 165, 233, 0.08);
--healthcare-border-radius: 12px; /* Softer, approachable */
```

### Theme Presets (5 Options)

1. **Trustworthy Blue** (Default): Professional healthcare blue, calming
2. **Healing Green**: Soft green tones for wellness focus
3. **Clean Minimal**: Stark white with black text, maximum clarity
4. **Warm Coral**: Gentle coral accents for pediatric/family practice
5. **Professional Purple**: Sophisticated purple for specialty clinics

### API Integration Map

#### Existing Endpoints to Leverage

```typescript
// From Backend/core-api/src/routes/appointments.ts
GET /api/appointments?date=today&status=all
GET /api/appointments/:id
PUT /api/appointments/:id/status

// From Backend/core-api/src/routes/patients.ts
GET /api/patients?search=&limit=50
GET /api/patients/:id
POST /api/patients

// From Backend/core-api/src/routes/providers.ts
GET /api/providers/:id/schedule?date=today
```

#### New Endpoints to Create

```typescript
// Healthcare-specific analytics
GET /api/industries/healthcare/dashboard
  Response: {
    scheduledAppointments: number,
    checkedIn: number,
    onTimeRate: number,
   nextAppointment: {
      patientName: string,
      time: string,
      room: string,
      providerName: string,
     reason: string
    }
  }

GET /api/industries/healthcare/patient-queue
  Response: {
    queue: Array<{
      roomId: string,
      patientName: string,
      checkInTime: string,
     reason: string,
      waitTimeMinutes: number,
     status: 'waiting' | 'in-room' | 'with-provider' | 'checking-out'
    }>
  }

GET /api/industries/healthcare/provider-availability
  Response: {
    providers: Array<{
      id: string,
     name: string,
      specialty: string,
      slotsFilled: number,
     totalSlots: number,
      availableTimes: string[],
     status: 'available' | 'busy' | 'fully-booked'
    }>
  }

GET /api/industries/healthcare/practice-metrics?period=30d
  Response: {
   totalPatients: number,
    patientGrowth: number,
   revenue: number,
   revenueGrowth: number,
   topDiagnoses: Array<{
      code: string,
     name: string,
      patientCount: number,
      percentage: number
    }>
  }

GET /api/industries/healthcare/prescription-refills
  Response: {
    pendingApproval: number,
    processedToday: number,
   refills: Array<{
      id: string,
      patientName: string,
      medication: string,
      dosage: string,
     requestedAt: timestamp,
      prescriberId: string
    }>
  }

GET /api/industries/healthcare/action-required
  Response: {
   statLabResults: {
     total: number,
      critical: number,
      urgent: number,
     results: Array<{
        patientName: string,
        testType: string,
        value: string,
        flag: 'critical' | 'urgent'
      }>
    },
    unsignedDocuments: {
     total: number,
      dischargeSummaries: number,
     referralLetters: number,
      documents: Array<{
        id: string,
        patientName: string,
        type: string,
        createdAt: timestamp
      }>
    }
  }
```

#### HIPAA Compliance Features

```typescript
// Session Management
const SESSION_TIMEOUT = 15 * 60 * 1000; // 15 minutes of inactivity

// Auto-logout on inactivity
useEffect(() => {
  const resetTimer = () => {
    clearTimeout(sessionTimeout);
    sessionTimeout = setTimeout(() => {
     logoutUser();
      showSessionExpiredWarning();
    }, SESSION_TIMEOUT);
  };
  
  window.addEventListener('mousemove', resetTimer);
  window.addEventListener('keypress', resetTimer);
  
  return () => {
    clearTimeout(sessionTimeout);
    window.removeEventListener('mousemove', resetTimer);
    window.removeEventListener('keypress', resetTimer);
  };
}, []);

// Audit Logging
const logAuditEvent = async (eventType: string, details: object) => {
  await fetch('/api/audit/log', {
    method: 'POST',
    body: JSON.stringify({
      eventType,
      details,
      timestamp: new Date().toISOString(),
      userId: currentUser.id,
      ipAddress: getClientIP()
    })
  });
};

// Usage examples
logAuditEvent('PATIENT_RECORD_ACCESSED', { patientId: '123' });
logAuditEvent('PRESCRIPTION_SIGNED', { prescriptionId: 'RX-456' });
logAuditEvent('LAB_RESULTS_VIEWED', { labResultId: 'LAB-789' });
```

#### WebSocket Integration

```typescript
ws://localhost:3001/ws/healthcare-dashboard

// Subscribe to channels
{ action: 'subscribe', channels: ['patient-checkin', 'lab-results', 'provider-status'] }

// Receive patient check-in notifications
{
  type: 'patient-checked-in',
  payload: {
    patientId: 'PAT-123',
   name: 'John Smith',
    room: '204',
    checkInTime: '2026-03-10T14:00:00Z',
    appointmentType: 'follow-up'
  }
}

{
  type: 'lab-result-ready',
  payload: {
    labResultId: 'LAB-456',
    patientName: 'Mary Johnson',
    testType: 'Complete Blood Count',
    isStat: true,
    isCritical: false
  }
}

{
  type: 'provider-status-change',
  payload: {
    providerId: 'DR-789',
   name: 'Dr. Sarah Johnson',
   newStatus: 'running-late',
    estimatedDelay: 15
  }
}
```

### Key Features

1. **Patient Queue Management**: Real-time waiting room tracking with wait time alerts
2. **Provider Availability Dashboard**: Visual slot fill indicators for all providers
3. **Practice Analytics**: Patient volume, revenue, diagnosis frequency tracking
4. **Prescription Management**: Refill approval workflow with e-prescribing integration
5. **Critical Alerts**: STAT lab results and unsigned document notifications
6. **HIPAA Compliance**: Automatic session timeout, audit logging, access controls
7. **Clean, Accessible Design**: High contrast, clear typography for clinical environments

### Accessibility Considerations

```typescript
// WCAG 2.1 AA Compliance
- Minimum contrast ratio: 4.5:1 for normal text, 3:1 for large text
- Focus indicators: 2px solid outline on all interactive elements
- Keyboard navigation: Full tab support with logical focus order
- Screen reader support: ARIA labels for all icons and actions
- Error identification: Clear error messages with suggestions for correction

// Example: Accessible Button
<VayvaButton
  variant="primary"
  onClick={handleApproveRefills}
  aria-label="Approve 14 pending prescription refills"
  aria-describedby="refill-count-description"
>
  Approve Refills (14)
</VayvaButton>
<span id="refill-count-description" className="sr-only">
  Click to review and approve all pending prescription refill requests
</span>
```

---

## NEXT STEPS

**Proceed to MASTER_DESIGN_PLAN_PART3.md for:**
- Beauty/Cosmetics (Premium Glass)
- Events/Nightlife (Bold Energy)
- Automotive (Modern Dark)

---

*Document continues in PART3...*
