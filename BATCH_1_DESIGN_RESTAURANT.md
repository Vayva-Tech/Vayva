# Batch 1 Design Document: RESTAURANT Industry Dashboard
## Bold Energy (FOH) + Modern Dark (KDS) Dual Design System

**Document Version:** 1.0  
**Industry:** Restaurant & Food Service  
**Design Categories:** Bold Energy (Front of House), Modern Dark (Kitchen Display)  
**Plan Tier Support:** Basic → Pro  
**Last Updated:** 2026-03-11

---

## 1. Visual Layout Diagram

### Front of House (FOH) Dashboard - Bold Energy Design

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (Bold Gradient)                                                         │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo]  Dashboard  Orders  Tables  Menu  Reservations  Staff  Analytics  ▼   │  │
│  │                                                                  [🔔] [👤 Pro] │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  SERVICE OVERVIEW                    [Start Shift] [📊 End of Day Report]     │  │
│  │  "Lunch Service - March 11, 2026"                                             │  │
│  │  Current Status: ● Rush Hour | Next: Dinner Prep in 2h                        │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │  REVENUE    │ │   ORDERS    │ │    GUESTS   │ │ TABLE TURN  │ │ AVG TICKET  │   │
│  │   $8,420    │ │    142      │ │    387      │ │   2.4x      │ │   $21.75    │   │
│  │   ↑ 18.2%   │ │   ↑ 24.5%   │ │   ↑ 12.8%   │ │   ↑ 0.3x    │ │   ↑ $2.40   │   │
│  │   [Live]    │ │   [Live]    │ │   [Live]    │ │   [Live]    │ │   [Live]    │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       LIVE ORDER FEED                   │ │       TABLE STATUS               │   │
│  │                                         │ │                                  │   │
│  │  ┌─────────────────────────────────┐    │ │  Floor Plan: Main Dining        │   │
│  │  │ 🕐 12:45 PM - Table 12          │    │ │  ┌───┬───┬───┬───┬───┐         │   │
│  │  │    2 guests | Server: Maria      │    │ │  │T1 │T2 │T3 │T4 │T5 │         │   │
│  │  │    Order: 3 apps, 2 mains        │    │ │  ├───┼───┼───┼───┼───┤         │   │
│  │  │    Status: Cooking (8 min)       │    │ │  │T6 │T7 │T8 │T9 │T10│         │   │
│  │  └─────────────────────────────────┘    │ │  ├───┼───┼───┼───┼───┤         │   │
│  │                                          │ │  │T11│T12│T13│T14│T15│         │   │
│  │  ┌─────────────────────────────────┐    │ │  └───┴───┴───┴───┴───┘         │   │
│  │  │ 🕐 12:42 PM - Takeout #245      │    │ │                                  │   │
│  │  │    Pickup: 12:55 PM            │    │ │  Legend:                        │   │
│  │  │    Items: 4 dishes             │    │ │  🟢 Available  🔵 Seated        │   │
│  │  │    Status: Ready for pickup    │    │ │  🟡 Ordering    🟠 Cooking      │   │
│  │  └─────────────────────────────────┘    │ │  🔴 Reserved    ⚫ Offline      │   │
│  │                                          │ │                                  │   │
│  │  ┌─────────────────────────────────┐    │ │  Occupancy: 78% (24/31 seats)   │   │
│  │  │ 🕐 12:38 PM - Delivery #892     │    │ │  Wait Time: 15-20 min           │   │
│  │  │    Driver: John (UberEats)     │    │ │                                  │   │
│  │  │    Destination: 2.3 mi away    │    │ │  [View Full Floor Plan]         │   │
│  │  │    Status: Picked up           │    │ │                                  │   │
│  │  └─────────────────────────────────┘    │ │                                  │   │
│  │                                         │ └──────────────────────────────────┘   │
│  │  [View All Orders] [Filter: Dine-in ▼]  │                                        │
│  │                                         │                                        │
│  └─────────────────────────────────────────┘                                         │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       MENU PERFORMANCE                  │ │       STAFF ACTIVITY             │   │
│  │                                         │ │                                  │   │
│  │  Top Sellers (Lunch):                   │ │  On Shift: 8 staff members       │   │
│  │  ┌───────────────────────────────────┐  │ │                                  │   │
│  │  │ 1. Truffle Pasta    47 orders     │  │ │ Servers:                         │   │
│  │  │    ████████████████████░░░░ 82%   │  │ │ • Maria - Table 12 (Rushing)    │   │
│  │  │ 2. Caesar Salad     38 orders     │  │ │ • James - Table 7-9             │   │
│  │  │    ████████████████░░░░░░░░ 68%   │  │ │ • Sarah - Table 14-15           │   │
│  │  │ 3. Grilled Salmon   29 orders     │  │ │                                  │   │
│  │  │    ████████████░░░░░░░░░░░░ 54%   │  │ │ Kitchen:                         │   │
│  │  └───────────────────────────────────┘  │ │ • Chef Mike - 24 active tickets │   │
│  │                                         │ │ • Line Cook 1 - Prepping        │   │
│  │  86 Board Alerts:                       │ │ • Dishwasher - 98% efficiency   │   │
│  │  ⚠️ Avocado - LOW STOCK (12 left)      │ │                                  │   │
│  │  ❌ Lobster - OUT OF STOCK             │ │  Performance Today:              │   │
│  │  ⚠️ Sea Bass - Running low (4 portions)│ │  Avg Ticket Time: 18 min         │   │
│  │                                         │ │  Customer Satisfaction: 4.7★     │   │
│  │  [Manage 86 Board]                      │ │  Tips Pool: $847                 │   │
│  │                                         │ │                                  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       RESERVATIONS TIMELINE             │ │       DELIVERY INTEGRATION       │   │
│  │                                         │ │                                  │   │
│  │  11 AM    12 PM    1 PM    2 PM    3PM  │ │  Active Deliveries: 12           │   │
│  │  ├──────┼────────┼────────┼──────┤      │ │                                  │   │
│  │  │ ████ │ ██████ │ ████   │ ██   │      │ │  Platform Breakdown:             │   │
│  │  │ 12   │ 24     │ 18     │ 8    │      │ │  ┌───────────────────────────┐  │   │
│  │  └──────┴────────┴────────┴──────┘      │ │  │ UberEats    │ 8 orders   │  │   │
│  │                                         │ │  │ DoorDash    │ 3 orders   │  │   │
│  │  Upcoming (Next Hour):                  │ │  │ Grubhub     │ 1 order    │  │   │
│  │  ┌───────────────────────────────────┐  │ │  └───────────────────────────┘  │   │
│  │  │ 1:00 PM - Party of 4 (Table 8)    │  │ │                                  │   │
│  │  │ 1:15 PM - Party of 6 (Table 15)   │  │ │  Revenue by Channel:            │   │
│  │  │ 1:30 PM - Walk-in (Est. 15min)    │  │ │  Dine-in:    $6,240 (74%)       │   │
│  │  │ 1:45 PM - Party of 2 (Table 3)    │  │ │  Takeout:    $1,420 (17%)       │   │
│  │  └───────────────────────────────────┘  │ │  Delivery:   $760 (9%)          │   │
│  │                                         │ │                                  │   │
│  │  [+ New Reservation] [Waitlist: 5]      │ │  [Sync All Platforms]            │   │
│  │                                         │ │                                  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                         AI INSIGHTS (Pro Tier Only)                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ 💡 Prediction: Dinner rush will be 30% busier than average Wednesday    │  │  │
│  │  │    Based on: Weather forecast, local events, historical patterns         │  │  │
│  │  │    Recommendation: Call in 2 additional servers for 5-9 PM shift        │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

### Kitchen Display System (KDS) - Modern Dark Design

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  KITCHEN DISPLAY SYSTEM - Main Station                                              │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  [Station: Grill ▼]  [Filter: All ▼]  [Sound: ON]  [Shift: Lunch]  [12:47 PM] │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌─────────────────────────────────┐ ┌─────────────────────────────────┐           │
│  │  TICKET #342 - TABLE 12         │ │  TICKET #345 - TABLE 7          │           │
│  │  ─────────────────────────────  │ │  ─────────────────────────────  │           │
│  │  👤 Server: Maria               │ │  👤 Server: James               │           │
│  │  ⏱️  8 minutes                 │ │  ⏱️  12 minutes                │           │
│  │                                 │ │                                 │           │
│  │  ITEMS:                         │ │  ITEMS:                         │           │
│  │  ✓ Caesar Salad x2              │ │  ○ Onion Rings x1               │           │
│  │  ✓ Bruschetta x1                │ │  ○ Calamari x2                  │           │
│  │  ○ Truffle Pasta x2      [COOK] │ │  ● Burger Medium x1      [PLATE]│           │
│  │  ○ Ribeye 12oz x1        [GRILL]│ │  ○ Fries x2              [COOK] │           │
│  │                                 │ │  ○ Coke x2               [POUR] │           │
│  │  [START] [BUMP 15m] [URGENT]    │ │                                 │           │
│  │                                 │ │  [START] [BUMP 10m] [URGENT]    │           │
│  │  MODIFIERS:                     │ │                                 │           │
│  │  • Pasta: GF option             │ │  MODIFIERS:                     │           │
│  │  • Ribeye: Med-rare, no sauce   │ │  • Burger: No onions            │           │
│  │                                 │ │                                 │           │
│  └─────────────────────────────────┘ └─────────────────────────────────┘           │
│                                                                                     │
│  ┌─────────────────────────────────┐ ┌─────────────────────────────────┐           │
│  │  TICKET #348 - TAKEOUT #245     │ │  TICKET #351 - TABLE 15         │           │
│  │  ─────────────────────────────  │ │  ─────────────────────────────  │           │
│  │  🛍️ Pickup: 12:55 PM           │ │  👤 Server: Sarah               │           │
│  │  ⏱️  3 minutes (READY SOON)     │ │  ⏱️  2 minutes (FRESH)         │           │
│  │                                 │ │                                 │           │
│  │  ITEMS:                         │ │  ITEMS:                         │           │
│  │  ✓ Pad Thai x2           [DONE] │ │  ○ Margherita Pizza x1   [OVEN] │           │
│  │  ✓ Spring Rolls x1       [DONE] │ │  ○ Caprese Salad x1      [PREP] │           │
│  │  ✓ Tom Yum Soup x1       [DONE] │ │  ○ Tiramisu x1           [WAIT] │           │
│  │  ○ Sticky Rice x1        [COOK] │ │                                 │           │
│  │                                 │ │  [START] [BUMP 5m] [URGENT]     │           │
│  │  [MARK READY] [PRINT LABEL]     │ │                                 │           │
│  │                                 │ │  ALLERGIES:                     │           │
│  │  PAYMENT: ✅ Paid               │ │  • Nut allergy (Table)          │           │
│  │                                 │ │                                 │           │
│  └─────────────────────────────────┘ └─────────────────────────────────┘           │
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  PREP LIST - Today                                                            │  │
│  │  ──────────────────────────────────────────────────────────────────────────   │  │
│  │  Garlic Oil:      ████████████░░░░ 78%  ✓ Done                               │  │
│  │  Tomato Sauce:    ██████████░░░░░░░░ 62%  ⚠️ Need more                       │  │
│  │  Breadsticks:     ████████████████░░ 85%  ✓ Done                             │  │
│  │  Salad Mix:       ████████░░░░░░░░░░ 45%  ⚠️ Start batch                     │  │
│  │  Desserts:        ██████░░░░░░░░░░░░ 32%  ⚠️ Low                             │  │
│  │                                                                               │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Category Application

### FOH: Bold Energy Design System

**Primary Palette:**
```
Background Primary:   #1A1A1A (Charcoal)
Background Secondary: #252525 (Dark gray)
Background Tertiary:  rgba(255, 255, 255, 0.05) (Panels)

Accent Primary:       #FF6B35 (Vibrant orange - energy)
Accent Secondary:     #FF8C42 (Soft orange)
Accent Tertiary:      #FFB347 (Amber highlight)

Text Primary:         #FFFFFF (Pure white)
Text Secondary:       rgba(255, 255, 255, 0.8)
Text Tertiary:        rgba(255, 255, 255, 0.6)

Status Colors:
  Rush:    #FF4757 (Red-orange)
  Busy:    #FFA502 (Orange)
  Normal:  #2ED573 (Green)
  Slow:    #1E90FF (Blue)
```

**Bold Effects:**
```css
/* Bold Panel */
.bold-panel {
  background: linear-gradient(135deg, #252525 0%, #1A1A1A 100%);
  border: 2px solid #FF6B35;
  border-radius: 12px;
}

/* Live Indicator Pulse */
@keyframes pulse-live {
  0% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(255, 107, 53, 0); }
  100% { box-shadow: 0 0 0 0 rgba(255, 107, 53, 0); }
}

.live-indicator {
  animation: pulse-live 2s infinite;
}

/* Gradient Accent */
.accent-gradient {
  background: linear-gradient(90deg, #FF6B35 0%, #FF8C42 100%);
}
```

### KDS: Modern Dark Design System

**Primary Palette:**
```
Background Primary:   #0D0D0D (Near black)
Background Secondary: #1A1A1A (Dark surfaces)
Background Tertiary:  #252525 (Card backgrounds)

Accent Primary:       #00D9FF (Cyan - modern tech)
Accent Secondary:     #00B8D4 (Teal)
Accent Tertiary:      #7DE2F9 (Light cyan)

Text Primary:         #FFFFFF
Text Secondary:       rgba(255, 255, 255, 0.85)
Text Tertiary:        rgba(255, 255, 255, 0.65)

Ticket Status:
  Fresh:   #00D9FF (Cyan)
  Cooking: #FFA502 (Orange)
  Ready:   #2ED573 (Green)
  Urgent:  #FF4757 (Red)
  Overdue: #FF6B81 (Pink-red)
```

---

## 3. Component Hierarchy

```
RestaurantDashboard (Root)
├── DashboardHeader
│   ├── BreadcrumbNav
│   ├── ServiceStatus
│   │   ├── CurrentService
│   │   └── NextServiceCountdown
│   └── QuickActions
│       ├── StartShiftButton
│       └── EndOfDayReportButton
├── KPIRow (5 metrics)
│   └── RestaurantMetricCard × 5
│       ├── LiveIndicator
│       ├── TrendIndicator
│       └── ValueDisplay
├── ContentGrid (2 columns)
│   ├── LeftColumn
│   │   ├── LiveOrderFeed
│   │   │   └── OrderItem × N
│   │   ├── MenuPerformance
│   │   │   ├── TopSellersList
│   │   │   └── EightySixBoard
│   │   └── ReservationsTimeline
│   │       ├── TimelineChart
│   │       └── UpcomingList
│   └── RightColumn
│       ├── TableStatusFloorPlan
│       │   ├── FloorPlanGrid
│       │   ├── TableLegend
│       │   └── OccupancyStats
│       ├── StaffActivityPanel
│       │   ├── OnShiftList
│       │   └── PerformanceMetrics
│       └── DeliveryIntegration
│           ├── PlatformBreakdown
│           └── ChannelRevenue
└── AIInsightsPanel (Pro Tier)
    └── PredictionCard

KitchenDisplaySystem (Root)
├── KDSHeader
│   ├── StationSelector
│   ├── FilterControls
│   ├── SoundToggle
│   └── CurrentTime
├── TicketGrid
│   └── TicketCard × N
│       ├── TicketHeader
│       │   ├── TableNumber
│       │   ├── ServerName
│       │   └── TimerDisplay
│       ├── TicketItems
│       │   └── TicketItem × N
│       │       ├── ItemName
│       │       ├── Quantity
│       │       ├── StatusBadge
│       │       └── StationButton
│       ├── TicketModifiers
│       └── TicketActions
│           ├── StartButton
│           ├── BumpButton
│           └── UrgentButton
└── PrepListPanel
    └── PrepItem × N
```

---

## 4. 5 Theme Presets

### FOH Themes

#### Theme 1: Bold Orange (Default)
```
Primary:    #FF6B35
Secondary:  #FF8C42
Background: #1A1A1A
Surface:    #252525
Accent:     linear-gradient(90deg, #FF6B35, #FF8C42)
```

#### Theme 2: Electric Blue
```
Primary:    #3B82F6
Secondary:  #60A5FA
Background: #0F172A
Surface:    #1E293B
Accent:     linear-gradient(90deg, #3B82F6, #60A5FA)
```

#### Theme 3: Fiery Red
```
Primary:    #EF4444
Secondary:  #F87171
Background: #1A0F0F
Surface:    #2A1515
Accent:     linear-gradient(90deg, #EF4444, #F87171)
```

#### Theme 4: Fresh Green
```
Primary:    #22C55E
Secondary:  #4ADE80
Background: #0F1A0F
Surface:    #1A2A1A
Accent:     linear-gradient(90deg, #22C55E, #4ADE80)
```

#### Theme 5: Golden Hour
```
Primary:    #F59E0B
Secondary:  #FBBF24
Background: #1A140A
Surface:    #2A2214
Accent:     linear-gradient(90deg, #F59E0B, #FBBF24)
```

### KDS Themes

#### Theme 1: Cyan Tech (Default)
```
Primary:    #00D9FF
Secondary:  #00B8D4
Background: #0D0D0D
Surface:    #1A1A1A
Accent:     linear-gradient(90deg, #00D9FF, #00B8D4)
```

#### Theme 2: Matrix Green
```
Primary:    #00FF88
Secondary:  #00DD77
Background: #0A0F0A
Surface:    #1A251A
Accent:     linear-gradient(90deg, #00FF88, #00DD77)
```

#### Theme 3: Plasma Purple
```
Primary:    #A855F7
Secondary:  #C084FC
Background: #0F0A1A
Surface:    #1A142A
Accent:     linear-gradient(90deg, #A855F7, #C084FC)
```

#### Theme 4: Sunset Orange
```
Primary:    #F97316
Secondary:  #FB923C
Background: #1A0F0A
Surface:    #2A1A14
Accent:     linear-gradient(90deg, #F97316, #FB923C)
```

#### Theme 5: Arctic Blue
```
Primary:    #38BDF8
Secondary:  #7DD3FC
Background: #0A141A
Surface:    #14252A
Accent:     linear-gradient(90deg, #38BDF8, #7DD3FC)
```

---

## 5. Expanded Settings Page Design

### Restaurant-Specific Settings Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SETTINGS - Restaurant Configuration                                         │
├──────────────────┬──────────────────────────────────────────────────────────┤
│                  │  GENERAL SETTINGS                                        │
│  General         │                                                          │
│  Branding        │  ┌────────────────────────────────────────────────────┐  │
│  Notifications   │  │ HOURS & SERVICE                                     │  │
│  Integrations    │  │                                                    │  │
│  Team            │  │ Operating Hours:                                   │  │
│  Billing         │  │ Mon-Thu:  [11:00 AM] - [10:00 PM]                 │  │
│                  │  │ Fri-Sat:   [11:00 AM] - [11:00 PM]                │  │
│  ──────────────  │  │ Sunday:    [12:00 PM] - [9:00 PM]                 │  │
│                  │  │                                                    │  │
│  RESTAURANT SPEC │  │ Service Types:                                     │  │
│  ├─ Menu Mgmt    │  │ [✓] Dine-in   [✓] Takeout   [✓] Delivery          │  │
│  ├─ Table Mgmt   │  │ [✓] Reservations [✓] Catering  [✗] Drive-thru    │  │
│  ├─ Kitchen      │  │                                                    │  │
│  ├─ Staff        │  │ Rush Hour Settings:                                │  │
│  ├─ Inventory    │  │ Morning: [✗]  Lunch: [✓] 11:30AM-2PM             │  │
│  └─ Delivery     │  │ Dinner: [✓] 5PM-9PM  Late: [✗]                    │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ TABLE MANAGEMENT                                    │  │
│                  │  │                                                    │  │
│                  │  │ Total Tables: [31]    Total Seats: [120]           │  │
│                  │  │                                                    │  │
│                  │  │ Table Configuration:                               │  │
│                  │  │ 2-tops: [8]  4-tops: [12]  6-tops: [6]            │  │
│                  │  │ 8+ tops: [3]  Bar seats: [12]                      │  │
│                  │  │                                                    │  │
│                  │  │ Floor Plan:                                        │  │
│                  │  │ [Upload Floor Plan Image]                          │  │
│                  │  │ [Configure Table Layout Editor]                    │  │
│                  │  │                                                    │  │
│                  │  │ Turn Time Goals:                                   │  │
│                  │  │ Lunch:  [45] minutes  Dinner: [60] minutes         │  │
│                  │  │ Bar:    [30] minutes  Large parties: [90] minutes  │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ MENU MANAGEMENT                                     │  │
│                  │  │                                                    │  │
│                  │  │ Active Menus:                                      │  │
│                  │  │ [✓] Lunch Menu    [✓] Dinner Menu                 │  │
│                  │  │ [✓] Weekend Brunch [✓] Happy Hour                 │  │
│                  │  │ [✓] Kids Menu    [✓] Bar Menu                     │  │
│                  │  │                                                    │  │
│                  │  │ Menu Display Settings:                             │  │
│                  │  │ • Show Calories: [✓]                              │  │
│                  │  │ • Show Allergens: [✓]                             │  │
│                  │  │ • Dietary Icons: [✓] Vegan [✓] GF [✓] Spicy      │  │
│                  │  │                                                    │  │
│                  │  │ 86 Board Auto-Update: [✓] Enable                   │  │
│                  │  │ Low Stock Threshold: [10] portions                 │  │
│                  │  │                                                    │  │
│                  │  │ [Manage Menu Items] [Import Menu]                  │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ KITCHEN CONFIGURATION                               │  │
│                  │  │                                                    │  │
│                  │  │ Kitchen Stations:                                  │  │
│                  │  │ [✓] Grill    [✓] Fryer    [✓] Sauté               │  │
│                  │  │ [✓] Cold     [✓] Expo     [✓] Bar                 │  │
│                  │  │ [✓] Pizza    [✓] Sushi    [✓] Dessert             │  │
│                  │  │                                                    │  │
│                  │  │ KDS Settings:                                      │  │
│                  │  │ • Auto-route items: [✓]                           │  │
│                  │  │ • Fire times: [Immediate ▼]                       │  │
│                  │  │ • Course timing: [App: 0min, Main: +15min ▼]      │  │
│                  │  │                                                    │  │
│                  │  │ Ticket Bump Rules:                                 │  │
│                  │  │ Auto-bump after: [90] minutes                     │  │
│                  │  │ Alert at: [45] minutes                            │  │
│                  │  │ Urgent at: [75] minutes                           │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ RESERVATION RULES                                   │  │
│                  │  │                                                    │  │
│                  │  │ Accept Reservations: [✓] Enable                    │  │
│                  │  │ Advance Booking: [30] days                         │  │
│                  │  │ Cutoff Time: [2] hours before                      │  │
│                  │  │                                                    │  │
│                  │  │ Party Size Limits:                                 │  │
│                  │  │ Online Max: [8] guests                             │  │
│                  │  │ Phone Max: [Unlimited]                             │  │
│                  │  │ Auto-assign tables: [✓]                            │  │
│                  │  │                                                    │  │
│                  │  │ Deposit Policy:                                    │  │
│                  │  │ Require deposit for parties of: [6+] people       │  │
│                  │  │ Deposit amount: [$20] per person                  │  │
│                  │  │ Cancellation fee: [$10] per person                │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ DELIVERY INTEGRATION                                │  │
│                  │  │                                                    │  │
│                  │  │ Connected Platforms:                               │  │
│                  │  │ [✓] UberEats   [✓] DoorDash   [✓] Grubhub         │  │
│                  │  │ [✗] Postmates [✗] Deliveroo  [✗] Local           │  │
│                  │  │                                                    │  │
│                  │  │ Delivery Radius: [5] miles                         │  │
│                  │  │ Delivery Fee: [$4.99]                              │  │
│                  │  │ Minimum Order: [$15]                               │  │
│                  │  │                                                    │  │
│                  │  │ Packaging:                                         │  │
│                  │  │ [✓] Include utensils by default                   │  │
│                  │  │ [✓] Ventilated bags for crispy items              │  │
│                  │  │ [✓] Separate hot/cold items                       │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ STAFF MANAGEMENT                                    │  │
│                  │  │                                                    │  │
│                  │  │ Tip Pool Configuration:                            │  │
│                  │  │ Enable tip pool: [✓]                              │  │
│                  │  │ Distribution:                                      │  │
│                  │  │ Servers: [60%]  Bartenders: [20%]  Runners: [10%] │  │
│                  │  │ Kitchen: [10%]                                     │  │
│                  │  │                                                    │  │
│                  │  │ Role Permissions:                                  │  │
│                  │  │ [Manager Access] [Server Access] [Kitchen Access]  │  │
│                  │  │ [Host Access] [Bartender Access]                   │  │
│                  │  │                                                    │  │
│                  │  │ Labor Cost Target: [30]% of sales                  │  │
│                  │  │                                                    │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
└──────────────────┴──────────────────────────────────────────────────────────┘
```

---

## 6. Marketing & Social Integration

### Restaurant Marketing Module

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ MARKETING - Restaurant Promotion                                            │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  LOYALTY PROGRAM                                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Program Status: [Active]    Members: 2,847 (+124 this month)          │  │
│  │                                                                       │  │
│  │ Rewards Structure:                                                   │  │
│  │ • Earn 1 point per $1 spent                                           │  │
│  │ • 100 points = $10 off                                               │  │
│  │ • Birthday reward: Free dessert                                       │  │
│  │ • Anniversary: Free appetizer                                         │  │
│  │                                                                       │  │
│  │ [Manage Rewards] [Send Points] [Export Members]                      │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  EMAIL CAMPAIGNS                                                            │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Recent Campaigns:                                                     │  │
│  │ ┌─────────────────┐ ┌─────────────────┐ ┌─────────────────┐          │  │
│  │ │ 🎉 Happy Hour   │ │ 🌮 Taco Tuesday │ │ 💝 Valentine's  │          │  │
│  │ │    Promo        │ │    Special      │ │    Menu         │          │  │
│  │ │                 │ │                 │ │                 │          │  │
│  │ │ Sent: Mar 5     │ │ Scheduled       │ │ Draft           │          │  │
│  │ │ Open: 42%       │ │ Mar 12          │ │                 │          │  │
│  │ │ Click: 18%      │ │ 1,240 recipients│ │                 │          │  │
│  │ │ Revenue: $2,840 │ │                 │ │                 │          │  │
│  │ └─────────────────┘ └─────────────────┘ └─────────────────┘          │  │
│  │                                                                       │  │
│  │ [+ Create Campaign] [Templates] [Automation]                         │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  SOCIAL MEDIA                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Connected Accounts:                                                   │  │
│  │ [Instagram ✓ 12.4K] [Facebook ✓ 8.9K] [TikTok ✓ 5.2K]                │  │
│  │                                                                       │  │
│  │ Recent Posts Performance:                                             │  │
│  │ ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │ │ 📸 New Spring Menu Launch                                      │  │  │
│  │ │    Instagram: 2,847 likes | 142 comments | 89 shares           │  │  │
│  │ │    Facebook: 1,234 likes | 67 comments | 45 shares             │  │  │
│  │ │    Generated: $4,200 in reservations                           │  │  │
│  │ └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │ [Schedule Post] [Content Calendar] [Analytics]                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  REVIEW MANAGEMENT                                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Overall Rating: 4.6★ (1,247 reviews)                                  │  │
│  │                                                                       │  │
│  │ By Platform:                                                          │  │
│  │ Google: 4.7★ (523 reviews)   Yelp: 4.5★ (412 reviews)                │  │
│  │ TripAdvisor: 4.6★ (312 reviews)                                      │  │
│  │                                                                       │  │
│  │ Pending Responses: 8                                                  │  │
│  │ ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │ │ ⭐⭐⭐⭐⭐ "Amazing food and service!" - 2 hours ago              │  │  │
│  │ │ [Respond] [Thank] [Share]                                       │  │  │
│  │ └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │ [Review Settings] [Auto-respond] [Alerts]                            │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  SPECIAL OFFERS                                                             │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Active Promotions:                                                    │  │
│  │ ┌──────────────┐ ┌──────────────┐ ┌──────────────┐                   │  │
│  │ │ Happy Hour   │ │ Early Bird   │ │ Date Night   │                   │  │
│  │ │ 4-6 PM Daily │ │ 5-6:30 PM    │ │ Fri/Sat      │                   │  │
│  │ │ 50% off apps │ │ 20% off      │ │ 3-course     │                   │  │
│  │ │ Active       │ │ Active       │ │ $49/person   │                   │  │
│  │ └──────────────┘ └──────────────┘ └──────────────┘                   │  │
│  │                                                                       │  │
│  │ [+ Create Offer] [Schedule Promotion] [Track ROI]                    │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 7. Control Center Integration

### Restaurant Storefront Customization

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ CONTROL CENTER - Restaurant Online Presence                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ONLINE ORDERING SETUP                                                      │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Ordering Enabled: [✓]                                                 │  │
│  │                                                                       │  │
│  │ Ordering Hours:                                                       │  │
│  │ Same as restaurant: [✓]  OR  Custom: [ ]                             │  │
│  │                                                                       │  │
│  │ Lead Times:                                                           │  │
│  │ Pickup: [15-30] minutes  Delivery: [30-45] minutes                   │  │
│  │ Advance Orders: [✓] Accept up to [7] days ahead                      │  │
│  │                                                                       │  │
│  │ Order Throttling:                                                     │  │
│  │ Max concurrent orders: [20]                                           │  │
│  │ Pause when kitchen busy: [✓] Enable at [80%] capacity                │  │
│  │                                                                       │  │
│  │ [Preview Ordering Site] [Test Order] [Go Live]                       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  MENU DISPLAY CUSTOMIZATION                                                 │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Menu Style: [Grid View ▼]                                             │  │
│  │                                                                       │  │
│  │ Item Card Display:                                                    │  │
│  │ [✓] Show image   [✓] Show description   [✓] Show calories           │  │
│  │ [✓] Show allergens [✓] Show dietary icons [✓] Show popularity       │  │
│  │                                                                       │  │
│  │ Customization Options:                                                │  │
│  │ [✓] Allow special instructions                                        │  │
│  │ [✓] Show modifiers prominently                                        │  │
│  │ [✓] Upsell suggestions: [✓] Enable                                    │  │
│  │                                                                       │  │
│  │ Photography:                                                          │  │
│  │ [Upload Menu Photos] [Use AI Enhancement] [Professional Service]     │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  BRAND CUSTOMIZATION                                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Logo: [Upload Logo]                                                   │  │
│  │ Current: [restaurant-logo.png]                                        │  │
│  │                                                                       │  │
│  │ Brand Colors:                                                         │  │
│  │ Primary: [#FF6B35]  Secondary: [#1A1A1A]  Accent: [#FFD700]          │  │
│  │                                                                       │  │
│  │ Theme Preview:                                                        │  │
│  │ ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │ │ [Live preview of online ordering page with brand colors]        │  │  │
│  │ └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │ [Save Branding] [Reset to Default]                                   │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  PROMOTIONAL BANNERS                                                        │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Active Banners:                                                       │  │
│  │ ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │ │ 🎉 Happy Hour: 4-6 PM Daily - 50% Off Appetizers               │  │  │
│  │ │    Display: [Homepage ✓] [Menu ✓] [Checkout ✓]                 │  │  │
│  │ │    Schedule: [Always] OR [Custom Dates]                        │  │  │
│  │ │    [Edit] [Disable]                                            │  │  │
│  │ └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │ [+ Add Banner] [Templates]                                           │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 8. Finance Module Customization

### Restaurant-Specific Financial Metrics

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ FINANCE - Restaurant Industry View                                          │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  REVENUE BREAKDOWN                                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Today's Revenue: $8,420  |  Yesterday: $7,120  |  Last Week: $6,890  │  │
│  │                                                                       │  │
│  │ By Revenue Stream:                                    By Meal Period: │  │
│  │ ┌─────────────────────────────────────────┐  ┌─────────────────────┐  │  │
│  │ │ [Pie Chart]                             │  │ [Bar Chart]         │  │  │
│  │ │ • Dine-in         74%  $6,240          │  │ Breakfast   8%      │  │  │
│  │ │ • Takeout         17%  $1,420          │  │ Lunch      42%      │  │  │
│  │ │ • Delivery         9%  $760            │  │ Dinner     45%      │  │  │
│  │ │ • Catering         0%  $0              │  │ Late Night  5%      │  │  │
│  │ └─────────────────────────────────────────┘  └─────────────────────┘  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  COST ANALYSIS                                                              │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Food Cost: 28.5% (Target: 30%)  ✓ Under budget                        │  │
│  │ Labor Cost: 31.2% (Target: 30%)  ⚠️ Slightly over                     │  │
│  │ Prime Cost: 59.7% (Target: 60%)  ✓ Healthy                            │  │
│  │                                                                       │  │
│  │ Top Cost Items:                                                       │  │
│  │ ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │ │ Protein (Beef/Fish)    │  38% of food cost  │  $942 today      │  │  │
│  │ │ Produce                │  22% of food cost  │  $544 today      │  │  │
│  │ │ Dairy                  │  15% of food cost  │  $372 today      │  │  │
│  │ │ Dry Goods              │  25% of food cost  │  $622 today      │  │  │
│  │ └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  LABOR MANAGEMENT                                                           │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Today's Labor:                                                        │  │
│  │ Scheduled: 8 staff  |  Actual: 8 staff  |  Hours: 64                 │  │
│  │                                                                       │  │
│  │ Labor Cost Breakdown:                                                 │  │
│  │ ┌─────────────────────────────────────────────────────────────────┐  │  │
│  │ │ Front of House  │  $1,420  │  54%  │  8 staff on shift        │  │  │
│  │ │ Back of House   │  $1,080  │  41%  │  6 staff on shift        │  │  │
│  │ │ Management      │  $140    │  5%   │  2 managers              │  │  │
│  │ └─────────────────────────────────────────────────────────────────┘  │  │
│  │                                                                       │  │
│  │ Overtime Alert:                                                       │  │
│  │ ⚠️ 2 employees approaching OT threshold this week                    │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  TIPS & GRATUITIES                                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Today's Tips: $847                                                    │  │
│  │                                                                       │  │
│  │ Tip Pool Distribution:                                                │  │
│  │ Servers (60%):      $508.20 ÷ 4 servers = $127.05 each               │  │
│  │ Bartenders (20%):   $169.40 ÷ 2 bartenders = $84.70 each             │  │
│  │ Runners (10%):      $84.70 ÷ 2 runners = $42.35 each                 │  │
│  │ Kitchen (10%):      $84.70 ÷ 3 cooks = $28.23 each                   │  │
│  │                                                                       │  │
│  │ Tip Reporting:                                                        │  │
│  │ [Export for Payroll] [IRS Form 4070] [Historical Reports]            │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 9. Account Page Extensions

### Restaurant-Specific Profile Fields

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ ACCOUNT SETTINGS - Restaurant Profile                                       │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  RESTAURANT INFORMATION                                                     │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Restaurant Name: [The Golden Fork                        ]           │  │
│  │ Cuisine Type:    [Contemporary American ▼]                           │  │
│  │ Tagline:         [Farm-to-table dining experience       ]            │  │
│  │                                                       │  │
│  │ Restaurant Category:                                                  │  │
│  │ [✓] Casual Dining  [✓] Fine Dining  [✗] Fast Casual                │  │
│  │ [✗] Quick Service [✓] Bar/Lounge  [✗] Food Truck                   │  │
│  │                                                       │  │
│  │ Price Range: [$$$ ▼] ($30-50 per person)                             │  │
│  │                                                       │  │
│  │ Ambiance:                                                           │  │
│  │ [✓] Romantic  [✓] Business  [✓] Family-friendly  [✓] Trendy        │  │
│  │ [✗] Sports Bar [✗] Quiet [✓] Outdoor Seating                       │  │
│  │                                                       │  │
│  │ [Save Profile]                                                        │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  LOCATION & CONTACT                                                         │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Address:         [123 Main Street, City, State 12345]                │  │
│  │ Phone:           [(555) 123-4567]                                    │  │
│  │ Email:           [info@goldenfork.com]                               │  │
│  │ Website:         [www.goldenfork.com]                                │  │
│  │                                                       │  │
│  │ Delivery Zones:                                                       │  │
│  │ [Configure Delivery Area Map]                                         │  │
│  │ Current radius: 5 miles                                               │  │
│  │                                                       │  │
│  │ Parking Information:                                                  │  │
│  │ [✓] Street Parking  [✓] Parking Lot  [✓] Valet  [✗] Garage         │  │
│  │                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  CERTIFICATIONS & COMPLIANCE                                                │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ Health Department:                                                    │  │
│  │ Rating: [A ✓]  Last Inspection: Jan 15, 2026                        │  │
│  │ Next Inspection: Due in 45 days                                       │  │
│  │ [Upload Certificate]                                                  │  │
│  │                                                                       │  │
│  │ Certifications:                                                       │  │
│  │ [✓] Organic Certified  [✓] Sustainable Seafood                       │  │
│  │ [✓] Wine Spectator Award  [✗] Michelin Star                         │  │
│  │ [✓] Local Farm Partner  [✗] Kosher                                  │  │
│  │                                                                       │  │
│  │ Licenses:                                                             │  │
│  │ [✓] Liquor License  [✓] Food Service  [✓] Music/Entertainment       │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
│  INTEGRATIONS                                                               │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                                                                       │  │
│  │ POS Systems:                                                          │  │
│  │ [Connect Toast] [Connect Square] [Connect Clover] [Connect Micros]   │  │
│  │ Current: Toast ✓                                                      │  │
│  │                                                                       │  │
│  │ Reservation Platforms:                                                │  │
│  │ [Connect OpenTable] [Connect Resy] [Connect Yelp Reservations]       │  │
│  │ Current: OpenTable ✓, Resy ✓                                          │  │
│  │                                                                       │  │
│  │ Delivery Platforms:                                                   │  │
│  │ [Connect UberEats] [Connect DoorDash] [Connect Grubhub]              │  │
│  │ Current: All connected ✓                                              │  │
│  │                                                                       │  │
│  │ Accounting:                                                           │  │
│  │ [Connect QuickBooks] [Connect Xero] [Connect Sage]                   │  │
│  │ Current: QuickBooks ✓                                                 │  │
│  │                                                                       │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

## 10. API Endpoints Mapping

### Required APIs for Restaurant Dashboard

| Feature | API Endpoint | Method | Priority |
|---------|--------------|--------|----------|
| **Dashboard** ||||
| Get aggregate metrics | `/api/dashboard/aggregate` | GET | P0 |
| Get live order feed | `/api/restaurant/orders/live` | GET | P0 |
| Get table status | `/api/restaurant/tables/status` | GET | P0 |
| **Orders** ||||
| List orders | `/api/orders` | GET | P0 |
| Create order | `/api/orders` | POST | P0 |
| Update order status | `/api/orders/:id/status` | PUT | P0 |
| **Tables** ||||
| Get tables | `/api/restaurant/tables` | GET | P1 |
| Update table status | `/api/restaurant/tables/:id/status` | PUT | P1 |
| Get floor plan | `/api/restaurant/tables/layout` | GET | P1 |
| **Menu** ||||
| Get menu categories | `/api/restaurant/menu/categories` | GET | P1 |
| Get menu items | `/api/restaurant/menu/items` | GET | P1 |
| Update item availability | `/api/restaurant/menu/items/:id/availability` | PUT | P1 |
| **86 Board** ||||
| Get 86 board | `/api/restaurant/86-board` | GET | P0 |
| Update item status | `/api/restaurant/86-board/items` | POST | P1 |
| Restore item | `/api/restaurant/86-board/items/:id/restore` | PUT | P1 |
| **Reservations** ||||
| Get reservations | `/api/restaurant/reservations` | GET | P1 |
| Create reservation | `/api/restaurant/reservations` | POST | P1 |
| Get availability | `/api/restaurant/reservations/availability` | GET | P1 |
| **Kitchen (KDS)** ||||
| Get KDS tickets | `/api/restaurant/kds/tickets` | GET | P0 |
| Update ticket status | `/api/restaurant/kds/tickets/:id/status` | PUT | P0 |
| Get stations | `/api/restaurant/kds/stations` | GET | P1 |
| Bump ticket | `/api/restaurant/kds/bump` | POST | P1 |
| **Staff** ||||
| Get staff on shift | `/api/restaurant/staff/on-shift` | GET | P1 |
| Log staff activity | `/api/restaurant/staff/activity` | POST | P1 |
| Get performance | `/api/restaurant/staff/performance` | GET | P2 |
| **Delivery** ||||
| Get active deliveries | `/api/restaurant/deliveries/active` | GET | P1 |
| Sync platforms | `/api/restaurant/delivery-platforms/sync` | POST | P2 |
| **Inventory** ||||
| Get ingredients | `/api/restaurant/ingredients` | GET | P1 |
| Get low stock | `/api/restaurant/ingredients/low-stock` | GET | P1 |
| Log usage | `/api/restaurant/ingredients/usage-log` | POST | P2 |

---

*Document generated as part of Batch 1 Design Documents - Restaurant Industry*
