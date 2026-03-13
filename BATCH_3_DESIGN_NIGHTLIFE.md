# Batch 3 Design Document: NIGHTLIFE Industry Dashboard
## Modern Dark Design with VIP Management

**Document Version:** 1.0  
**Industry:** Nightlife, Club & Lounge Management  
**Design Category:** Modern Dark  
**Plan Tier Support:** Basic → Pro  
**Last Updated:** 2026-03-11

---

## 1. Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (Modern Dark - Sleek Nightlife)                                         │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo]  Dashboard  Tables  VIP List  Bottle Service  Events  Staff  Analytics │  │
│  │                                                                  [🔔] [👤 Pro] │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  VENUE OVERVIEW                    [+ New Reservation] [📊 Night Report]       │  │
│  │  "Elysium Nightclub | March 11, 2026 | Thursday Night"                        │  │
│  │  Status: ● Open Now | Capacity: 68% | Next Event: DJ Nexus at 11 PM            │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │   REVENUE   │ │  COVERS     │ │    VIP      │ │  BOTTLE     │ │  OCCUPANCY  │   │
│  │   $18,420   │ │    342      │ │    89       │ │    147      │ │    68%      │   │
│  │   ↑ 32.5%   │ │   ↑ 18.2%   │ │   ↑ 45.3%   │ │   ↑ 38.7%   │ │   ▲ 12%     │   │
│  │   [Live]    │ │   [Live]    │ │   [Live]    │ │   [Live]    │ │   [Live]    │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       TABLE RESERVATIONS                │ │       VIP GUEST LIST             │   │
│  │                                         │ │                                  │   │
│  │  Floor Plan - Main Room                 │ │  Tonight's VIP List (89 guests): │   │
│  │  ┌─────────────────────────────────┐    │ │  ┌────────────────────────────┐  │   │
│  │  │     STAGE                       │    │ │  │                            │  │   │
│  │  │                                 │    │ │  │ 🌟 CELEBRITY (12)          │  │   │
│  │  │  T12  T13  T14  T15             │    │ │  │ • Marcus Johnson (NBA)     │  │   │
│  │  │  🔴   🟡   🟢   🔴              │    │ │  │   Table 1 | 8 guests       │  │   │
│  │  │                                 │    │ │  │   ✅ On list | ⏳ Arrived   │  │   │
│  │  │  T8   T9   T10  T11             │    │ │  │   [Escort to Table]        │  │   │
│  │  │  🟢   🔴   🟢   🟡              │    │ │  │                            │  │   │
│  │  │                                 │    │ │  │ • Sofia Rodriguez (Model)  │  │   │
│  │  │  T4   T5   T6   T7              │    │ │  │   Table 3 | 6 guests       │  │   │
│  │  │  🟢   🟢   🔴   🟢              │    │ │  │   ✅ On list | ❌ Not here  │  │   │
│  │  │                                 │    │ │  │   [Check-in] [Message]     │  │   │
│  │  │  T1   T2   T3   BAR             │    │ │  │                            │  │   │
│  │  │  🔴   🟢   🟢                   │    │ │  │ 💎 HIGH-ROLLER (24)        │  │   │
│  │  │                                 │    │ │  │ • Ahmed Al-Rashid          │  │   │
│  │  │  Legend:                        │    │ │  │   Table 5 | 10 guests      │  │   │
│  │  │  🟢 Available (8)               │    │ │  │   Min. spend: $5K          │  │   │
│  │  │  🟡 Reserved (3)                │    │ │  │   ✅ Deposited $2K         │  │   │
│  │  │  🔴 Occupied (5)                │    │ │  │   [Confirm Reservation]    │  │   │
│  │  │  ⚫ Offline (0)                  │    │ │  │                            │  │   │
│  │  │                                 │    │ │  │ 🎂 SPECIAL OCCASION (18)   │  │   │
│  │  │  Current Revenue: $12,420       │    │ │  │ • Jessica Chen - Birthday  │  │   │
│  │  │  Projected: $24,500             │    │ │  │   Table 8 | 12 guests      │  │   │
│  │  │                                 │    │ │  │   🎁 Complimentary cake    │  │   │
│  │  │  [View Full Map] [Add Table]    │    │ │  │   ✅ Confirmed             │  │   │
│  │  │                                 │    │ │  │   [Prepare VIP Treatment]  │  │   │
│  │  │  Wait Time: 25-35 min           │    │ │  │                            │  │   │
│  │  │  Walks Tonight: 47              │    │ │  │ 🎉 REGULAR VIP (35)        │  │   │
│  │  │                                 │    │ │  │ • David Park               │  │   │
│  │  │  [Manage Reservations]          │    │ │  │   Table 12 | 6 guests      │  │   │
│  │  │                                 │    │ │  │   ✅ Frequent guest        │  │   │
│  │  │                                 │    │ │  │   [Priority Entry]         │  │   │
│  │  └─────────────────────────────────┘    │ │  │                            │  │   │
│  │                                         │ │  │ Guest List Stats:          │  │   │
│  │  Table Performance:                     │ │  │ Total on list: 89          │  │   │
│  │  Avg. spend/table: $2,484               │ │  │ Checked in: 34 (38%)       │  │   │
│  │  Top table: T5 ($4,820 tonight)         │ │  │ Pending: 55                │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       BOTTLE SERVICE                    │ │       PROMOTER PERFORMANCE       │   │
│  │                                         │ │                                  │   │
│  │  Active Bottle Orders: 12               │ │  Top Promoters Tonight:          │  │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ 🍾 Ace of Spades Gold x3          │  │ │  │ 👤 Mike Thompson           │  │   │
│  │  │    Table 5 | $2,400               │  │ │  │    24 guests | $8,420 bar  │  │   │
│  │  │    ✅ Delivered                   │  │ │  │    ████████████████████░░  │  │   │
│  │  │    [Add Mixer] [Complete]         │  │ │  │    Commission: $842        │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ 🍾 Don Julio 1942 x2              │  │ │  │ 👤 Sarah Martinez          │  │   │
│  │  │    Table 8 | $1,600               │  │ │  │    18 guests | $6,240 bar  │  │   │
│  │  │    ⏳ Preparing                   │  │ │  │    ████████████████░░░░░░  │  │   │
│  │  │    [Rush Order] [Notify]          │  │ │  │    Commission: $624        │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ 🍾 Grey Goose Magnum x1           │  │ │  │ 👤 James Wilson            │  │   │
│  │  │    Table 12 | $680                │  │ │  │    15 guests | $4,820 bar  │  │   │
│  │  │    ✅ Delivered                   │  │ │  │    ███████████████░░░░░░░  │  │   │
│  │  │    [Add Mixer] [Complete]         │  │ │  │    Commission: $482        │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ [View All Orders] [New Order]     │  │ │  │ [View All Promoters]       │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ Inventory Alert:                   │  │ │  │ Promoter Stats:            │  │   │
│  │  │ ⚠️ Ace of Spades (3 left)         │  │ │  │ Total guests: 147          │  │   │
│  │  │ ⚠️ Clase Azul (5 left)            │  │ │  │ Total bar revenue: $42,500 │  │   │
│  │  │                                   │  │ │  │ Avg. per guest: $289       │  │   │
│  │  │ [Restock] [View Inventory]        │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       DOOR ACTIVITY                     │ │       SECURITY LOG               │   │
│  │                                         │ │                                  │   │
│  │  Entry Stats (Last Hour):               │ │  Incidents Tonight: 2            │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ Admitted: 142                     │  │ │  │ ⚠️ 11:42 PM - Table 7      │  │   │
│  │  │ Denied: 8                         │  │ │  │    Issue: Over-intoxicated │  │   │
│  │  │ Waiting: 23                       │  │ │  │    Action: Water provided  │  │   │
│  │  │                                   │  │ │  │    Status: Resolved ✓      │  │   │
│  │  │ Cover Charge Collected: $4,260    │  │ │  │    Officer: Marcus T.      │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ Demographics:                     │  │ │  │ ⚠️ 10:15 PM - Entrance     │  │   │
│  │  │ M: 58% | F: 41% | Other: 1%       │  │ │  │    Issue: Fake ID detected │  │   │
│  │  │                                   │  │ │  │    Action: Denied entry    │  │   │
│  │  │ Age Groups:                       │  │ │  │    Status: Escorted away ✓ │  │   │
│  │  │ 21-25: 42% | 26-30: 35%           │  │ │  │    Officer: Sarah K.       │  │   │
│  │  │ 31-35: 18% | 35+: 5%              │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │ [View Full Log] [Report]   │  │   │
│  │  │ [Door Dashboard] [Guest List]     │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │ Security Staff:            │  │   │
│  │  │ Bouncers Active: 6/8              │  │ │  │ • Main entrance: 2         │  │   │
│  │  │ ID Checkers: 3/4                  │  │ │  │ • Floor: 3                 │  │   │
│  │  │                                   │  │ │  │ • VIP area: 2              │  │   │
│  │  │ [Staff Schedule] [Break Rotation] │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │ CCTV Status: ● All active  │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                         AI INSIGHTS (Pro Tier Only)                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ 💡 Peak Time Alert: Expected rush between 11:30 PM - 12:30 PM           │  │  │
│  │  │    Based on: Historical data, event calendar, weather, social buzz      │  │  │
│  │  │    Recommendation: Call in 2 additional bartenders, open VIP section    │  │  │
│  │  │    Predicted impact: +$8,500 revenue, reduced wait times                │  │  │
│  │  │  [Adjust Staffing] [View Forecast]                                      │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Category Application

### Modern Dark Design System

**Primary Palette:**
```
Background Primary:   #0D0D0D (Near black)
Background Secondary: #1A1A1A (Dark surfaces)
Background Tertiary:  #252525 (Card backgrounds)

Accent Primary:       #00D9FF (Electric cyan - modern tech)
Accent Secondary:     #00B8D4 (Teal)
Accent Tertiary:      #7DE2F9 (Light cyan)

Text Primary:         #FFFFFF (Pure white)
Text Secondary:       rgba(255, 255, 255, 0.85)
Text Tertiary:        rgba(255, 255, 255, 0.65)

Status Colors:
  Available: #00E676 (Bright green)
  Reserved:  #F59E0B (Amber)
  Occupied:  #FF2E63 (Pink-red)
  VIP:       #BD00FF (Purple)
```

**Modern Dark Effects:**
```css
/* Dark Card */
.dark-card {
  background: #252525;
  border: 1px solid #333333;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.4);
}

/* Dark Card Hover */
.dark-card:hover {
  background: #2A2A2A;
  border-color: #00D9FF;
  box-shadow: 0 4px 20px rgba(0, 217, 255, 0.2);
}

/* Cyan Glow */
.cyan-glow {
  box-shadow: 0 0 20px rgba(0, 217, 255, 0.4);
}

/* Gradient Accent */
.accent-gradient {
  background: linear-gradient(90deg, #00D9FF 0%, #00B8D4 100%);
}
```

---

*Continuing with complete specification...*

## 3. Component Hierarchy

```
NightlifeDashboard (Root)
├── DashboardHeader
│   ├── BreadcrumbNav
│   ├── ActionButtons
│   │   ├── NewReservationButton
│   │   └── NightReportButton
│   └── VenueStatus
├── KPIRow (5 metrics)
│   └── NightlifeMetricCard × 5
│       ├── LiveIndicator
│       ├── TrendChart
│       └── ValueDisplay
├── ContentGrid (2 columns)
│   ├── LeftColumn
│   │   ├── TableReservations
│   │   │   ├── FloorPlan
│   │   │   ├── TableMarkers
│   │   │   ├── Legend
│   │   │   └── RevenueDisplay
│   │   ├── BottleService
│   │   │   ├── ActiveOrders
│   │   │   ├── OrderCard × N
│   │   │   ├── InventoryAlerts
│   │   │   └── QuickActions
│   │   └── DoorActivity
│   │       ├── EntryStats
│   │       ├── Demographics
│   │       └── StaffStatus
│   └── RightColumn
│       ├── VIPGuestList
│       │   ├── GuestCategory × 4
│       │   ├── GuestCard × N
│       │   ├── CheckInButton
│       │   └── StatsDisplay
│       ├── PromoterPerformance
│       │   ├── PromoterCard × N
│       │   ├── GuestCount
│       │   ├── BarRevenue
│       │   └── CommissionDisplay
│       └── SecurityLog
│           ├── IncidentCard × N
│           ├── StatusTracker
│           └── StaffDisplay
└── AIInsightsPanel (Pro Tier)
    └── PeakTimeAlert
```

---

## 4. 5 Theme Presets

### Theme 1: Electric Cyan (Default)
```
Primary:    #00D9FF
Secondary:  #00B8D4
Background: #0D0D0D
Surface:    #252525
Accent:     linear-gradient(90deg, #00D9FF, #00B8D4)
```

### Theme 2: Hot Pink
```
Primary:    #FF2E63
Secondary:  #F73D93
Background: #1A0F1A
Surface:    #2A1A2A
Accent:     linear-gradient(90deg, #FF2E63, #F73D93)
```

### Theme 3: Royal Gold
```
Primary:    #D4AF37
Secondary:  #E5C158
Background: #1A1408
Surface:    #2A2214
Accent:     linear-gradient(90deg, #D4AF37, #E5C158)
```

### Theme 4: Deep Purple
```
Primary:    #BD00FF
Secondary:  #E040FB
Background: #1A0F1A
Surface:    #2A1A2A
Accent:     linear-gradient(90deg, #BD00FF, #E040FB)
```

### Theme 5: Emerald Night
```
Primary:    #00E676
Secondary:  #69F0AE
Background: #0A1F0F
Surface:    #1A2A1A
Accent:     linear-gradient(90deg, #00E676, #69F0AE)
```

---

## 5. API Endpoints Mapping

### Required APIs for Nightlife Dashboard

| Feature | API Endpoint | Method | Priority |
|---------|--------------|--------|----------|
| **Dashboard** ||||
| Get aggregate metrics | `/api/dashboard/aggregate` | GET | P0 |
| Get table status | `/api/nightlife/tables/status` | GET | P0 |
| Get guest list | `/api/nightlife/vip-list` | GET | P0 |
| **Tables** ||||
| List tables | `/api/nightlife/tables` | GET | P1 |
| Create table | `/api/nightlife/tables` | POST | P1 |
| Get table details | `/api/nightlife/tables/:id` | GET | P1 |
| Update table status | `/api/nightlife/tables/:id` | PUT | P1 |
| **Reservations** ||||
| List reservations | `/api/nightlife/reservations` | GET | P1 |
| Create reservation | `/api/nightlife/reservations` | POST | P0 |
| Update reservation | `/api/nightlife/reservations/:id` | PUT | P1 |
| **VIP List** ||||
| Get VIP list | `/api/nightlife/vip-list` | GET | P0 |
| Add to VIP list | `/api/nightlife/vip-list` | POST | P1 |
| Update VIP status | `/api/nightlife/vip-list/:id` | PUT | P1 |
| Guest list entry | `/api/nightlife/guest-list/entry` | POST | P0 |
| **Bottle Service** ||||
| Get bottle packages | `/api/nightlife/bottle-service/packages` | GET | P1 |
| Create bottle order | `/api/nightlife/bottle-service/orders` | POST | P0 |
| List bottle orders | `/api/nightlife/bottle-service/orders` | GET | P1 |
| Update bottle order | `/api/nightlife/bottle-service/orders/:id` | PUT | P1 |
| **Events** ||||
| List events | `/api/nightlife/events` | GET | P1 |
| Create event | `/api/nightlife/events` | POST | P1 |
| **Staff** ||||
| Get staff on duty | `/api/nightlife/staff` | GET | P1 |
| Manage shifts | `/api/nightlife/staff/shifts` | POST | P1 |
| Get staff performance | `/api/nightlife/staff/performance` | GET | P2 |
| **Promoters** ||||
| List promoters | `/api/nightlife/promoters` | GET | P1 |
| Get promoter sales | `/api/nightlife/promoters/:id/sales` | GET | P1 |
| Calculate commissions | `/api/nightlife/promoters/commissions` | POST | P2 |
| **Security** ||||
| Get security log | `/api/nightlife/security/log` | GET | P1 |
| Report incident | `/api/nightlife/security/incidents` | POST | P1 |
| Age verification | `/api/nightlife/compliance/age-verification` | POST | P0 |

---

*Document generated as part of Batch 3 Design Documents - Nightlife Industry*
