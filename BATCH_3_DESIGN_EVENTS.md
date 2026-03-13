# Batch 3 Design Document: EVENTS Industry Dashboard
## Bold Energy Design with Real-Time Ticket Sales

**Document Version:** 1.0  
**Industry:** Events & Conference Management  
**Design Category:** Bold Energy  
**Plan Tier Support:** Basic → Pro  
**Last Updated:** 2026-03-11

---

## 1. Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (Bold Gradient - High Energy)                                           │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo]  Dashboard  Events  Tickets  Venues  Attendees  Sponsors  Analytics ▼  │  │
│  │                                                                  [🔔] [👤 Pro] │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  EVENT OVERVIEW                    [+ New Event] [📊 Sales Report]             │  │
│  │  "Tech Summit 2026 | March 15-17, 2026"                                       │  │
│  │  Status: ● On Sale | Days Until Event: 4 | Tickets Sold: 847/1200              │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │   REVENUE   │ │  TICKETS    │ │ ATTENDEES   │ │  SPONSORS   │ │ CONVERSION  │   │
│  │   $124.5K   │ │    847      │ │    623      │ │    12       │ │    3.8%     │   │
│  │   ↑ 28.4%   │ │   ↑ 42.1%   │ │   ↑ 35.2%   │ │   ▲ $85K    │ │   ↑ 1.2%    │   │
│  │   [Live]    │ │   [Live]    │ │   [Live]    │ │   [Spark]   │ │   [Spark]   │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       LIVE TICKET SALES                 │ │       EVENT TIMELINE             │   │
│  │                                         │ │                                  │   │
│  │  Today's Sales: $8,420 (142 tickets)    │ │  Event Countdown: 4 days         │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │  🎫 LAST 5 SALES (Live Feed)      │  │ │  │ Mar 15 - Day 1             │  │   │
│  │  │                                   │  │ │  │ ├─ 9:00 AM Registration    │  │   │
│  │  │  • Sarah M. - VIP Pass - $299     │  │ │  │ ├─ 10:00 AM Keynote        │  │   │
│  │  │    2 minutes ago                  │  │ │  │ ├─ 12:00 PM Lunch          │  │   │
│  │  │    [Check-in] [Refund]            │  │ │  │ └─ 1:00 PM Breakout Sessions│  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │  • James T. - General - $149      │  │ │  │ Mar 16 - Day 2             │  │   │
│  │  │    5 minutes ago                  │  │ │  │ ├─ 9:00 AM Panel Discussion│  │   │
│  │  │    [Check-in] [Refund]            │  │ │  │ ├─ 12:00 PM Networking     │  │   │
│  │  │                                   │  │ │  │ └─ 7:00 PM Gala Dinner     │  │   │
│  │  │  • Emily R. - Early Bird - $99    │  │ │  │                            │  │   │
│  │  │    8 minutes ago                  │  │ │  │ Mar 17 - Day 3             │  │   │
│  │  │    ✓ Checked in                   │  │ │  │ ├─ 9:00 AM Workshops       │  │   │
│  │  │                                   │  │ │  │ └─ 3:00 PM Closing Remarks │  │   │
│  │  │  • Michael B. - VIP - $299        │  │ │  │                            │  │   │
│  │  │    12 minutes ago                 │  │ │  │ [Full Schedule] [Edit]     │  │   │
│  │  │    [Check-in] [Refund]            │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │ Venue Setup:               │  │   │
│  │  │  • Lisa K. - Group (5) - $595     │  │ │  │ Main Hall: 800 capacity    │  │   │
│  │  │    15 minutes ago                 │  │ │  │ breakout Rooms: 4 × 150    │  │   │
│  │  │    [Check-in] [Refund]            │  │ │  │ Exhibition: 20 booths      │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │  [View All Sales]                 │  │ │  │ [Venue Map] [Setup Guide]  │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │  Sales Velocity:                  │  │ │  │                            │  │   │
│  │  │  12 tickets/hour (Peak: 28/hr)    │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                         │ │  │                            │  │   │
│  │  Ticket Type Breakdown:                 │ │  │                            │  │   │
│  │  VIP (247) ████████████░░░░░░ 29%       │ │  │                            │  │   │
│  │  General (458) ████████████████████ 54% │ │  │                            │  │   │
│  │  Early Bird (142) ███████░░░░░░░░░░ 17% │ │  │                            │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       ATTENDEE CHECK-IN                 │ │       SPONSOR SHOWCASE           │   │
│  │                                         │ │                                  │   │
│  │  Checked In: 623/847 (73%)              │ │  Total Sponsorship: $85,000      │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ 🟢 ON-SITE (412 attendees)        │  │ │  │ 🥇 PLATINUM ($25K)         │  │   │
│  │  │                                   │  │ │  │ TechCorp Industries        │  │   │
│  │  │ 👤 John Smith - Scanned 9:02 AM   │  │ │  │ Booth #1 | Logo on stage   │  │   │
│  │  │ 👤 Emma Wilson - Scanned 9:15 AM  │  │ │  │ [View Benefits] [Contact]  │  │   │
│  │  │ 👤 David Brown - Scanned 9:18 AM  │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │ 🥈 GOLD ($15K)             │  │   │
│  │  │ 🟡 REGISTERED NOT PRESENT (211)   │  │ │  │ InnovateCo                 │  │   │
│  │  │                                   │  │ │  │ Booth #5 | Banner placement│  │   │
│  │  │ ⚠️ VIP Not Arrived (23)           │  │ │  │ [View Benefits] [Contact]  │  │   │
│  │  │ 📧 Send Reminder: [Send Now]      │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │ 🥉 BRONZE ($8K)            │  │   │
│  │  │ Walk-ins Today: 47                │  │ │  │ StartupHub                 │  │   │
│  │  │ Badge Printing: 52 remaining      │  │ │  │ Booth #12 | Listing only   │  │   │
│  │  │                                   │  │ │  │ [View Benefits] [Contact]  │  │   │
│  │  │ [Manual Check-in] [Print Badge]   │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │ Sponsor Deliverables:      │  │   │
│  │  │ QR Scanner Status: ● Active       │  │ │  │ ✓ Logo on website          │  │   │
│  │  │ Devices Connected: 8/10           │  │ │  │ ✓ Social media mentions    │  │   │
│  │  │                                   │  │ │  │ ⏳ Booth setup (Tomorrow)  │  │   │
│  │  │ [Scanner Settings] [Export List]  │  │ │  │ ⏳ Speaking slot (Day 2)   │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  └───────────────────────────────────┘  │ │  │ [Sponsor Portal] [Assets]  │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       VENDORS & LOGISTICS               │ │       MARKETING PERFORMANCE      │   │
│  │                                         │ │                                  │   │
│  │  Active Vendors: 18                     │ │  Campaign Performance:           │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ 🍔 Catering - Gourmet Eats        │  │ │  │ Email Campaign:            │  │   │
│  │  │    Status: ✅ Confirmed           │  │ │  │ Sent: 12,847 | Open: 42%   │  │   │
│  │  │    Delivery: 8:00 AM Tomorrow     │  │ │  │ Clicked: 18% | Conv: 3.2%  │  │   │
│  │  │    [Contact] [Contract]           │  │ │  │ Revenue: $42,500           │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ 🎵 AV Equipment - SoundPro        │  │ │  │ Social Media Ads:          │  │   │
│  │  │    Status: ✅ Setup Complete      │  │ │  │ Impressions: 284K          │  │   │
│  │  │    Tech Check: 2:00 PM Today      │  │ │  │ Clicks: 8,420 | Conv: 2.8% │  │   │
│  │  │    [Contact] [Rider]              │  │ │  │ Revenue: $28,400           │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ 🪑 Furniture Rental - EventChair  │  │ │  │ Partner Promotion:         │  │   │
│  │  │    Status: ⏳ Delivery 6:00 PM    │  │ │  │ Referrals: 247 tickets     │  │   │
│  │  │    [Contact] [Order]              │  │ │  │ Revenue: $36,800           │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ 📸 Photography - CaptureMoments   │  │ │  │ [Create Campaign] [Analytics]│  │   │
│  │  │    Status: ✅ Contract Signed     │  │ │  │                            │  │   │
│  │  │    Arrival: 8:30 AM Day 1         │  │ │  │ ROI Summary:               │  │   │
│  │  │    [Contact] [Shot List]          │  │ │  │ Ad Spend: $12,500          │  │   │
│  │  │                                   │  │ │  │ Revenue: $107,700          │  │   │
│  │  │ [View All Vendors] [Add Vendor]   │  │ │  │ ROI: 762%                  │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ Task Checklist:                    │  │ │  │                            │  │   │
│  │  │ ☑ Venue booking   ☑ Permits       │  │ │  │                            │  │   │
│  │  │ ☑ Insurance       ☐ Final walkthrough│  │  │                            │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                         AI INSIGHTS (Pro Tier Only)                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ 💡 Demand Alert: VIP tickets selling 45% faster than expected           │  │  │
│  │  │    Based on: Sales velocity, social engagement, competitor pricing      │  │  │
│  │  │    Recommendation: Increase VIP allocation by 50 tickets                │  │  │
│  │  │    Predicted impact: +$14,950 revenue                                   │  │  │
│  │  │  [Adjust Inventory] [View Analysis]                                     │  │  │
│  │  └─────────────────────────────────────────────────────────────────────────┘  │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Design Category Application

### Bold Energy Design System

**Primary Palette:**
```
Background Primary:   #1A1A2E (Deep purple-black)
Background Secondary: #16213E (Dark blue)
Background Tertiary:  rgba(255, 255, 255, 0.05) (Panels)

Accent Primary:       #FF2E63 (Vibrant pink-red - excitement)
Accent Secondary:     #F73D93 (Hot pink)
Accent Tertiary:      #FF9EB5 (Light pink highlight)

Text Primary:         #FFFFFF (Pure white)
Text Secondary:       rgba(255, 255, 255, 0.85)
Text Tertiary:        rgba(255, 255, 255, 0.65)

Status Colors:
  Live:     #00F5FF (Cyan - electric)
  Sold:     #FF2E63 (Pink-red)
  Available:#00E676 (Bright green)
  LowStock: #F59E0B (Amber)
```

**Bold Energy Effects:**
```css
/* Bold Panel */
.bold-panel {
  background: linear-gradient(135deg, #16213E 0%, #1A1A2E 100%);
  border: 2px solid #FF2E63;
  border-radius: 12px;
}

/* Live Indicator Pulse */
@keyframes pulse-live {
  0% { box-shadow: 0 0 0 0 rgba(0, 245, 255, 0.7); }
  70% { box-shadow: 0 0 0 10px rgba(0, 245, 255, 0); }
  100% { box-shadow: 0 0 0 0 rgba(0, 245, 255, 0); }
}

.live-indicator {
  animation: pulse-live 2s infinite;
}

/* Gradient Accent */
.accent-gradient {
  background: linear-gradient(90deg, #FF2E63 0%, #F73D93 100%);
}

/* Neon Glow */
.neon-glow {
  text-shadow: 0 0 10px rgba(255, 46, 99, 0.8),
               0 0 20px rgba(255, 46, 99, 0.6);
}
```

---

## 3. Component Hierarchy

```
EventsDashboard (Root)
├── DashboardHeader
│   ├── BreadcrumbNav
│   ├── ActionButtons
│   │   ├── NewEventButton
│   │   └── SalesReportButton
│   └── EventStatus
├── KPIRow (5 metrics)
│   └── EventsMetricCard × 5
│       ├── LiveIndicator
│       ├── TrendChart
│       └── ValueDisplay
├── ContentGrid (2 columns)
│   ├── LeftColumn
│   │   ├── LiveTicketSales
│   │   │   ├── SalesFeed
│   │   │   ├── LastSalesList
│   │   │   ├── TicketTypeBreakdown
│   │   │   └── SalesVelocity
│   │   ├── AttendeeCheckIn
│   │   │   ├── CheckInStats
│   │   │   ├── OnSiteList
│   │   │   ├── NotPresentList
│   │   │   └── QRScannerStatus
│   │   └── VendorsLogistics
│   │       ├── VendorCard × N
│   │       ├── StatusTracker
│   │       └── TaskChecklist
│   └── RightColumn
│       ├── EventTimeline
│       │   ├── CountdownDisplay
│       │   ├── DaySchedule × N
│       │   ├── VenueCapacity
│       │   └── VenueMapLink
│       ├── SponsorShowcase
│       │   ├── SponsorTier × 3
│       │   ├── DeliverablesTracker
│       │   └── SponsorPortalLink
│       └── MarketingPerformance
│           ├── CampaignCard × 3
│           ├── ROISummary
│           └── AnalyticsLink
└── AIInsightsPanel (Pro Tier)
    └── DemandAlert
```

---

## 4. 5 Theme Presets

### Theme 1: Electric Pink (Default)
```
Primary:    #FF2E63
Secondary:  #F73D93
Background: #1A1A2E
Surface:    #16213E
Accent:     linear-gradient(90deg, #FF2E63, #F73D93)
```

### Theme 2: Cyber Blue
```
Primary:    #00F5FF
Secondary:  #00D9E6
Background: #0A0F1A
Surface:    #1A1A2E
Accent:     linear-gradient(90deg, #00F5FF, #00D9E6)
```

### Theme 3: Neon Purple
```
Primary:    #BD00FF
Secondary:  #E040FB
Background: #1A0F1A
Surface:    #2A1A2A
Accent:     linear-gradient(90deg, #BD00FF, #E040FB)
```

### Theme 4: Laser Green
```
Primary:    #00E676
Secondary:  #69F0AE
Background: #0A1F0F
Surface:    #1A2A1A
Accent:     linear-gradient(90deg, #00E676, #69F0AE)
```

### Theme 5: Sunset Orange
```
Primary:    #FF6B35
Secondary:  #FF8C42
Background: #1A0F0A
Surface:    #2A1A14
Accent:     linear-gradient(90deg, #FF6B35, #FF8C42)
```

---

## 5. API Endpoints Mapping

### Required APIs for Events Dashboard

| Feature | API Endpoint | Method | Priority |
|---------|--------------|--------|----------|
| **Dashboard** ||||
| Get aggregate metrics | `/api/dashboard/aggregate` | GET | P0 |
| Get live ticket sales | `/api/events/tickets/sales/live` | GET | P0 |
| Get check-in stats | `/api/events/attendees/checkins` | GET | P0 |
| **Events** ||||
| List events | `/api/events` | GET | P0 |
| Create event | `/api/events` | POST | P0 |
| Get event details | `/api/events/:id` | GET | P1 |
| Update event | `/api/events/:id` | PUT | P1 |
| Delete event | `/api/events/:id` | DELETE | P1 |
| Publish event | `/api/events/:id/publish` | POST | P1 |
| **Tickets** ||||
| List tickets | `/api/events/tickets` | GET | P1 |
| Create ticket | `/api/events/tickets` | POST | P1 |
| Update ticket | `/api/events/tickets/:id` | PUT | P1 |
| Get ticket sales | `/api/events/tickets/sales` | GET | P1 |
| Check-in attendee | `/api/events/tickets/checkin` | POST | P0 |
| Scan ticket | `/api/events/tickets/scan` | POST | P0 |
| **Attendees** ||||
| List attendees | `/api/events/attendees` | GET | P1 |
| Import attendees | `/api/events/attendees/import` | POST | P2 |
| Get check-ins | `/api/events/attendees/checkins` | GET | P1 |
| Print badge | `/api/events/attendees/:id/badge` | POST | P2 |
| **Venues** ||||
| List venues | `/api/events/venues` | GET | P1 |
| Create venue | `/api/events/venues` | POST | P1 |
| Get venue layout | `/api/events/venues/:id/layout` | GET | P2 |
| Get venue capacity | `/api/events/venues/:id/capacity` | GET | P2 |
| **Sponsors** ||||
| List sponsors | `/api/events/sponsors` | GET | P1 |
| Create sponsor | `/api/events/sponsors` | POST | P1 |
| Update sponsor | `/api/events/sponsors/:id` | PUT | P1 |
| Get sponsor benefits | `/api/events/sponsors/:id/benefits` | GET | P2 |
| **Vendors** ||||
| List vendors | `/api/events/vendors` | GET | P2 |
| Create vendor | `/api/events/vendors` | POST | P2 |
| Update vendor status | `/api/events/vendors/:id/status` | PUT | P2 |
| **Analytics** ||||
| Get attendance analytics | `/api/events/analytics/attendance` | GET | P2 |
| Get engagement analytics | `/api/events/analytics/engagement` | GET | P2 |
| Get revenue analytics | `/api/events/analytics/revenue` | GET | P2 |

---

*Document generated as part of Batch 3 Design Documents - Events Industry*
