# Batch 2 Design Document: REAL ESTATE Industry Dashboard
## Premium Glass Design with Professional Blue Accents

**Document Version:** 1.0  
**Industry:** Real Estate & Property Management  
**Design Category:** Premium Glass  
**Plan Tier Support:** Basic → Pro  
**Last Updated:** 2026-03-11

---

## 1. Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (Glass Effect)                                                          │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo]  Dashboard  Properties  Listings  CMAs  Showings  Leads  Analytics  ▼  │  │
│  │                                                                  [🔔] [👤 Pro] │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  MARKET OVERVIEW                    [+ New Listing] [📊 Generate CMA]          │  │
│  │  "Downtown Metro Area - March 2026"                                           │  │
│  │  Active Listings: 47 | Pending: 12 | Closed This Month: 23                     │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │   REVENUE   │ │  LISTINGS   │ │   LEADS     │ │  SHOWINGS   │ │ CONVERSION  │   │
│  │   $284.5K   │ │    47       │ │    186      │ │    89       │ │    24.7%    │   │
│  │   ↑ 18.4%   │ │   ↑ 12.2%   │ │   ↑ 34.5%   │ │   ↑ 22.1%   │ │   ↑ 3.2%    │   │
│  │   [Spark]   │ │   [Spark]   │ │   [Spark]   │ │   [Spark]   │ │   [Spark]   │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       ACTIVE LISTINGS MAP               │ │       LEAD PIPELINE              │   │
│  │                                         │ │                                  │   │
│  │  [Interactive Map View]                 │ │  Lead Stages:                    │   │
│  │  ┌─────────────────────────────────┐    │ │  ┌────────────────────────────┐  │   │
│  │  │                                 │    │ │  │                            │  │   │
│  │  │  📍 123 Main St - $425K         │    │ │  │ 🔵 New Leads (42)          │  │   │
│  │  │  📍 456 Oak Ave - $680K         │    │ │  │    ████████████░░░░ 58%    │  │   │
│  │  │  📍 789 Pine Rd - $520K         │    │ │  │                            │  │   │
│  │  │  📍 321 Elm St - $890K          │    │ │  │ 🟡 Contacted (38)          │  │   │
│  │  │  📍 654 Maple Dr - $1.2M        │    │ │  │    ██████████░░░░░░ 45%    │  │   │
│  │  │                                 │    │ │  │                            │  │   │
│  │  │  Legend:                        │    │ │  │ 🟠 Qualified (28)          │  │   │
│  │  │  🟢 Active (28)                 │    │ │  │    ████████░░░░░░░░ 32%    │  │   │
│  │  │  🟡 Pending (12)                │    │ │  │                            │  │   │
│  │  │  🔴 Under Contract (7)          │    │ │  │ 🟣 Showing Scheduled (18)  │  │   │
│  │  │                                 │    │ │  │    █████░░░░░░░░░░░ 22%    │  │   │
│  │  │  [View Full Map] [Add Listing]  │    │ │  │                            │  │   │
│  │  │                                 │    │ │  │ 🔴 Offer Made (12)         │  │   │
│  │  │  Avg. List Price: $642K         │    │ │  │    ███░░░░░░░░░░░░░ 14%    │  │   │
│  │  │  Avg. Days on Market: 34        │    │ │  │                            │  │   │
│  │  │  Price/SqFt: $285               │    │ │  │ ⚫ Closed (48)             │  │   │
│  │  │                                 │    │ │  │    ████████████████ 100%   │  │   │
│  │  └─────────────────────────────────┘    │ │  │                            │  │   │
│  │                                         │ │  │ [View All Leads]           │  │   │
│  │  Neighborhood Performance:              │ │  │                            │  │   │
│  │  Downtown: ▲ 12% | Suburbs: ▲ 8%        │ │  │ [+ Add Lead] [Import]      │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       CMA GENERATOR                     │ │       AGENT PERFORMANCE          │   │
│  │                                         │ │                                  │   │
│  │  Recent CMA Reports:                    │ │  Top Agents This Month:          │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │ 123 Main St - Comparative Analysis│  │ │  │                            │  │   │
│  │  │    Generated: Mar 10, 2026        │  │ │  │ 👤 Sarah Johnson           │  │   │
│  │  │    Subject Property: 3BR/2BA      │  │ │  │    12 sales | $842K vol    │  │   │
│  │  │    Comps Used: 6 properties       │  │ │  │    ████████████████████░░  │  │   │
│  │  │    Est. Value: $425,000           │  │ │  │    Commission: $25,260     │  │   │
│  │  │    [View Report] [Edit] [Export]  │  │ │  │                            │  │   │
│  │  └───────────────────────────────────┘  │ │  │ 👤 Michael Chen            │  │   │
│  │                                          │ │  │    9 sales | $624K vol     │  │   │
│  │  ┌───────────────────────────────────┐  │ │  │    ████████████████░░░░░░  │  │   │
│  │  │ 456 Oak Ave - Market Update       │  │ │  │    Commission: $18,720     │  │   │
│  │  │    Generated: Mar 9, 2026         │  │ │  │                            │  │   │
│  │  │    Subject Property: 4BR/3BA      │  │ │  │ 👤 Emily Rodriguez         │  │   │
│  │  │    Comps Used: 8 properties       │  │ │  │    8 sales | $548K vol     │  │   │
│  │  │    Est. Value: $680,000           │  │ │  │    ███████████████░░░░░░░  │  │   │
│  │  │    [View Report] [Edit] [Export]  │  │ │  │    Commission: $16,440     │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                          │ │  │ [View All Agents]          │  │   │
│  │  [+ Generate New CMA]                   │ │  │                            │  │   │
│  │                                          │ │  Team Stats:                   │   │
│  │  CMA Templates:                          │ │  • Total Sales: 48             │   │
│  │  [Standard] [Luxury] [Investment]       │ │  • Total Volume: $3.2M         │   │
│  │                                          │ │  • Avg. Commission: 3.1%      │   │
│  │                                          │ │  • Conversion Rate: 24.7%     │   │
│  │                                          │ │                                │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       UPCOMING SHOWINGS                 │ │       MARKET TRENDS              │   │
│  │                                         │ │                                  │   │
│  │  Today's Schedule (5 showings):         │ │  Market Indicators:              │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │ 10:00 AM - 123 Main St            │  │ │  │                            │  │   │
│  │  │    Buyers: Smith Family           │  │ │  │ 📈 Median Price: $542K     │  │   │
│  │  │    Agent: Sarah Johnson           │  │ │  │    ▲ 8.2% YoY              │  │   │
│  │  │    Status: Confirmed ✓            │  │ │  │                            │  │   │
│  │  │    [Check-in] [Reschedule]        │  │ │  │ 📊 Inventory: 2.4 months   │  │   │
│  │  └───────────────────────────────────┘  │ │  │    ▼ 12% from last month   │  │   │
│  │                                          │ │  │                            │  │   │
│  │  ┌───────────────────────────────────┐  │ │  │ 💰 Avg. DOM: 34 days       │  │   │
│  │  │ 11:30 AM - 456 Oak Ave            │  │ │  │    ▼ 5 days from avg       │  │   │
│  │  │    Buyers: Pre-approved           │  │ │  │                            │  │   │
│  │  │    Agent: Michael Chen            │  │ │  │ 🏷️ Price/SqFt: $285       │  │   │
│  │  │    Status: Arrived ●              │  │ │  │    ▲ 6% YoY                │  │   │
│  │  │    [Check-in] [Notes]             │  │ │  │                            │  │   │
│  │  └───────────────────────────────────┘  │ │  │ [Full Market Report]       │  │   │
│  │                                          │ │  │                            │  │   │
│  │  ┌───────────────────────────────────┐  │ │  │ Neighborhood Heatmap:      │  │   │
│  │  │ 2:00 PM - 789 Pine Rd             │  │ │  │ [Color-coded map view]     │  │   │
│  │  │    Open House                     │  │ │  │ Hot: Downtown, Riverfront  │  │   │
│  │  │    Agent: Emily Rodriguez         │  │ │  │ Warm: Suburbs, Heights     │  │   │
│  │  │    Status: Scheduled ⏳           │  │ │  │ Cool: Industrial District  │  │   │
│  │  │    [Send Reminder] [Details]      │  │ │  │                            │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                          │ │  │                            │  │   │
│  │  [View Calendar] [Schedule Showing]     │ │  │                            │  │   │
│  │                                          │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                         AI INSIGHTS (Pro Tier Only)                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ 💡 Pricing Recommendation: 123 Main St should be listed at $435K        │  │  │
│  │  │    Based on: Recent comps, market velocity, seasonal trends             │  │  │
│  │  │    Confidence: 92% | Predicted DOM: 28 days                             │  │  │
│  │  │    [Generate CMA] [Adjust Price]                                        │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Category Application

### Premium Glass Design System

**Primary Palette:**
```
Background Primary:   #0A0F1A (Deep navy-black)
Background Secondary: #151F2E (Elevated surfaces)
Background Tertiary:  rgba(255, 255, 255, 0.03) (Glass panels)

Accent Primary:       #4A90E2 (Professional blue)
Accent Secondary:     #5BA0F2 (Soft blue)
Accent Tertiary:      #7BB3F0 (Light blue highlight)

Text Primary:         #FFFFFF (Pure white)
Text Secondary:       rgba(255, 255, 255, 0.75)
Text Tertiary:        rgba(255, 255, 255, 0.5)

Status Colors:
  Active:   #10B981 (Green)
  Pending:  #F59E0B (Amber)
  Sold:     #EF4444 (Red)
  New:      #60A5FA (Blue)
```

**Glassmorphism Effects:**
```css
/* Glass Panel Base */
.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(74, 144, 226, 0.15);
  border-radius: 16px;
}

/* Glass Card Hover */
.glass-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(74, 144, 226, 0.3);
  box-shadow: 0 8px 32px rgba(74, 144, 226, 0.12);
}

/* Gradient Accents */
.accent-gradient {
  background: linear-gradient(135deg, #4A90E2 0%, #5BA0F2 100%);
}

/* Metric Card Glow */
.metric-glow {
  box-shadow: 0 0 40px rgba(74, 144, 226, 0.15);
}
```

---

## 3. Component Hierarchy

```
RealEstateDashboard (Root)
├── DashboardHeader
│   ├── BreadcrumbNav
│   ├── ActionButtons
│   │   ├── NewListingButton
│   │   └── GenerateCMAButton
│   └── MarketStatus
├── KPIRow (5 metrics)
│   └── RealEstateMetricCard × 5
│       ├── SparklineChart
│       ├── TrendIndicator
│       └── ValueDisplay
├── ContentGrid (2 columns)
│   ├── LeftColumn
│   │   ├── ActiveListingsMap
│   │   │   ├── InteractiveMap
│   │   │   ├── ListingMarkers
│   │   │   ├── Legend
│   │   │   └── StatsOverlay
│   │   ├── CMAGenerator
│   │   │   ├── RecentReports
│   │   │   ├── TemplateSelector
│   │   │   └── QuickActions
│   │   └── UpcomingShowings
│   │       ├── ShowingCard × N
│   │       ├── TimeSlot
│   │       └── ActionButtons
│   └── RightColumn
│       ├── LeadPipeline
│       │   ├── StageCard × 5
│       │   ├── ProgressBar
│       │   └── CountDisplay
│       ├── AgentPerformance
│       │   ├── AgentCard × N
│       │   ├── SalesVolume
│       │   └── CommissionDisplay
│       └── MarketTrends
│           ├── IndicatorCard × 4
│           ├── NeighborhoodHeatmap
│           └── FullReportLink
└── AIInsightsPanel (Pro Tier)
    └── PricingRecommendation
```

---

## 4. 5 Theme Presets

### Theme 1: Professional Blue (Default)
```
Primary:    #4A90E2
Secondary:  #5BA0F2
Background: #0A0F1A
Surface:    rgba(255, 255, 255, 0.03)
Accent:     linear-gradient(135deg, #4A90E2, #5BA0F2)
```

### Theme 2: Luxury Gold
```
Primary:    #D4AF37
Secondary:  #E5C158
Background: #1A1408
Surface:    rgba(212, 175, 55, 0.05)
Accent:     linear-gradient(135deg, #D4AF37, #E5C158)
```

### Theme 3: Emerald Elite
```
Primary:    #10B981
Secondary:  #34D399
Background: #0A1F15
Surface:    rgba(16, 185, 129, 0.05)
Accent:     linear-gradient(135deg, #10B981, #34D399)
```

### Theme 4: Slate Professional
```
Primary:    #64748B
Secondary:  #94A3B8
Background: #0F172A
Surface:    rgba(100, 116, 139, 0.05)
Accent:     linear-gradient(135deg, #64748B, #94A3B8)
```

### Theme 5: Burgundy Prestige
```
Primary:    #991B1B
Secondary:  #DC2626
Background: #1A0F0F
Surface:    rgba(153, 27, 27, 0.05)
Accent:     linear-gradient(135deg, #991B1B, #DC2626)
```

---

## 5. Expanded Settings Page Design

### Real Estate-Specific Settings Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SETTINGS - Real Estate Configuration                                        │
├──────────────────┬──────────────────────────────────────────────────────────┤
│                  │  GENERAL SETTINGS                                        │
│  General         │                                                          │
│  Branding        │  ┌────────────────────────────────────────────────────┐  │
│  Notifications   │  │ LICENSE & COMPLIANCE                                │  │
│  Integrations    │  │                                                    │  │
│  Team            │  │ Brokerage License: [RE-2026-12345]                 │  │
│  Billing         │  │ Expiry Date: [Dec 31, 2026]                        │  │
│                  │  │ [Upload License] ✓ Verified                        │  │
│  ──────────────  │  │                                                    │  │
│                  │  │ Agent Licenses Required: [✓]                       │  │
│  REAL ESTATE SPEC│  │ Background Check: [✓] Current                      │  │
│  ├─ Listings     │  │                                                    │  │
│  ├─ CMA          │  │ MLS Membership:                                    │  │
│  ├─ Showings     │  │ MLS ID: [MLS123456]                                │  │
│  ├─ Leads        │  │ Board: [Metro Association ▼]                       │  │
│  ├─ Agents       │  │                                                    │  │
│  └─ Transactions │  │ [Manage Compliance Docs]                           │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ LISTING MANAGEMENT                                  │  │
│                  │  │                                                    │  │
│                  │  │ Listing Types:                                     │  │
│                  │  │ [✓] Residential  [✓] Commercial  [✓] Land         │  │
│                  │  │ [✓] Multi-Family [✓] Rental     [✗] Auction      │  │
│                  │  │                                                    │  │
│                  │  │ Default Listing Terms:                             │  │
│                  │  │ Duration: [90] days                                │  │
│                  │  │ Auto-renew: [✓]                                    │  │
│                  │  │ Commission Rate: [2.5]%                            │  │
│                  │  │                                                    │  │
│                  │  │ Photo Requirements:                                │  │
│                  │  │ Minimum photos: [20]                               │  │
│                  │  │ Max file size: [10] MB                             │  │
│                  │  │ Virtual tour required: [✗]                        │  │
│                  │  │                                                    │  │
│                  │  │ [Manage Listing Templates]                         │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ CMA CONFIGURATION                                   │  │
│                  │  │                                                    │  │
│                  │  │ Comparable Search Radius: [2] miles                │  │
│                  │  │ Time Range: [6] months                             │  │
│                  │  │ Minimum Comps: [3]                                 │  │
│                  │  │ Maximum Comps: [10]                                │  │
│                  │  │                                                    │  │
│                  │  │ Adjustment Factors:                                │  │
│                  │  │ • Bedroom: [$15,000] per                           │  │
│                  │  │ • Bathroom: [$10,000] per                          │  │
│                  │  │ • Square Foot: [$150] per sqft                     │  │
│                  │  │ • Garage: [$8,000] per car                         │  │
│                  │  │ • Pool: [$25,000] flat                             │  │
│                  │  │                                                    │  │
│                  │  │ CMA Templates:                                     │  │
│                  │  │ [Standard] [Luxury] [Investment] [New Construction]│  │
│                  │  │                                                    │  │
│                  │  │ [Configure Adjustment Rules]                       │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ SHOWING MANAGEMENT                                  │  │
│                  │  │                                                    │  │
│                  │  │ Showing Windows:                                   │  │
│                  │  │ Min. notice: [2] hours                             │  │
│                  │  │ Max. advance: [30] days                            │  │
│                  │  │ Duration: [30] minutes per showing                 │  │
│                  │  │                                                    │  │
│                  │  │ Confirmation Settings:                             │  │
│                  │  │ Auto-confirm: [✓]                                  │  │
│                  │  │ Send reminders: [✓] 2 hours before                 │  │
│                  │  │ Require pre-approval: [✓] For financed buyers      │  │
│                  │  │                                                    │  │
│                  │  │ Feedback Collection:                               │  │
│                  │  │ Request feedback: [✓]                              │  │
│                  │  │ Follow-up: [✓] If no response in 24h               │  │
│                  │  │ Rating scale: [5-star ▼]                           │  │
│                  │  │                                                    │  │
│                  │  │ [Configure Showing Rules]                          │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ LEAD MANAGEMENT                                     │  │
│                  │  │                                                    │  │
│                  │  │ Lead Sources:                                      │  │
│                  │  │ [✓] Website    [✓] Zillow    [✓] Realtor.com      │  │
│                  │  │ [✓] Referrals  [✓] Social    [✓] Walk-ins         │  │
│                  │  │                                                    │  │
│                  │  │ Lead Assignment:                                   │  │
│                  │  │ Auto-assign: [✓] Round-robin                       │  │
│                  │  │ Response time goal: [15] minutes                   │  │
│                  │  │ Escalate after: [1] hour                           │  │
│                  │  │                                                    │  │
│                  │  │ Pipeline Stages:                                   │  │
│                  │  │ 1. New Lead                                        │  │
│                  │  │ 2. Contacted                                       │  │
│                  │  │ 3. Qualified                                       │  │
│                  │  │ 4. Showing Scheduled                               │  │
│                  │  │ 5. Offer Made                                      │  │
│                  │  │ 6. Under Contract                                  │  │
│                  │  │ 7. Closed                                          │  │
│                  │  │                                                    │  │
│                  │  │ [Customize Pipeline]                               │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ TRANSACTION MANAGEMENT                              │  │
│                  │  │                                                    │  │
│                  │  │ Document Requirements:                             │  │
│                  │  │ [✓] Purchase Agreement                             │  │
│                  │  │ [✓] Disclosure Forms                               │  │
│                  │  │ [✓] Inspection Reports                             │  │
│                  │  │ [✓] Appraisal                                      │  │
│                  │  │ [✓] Title Insurance                                │  │
│                  │  │                                                    │  │
│                  │  │ Milestone Tracking:                                │  │
│                  │  │ • Inspection contingency: [10] days                │  │
│                  │  │ • Financing contingency: [21] days                 │  │
│                  │  │ • Appraisal deadline: [14] days                    │  │
│                  │  │ • Closing date: [30-45] days                       │  │
│                  │  │                                                    │  │
│                  │  │ Commission Split:                                  │  │
│                  │  │ Brokerage: [30]%  Agent: [70]%                     │  │
│                  │  │ Transaction fee: [$495]                            │  │
│                  │  │                                                    │  │
│                  │  │ [Manage Transaction Templates]                     │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
└──────────────────┴──────────────────────────────────────────────────────────┘
```

---

## 6. API Endpoints Mapping

### Required APIs for Real Estate Dashboard

| Feature | API Endpoint | Method | Priority |
|---------|--------------|--------|----------|
| **Dashboard** ||||
| Get aggregate metrics | `/api/dashboard/aggregate` | GET | P0 |
| Get active listings | `/api/realestate/properties/active` | GET | P0 |
| Get lead pipeline stats | `/api/realestate/leads/pipeline` | GET | P0 |
| **Properties** ||||
| List properties | `/api/realestate/properties` | GET | P0 |
| Create property | `/api/realestate/properties` | POST | P0 |
| Get property details | `/api/realestate/properties/:id` | GET | P1 |
| Update property | `/api/realestate/properties/:id` | PUT | P1 |
| Delete property | `/api/realestate/properties/:id` | DELETE | P1 |
| Get property documents | `/api/realestate/properties/:id/documents` | GET | P2 |
| **CMA** ||||
| Generate CMA | `/api/realestate/cma/generate` | POST | P0 |
| Get CMA reports | `/api/realestate/cma/reports` | GET | P1 |
| Get CMA report | `/api/realestate/cma/reports/:id` | GET | P1 |
| Get comparables | `/api/realestate/cma/comparables` | GET | P1 |
| **Showings** ||||
| List showings | `/api/realestate/showings` | GET | P1 |
| Create showing | `/api/realestate/showings` | POST | P1 |
| Update showing | `/api/realestate/showings/:id` | PUT | P1 |
| Get showing feedback | `/api/realestate/showings/feedback` | GET | P2 |
| **Leads** ||||
| List leads | `/api/realestate/leads` | GET | P0 |
| Create lead | `/api/realestate/leads` | POST | P0 |
| Update lead | `/api/realestate/leads/:id` | PUT | P1 |
| Get lead pipeline | `/api/realestate/leads/pipeline` | GET | P1 |
| Convert lead | `/api/realestate/leads/:id/convert` | POST | P2 |
| **Agents** ||||
| List agents | `/api/realestate/agents` | GET | P1 |
| Create agent | `/api/realestate/agents` | POST | P1 |
| Get agent performance | `/api/realestate/agents/:id/performance` | GET | P1 |
| **Contracts** ||||
| List contracts | `/api/realestate/contracts` | GET | P2 |
| Create contract | `/api/realestate/contracts` | POST | P2 |
| Update contract status | `/api/realestate/contracts/:id/status` | PUT | P2 |

---

*Document generated as part of Batch 2 Design Documents - Real Estate Industry*
