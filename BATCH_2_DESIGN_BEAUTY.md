# Batch 2 Design Document: BEAUTY Industry Dashboard
## Premium Glass Design with Elegant Rose Accents

**Document Version:** 1.0  
**Industry:** Beauty Salon & Spa Services  
**Design Category:** Premium Glass  
**Plan Tier Support:** Basic → Pro  
**Last Updated:** 2026-03-11

---

## 1. Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  HEADER BAR (Glass Effect - Elegant)                                                │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  [Logo]  Dashboard  Services  Stylists  Appointments  Gallery  Clients  ▼     │  │
│  │                                                                  [🔔] [👤 Pro] │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │  SALON OVERVIEW                    [+ New Appointment] [📊 Today's Report]    │  │
│  │  "Bella Beauty Salon - March 11, 2026"                                        │  │
│  │  Open Now | Next Availability: 2:30 PM | Stylists on Duty: 8/10               │  │
│  └───────────────────────────────────────────────────────────────────────────────┘  │
│                                                                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │  REVENUE    │ │  APPTS      │ │   CLIENTS   │ │  STYLISTS   │ │  RETAIL     │   │
│  │   $4,820    │ │    52       │ │    186      │ │    10       │ │   $842      │   │
│  │   ↑ 15.3%   │ │   ↑ 22.1%   │ │   ↑ 18.4%   │ │   8 active  │ │   ↑ 12.5%   │   │
│  │   [Spark]   │ │   [Spark]   │ │   [Spark]   │ │   [Spark]   │ │   [Spark]   │   │
│  └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘ └─────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       TODAY'S SCHEDULE                  │ │       STYLIST AVAILABILITY       │   │
│  │                                         │ │                                  │   │
│  │  Current Time: 10:45 AM                 │ │  On Duty Today (8 stylists):     │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ 10:00 AM                          │  │ │  │ 👤 Sarah Johnson           │  │   │
│  │  │ ├─ Station 1: Maria (Haircut) ●   │  │ │  │    Hair Stylist            │  │   │
│  │  │ ├─ Station 2: Available ✓         │  │ │  │    ● In Service            │  │   │
│  │  │ ├─ Station 3: Lisa (Color) ●      │  │ │  │    Client: Emma W.         │  │   │
│  │  │ └─ Station 4: Available ✓         │  │ │  │    Until: 11:30 AM         │  │   │
│  │  │                                   │  │ │  │    [View Schedule]         │  │   │
│  │  │ 10:30 AM                          │  │ │  │                            │  │   │
│  │  │ ├─ Station 1: Available ⏳        │  │ │  │ 👤 Michael Chen            │  │   │
│  │  │ ├─ Station 2: James (Beard) ⏳    │  │ │  │    Color Specialist        │  │   │
│  │  │ ├─ Station 3: Available ⏳        │  │ │  │    🟡 Available in 15min   │  │   │
│  │  │ └─ Station 4: Anna (Manicure) ⏳  │  │ │  │    Next: 11:00 AM          │  │   │
│  │  │                                   │  │ │  │    [View Schedule]         │  │   │
│  │  │ 11:00 AM                          │  │ │  │                            │  │   │
│  │  │ ├─ Station 1: Maria (Style) ⏳    │  │ │  │ 👤 Emily Rodriguez         │  │   │
│  │  │ ├─ Station 2: James (Haircut) ⏳  │  │ │  │    Nail Technician         │  │   │
│  │  │ ├─ Station 3: Lisa ⏳              │  │ │  │    ● In Service            │  │   │
│  │  │ └─ Station 4: Anna ⏳               │  │ │  │    Client: Sophie M.      │  │   │
│  │  │                                   │  │ │  │    Until: 11:45 AM         │  │   │
│  │  │ [View Full Schedule]               │  │ │  │    [View Schedule]         │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ Walk-ins Today: 8                  │  │ │  │ Station Status:            │  │   │
│  │  │ No-shows: 2                        │  │ │  │ ● Busy (5)  ✓ Free (3)    │  │   │
│  │  │ Rebooked: 12                       │  │ │  │ 🟡 Soon (2)               │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ [Add Walk-in] [Manage Schedule]    │  │ │  │ [View All Stylists]       │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  └───────────────────────────────────┘  │ │  │ Utilization: 78%           │  │   │
│  │                                         │ │  │                            │  │   │
│  │  Upcoming (Next Hour):                  │ │  │ Top Performer Today:       │  │   │
│  │  • 11:00 AM - Bridal Consult (1h)       │ │  │ Sarah: $842 revenue        │  │   │
│  │  • 11:15 AM - Manicure (45min)          │  │  │                            │  │   │
│  │  • 11:30 AM - Highlights (2.5h)         │  │  │                            │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       SERVICE MENU PERFORMANCE          │ │       BEFORE/AFTER GALLERY       │   │
│  │                                         │ │                                  │   │
│  │  Top Services Today:                    │ │  Recent Transformations:         │   │
│  │  ┌───────────────────────────────────┐  │ │  ┌────────────────────────────┐  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ 1. Balayage Highlights            │  │ │  │ [Before/After Slider]      │  │   │
│  │  │    ████████████████████░░ 8 done  │  │ │  │ Client: Jessica R.         │  │   │
│  │  │    Revenue: $1,240                │  │ │  │ Service: Blonde Balayage   │  │   │
│  │  │    Avg. Duration: 2.5h            │  │ │  │ Stylist: Michael C.        │  │   │
│  │  │                                   │  │ │  │ Posted: 2 hours ago        │  │   │
│  │  │ 2. Gel Manicure                   │  │ │  │ ❤️ 48 likes | 💬 12 comments│  │   │
│  │  │    ████████████████░░░░░░ 6 done  │  │ │  │                            │  │   │
│  │  │    Revenue: $420                  │  │ │  │ [View Gallery] [Approve]   │  │   │
│  │  │    Avg. Duration: 45min           │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ 3. Keratin Treatment              │  │ │  │ [Before/After Slider]      │  │   │
│  │  │    ██████████████░░░░░░░░ 5 done  │  │ │  │ Client: Amanda K.          │  │   │
│  │  │    Revenue: $875                  │  │ │  │ Service: Hair Transformation│  │   │
│  │  │    Avg. Duration: 2h              │  │ │  │ Stylist: Sarah J.          │  │   │
│  │  │                                   │  │ │  │ Posted: 5 hours ago        │  │   │
│  │  │ 4. Bridal Makeup                  │  │ │  │ ❤️ 92 likes | 💬 24 comments│  │   │
│  │  │    ████████████░░░░░░░░░░ 4 done  │  │ │  │                            │  │   │
│  │  │    Revenue: $680                  │  │ │  │ [View Gallery] [Approve]   │  │   │
│  │  │    Avg. Duration: 1.5h            │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ [View All Services]                │  │ │  │ Total Photos: 247          │  │   │
│  │  │                                   │  │ │  │ Pending Approval: 8        │  │   │
│  │  │ Service Categories:                │  │ │  │                            │  │   │
│  │  │ Hair (18) | Nails (12) | Spa (8)   │  │ │  │ [+ Upload Photo]           │  │   │
│  │  │ Makeup (10) | Lashes (4)           │  │ │  │                            │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌─────────────────────────────────────────┐ ┌──────────────────────────────────┐   │
│  │       PRODUCT RECOMMENDATIONS           │ │       CLIENT INSIGHTS            │   │
│  │                                         │ │                                  │   │
│  │  Products Sold Today: 24 items          │ │  Client Demographics:            │   │
│  │  Revenue: $428                          │ │  ┌────────────────────────────┐  │   │
│  │                                         │ │  │                            │  │   │
│  │  Top Products:                          │ │  │ [Pie Chart]                  │  │   │
│  │  ┌───────────────────────────────────┐  │ │  │                            │  │   │
│  │  │ 1. Olaplex No.3      8 units $240 │  │ │  │ New Clients: 32% (60)      │  │   │
│  │  │    ████████████████████░░          │  │ │  │ Regular: 48% (89)         │  │   │
│  │  │                                   │  │ │  │ VIP: 20% (37)             │  │   │
│  │  │ 2. Pureology Shampoo 6 units $192 │  │ │  │                            │  │   │
│  │  │    ████████████████░░░░░░          │  │ │  │                            │  │   │
│  │  │ 3. Redken Mask       5 units $175 │  │ │  │ Retention Rate: 78%        │  │   │
│  │  │    ██████████████░░░░░░░░          │  │ │  │ Avg. Visit Frequency:      │  │   │
│  │  │                                   │  │ │  │ Every 4.2 weeks            │  │   │
│  │  │ 4. Bumble & Bumble   3 units $96  │  │ │  │                            │  │   │
│  │  │    ██████████░░░░░░░░░░░░          │  │ │  │ Lifetime Value:            │  │   │
│  │  │                                   │  │ │  │ Avg: $1,842/client          │  │   │
│  │  │ [View Inventory] [Reorder]         │  │ │  │ VIP Avg: $4,280/client      │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  │ Low Stock Alerts:                  │  │ │  │ [View Client Analytics]    │  │   │
│  │  │ ⚠️ DevaCurl Conditioner (3 left)  │  │ │  │                            │  │   │
│  │  │ ⚠️ Moroccan Oil (5 left)          │  │ │  │ Birthdays This Week: 8     │  │   │
│  │  │                                   │  │ │  │ Anniversaries: 3           │  │   │
│  │  │ Auto-reorder Suggestions:          │  │ │  │                            │  │   │
│  │  │ [Create PO] [Send to Supplier]     │  │ │  │ [Send Birthday Offers]     │  │   │
│  │  │                                   │  │ │  │                            │  │   │
│  │  └───────────────────────────────────┘  │ │  │                            │  │   │
│  │                                         │ │  │                            │  │   │
│  └─────────────────────────────────────────┘ └──────────────────────────────────┘   │
│                                                                                     │
│  ┌───────────────────────────────────────────────────────────────────────────────┐  │
│  │                         AI INSIGHTS (Pro Tier Only)                           │  │
│  │  ┌─────────────────────────────────────────────────────────────────────────┐  │  │
│  │  │ 💡 Recommendation: Promote balayage service for spring season           │  │  │
│  │  │    Based on: 45% increase in requests, seasonal trend, competitor gap   │  │  │
│  │  │    Suggested action: Social media campaign, package deal with treatment │  │  │
│  │  │    Predicted impact: +$2,400 revenue in next 30 days                    │  │  │
│  │  │  [Create Promotion] [View Details]                                      │  │  │
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
Background Primary:   #1A0F1A (Deep plum-black)
Background Secondary: #2A1A2A (Elevated surfaces)
Background Tertiary:  rgba(255, 255, 255, 0.05) (Glass panels)

Accent Primary:       #E879A8 (Elegant rose pink)
Accent Secondary:     #F09BC0 (Soft rose)
Accent Tertiary:      #F8D5E8 (Blush highlight)

Text Primary:         #FFFFFF (Pure white)
Text Secondary:       rgba(255, 255, 255, 0.75)
Text Tertiary:        rgba(255, 255, 255, 0.5)

Status Colors:
  Available: #10B981 (Green)
  Busy:      #F59E0B (Amber)
  Off Duty:  #6B7280 (Gray)
  VIP:       #E879A8 (Rose)
```

**Glassmorphism Effects:**
```css
/* Glass Panel Base */
.glass-panel {
  background: rgba(255, 255, 255, 0.03);
  backdrop-filter: blur(20px);
  border: 1px solid rgba(232, 121, 168, 0.2);
  border-radius: 16px;
}

/* Glass Card Hover */
.glass-card:hover {
  background: rgba(255, 255, 255, 0.06);
  border-color: rgba(232, 121, 168, 0.4);
  box-shadow: 0 8px 32px rgba(232, 121, 168, 0.15);
}

/* Gradient Accents */
.accent-gradient {
  background: linear-gradient(135deg, #E879A8 0%, #F09BC0 100%);
}

/* Metric Card Glow */
.metric-glow {
  box-shadow: 0 0 40px rgba(232, 121, 168, 0.15);
}

/* Before/After Slider */
.ba-slider {
  border: 2px solid rgba(232, 121, 168, 0.3);
  border-radius: 12px;
  overflow: hidden;
}
```

---

## 3. Component Hierarchy

```
BeautyDashboard (Root)
├── DashboardHeader
│   ├── BreadcrumbNav
│   ├── ActionButtons
│   │   ├── NewAppointmentButton
│   │   └── DailyReportButton
│   └── SalonStatus
├── KPIRow (5 metrics)
│   └── BeautyMetricCard × 5
│       ├── SparklineChart
│       ├── TrendIndicator
│       └── ValueDisplay
├── ContentGrid (2 columns)
│   ├── LeftColumn
│   │   ├── TodaysSchedule
│   │   │   ├── TimelineView
│   │   │   ├── StationStatus
│   │   │   ├── AppointmentCard × N
│   │   │   └── QuickActions
│   │   ├── ServiceMenuPerformance
│   │   │   ├── TopServicesList
│   │   │   ├── CategoryBreakdown
│   │   │   └── DurationStats
│   │   └── ProductRecommendations
│   │       ├── TopProductsList
│   │       ├── InventoryAlerts
│   │       └── ReorderSuggestions
│   └── RightColumn
│       ├── StylistAvailability
│       │   ├── StylistCard × N
│       │   ├── StatusIndicator
│       │   ├── CurrentClient
│       │   └── NextAppointment
│       ├── BeforeAfterGallery
│       │   ├── PhotoSlider
│       │   ├── LikeCommentCount
│       │   ├── ApprovalWorkflow
│       │   └── UploadButton
│       └── ClientInsights
│           ├── DemographicsPie
│           ├── RetentionMetrics
│           ├── LifetimeValue
│           └── SpecialOccasions
└── AIInsightsPanel (Pro Tier)
    └── ServiceRecommendation
```

---

## 4. 5 Theme Presets

### Theme 1: Elegant Rose (Default)
```
Primary:    #E879A8
Secondary:  #F09BC0
Background: #1A0F1A
Surface:    rgba(255, 255, 255, 0.03)
Accent:     linear-gradient(135deg, #E879A8, #F09BC0)
```

### Theme 2: Lavender Luxe
```
Primary:    #A78BVA
Secondary:  #C4B5FD
Background: #1A142A
Surface:    rgba(167, 139, 250, 0.05)
Accent:     linear-gradient(135deg, #A78BVA, #C4B5FD)
```

### Theme 3: Gold Glamour
```
Primary:    #D4AF37
Secondary:  #E5C158
Background: #1A1408
Surface:    rgba(212, 175, 55, 0.05)
Accent:     linear-gradient(135deg, #D4AF37, #E5C158)
```

### Theme 4: Sapphire Spa
```
Primary:    #4A90E2
Secondary:  #5BA0F2
Background: #0A0F1A
Surface:    rgba(74, 144, 226, 0.05)
Accent:     linear-gradient(135deg, #4A90E2, #5BA0F2)
```

### Theme 5: Emerald Elegance
```
Primary:    #10B981
Secondary:  #34D399
Background: #0A1F15
Surface:    rgba(16, 185, 129, 0.05)
Accent:     linear-gradient(135deg, #10B981, #34D399)
```

---

## 5. Expanded Settings Page Design

### Beauty-Specific Settings Structure

```
┌─────────────────────────────────────────────────────────────────────────────┐
│ SETTINGS - Beauty Salon Configuration                                       │
├──────────────────┬──────────────────────────────────────────────────────────┤
│                  │  GENERAL SETTINGS                                        │
│  General         │                                                          │
│  Branding        │  ┌────────────────────────────────────────────────────┐  │
│  Notifications   │  │ SALON INFORMATION                                   │  │
│  Integrations    │  │                                                    │  │
│  Team            │  │ Salon Name: [Bella Beauty Salon]                   │  │
│  Billing         │  │ License Number: [COS-2026-12345]                   │  │
│                  │  │ Expiry Date: [Dec 31, 2026]                        │  │
│  ──────────────  │  │ [Upload License] ✓ Verified                        │  │
│                  │  │                                                    │  │
│  BEAUTY SPEC     │  │ Services Offered:                                  │  │
│  ├─ Services     │  │ [✓] Hair Styling  [✓] Coloring   [✓] Extensions   │  │
│  ├─ Stylists     │  │ [✓] Nail Care     [✓] Skincare   [✓] Makeup       │  │
│  ├─ Appointments │  │ [✓] Spa Services  [✓] Lashes     [✓] Waxing       │  │
│  ├─ Gallery      │  │                                                    │  │
│  ├─ Products     │  │ Price Range: [$$$] Premium                         │  │
│  └─ Packages     │  │                                                    │  │
│                  │  │ [Save Salon Info]                                  │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ SERVICE MENU MANAGEMENT                             │  │
│                  │  │                                                    │  │
│                  │  │ Service Categories:                                │  │
│                  │  │ Hair (18 services)                                 │  │
│                  │  │ Nails (12 services)                                │  │
│                  │  │ Skincare (8 services)                              │  │
│                  │  │ Makeup (10 services)                               │  │
│                  │  │ Lashes & Brows (4 services)                        │  │
│                  │  │ Spa Packages (6 services)                          │  │
│                  │  │                                                    │  │
│                  │  │ Pricing Strategy:                                  │  │
│                  │  │ [✓] Tiered pricing by stylist level                │  │
│                  │  │ [✓] Weekend surcharge: [15]%                       │  │
│                  │  │ [✓] Holiday pricing: [25]%                         │  │
│                  │  │                                                    │  │
│                  │  │ Duration Defaults:                                 │  │
│                  │  │ Buffer time: [10] minutes                          │  │
│                  │  │ Cleanup time: [5] minutes                          │  │
│                  │  │                                                    │  │
│                  │  │ [Manage Services] [Import Menu]                    │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ STYLIST MANAGEMENT                                  │  │
│                  │  │                                                    │  │
│                  │  │ Staff Levels:                                      │  │
│                  │  │ • Senior Stylist (4) - Rate: [$80-120]             │  │
│                  │  │ • Stylist (3) - Rate: [$60-90]                     │  │
│                  │  │ • Junior Stylist (2) - Rate: [$40-60]              │  │
│                  │  │ • Nail Tech (1) - Rate: [$35-50]                   │  │
│                  │  │                                                    │  │
│                  │  │ Commission Structure:                              │  │
│                  │  │ Base commission: [40]%                             │  │
│                  │  │ Tier 2 (>$5K/mo): [45]%                            │  │
│                  │  │ Tier 3 (>$8K/mo): [50]%                            │  │
│                  │  │ Tips: [100%] to stylist                            │  │
│                  │  │ Retail commission: [10]%                           │  │
│                  │  │                                                    │  │
│                  │  │ Schedule Settings:                                 │  │
│                  │  │ Max appointments/day: [8]                          │  │
│                  │  │ Min. break between: [15] minutes                   │  │
│                  │  │ Allow double-booking: [✗]                          │  │
│                  │  │                                                    │  │
│                  │  │ [Manage Stylists] [View Schedules]                 │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ APPOINTMENT BOOKING                                 │  │
│                  │  │                                                    │  │
│                  │  │ Booking Rules:                                     │  │
│                  │  │ Online booking: [✓] Enable                         │  │
│                  │  │ Advance booking: [30] days                         │  │
│                  │  │ Cutoff time: [2] hours before                      │  │
│                  │  │ Deposit required: [✓] For services >$100           │  │
│                  │  │                                                    │  │
│                  │  │ Cancellation Policy:                               │  │
│                  │  │ Free cancellation: [24] hours before               │  │
│                  │  │ Late fee: [50]% of service                         │  │
│                  │  │ No-show fee: [100]% of service                     │  │
│                  │  │                                                    │  │
│                  │  │ Confirmation Settings:                             │  │
│                  │  │ [✓] Send SMS confirmation                          │  │
│                  │  │ [✓] Send email confirmation                        │  │
│                  │  │ [✓] Reminder: [24] hours before                    │  │
│                  │  │ [✓] Reminder: [2] hours before                     │  │
│                  │  │                                                    │  │
│                  │  │ [Manage Booking Settings]                          │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ GALLERY & PORTFOLIO                                 │  │
│                  │  │                                                    │  │
│                  │  │ Photo Settings:                                    │  │
│                  │  │ Require before/after: [✓] For chemical services    │  │
│                  │  │ Auto-publish: [✗] Require approval                 │  │
│                  │  │ Watermark: [✓] Add salon logo                      │  │
│                  │  │                                                    │  │
│                  │  │ Social Media Integration:                          │  │
│                  │  │ [✓] Auto-post to Instagram                         │  │
│                  │  │ [✓] Auto-post to Facebook                          │  │
│                  │  │ Hashtags: #[SalonName] #[City]Beauty               │  │
│                  │  │                                                    │  │
│                  │  │ Client Consent:                                    │  │
│                  │  │ [✓] Require photo release form                     │  │
│                  │  │ [✓] Store signed consent                           │  │
│                  │  │ Minor consent: [✓] Parent signature required       │  │
│                  │  │                                                    │  │
│                  │  │ [Manage Gallery] [Photo Release Forms]             │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ PRODUCT & INVENTORY                                 │  │
│                  │  │                                                    │  │
│                  │  │ Retail Products:                                   │  │
│                  │  │ Enable retail sales: [✓]                           │  │
│                  │  │ Commission on retail: [10]%                        │  │
│                  │  │                                                    │  │
│                  │  │ Inventory Tracking:                                │  │
│                  │  │ Track product usage: [✓]                           │  │
│                  │  │ Low stock alerts: [✓] At [20%] remaining           │  │
│                  │  │ Auto-reorder: [✗] Manual approval required         │  │
│                  │  │                                                    │  │
│                  │  │ Preferred Suppliers:                               │  │
│                  │  │ • Olaplex (Authorized retailer)                    │  │
│                  │  │ • Pureology (Authorized retailer)                  │  │
│                  │  │ • Redken (Authorized retailer)                     │  │
│                  │  │                                                    │  │
│                  │  │ [Manage Inventory] [Supplier Contacts]             │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
│                  │  ┌────────────────────────────────────────────────────┐  │
│                  │  │ PACKAGES & MEMBERSHIPS                              │  │
│                  │  │                                                    │  │
│                  │  │ Service Packages:                                  │  │
│                  │  │ • Bridal Package: [$450] (Save $80)                │  │
│                  │  │ • Spa Day: [$280] (Save $50)                       │  │
│                  │  │ • Color & Cut: [$180] (Save $30)                   │  │
│                  │  │ • Mani-Pedi: [$85] (Save $15)                      │  │
│                  │  │                                                    │  │
│                  │  │ Membership Plans:                                  │  │
│                  │  │ • VIP Monthly: [$99/mo] - 20% off all services     │  │
│                  │  │ • Beauty Pass: [$49/mo] - 10% off + free products  │  │
│                  │  │ • Unlimited Blowouts: [$149/mo]                    │  │
│                  │  │                                                    │  │
│                  │  │ Gift Cards:                                        │  │
│                  │  │ [✓] Sell gift cards                                │  │
│                  │  │ Denominations: [$50, $100, $200, Custom]          │  │
│                  │  │ Expiration: [Never]                                │  │
│                  │  │                                                    │  │
│                  │  │ [Manage Packages] [Membership Benefits]            │  │
│                  │  └────────────────────────────────────────────────────┘  │
│                  │                                                          │
└──────────────────┴──────────────────────────────────────────────────────────┘
```

---

## 6. API Endpoints Mapping

### Required APIs for Beauty Dashboard

| Feature | API Endpoint | Method | Priority |
|---------|--------------|--------|----------|
| **Dashboard** ||||
| Get aggregate metrics | `/api/dashboard/aggregate` | GET | P0 |
| Get today's schedule | `/api/beauty/appointments/today` | GET | P0 |
| Get stylist availability | `/api/beauty/stylists/availability` | GET | P0 |
| **Services** ||||
| List services | `/api/beauty/services` | GET | P1 |
| Create service | `/api/beauty/services` | POST | P1 |
| Update service | `/api/beauty/services/:id` | PUT | P1 |
| Delete service | `/api/beauty/services/:id` | DELETE | P1 |
| **Stylists** ||||
| List stylists | `/api/beauty/stylists` | GET | P1 |
| Create stylist | `/api/beauty/stylists` | POST | P1 |
| Update stylist | `/api/beauty/stylists/:id` | PUT | P1 |
| Get stylist schedule | `/api/beauty/stylists/:id/schedule` | GET | P1 |
| Get stylist performance | `/api/beauty/stylists/:id/performance` | GET | P2 |
| **Appointments** ||||
| List appointments | `/api/beauty/appointments` | GET | P0 |
| Create appointment | `/api/beauty/appointments` | POST | P0 |
| Update appointment | `/api/beauty/appointments/:id` | PUT | P1 |
| Get availability | `/api/beauty/appointments/availability` | GET | P1 |
| Send reminder | `/api/beauty/appointments/:id/remind` | POST | P1 |
| **Gallery** ||||
| List gallery photos | `/api/beauty/gallery` | GET | P1 |
| Upload photo | `/api/beauty/gallery` | POST | P1 |
| Update photo | `/api/beauty/gallery/:id` | PUT | P1 |
| Delete photo | `/api/beauty/gallery/:id` | DELETE | P1 |
| **Products** ||||
| Get recommendations | `/api/beauty/recommendations` | GET | P2 |
| Create recommendation | `/api/beauty/recommendations` | POST | P2 |
| Get popular products | `/api/beauty/recommendations/popular` | GET | P2 |
| **Packages** ||||
| List packages | `/api/beauty/packages` | GET | P2 |
| Create package | `/api/beauty/packages` | POST | P2 |
| Get memberships | `/api/beauty/memberships` | GET | P2 |

---

*Document generated as part of Batch 2 Design Documents - Beauty Industry*
