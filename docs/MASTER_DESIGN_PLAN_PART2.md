# Vayva Industry Dashboard Master Design Plan - Part 2

**Complete Visual Specifications for Remaining 20 Industries**  
*Tier 1, 2, and 3 Industries with Diagrams & API Integration*

---

## 3. Retail/E-commerce Dashboard

### Design Category: **Signature Clean** ⭐

### Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                        HEADER (Minimal)                          │
│  ┌──────┐                                                        │
│  │ Logo │    Overview  Products  Orders  Customers  Analytics   │
│  └──────┘                                                        │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║  KPI ROW (Clean White Cards)                             ║  │
│  ║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   ║  │
│  ║  │ Revenue  │ │ Orders   │ │ Conv.Rate│ │ AOV      │   ║  │
│  ║  │ $45,280  │ │ 1,247    │ │ 3.2%     │ │ $89      │   ║  │
│  ║  │ ▲ 8%     │ │ ▲ 12%    │ │ ▼ 0.4%   │ │ ▲ 5%     │   ║  │
│  ║  └──────────┘ └──────────┘ └──────────┘ └──────────┘   ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║  SALES TREND CHART (Minimalist Line)                     ║  │
│  ║  ┌────────────────────────────────────────────────────┐  ║  │
│  ║  │                                                    │  ║  │
│  ║  │      ╱╲    ╱╲                                      │  ║  │
│  ║  │     ╱  ╲  ╱  ╲    ╱╲                               │  ║  │
│  ║  │    ╱    ╲╱    ╲  ╱  ╲    ╱╲                         │  ║  │
│  ║  │   ╱          ╲╱    ╲  ╱  ╲╱                         │  ║  │
│  ║  │  ╱                    ╲                              │  ║  │
│  ║  │ ╱                                                      │  ║  │
│  ║  └────────────────────────────────────────────────────┘  ║  │
│  ║  Jan  Feb  Mar  Apr  May  Jun  Jul  Aug  Sep  Oct        ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔══════════════════════════╗ ╔══════════════════════════╗     │
│  ║ TOP PRODUCTS             ║ ║ LOW STOCK ALERTS         ║     │
│  ║ ┌────┬────────┬─────┐   ║ ║ ┌──────────────────────┐ ║     │
│  ║ │ 📷 │ Product│ Sold│   ║ ║ │ ⚠️ Size M - Tee     │ ║     │
│  ║ ├────┼────────┼─────┤   ║ ║ │   12 left           │ ║     │
│  ║ │ 📷 │ Product│ 234 │   ║ ║ ├──────────────────────┤ ║     │
│  ║ ├────┼────────┼─────┤   ║ ║ │ ⚠️ Blue - Jeans     │ ║     │
│  ║ │ 📷 │ Product│ 189 │   ║ ║ │   8 left            │ ║     │
│  ║ └────┴────────┴─────┘   ║ ║ └──────────────────────┘ ║     │
│  ╚══════════════════════════╝ ╚══════════════════════════╝     │
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║  INVENTORY BY CATEGORY                                   ║  │
│  ║  ┌──────────────────────────────────────────────────┐    ║  │
│  ║  │ Tops      ▓▓▓▓▓▓▓▓░░ 342 units  $12,450 value  │    ║  │
│  ║  │ Bottoms   ▓▓▓▓▓▓▓░░░ 289 units  $9,890 value   │    ║  │
│  ║  │ Shoes     ▓▓▓▓▓░░░░░ 156 units  $18,900 value  │    ║  │
│  ║  │ Access.   ▓▓▓░░░░░░░  98 units  $4,560 value   │    ║  │
│  ║  └──────────────────────────────────────────────────┘    ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
RetailDashboardPage
├── MinimalHeader
│   ├── Logo
│   └── NavigationTabs × 5
├── KPIRow
│   └── RetailKPICard × 4
├── SalesTrendChart
│   ├── ChartContainer
│   ├── XAxis (Months)
│   ├── YAxis (Revenue)
│   └── DataLine (Smooth)
├── TopProductsGrid
│   └── ProductCard × 10
├── LowStockAlerts
│   └── AlertCard × many
└── InventoryByCategory
    └── CategoryBar × many
```

### Color Palette

**Background:** `#FFFFFF`  
**Secondary BG:** `#F9FAFB`  
**Tertiary BG:** `#F3F4F6`  
**Text Primary:** `#111827`  
**Text Secondary:** `#6B7280`  
**Accent (Vayva):** `#6366F1`  
**Success:** `#10B981`  
**Warning:** `#F59E0B`  
**Error:** `#EF4444`  
**Borders:** `#E5E7EB` (1px solid)  
**Shadows:** `0 4px 16px rgba(0,0,0,0.08)`

### Theme Presets (5 Variants)

1. **Pure White** - Clean white with black accents
2. **Soft Gray** - Warm grays throughout
3. **Sky Blue** - Blue accent (#0EA5E9)
4. **Blush Pink** - Pink accent (#EC4899)
5. **Sage Green** - Green accent (#10B981)

### API Integration Map - Retail

#### Existing APIs to Reuse:
```typescript
GET /api/dashboard/overview
  ├── revenue → Revenue KPI
  ├── orders → Orders KPI
  └── conversionRate → Conv.Rate KPI

GET /api/dashboard/recent-orders
  └── orders[] → Calculate top products

GET /api/dashboard/inventory-alerts
  └── alerts[] → Low Stock Alerts

GET /api/dashboard/aggregate
  └── All base metrics in one call
```

#### New APIs Needed:
```typescript
// Product Analytics
GET /api/dashboard/retail/top-products?limit=10&period=30d
  Returns: {
    products: Array<{
      id: string;
      name: string;
      image: string;
      unitsSold: number;
      revenue: number;
      category: string;
    }>
  }

GET /api/dashboard/retail/sales-trend?period=12m
  Returns: {
    trend: Array<{ month: string; revenue: number }>
  }

GET /api/dashboard/retail/inventory-by-category
  Returns: {
    categories: Array<{
      name: string;
      units: number;
      value: number;
      turnover: number;
    }>
  }

// Inventory Management
POST /api/dashboard/retail/inventory/restock
  Body: { productId: string; quantity: number }

GET /api/dashboard/retail/stock-levels
  Returns: {
    lowStock: Product[];
    outOfStock: Product[];
    overstocked: Product[];
  }
```

### Key Features - Retail

1. **Sales Trend Visualization** - 12-month revenue line chart
2. **Top Products Grid** - Best sellers with thumbnails
3. **Low Stock Alerts** - Real-time inventory warnings
4. **Inventory by Category** - Distribution visualization
5. **Product Performance** - Units sold + revenue per item

---

## 4. Real Estate Dashboard

### Design Category: **Premium Glass** 🏠

### Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    HEADER (Glass with Logo)                      │
│  ┌──────┐                                                        │
│  │ Logo │    "Real Estate Pro"  |  Active Listings: 47          │
│  └──────┘                                                        │
└─────────────────────────────────────────────────────────────────┘
│                 [Gradient Orbs: Purple/Pink/Blue]                │
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║  KPI ROW (Glass Cards with Gradient Text)                ║  │
│  ║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   ║  │
│  ║  │ Active   │ │ Lead     │ │ Conv.    │ │ Commis-  │   ║  │
│  ║  │ Listings │ │ Score    │ │ Rate     │ │ sions    │   ║  │
│  ║  │   47     │ │  8.4/10  │ │  24%     │ │ $142K    │   ║  │
│  ║  │ ▲ 5      │ │ ↑ 1.2    │ │ ↑ 3%     │ │ ▲ $18K   │   ║  │
│  ║  └──────────┘ └──────────┘ └──────────┘ └──────────┘   ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║  FEATURED PROPERTY HERO                                  ║  │
│  ║  ┌────────────────────────────────────────────────────┐  ║  │
│  ║  │                                                    │  ║  │
│  ║  │              [Property Image Carousel]             │  ║  │
│  ║  │                                                    │  ║  │
│  ║  │  123 Luxury Lane, Beverly Hills, CA 90210         │  ║  │
│  ║  │  $4,250,000 | 5 bed | 4 bath | 4,200 sqft         │  ║  │
│  ║  │                                                    │  ║  │
│  ║  │  [Schedule Showing] [Virtual Tour] [Contact]      │  ║  │
│  ║  └────────────────────────────────────────────────────┘  ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔════════════════════════╗ ╔════════════════════════╗         │
│  ║ TRANSACTION TIMELINE   ║ ║ LEAD SCORING GAUGE     ║         │
│  ║ ┌──────────────────┐  ║ ║      ┌────────┐        ║         │
│  ║ │ ● Offer Accepted │  ║ ║     ╱   8.4  ╲       ║         │
│  ║ │ ○ Inspection     │  ║ ║    ╱  High    ╲      ║         │
│  ║ │ ○ Appraisal      │  ║ ║   │  Lead    │      ║         │
│  ║ │ ○ Financing      │  ║ ║    ╲        ╱       ║         │
│  ║ │ ○ Closing        │  ║ ║     ╲______╱        ║         │
│  ║ └──────────────────┘  ║ ╚════════════════════════╝         │
│  ╚════════════════════════╝                                    │
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║  CMA (COMPARATIVE MARKET ANALYSIS)                       ║  │
│  ║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   ║  │
│  ║  │ Property │ │ Comp 1   │ │ Comp 2   │ │ Comp 3   │   ║  │
│  ║  │ Subject  │ │ 0.2mi    │ │ 0.3mi    │ │ 0.5mi    │   ║  │
│  ║  │ $4.25M   │ │ $4.10M   │ │ $4.35M   │ │ $4.18M   │   ║  │
│  ║  │          │ │ +3.5%    │ │ -2.3%    │ │ +1.7%    │   ║  │
│  ║  └──────────┘ └──────────┘ └──────────┘ └──────────┘   ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
RealEstateDashboardPage
├── GlassHeader
├── GradientOrbs
├── KPIRow
│   └── GlassKPICard × 4
├── FeaturedPropertyHero
│   ├── ImageCarousel
│   ├── PropertyDetails
│   └── ActionButtons
├── TransactionTimeline
│   └── MilestoneCard × 5
├── LeadScoringGauge
└── CMAComparables
    └── ComparableCard × 3
```

### Color Palette

**Primary Gradient:** `linear-gradient(135deg, #7C3AED 0%, #A78BFA 50%, #C4B5FD 100%)`  
**Background Base:** `#F5F3FF` (Light Lavender)  
**Card BG:** `rgba(255, 255, 255, 0.85)` with blur  
**Card Border:** `rgba(255, 255, 255, 0.4)`  
**Text Primary:** `#2E1065` (Deep Purple)  
**Text Secondary:** `#6D28D9`  
**Accent Glow:** `rgba(139, 92, 246, 0.3)`

### Theme Presets (5 Variants)

1. **Platinum** - Silver/Gray gradient
2. **Navy Blur** - Blue/Indigo gradient
3. **Sunset Glow** - Orange/Pink gradient
4. **Urban Gray** - Charcoal/Slate gradient
5. **Gold Touch** - Gold/Bronze gradient

### API Integration Map - Real Estate

#### Existing APIs to Reuse:
```typescript
GET /api/dashboard/overview
  ├── listings → Active Listings count
  └── revenue → Commissions

GET /api/dashboard/customer-insights
  └── leads[] → Lead scoring data
```

#### New APIs Needed:
```typescript
// Property Management
GET /api/dashboard/realestate/listings?status=active&limit=1
  Returns: { featured: Property }

GET /api/dashboard/realestate/transaction-timeline
  Returns: {
    transactions: Array<{
      id: string;
      address: string;
      stage: 'offer' | 'inspection' | 'appraisal' | 'financing' | 'closing';
      closingDate?: string;
      commission: number;
    }>
  }

// Lead Scoring
GET /api/dashboard/realestate/lead-scoring
  Returns: {
    leads: Array<{
      id: string;
      name: string;
      score: number; // 0-10
      level: 'low' | 'medium' | 'high';
      factors: string[];
    }>
  }

// CMA
GET /api/dashboard/realestate/cma/:propertyId
  Returns: {
    subject: Property;
    comparables: Array<{
      property: Property;
      distance: number;
      pricePerSqft: number;
      adjustments: number;
    }>
  }

// Showings
POST /api/dashboard/realestate/showing/schedule
  Body: { propertyId: string; date: string; buyerId: string }
```

### Key Features - Real Estate

1. **Featured Property Hero** - Showcase premier listing
2. **Transaction Timeline** - Track deals through closing
3. **Lead Scoring AI** - Prioritize hot buyers
4. **CMA Calculator** - Comparative market analysis
5. **Showing Scheduler** - Book property tours

---

## 5. Healthcare/Medical Dashboard

### Design Category: **Signature Clean** 🏥

### Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   HEADER (Clean White)                           │
│  ┌──────┐                                                        │
│  │ Logo │    "MedPractice Dashboard"  |  🛡️ HIPAA Secure        │
│  └──────┘                                                        │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║  TODAY'S OVERVIEW (Clean Cards)                          ║  │
│  ║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   ║  │
│  ║  │ Appt's   │ │ Wait Time│ │ Providers│ │ Revenue  │   ║  │
│  ║  │   47     │ │  12 min  │ │   8/10   │ │  $8,420  │   ║  │
│  ║  │ ▲ 8      │ │ ↓ 5 min  │ │  80%     │ │ ▲ $920  │   ║  │
│  ║  └──────────┘ └──────────┘ └──────────┘ └──────────┘   ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║  PATIENT QUEUE                                           ║  │
│  ║  ┌────────────────────────────────────────────────────┐  ║  │
│  ║  │ John D.     │ Check-in │ 8:45 AM │ Dr. Smith      │  ║  │
│  ║  │ Sarah M.    │ In Room  │ 9:00 AM │ Dr. Johnson    │  ║  │
│  ║  │ Mike R.     │ Waiting  │ 9:15 AM │ Dr. Smith      │  ║  │
│  ║  │ Emily K.    │ Check-in │ 9:30 AM │ Dr. Lee        │  ║  │
│  ║  └────────────────────────────────────────────────────┘  ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔════════════════════════╗ ╔════════════════════════╗         │
│  ║ WAIT TIME TRACKER      ║ ║ PROVIDER UTILIZATION   ║         │
│  ║      ┌────────┐        ║ ║ ┌────────────────────┐ ║         │
│  ║     ╱   12   ╲        ║ ║ │ Dr.Smith   ▓▓▓▓▓░░ │ ║         │
│  ║    ╱  minutes ╲       ║ ║ │ Dr.Johnson ▓▓▓▓░░░ │ ║         │
│  ║   │  Current  │       ║ ║ │ Dr.Lee     ▓▓▓░░░░ │ ║         │
│  ║    ╲          ╱       ║ ║ │ Dr.Wilson  ▓▓▓▓▓▓░ │ ║         │
│  ║     ╲________╱        ║ ║ └────────────────────┘ ║         │
│  ║   Green: <15min       ║ ╚════════════════════════╝         │
│  ╚════════════════════════╝                                    │
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║  HIPAA AUDIT LOG (Compliance Tracking)                   ║  │
│  ║  ┌──────────────────────────────────────────────────┐    ║  │
│  ║  │ 10:42 AM | Dr.Smith accessed patient #4521       │    ║  │
│  ║  │ 10:38 AM | Nurse J. updated vitals for #4518     │    ║  │
│  ║  │ 10:35 AM | Front desk checked in patient #4522   │    ║  │
│  ║  │ 10:30 AM | System backup completed successfully  │    ║  │
│  ║  └──────────────────────────────────────────────────┘    ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
HealthcareDashboardPage
├── CleanHeader
│   ├── Logo
│   ├── Title
│   └── HIPAABadge
├── KPIRow
│   └── HealthcareKPICard × 4
├── PatientQueue
│   └── PatientRow × many
├── WaitTimeTracker
│   └── CircularGauge
├── ProviderUtilization
│   └── ProviderBar × many
└── HIPAAAuditLog
    └── LogEntry × many
```

### Color Palette

**Background:** `#FFFFFF`  
**Secondary BG:** `#F0FDF4` (Soft Green - calming)  
**Text Primary:** `#111827`  
**Text Secondary:** `#6B7280`  
**Accent (Vayva):** `#10B981` (Green - health)  
**Success:** `#10B981`  
**Warning:** `#F59E0B` (Use instead of red for non-critical)  
**Error:** `#DC2626` (Only for true emergencies)  
**Borders:** `#E5E7EB`  
**Shadows:** Soft, subtle

### Theme Presets (5 Variants)

1. **Calm Blue** - Blue/Teal accent
2. **Mint Fresh** - Green/Mint accent
3. **Lavender** - Purple/Lavender accent
4. **Soft White** - Pure minimal
5. **Sea Foam** - Aquamarine accent

### API Integration Map - Healthcare

#### Existing APIs to Reuse:
```typescript
GET /api/dashboard/overview
  ├── appointments → Today's appointments
  └── revenue → Daily revenue

GET /api/dashboard/activity
  └── activity[] → Audit log entries
```

#### New APIs Needed:
```typescript
// Patient Management
GET /api/dashboard/healthcare/patient-queue?date=today
  Returns: {
    patients: Array<{
      id: string;
      name: string;
      status: 'checked-in' | 'waiting' | 'in-room' | 'with-doctor';
      checkInTime: string;
      assignedProvider: string;
    }>
  }

GET /api/dashboard/healthcare/wait-time
  Returns: {
    currentWaitTime: number; // minutes
    averageWaitTime: number;
    targetWaitTime: number;
    status: 'good' | 'acceptable' | 'long';
  }

GET /api/dashboard/healthcare/provider-utilization
  Returns: {
    providers: Array<{
      name: string;
      utilizationPercent: number;
      patientsSeen: number;
      availableSlots: number;
    }>
  }

// HIPAA Compliance
GET /api/dashboard/healthcare/audit-log?limit=20
  Returns: {
    logs: Array<{
      timestamp: string;
      user: string;
      action: string;
      patientId?: string;
      details: string;
    }>
  }

// Telemedicine
GET /api/dashboard/healthcare/telemedicine/sessions
  Returns: { active: Session[], upcoming: Session[] }
```

### Key Features - Healthcare

1. **Patient Queue Management** - Real-time waitlist tracking
2. **Wait Time Monitor** - Circular gauge with color zones
3. **Provider Utilization** - Staff workload balancing
4. **HIPAA Audit Trail** - Compliance logging visible
5. **Telemedicine Integration** - Virtual visit support

---

*(Continuing with remaining 17 industries in next document due to length...)*

---

## Summary: Industries 1-5 Complete

✅ **Fashion** - Premium Glass with size curves, visual merchandising  
✅ **Restaurant** - Bold Energy FOH + Modern Dark KDS  
✅ **Retail** - Signature Clean with product focus  
✅ **Real Estate** - Premium Glass with CMA, lead scoring  
✅ **Healthcare** - Signature Clean with HIPAA compliance  

**Remaining:** 17 industries across Tier 2 and Tier 3

Each includes:
- ASCII layout diagram
- Component hierarchy
- Color palette with hex codes
- 5 theme presets
- API integration map (existing + new endpoints)
- Key features list

Should I continue with the remaining 17 industries in this same detailed format?
