# Batch 3 Design Document: AUTOMOTIVE Industry Dashboard
## Signature Clean Design with Vehicle Inventory Focus

**Document Version:** 1.0  
**Industry:** Automotive Dealership & Sales  
**Design Category:** Signature Clean  
**Plan Tier Support:** Basic → Pro  
**Last Updated:** 2026-03-11

---

## 1. Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (Clean Professional - Automotive)                                       │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo]  Dashboard  Inventory  Test Drives  Financing  Service  Parts  CRM ▼   │  │
│  │                                                                  [🔔] [👤 Pro] │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  DEALERSHIP OVERVIEW                [+ New Listing] [📊 Sales Report]          │  │
│  │  "Premium Auto Group | March 11, 2026"                                        │  │
│  │  Open Now | Service Bays: 8/12 Occupied | Test Drives Today: 24                 │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │   REVENUE   │ │   UNITS     │ │  SERVICE    │ │  TEST       │ │  FINANCE    │   │
│  │   $284.5K   │ │    47       │ │   $42.8K    │ │    24       │ │   $89.2K    │   │
│  │   ↑ 18.4%   │ │   ↑ 12.2%   │ │   ↑ 22.5%   │ │   ↑ 35.2%   │ │   ↑ 28.4%   │   │
│  │   [Chart]   │ │   [Chart]   │ │   [Chart]   │ │   [Chart]   │ │   [Chart]   │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       VEHICLE INVENTORY                 │ │       SALES TEAM PERFORMANCE     │   │
│  │                                         │ │                                  │   │
│  │  Total Inventory: 247 vehicles          │ │  Top Sales Consultants:          │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ 🚗 New (142) | Used (105)         │  │ │  │ 👤 Robert Martinez           │  │   │
│  │  │                                   │  │ │  │    12 sales | $84.2K rev   │  │   │
│  │  │ By Category:                      │  │ │  │    ████████████████████░░  │  │   │
│  │  │ Sedan (68)  SUV (92)  Truck (47)  │  │ │  │    Commission: $4,210      │  │   │
│  │  │ Luxury (28)  Electric (12)        │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │ 👤 Jennifer Lee            │  │   │
│  │  │ Featured Vehicles:                │  │ │  │    9 sales | $62.4K rev    │  │   │
│  │  │ ┌─────────────────────────────┐   │  │ │  │    ████████████████░░░░░░  │  │   │
│  │  │ │ 2026 BMW X5 xDrive40i       │   │  │ │  │    Commission: $3,120      │  │   │
│  │  │ │ MSRP: $68,500               │   │  │ │  │                            │  │   │
│  │  │ │ Days on Lot: 12             │   │  │ │  │ 👤 David Thompson          │  │   │
│  │  │ │ Views: 342 | Leads: 28      │   │  │ │  │    8 sales | $54.8K rev    │  │   │
│  │  │ │ [View Details] [Edit]       │   │  │ │  │    ███████████████░░░░░░░  │  │   │
│  │  │ └─────────────────────────────┘   │  │ │  │    Commission: $2,740      │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ ┌─────────────────────────────┐   │  │ │  │ [View All Sales Team]      │  │   │
│  │  │ │ 2026 Mercedes C300          │   │  │ │  │                            │  │   │
│  │  │ │ MSRP: $52,900               │   │  │ │  │ Team Stats:                │  │   │
│  │  │ │ Days on Lot: 8              │   │  │ │  │ • Total Sales: 47 units    │  │   │
│  │  │ │ Views: 284 | Leads: 32      │   │  │ │  │ • Total Revenue: $284.5K   │  │   │
│  │  │ │ [View Details] [Edit]       │   │  │ │  │ • Avg. per sale: $6,053    │  │   │
│  │  │ └─────────────────────────────┘   │  │ │  │ • Close rate: 24.7%        │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ [View Full Inventory]             │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ Inventory Aging:                  │  │ │  │                            │  │   │
│  │  │ 0-30 days: 62% | 31-60: 28%       │  │ │  │                            │  │   │
│  │  │ 61-90: 8% | 90+: 2%               │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       TEST DRIVE SCHEDULE               │ │       FINANCING PIPELINE         │   │
│  │                                         │ │                                  │   │
│  │  Today's Test Drives: 24                │ │  Active Applications: 18         │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ 10:00 AM - John Smith             │  │ │  │ ✅ Approved (12)           │  │   │
│  │  │    2026 BMW X5                    │  │ │  │ • Sarah M. - 3.9% APR      │  │   │
│  │  │    Status: ✓ Completed            │  │ │  │   $42,500 | 60 months      │  │   │
│  │  │    Rating: ⭐⭐⭐⭐⭐              │  │ │  │   ✅ Contract signed         │  │   │
│  │  │    Interest: High ●               │  │ │  │                            │  │   │
│  │  │    [Follow-up] [Convert]          │  │ │  │ • James T. - 4.2% APR      │  │   │
│  │  │                                   │  │ │  │   $38,900 | 72 months      │  │   │
│  │  │ 11:00 AM - Emily Davis            │  │ │  │   ⏳ Awaiting signature    │  │   │
│  │  │    2026 Mercedes C300             │  │ │  │                            │  │   │
│  │  │    Status: ● In Progress          │  │ │  │ ⏳ Pending Review (6)      │  │   │
│  │  │    Sales Rep: Robert M.           │  │ │  │ • Michael B. - Credit 720  │  │   │
│  │  │    [Check-in] [Notes]             │  │ │  │   Est. APR: 4.5-5.2%       │  │   │
│  │  │                                   │  │ │  │   Income verified ✓        │  │   │
│  │  │ 1:00 PM - Michael Brown            │  │ │  │   ⏳ Lender decision       │  │   │
│  │  │    2026 Audi Q7                   │  │ │  │                            │  │   │
│  │  │    Status: ⏳ Scheduled            │  │ │  │ • Lisa K. - Credit 680     │  │   │
│  │  │    Walk-in                        │  │ │  │   Est. APR: 5.5-6.5%       │  │   │
│  │  │    [Prepare Vehicle]              │  │ │  │   Additional docs needed   │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ [View Calendar] [Schedule Drive]   │  │ │  │ ❌ Declined (0)            │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ Conversion Rate: 42%               │  │ │  │ [F&I Manager Dashboard]    │  │   │
│  │  │ Avg. drive-to-sale: 2.4 days       │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │ Lender Relationships:      │  │   │
│  │  │ Upcoming Tomorrow: 18 drives       │  │ │  │ • Chase: 8 approved        │  │   │
│  │  │                                   │  │ │  │ • BofA: 6 approved         │  │   │
│  │  │                                    │  │ │  │ • Wells: 4 approved        │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       SERVICE DEPARTMENT                │ │       PARTS INVENTORY            │   │
│  │                                         │ │                                  │   │
│  │  Service Bays: 8/12 Occupied            │ │  Total Parts SKUs: 2,847         │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ Bay 1-3: Oil Change (3 vehicles)  │  │ │  │ Low Stock Alerts:          │  │   │
│  │  │    Est. completion: 11:30 AM      │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │ 🔴 Oil Filter 5W-30 (24)   │  │   │
│  │  │ Bay 4-6: Tire Rotation (2 veh)    │  │ │  │    Reorder point: 50       │  │   │
│  │  │    Est. completion: 12:00 PM      │  │ │  │    [Order Now]              │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ Bay 7-9: Brake Service (2 veh)    │  │ │  │ 🟡 Brake Pads - Front (42) │  │   │
│  │  │    Est. completion: 2:00 PM       │  │ │  │    Reorder point: 60       │  │   │
│  │  │    Upsell: Rotor replacement      │  │ │  │    [Add to PO]              │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ Bay 10-12: Engine Diagnostic (1)  │  │ │  │ 🟢 Air Filters (124)       │  │   │
│  │  │    Est. completion: 3:30 PM       │  │ │  │    Healthy stock           │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ [Service Scheduler] [Bay Status]   │  │ │  │ Parts Sales Today: $4,280  │  │   │
│  │  │                                   │  │ │  │ Counter Sales: 24 orders   │  │   │
│  │  │ Service Advisors:                   │  │ │  │ Wholesale: 8 orders      │  │   │
│  │  │ • Linda K. (6 bays) ● Busy        │  │ │  │                            │  │   │
│  │  │ • Marcus T. (2 bays) ✓ Available  │  │ │  │ [View Inventory] [Order]   │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ Today's ROs: 42 | Revenue: $8,420  │  │ │  │                            │  │   │
│  │  │ CSI Score: 4.8/5.0                 │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                         AI INSIGHTS (Pro Tier Only)                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ 💡 Pricing Alert: 2026 BMW X5 priced 3% below market average            │  │  │
│  │  │    Based on: Competitor pricing, demand velocity, inventory age         │  │  │
│  │  │    Recommendation: Increase MSRP by $1,800 or highlight value in ads    │  │  │
│  │  │    Impact: +$2,400 margin or 40% faster sale                            │  │  │
│  │  │  [Adjust Price] [View Analysis]                                         │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Category Application

### Signature Clean Design System

**Primary Palette:**
```
Background Primary:   #FFFFFF (Pure white)
Background Secondary: #F8FAFC (Light gray-blue)
Background Tertiary:  #F1F5F9 (Subtle panels)

Accent Primary:       #3B82F6 (Professional blue)
Accent Secondary:     #60A5FA (Soft blue)
Accent Tertiary:      #DBEAFE (Light blue highlight)

Text Primary:         #0F172A (Dark slate)
Text Secondary:       #475569 (Medium slate)
Text Tertiary:        #94A3B8 (Light slate)

Status Colors:
  Available: #10B981 (Green)
  Reserved:  #F59E0B (Amber)
  Sold:      #EF4444 (Red)
  New:       #3B82F6 (Blue)
```

---

*Continuing with complete specification...*

## 3. Component Hierarchy

```
AutomotiveDashboard (Root)
├── DashboardHeader
│   ├── BreadcrumbNav
│   ├── ActionButtons
│   │   ├── NewListingButton
│   │   └── SalesReportButton
│   └── DealershipStatus
├── KPIRow (5 metrics)
│   └── AutomotiveMetricCard × 5
│       ├── TrendChart
│       ├── TrendIndicator
│       └── ValueDisplay
├── ContentGrid (2 columns)
│   ├── LeftColumn
│   │   ├── VehicleInventory
│   │   │   ├── InventoryStats
│   │   │   ├── CategoryBreakdown
│   │   │   ├── FeaturedVehicle × N
│   │   │   └── AgingAnalysis
│   │   ├── TestDriveSchedule
│   │   │   ├── TodayDrives
│   │   │   ├── DriveCard × N
│   │   │   ├── ConversionRate
│   │   │   └── ScheduleButton
│   │   └── ServiceDepartment
│   │       ├── BayStatus
│   │       ├── ServiceAdvisor × N
│   │       └── CSIScore
│   └── RightColumn
│       ├── SalesTeamPerformance
│       │   ├── SalesCard × N
│       │   ├── CommissionDisplay
│       │   └── TeamStats
│       ├── FinancingPipeline
│       │   ├── ApplicationCard × N
│       │   ├── StatusTracker
│       │   └── LenderRelationships
│       └── PartsInventory
│           ├── StockAlerts
│           ├── PartsSales
│           └── OrderActions
└── AIInsightsPanel (Pro Tier)
    └── PricingRecommendation
```

---

## 4. 5 Theme Presets

### Theme 1: Professional Blue (Default)
```
Primary:    #3B82F6
Secondary:  #60A5FA
Background: #FFFFFF
Surface:    #F8FAFC
Accent:     linear-gradient(135deg, #3B82F6, #60A5FA)
```

### Theme 2: Performance Red
```
Primary:    #EF4444
Secondary:  #F87171
Background: #FFFFFF
Surface:    #FEF2F2
Accent:     linear-gradient(135deg, #EF4444, #F87171)
```

### Theme 3: Luxury Silver
```
Primary:    #6B7280
Secondary:  #9CA3AF
Background: #FFFFFF
Surface:    #F9FAFB
Accent:     linear-gradient(135deg, #6B7280, #9CA3AF)
```

### Theme 4: Electric Blue
```
Primary:    #2563EB
Secondary:  #3B82F6
Background: #FFFFFF
Surface:    #EFF6FF
Accent:     linear-gradient(135deg, #2563EB, #3B82F6)
```

### Theme 5: Forest Green
```
Primary:    #16A34A
Secondary:  #22C55E
Background: #FFFFFF
Surface:    #F0FDF4
Accent:     linear-gradient(135deg, #16A34A, #22C55E)
```

---

## 5. API Endpoints Mapping

### Required APIs for Automotive Dashboard

| Feature | API Endpoint | Method | Priority |
|---------|--------------|--------|----------|
| **Dashboard** ||||
| Get aggregate metrics | `/api/dashboard/aggregate` | GET | P0 |
| Get inventory stats | `/api/automotive/vehicles/stats` | GET | P0 |
| Get test drives today | `/api/automotive/test-drives/today` | GET | P0 |
| **Vehicles** ||||
| List vehicles | `/api/automotive/vehicles` | GET | P0 |
| Create vehicle | `/api/automotive/vehicles` | POST | P0 |
| Get vehicle details | `/api/automotive/vehicles/:id` | GET | P1 |
| Update vehicle | `/api/automotive/vehicles/:id` | PUT | P1 |
| Delete vehicle | `/api/automotive/vehicles/:id` | DELETE | P1 |
| Get vehicle history | `/api/automotive/vehicles/:id/history` | GET | P2 |
| **Test Drives** ||||
| List test drives | `/api/automotive/test-drives` | GET | P1 |
| Schedule test drive | `/api/automotive/test-drives` | POST | P0 |
| Update test drive | `/api/automotive/test-drives/:id` | PUT | P1 |
| Get availability | `/api/automotive/test-drives/availability` | GET | P1 |
| **Financing** ||||
| Calculate financing | `/api/automotive/financing/calculate` | POST | P0 |
| Get rates | `/api/automotive/financing/rates` | GET | P1 |
| Get applications | `/api/automotive/financing/applications` | GET | P1 |
| **Service** ||||
| Get service appointments | `/api/automotive/service/appointments` | GET | P1 |
| Schedule service | `/api/automotive/service/appointments` | POST | P1 |
| Get service packages | `/api/automotive/service/packages` | GET | P2 |
| Create service package | `/api/automotive/service/packages` | POST | P2 |
| Get service history | `/api/automotive/service/history` | GET | P2 |
| **Parts** ||||
| List parts | `/api/automotive/parts` | GET | P1 |
| Create part | `/api/automotive/parts` | POST | P1 |
| Get parts categories | `/api/automotive/parts/categories` | GET | P2 |
| Get low stock | `/api/automotive/parts/low-stock` | GET | P1 |
| **Trade-ins** ||||
| Estimate trade-in | `/api/automotive/tradein/estimate` | POST | P1 |
| Get appraisals | `/api/automotive/tradein/appraisals` | GET | P2 |
| Update appraisal | `/api/automotive/tradein/appraisals/:id` | PUT | P2 |
| **Sales Team** ||||
| Get sales team | `/api/automotive/sales-team` | GET | P1 |
| Get sales performance | `/api/automotive/sales-team/:id/performance` | GET | P1 |
| Assign leads | `/api/automotive/sales-team/:id/assignments` | POST | P2 |

---

*Document generated as part of Batch 3 Design Documents - Automotive Industry*
