# VAYVA INDUSTRY DASHBOARD - MASTER DESIGN PLAN PART3
## Industries 6-8: Beauty, Events, Automotive

**Document Version:** 1.0  
**Last Updated:** March 10, 2026  
**Previous Parts:** 
- MASTER_DESIGN_PLAN_COMPLETE.md (Industries 1-2)
- MASTER_DESIGN_PLAN_PART2.md (Industries 3-5)

---

## BEAUTY/COSMETICS DASHBOARD - PREMIUM GLASS

### Industry Context
Beauty professionals need appointment scheduling, client management, service menus, product retail tracking, and before/after galleries with an elegant, aspirational aesthetic that reflects beauty transformations.

### Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VAYVA HEADER - GLASS                                                       │
│  [Logo]  Beauty Studio    [+ Book Appointment]  [💬 Messages] [🔔] [⚙️]    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📊 TODAY'S SALON OVERVIEW                                          │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │     18       │  │    $3,240    │  │     87%      │              │   │
│  │  │ Appointments │  │  Revenue    │  │  Retail Sales│              │   │
│  │  │   Today      │  │   Target     │  │   Goal       │              │   │
│  │  │  6 checked in│  │   ↑ $2.8K    │  │   ↑ 12%      │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  │                                                                      │   │
│  │  Next: Sarah M. - 2:30 PM - Balayage & Cut - Stylist: Emma        │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐  ┌────────────────────────────────────┐   │
│  │ 📅 APPOINTMENT SCHEDULE     │  │ 💇‍♀️ STYLIST AVAILABILITY          │   │
│  │                             │  │                                    │   │
│  │  1:00 PM  ✅ Jessica L.     │  │  Emma Chen                       │   │
│  │           Manicure Deluxe   │  │  ████████░░ 8/10 bookings        │   │
│  │           Nail Tech: Lisa   │  │  Next: 3:30 PM, 5:00 PM          │   │
│  │                             │  │                                    │   │
│  │  1:30 PM  ⏳ Michael R.     │  │  Marcus Johnson                  │   │
│  │           Men's Cut         │  │  ██████████ 10/10 bookings       │   │
│  │           Barber: Tom       │  │  Fully booked                    │   │
│  │                             │  │                                    │   │
│  │  2:00 PM  🚨 Running Late   │  │  Sofia Rodriguez                 │   │
│  │           Color Correction  │  │  ██████░░░░ 6/10 bookings        │   │
│  │           Client: Amy T.    │  │  Available: 2:30, 3:30, 4:30     │   │
│  │                             │  │                                    │   │
│  │  [View Full Schedule →]     │  │  [Manage Staff Calendar →]        │   │
│  └─────────────────────────────┘  └────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ ✨ BEFORE & AFTER GALLERY                                          │   │
│  │                                                                     │   │
│  │  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐          │   │
│  │  │ BEFORE   │  │ BEFORE   │  │ BEFORE   │  │ BEFORE   │          │   │
│  │  │  ▸▸▸▸▸   │  │  ▸▸▸▸▸   │  │  ▸▸▸▸▸   │  │  ▸▸▸▸▸   │          │   │
│  │  │ AFTER    │  │ AFTER    │  │ AFTER    │  │ AFTER    │          │   │
│  │  │ AFTER    │  │ AFTER    │  │ AFTER    │  │ AFTER    │          │   │
│  │  │Balayage  │  │Hair Color│  │  Makeup  │  │  Nails   │          │   │
│  │  │  ★★★★★  │  │  ★★★★★  │  │  ★★★★★  │  │  ★★★★★  │          │   │
│  │  └──────────┘  └──────────┘  └──────────┘  └──────────┘          │   │
│  │                                                                     │   │
│  │  [View All Transformations (234) →]                                 │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐  ┌────────────────────────────────────┐   │
│  │ 🛍️ PRODUCT INVENTORY       │  │ 📈 CLIENT INSIGHTS                 │   │
│  │                             │  │                                    │   │
│  │  Retail Sales Today: $892  │  │  New Clients This Month: 34       │   │
│  │                             │  │  Returning Rate: 76%              │   │
│  │  Top Sellers:              │  │  Average Visit Value: $145        │   │
│  │  • Olaplex No.3 (12 units) │  │                                    │   │
│  │  • Kerastase Oil (8 units) │  │  Client Satisfaction: 4.9★        │   │
│  │  • Redken Shampoo (6 units)│  │  (based on 128 reviews this month)│   │
│  │                             │  │                                    │   │
│  │  Low Stock Alerts: 5 items │  │  [View Client Reports →]           │   │
│  │  [Restock Products →]       │  └────────────────────────────────────┘   │
│  └─────────────────────────────┘                                            │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
BeautyDashboard
├── VayvaThemeProvider (category="glass", preset="rose-gold-beauty")
├── DashboardHeader (glass variant with soft shadows)
│   ├── VayvaLogo (glass styling)
│   ├── PageTitle ("Beauty Studio")
│   ├── PrimaryButton ("+ Book Appointment")
│   ├── MessagesButton
│   ├── NotificationBadge
│   └── SettingsIconButton
├── TodaysOverviewSection
│   └── VayvaCard (variant="glass", fullWidth)
│       ├── CardHeader(title="Today's Salon Overview")
│       ├── KPICardGrid (3 columns)
│       │   ├── AppointmentsCard (count with check-in status)
│       │   ├── RevenueCard (target vs actual)
│       │   └── RetailSalesCard (goal percentage)
│       └── NextAppointmentBanner (client name, time, service, stylist)
├── TwoColumnGrid
│   ├── AppointmentSchedulePanel
│   │   └── VayvaCard (variant="glass")
│       ├── CardHeader (title="Appointment Schedule")
│       ├── AppointmentTimeline
│       │   ├── AppointmentItem (time, status icon, client, service, provider)
│       │   └── AppointmentItem (multiple with running late alert)
│       └── ViewFullScheduleLink
│   └── StylistAvailabilityPanel
│       └── VayvaCard (variant="glass")
│           ├── CardHeader(title="Stylist Availability")
│           ├── StylistList
│           │   ├── StylistRow (name, booking fill bar, available slots, status)
│           │   └── StylistRow (multiple)
│           └── ManageStaffCalendarLink
├── BeforeAfterGallerySection
│   └── VayvaCard (variant="glass", fullWidth)
│       ├── CardHeader(title="Before & After Gallery")
│       ├── TransformationGrid (4 columns)
│       │   └── BeforeAfterSlider(before/after images, service type, rating)
│       └── ViewAllTransformationsLink
├── BottomTwoColumnGrid
│   ├── ProductInventoryWidget
│   │   └── VayvaCard (variant="glass")
│       ├── CardHeader (title="Product Inventory")
│       ├── RetailSalesSummary (today's total)
│       ├── TopSellersList (product name, units sold)
│       ├── LowStockAlert (count)
│       └── RestockProductsLink
│   └── ClientInsightsPanel
│       └── VayvaCard (variant="glass")
│           ├── CardHeader(title="Client Insights")
│           ├── ClientMetrics (new clients, returning rate, avg visit value)
│           ├── SatisfactionRating (stars, review count)
│           └── ViewClientReportsLink
└── WebSocketConnection(real-time appointment updates)
```

### Color Palette

**Primary Colors:**
- Rose Gold: `#E0BFB8` (primary actions, luxury feel)
- Soft Blush: `#FFD6D6` (gradient overlays, feminine touch)
- Dusty Rose: `#D4A59A` (hover states, accents)

**Neutral Base:**
- Pure White: `#FFFFFF` (glass card base, clean aesthetic)
- Warm Gray: `#F5F5F5` (section backgrounds)
- Taupe: `#B8A8A0` (text secondary)
- Charcoal: `#374151` (text primary)

**Accent Colors:**
- Champagne: `#F7E7CE` (highlights, special offers)
- Soft Lavender: `#E6E6FA` (calming accent)

**Gradient Presets:**
```css
--gradient-rose-gold: linear-gradient(135deg, #E0BFB8 0%, #FFD6D6 100%);
--gradient-blush: linear-gradient(135deg, #FFD6D6 0%, #D4A59A 100%);
--gradient-champagne: linear-gradient(135deg, #F7E7CE 0%, #E0BFB8 100%);
```

**Glass Effect:**
```css
background: rgba(255, 255, 255, 0.85);
backdrop-filter: blur(20px);
-webkit-backdrop-filter: blur(20px);
border: 1px solid rgba(224, 191, 184, 0.2);
box-shadow: 0 8px 32px rgba(224, 191, 184, 0.1);
```

### Theme Presets (5 Options)

1. **Rose Gold Elegance** (Default): Soft rose gold, feminine luxury
2. **Platinum Chic**: Cool silver tones, modern sophistication
3. **Lavender Dreams**: Soft purple accents, calming spa feel
4. **Peach Glow**: Warm peach tones, sunny optimism
5. **Minimal Luxe**: Stark white with single gold accent

### API Integration Map

#### Existing Endpoints to Leverage

```typescript
// From Backend/core-api/src/routes/appointments.ts
GET /api/appointments?date=today&providerType=stylist
GET /api/appointments/:id
PUT /api/appointments/:id/status

// From Backend/core-api/src/routes/staff.ts
GET /api/staff?role=stylist&availability=today
GET /api/staff/:id/schedule

// From Backend/core-api/src/routes/products.ts
GET /api/products?category=retail&lowStock=true
GET /api/products/top-sellers?period=today
```

#### New Endpoints to Create

```typescript
// Beauty-specific analytics
GET /api/industries/beauty/dashboard
  Response: {
    appointmentsToday: number,
   checkedInCount: number,
   revenueToday: number,
   revenueTarget: number,
   retailSalesGoal: number,
   retailSalesPercentage: number,
  nextAppointment: {
      clientName: string,
      time: string,
      service: string,
     stylistName: string,
      duration: number
    }
  }

GET /api/industries/beauty/appointment-schedule
  Response: {
   schedule: Array<{
      time: string,
     status: 'confirmed' | 'checked-in' | 'in-progress' | 'completed' | 'running-late' | 'no-show',
      clientId: string,
      clientName: string,
      serviceId: string,
      serviceName: string,
     providerId: string,
     providerName: string,
      duration: number,
      notes?: string
    }>
  }

GET /api/industries/beauty/stylist-availability
  Response: {
   stylists: Array<{
     id: string,
     name: string,
      specialty: string,
      bookingsCount: number,
     totalSlots: number,
      availableTimes: string[],
     status: 'available' | 'busy' | 'fully-booked'
    }>
  }

GET /api/industries/beauty/transformations?limit=20
  Response: {
    transformations: Array<{
     id: string,
      beforeImages: string[],
      afterImages: string[],
      serviceType: string,
      rating: number,
      clientId?: string,
     stylistId: string,
      createdAt: timestamp
    }>
  }

GET /api/industries/beauty/product-inventory
  Response: {
  retailSalesToday: number,
   topSellers: Array<{
     productId: string,
     name: string,
      unitsSold: number,
     revenue: number
    }>,
   lowStockItems: Array<{
     productId: string,
     name: string,
      currentStock: number,
      minStock: number
    }>
  }

GET /api/industries/beauty/client-insights?period=30d
  Response: {
   newClients: number,
   returningRate: number,
    averageVisitValue: number,
    satisfactionRating: number,
   reviewCount: number,
   topServices: Array<{
      serviceId: string,
     name: string,
      bookingsCount: number,
     revenue: number
    }>
  }
```

#### WebSocket Integration

```typescript
ws://localhost:3001/ws/beauty-dashboard

// Subscribe to channels
{ action: 'subscribe', channels: ['appointment-updates', 'client-checkin', 'product-alerts'] }

// Receive appointment notifications
{
  type: 'appointment-checked-in',
  payload: {
    appointmentId: 'APT-123',
    clientName: 'Sarah Martinez',
    service: 'Balayage & Cut',
   stylistName: 'Emma Chen',
   scheduledTime: '2:30 PM',
   roomNumber: 'Station 5'
  }
}

{
  type: 'appointment-running-late',
  payload: {
    appointmentId: 'APT-456',
    clientName: 'Amy Thompson',
    estimatedDelay: 15,
    affectedAppointments: ['APT-789']
  }
}

{
  type: 'product-low-stock',
  payload: {
   productId: 'PROD-321',
   name: 'Olaplex No.3',
    currentStock: 3,
    minStock: 10
  }
}
```

### Key Features

1. **Before/After Slider**: Interactive image comparison showcasing transformations
2. **Stylist Booking Tracker**: Visual fill indicators for each stylist's schedule
3. **Retail Sales Integration**: Product sales tracking alongside service revenue
4. **Appointment Timeline**: Color-coded status indicators (on-time, running late)
5. **Client Retention Analytics**: New vs returning client ratios, satisfaction scores
6. **Low Stock Alerts**: Automatic notifications for product inventory management
7. **Glassmorphism Aesthetic**: Elegant backdrop blur with rose-gold gradients

---

## EVENTS/NIGHTLIFE DASHBOARD - BOLD ENERGY

### Industry Context
Event venues and nightlife establishments need ticket sales tracking, attendance management, capacity monitoring, and real-time event performance with high-energy, dynamic visuals that match the excitement of live events.

### Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  VAYVA HEADER - BOLD                                                        │
│  [Logo]  Event Command Center    [+ Create Event]  [🎫 Tickets] [🔔 7]     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 🎉 LIVE EVENT STATUS                                               │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │   SOLD OUT   │  │    847/1000  │  │   $24,580    │              │   │
│  │  │   Tonight    │  │   Capacity   │  │  Revenue    │              │   │
│  │  │   Doors: 9PM │  │   Inside Now │  │   (↑ 32%)    │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  │                                                                      │   │
│  │  Current Act: DJ Shadow Stage B | Next: Headliner at 11:00 PM     │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐  ┌────────────────────────────────────┐   │
│  │ 🎟️ TICKET SALES TICKER     │  │ 👥 ATTENDANCE HEATMAP             │   │
│  │                             │  │                                    │   │
│  │  ⚡ General Admission: 523  │  │         VENUE LAYOUT              │   │
│  │  ⚡ VIP: 189                │  │                                    │   │
│  │  ⚡ Table Service: 135      │  │  ┌────┐ ┌────┐ ┌────┐            │   │
│  │                             │  │  │🔴90%││🟢45%││🟡68%│  Bar 1    │   │
│  │  Last 5 min: +47 tickets   │  │  └────┘ └────┘ └────┘            │   │
│  │  Peak hour: 10-11PM (234)  │  │                                    │   │
│  │                             │  │  ┌────┐ ┌────┐ ┌────┐            │   │
│  │  [View Sales Report →]      │  │  │🟢32%││🔴95%││🟡71%│  Dance    │   │
│  │                             │  │  └────┘ └────┘ └────┘  Floor     │   │
│  │                             │  │                                    │   │
│  │                             │  │  Legend: 🔴 Crowded 🟡 Moderate   │   │
│  │                             │  │          🟢 Open                  │   │
│  │                             │  │                                    │   │
│  │                             │  │  [Live Camera Feeds →]            │   │
│  └─────────────────────────────┘  └────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📊 REVENUE BREAKDOWN                                               │   │
│  │                                                                     │   │
│  │  Ticket Sales   [████████░░]  $18,450  (75%)                      │   │
│  │  Table Service  [████░░░░░░]  $4,920   (20%)                      │   │
│  │  Merchandise    [█░░░░░░░░░]  $1,210   (5%)                       │   │
│  │                                                                     │   │
│  │  Avg Spend Per Person: $29.03                                      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐  ┌────────────────────────────────────┐   │
│  │ 🍸 BAR PERFORMANCE          │  │ 🚨 ALERTS                        │   │
│  │                             │  │                                    │   │
│  │  Bar 1: $4,230 (busiest)   │  │  ⚠️  Capacity Alert: VIP Section  │   │
│  │  Bar 2: $3,180             │  │     95% full, consider closing    │   │
│  │  Bar 3: $2,890             │  │                                    │   │
│  │                             │  │  ℹ️  Waitlist: 47 people          │   │
│  │  Top Seller: Signature     │  │     Average wait: 35 min          │   │
│  │  Cocktails (234 orders)    │  │                                    │   │
│  │                             │  │  🔒 Security Incident: 0          │   │
│  │  [View Bar Stats →]         │  │                                    │   │
│  │                             │  │  [View All Alerts (12) →]         │   │
│  └─────────────────────────────┘  └────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
EventsNightlifeDashboard
├── VayvaThemeProvider (category="bold", preset="neon-nightlife")
├── DashboardHeader(bold variant with thick borders)
│   ├── VayvaLogo
│   ├── PageTitle ("Event Command Center")
│   ├── PrimaryButton ("+ Create Event")
│   ├── TicketsButton
│   ├── NotificationBadge (count=7)
│   └── SettingsIconButton
├── LiveEventStatusSection
│   └── VayvaCard (variant="bold", fullWidth)
│       ├── CardHeader (title="Live Event Status")
│       ├── KPICardGrid (3 columns)
│       │   ├── EventStatusCard (sold out indicator, door time)
│       │   ├── CapacityCard (current count, max capacity)
│       │   └── RevenueCard (total, trend percentage)
│       └── CurrentActBanner (performer name, next act time)
├── TwoColumnGrid
│   ├── TicketSalesTickerPanel
│   │   └── VayvaCard (variant="bold")
│       ├── CardHeader (title="Ticket Sales Ticker")
│       ├── TicketTypeList (GA, VIP, table service with counts)
│       ├── RecentSalesActivity (last 5 min, peak hour)
│       └── ViewSalesReportLink
│   └── AttendanceHeatmapPanel
│       └── VayvaCard (variant="bold")
│           ├── CardHeader(title="Attendance Heatmap")
│           ├── VenueLayoutGrid (visual capacity indicators by zone)
│           ├── ColorLegend
│           └── LiveCameraFeedsLink
├── RevenueBreakdownSection
│   └── VayvaCard (variant="bold", fullWidth)
│       ├── CardHeader (title="Revenue Breakdown")
│       ├── RevenueProgressBarList (tickets, table service, merchandise)
│       └── AvgSpendPerPerson Metric
├── BottomTwoColumnGrid
│   ├── BarPerformanceWidget
│   │   └── VayvaCard (variant="bold")
│       ├── CardHeader (title="Bar Performance")
│       ├── BarSalesList (by location, top seller)
│       └── ViewBarStatsLink
│   └── AlertsPanel
│       └── VayvaCard (variant="bold")
│           ├── CardHeader(title="Alerts")
│           ├── AlertList
│           │   ├── CapacityAlert (zone, percentage, recommendation)
│           │   ├── WaitlistInfo (count, avg wait time)
│           │   └── SecurityIncidentCounter
│           └── ViewAllAlertsLink
└── WebSocketConnection (real-time ticket sales, capacity updates)
```

### Color Palette

**Primary Colors:**
- Electric Blue: `#3B82F6` (primary actions, digital displays)
- Neon Pink: `#EC4899` (VIP, urgent alerts)
- Hot Purple: `#A855F7` (highlights, special promotions)

**Neutral Base:**
- Pure White: `#FFFFFF` (card backgrounds)
- Jet Black: `#000000` (borders, text primary, high contrast)
- Dark Gray: `#1F2937` (section backgrounds)

**Status Colors:**
- Sold Out: `#EF4444` (red, urgent)
- Limited: `#F97316` (orange, warning)
- Available: `#10B981` (green, positive)
- Crowd Level: Gradient from green → yellow → red

**Bold Design Tokens:**
```css
--events-primary: #3B82F6;
--events-neon-pink: #EC4899;
--events-neon-purple: #A855F7;
--border-thick: 2px solid #000000;
--shadow-solid: 4px 4px 0px #000000;
--shadow-hover: 6px 6px 0px #000000;
```

### Theme Presets (5 Options)

1. **Neon Nightlife** (Default): Electric blue, neon pink, vibrant energy
2. **Golden VIP**: Luxury gold accents for upscale venues
3. **Red Velvet**: Deep red tones for intimate clubs
4. **UV Glow**: Blacklight-inspired neon greens and purples
5. **Monochrome Bold**: Black and white with single accent color

### API Integration Map

#### Existing Endpoints to Leverage

```typescript
// From Backend/core-api/src/routes/events.ts
GET /api/events?status=active&date=today
GET /api/events/:id
PUT /api/events/:id

// From Backend/core-api/src/routes/tickets.ts
GET /api/events/:id/tickets/sales
GET /api/tickets/types?eventId=:id

// From Backend/core-api/src/routes/orders.ts
POST /api/orders (ticket purchases)
GET /api/orders?eventId=:id&status=completed
```

#### New Endpoints to Create

```typescript
// Events-specific analytics
GET /api/industries/events/dashboard?eventId=:id
  Response: {
    eventStatus: 'upcoming' | 'live' | 'completed' | 'sold-out',
    doorTime: string,
    currentAttendance: number,
    maxCapacity: number,
   capacityPercentage: number,
   totalRevenue: number,
   revenueGrowth: number,
    currentAct: string,
   nextActTime: string
  }

GET /api/industries/events/ticket-sales?eventId=:id
  Response: {
    salesByType: Array<{
      typeId: string,
     name: 'General Admission' | 'VIP' | 'Table Service',
      sold: number,
      available: number,
     price: number,
     revenue: number
    }>,
   recentSales: {
      last5Minutes: number,
      lastHour: number,
     peakHour: { time: string, count: number }
    },
    salesHistory: Array<{ hour: string, ticketsSold: number }>
  }

GET /api/industries/events/attendance-heatmap?eventId=:id
  Response: {
    venueZones: Array<{
      zoneId: string,
     name: string,
      currentCount: number,
     capacity: number,
     percentage: number,
     status: 'open' | 'moderate' | 'crowded' | 'full'
    }>,
   cameraFeeds: Array<{
      zoneId: string,
     streamUrl: string,
      thumbnailUrl: string
    }>
  }

GET /api/industries/events/revenue-breakdown?eventId=:id
  Response: {
  revenueSources: Array<{
      source: 'tickets' | 'table-service' | 'merchandise' | 'parking' | 'other',
      amount: number,
     percentage: number
    }>,
    avgSpendPerPerson: number,
   totalAttendees: number
  }

GET /api/industries/events/bar-performance?eventId=:id
  Response: {
    bars: Array<{
      barId: string,
     name: string,
     revenue: number,
     orderCount: number,
      avgWaitTime: number
    }>,
   topSellers: Array<{
      itemId: string,
     name: string,
     category: string,
     orderCount: number,
     revenue: number
    }>
  }

GET /api/industries/events/alerts?eventId=:id
  Response: {
   capacityAlerts: Array<{
      zoneId: string,
      zoneName: string,
      currentPercentage: number,
     recommendation: string
    }>,
    waitlist: {
     count: number,
      averageWaitTime: number
    },
    securityIncidents: number,
    otherAlerts: Array<{
      type: string,
      message: string,
      severity: 'info' | 'warning' | 'critical'
    }>
  }
```

#### WebSocket Integration

```typescript
ws://localhost:3001/ws/events-dashboard

// Subscribe to channels
{ action: 'subscribe', channels: ['ticket-sales-live', 'capacity-updates', 'alerts'] }

// Receive real-time ticket sales
{
  type: 'ticket-sale',
  payload: {
    ticketType: 'VIP',
   quantity: 2,
   total: 400,
    timestamp: '2026-03-10T22:15:32Z'
  }
}

{
  type: 'capacity-update',
  payload: {
    zoneId: 'vip-section',
    zoneName: 'VIP Section',
    currentCount: 95,
   capacity: 100,
   percentage: 95,
   status: 'crowded'
  }
}

{
  type: 'alert',
  payload: {
    alertType: 'capacity-warning',
    zone: 'Main Floor',
    message: 'Dance floor at 92% capacity',
    severity: 'warning',
   recommendedAction: 'Slow down entry to main floor'
  }
}

{
  type: 'milestone',
  payload: {
    milestoneType: 'revenue-goal',
    message: 'Revenue target exceeded! $25,000 reached',
    celebration: true
  }
}
```

### Key Features

1. **Live Ticket Ticker**: Real-time sales feed with countdown urgency
2. **Venue Capacity Heatmap**: Visual zone-by-zone crowd density tracking
3. **Revenue Pulse**: Live revenue counter with goal progress
4. **Bar Performance Metrics**: Sales by location, top sellers identification
5. **Capacity Alerts**: Automatic warnings when zones approach limits
6. **Waitlist Management**: Queue tracking with estimated wait times
7. **Bold Visual Design**: Thick borders, solid shadows, high-energy aesthetics

---

## AUTOMOTIVE DASHBOARD - MODERN DARK

### Industry Context
Automotive dealerships and service centers need vehicle inventory management, sales pipeline tracking, service bay scheduling, and financing tools with a sleek, modern dark interface that conveys sophistication and technical precision.

### Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────────────────┐
│  KDS - AUTOMOTIVE                                                          │
│  [Vayva Logo]  Auto Dealer Pro    [+ List Vehicle]  [🔧 Service] [🔔 4]    │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 📊 DEALERSHIP PERFORMANCE (March 2026)                              │   │
│  │                                                                      │   │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │   │
│  │  │     47       │  │   $1,847K    │  │    12.3%     │              │   │
│  │  │ Units Sold   │  │  Revenue    │  │  Gross Margin│              │   │
│  │  │   ↑ 8 vs LY  │  │   ↑ $234K    │  │   ↑ 1.2%     │              │   │
│  │  └──────────────┘  └──────────────┘  └──────────────┘              │   │
│  │                                                                      │   │
│  │  Month-to-Date Goal: 68% (47/69 units)                              │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐  ┌────────────────────────────────────┐   │
│  │ 🚗 VEHICLE INVENTORY        │  │ 🔍 LEAD PIPELINE                   │   │
│  │                             │  │                                    │   │
│  │  Total Stock: 234 vehicles │  │  ┌──────────────────────────┐     │   │
│  │                             │  │  │ John Davis              │     │   │
│  │  By Category:              │  │  │ Interested: 2026 F-150  │     │   │
│  │  • SUVs: 89 (38%)         │  │  │ Budget: $55K-$65K       │     │   │
│  │  • Sedans: 67 (29%)       │  │  │ Hot Lead • Test Drive   │     │   │
│  │  • Trucks: 52 (22%)       │  │  │ Scheduled: Tomorrow 2PM │     │   │
│  │  • Electric: 26 (11%)     │  │  └──────────────────────────┘     │   │
│  │                             │  │                                    │   │
│  │  Low Stock Alert:          │  │  ┌──────────────────────────┐     │   │
│  │  • Hybrid Sedans (3 left)  │  │  │ Maria Garcia            │     │   │
│  │                             │  │  │ Interested: Tesla M.Y.  │     │   │
│  │  [View Inventory (234) →]   │  │  │ Budget: $48K-$52K       │     │   │
│  │                             │  │  │ Warm Lead • Follow-up   │     │   │
│  │                             │  │  │ Financing Pre-approved  │     │   │
│  │                             │  │  └──────────────────────────┘     │   │
│  │                             │  │                                    │   │
│  │                             │  │  [View All Leads (89) →]          │   │
│  └─────────────────────────────┘  └────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ 🔧 SERVICE BAY SCHEDULE                                            │   │
│  │                                                                     │   │
│  │  Bay 1: ████████░░ 2026 Honda Civic - Oil Change - Done 2:15 PM  │   │
│  │  Bay 2: ██████████ 2025 Toyota RAV4 - Brake Service- In Progress │   │
│  │  Bay 3: ████░░░░░░ 2024 Ford F-150 - Inspection - Waiting         │   │
│  │  Bay 4: ██████░░░░ 2026 Tesla Model 3 - Tire Rotation - Next      │   │
│  │                                                                     │   │
│  │  Today's Appointments: 34 | Completed: 28 | Pending: 6            │   │
│  │  Revenue: $4,890                                                  │   │
│  │                                                                     │   │
│  │  [View Service Schedule →]                                          │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
│                                                                             │
│  ┌─────────────────────────────┐  ┌────────────────────────────────────┐   │
│  │ 💰 FINANCING CALCULATOR     │  │ 📈 MARKET INSIGHTS                 │   │
│  │                             │  │                                    │   │
│  │  Vehicle Price: $45,000    │  │  Avg Days on Lot: 42 days         │   │
│  │  Down Payment: $9,000      │  │  Market Avg: 38 days               │   │
│  │  Interest Rate: 4.5%       │  │                                    │   │
│  │  Term: 60 months           │  │  Top Selling: Midsize SUVs        │   │
│  │                             │  │  +23% vs last quarter             │   │
│  │  Monthly Payment:          │  │                                    │   │
│  │  $672/mo                   │  │  Trade-In Values: Stable ↗️       │   │
│  │                             │  │  +2.1% this month                 │   │
│  │  [Run Custom Quote →]       │  │                                    │   │
│  │                             │  │  [View Market Report →]            │   │
│  └─────────────────────────────┘  └────────────────────────────────────┘   │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
AutomotiveDashboard
├── VayvaThemeProvider (category="dark", preset="automotive-sleek")
├── DashboardHeader
│   ├── VayvaLogo (neon variant)
│   ├── PageTitle ("Auto Dealer Pro")
│   ├── PrimaryButton ("+ List Vehicle")
│   ├── ServiceBayButton
│   ├── NotificationBadge (count=4)
│   └── SettingsIconButton
├── DealershipPerformanceSection
│   └── VayvaCard (variant="dark", fullWidth)
│       ├── CardHeader(title="Dealership Performance", subtitle="March 2026")
│       ├── KPICardGrid (3 columns)
│       │   ├── UnitsSoldCard (count, vs last year)
│       │   ├── RevenueCard (total, growth)
│       │   └── GrossMarginCard (percentage, trend)
│       └── MonthlyGoalProgress (current/goal, percentage)
├── TwoColumnGrid
│   ├── VehicleInventoryPanel
│   │   └── VayvaCard (variant="dark")
│       ├── CardHeader(title="Vehicle Inventory")
│       ├── TotalStockMetric
│       ├── CategoryBreakdownList (SUVs, sedans, trucks, electric)
│       ├── LowStockAlert
│       └── ViewInventoryLink
│   └── LeadPipelinePanel
│       └── VayvaCard (variant="dark")
│           ├── CardHeader(title="Lead Pipeline")
│           ├── LeadCardList
│           │   ├── LeadCard (name, vehicle interest, budget, temperature, next action)
│           │   └── LeadCard (multiple)
│           └── ViewAllLeadsLink
├── ServiceBayScheduleSection
│   └── VayvaCard (variant="dark", fullWidth)
│       ├── CardHeader (title="Service Bay Schedule")
│       ├── BayScheduleList
│       │   ├── BayRow (bay number, fill bar, vehicle, service, status, ETA)
│       │   └── BayRow (multiple bays)
│       ├── DailyMetrics (appointments, completed, pending, revenue)
│       └── ViewServiceScheduleLink
├── BottomTwoColumnGrid
│   ├── FinancingCalculatorWidget
│   │   └── VayvaCard (variant="dark")
│       ├── CardHeader(title="Financing Calculator")
│       ├── CalculatorInputs (price, down payment, rate, term)
│       ├── MonthlyPaymentDisplay (large, prominent)
│       └── RunCustomQuoteLink
│   └── MarketInsightsPanel
│       └── VayvaCard (variant="dark")
│           ├── CardHeader(title="Market Insights")
│           ├── InsightList (days on lot, top selling category, trade-in values)
│           └── ViewMarketReportLink
└── WebSocketConnection(real-time lead updates, service bay status)
```

### Color Palette

**Background Colors:**
- Void Black: `#0D0D0D` (main background)
- Charcoal: `#1A1A1A` (card backgrounds)
- Gunmetal: `#2D2D2D` (elevated surfaces)

**Primary Accent Colors:**
- Electric Blue: `#3B82F6` (primary actions, highlights)
- Performance Red: `#DC2626` (urgent alerts, sport trim)
- Metallic Silver: `#9CA3AF` (secondary text, accents)

**Status Colors:**
- Available: `#10B981` (green, in stock)
- Low Stock: `#F97316` (orange, warning)
- Sold: `#6B7280` (gray, completed)
- Lead Hot: `#EF4444` (red, urgent follow-up)
- Lead Warm: `#F97316` (orange, nurturing)
- Lead Cold: `#3B82F6` (blue, long-term)

**Neon Glow Effects:**
```css
--neon-glow-blue: 0 0 10px rgba(59, 130, 246, 0.5);
--neon-glow-red: 0 0 10px rgba(220, 38, 38, 0.5);
--neon-glow-green: 0 0 10px rgba(16, 185, 129, 0.5);
```

### Theme Presets (5 Options)

1. **Automotive Sleek** (Default): Electric blue accents, tech-forward
2. **Performance Red**: Sporty red tones for racing/dealer performance
3. **Luxury Gold**: Premium gold for luxury/exotic dealerships
4. **Eco Green**: Green accents for EV/hybrid focused dealerships
5. **Stealth Mode**: Monochrome with minimal accents, ultra-modern

### API Integration Map

#### Existing Endpoints to Leverage

```typescript
// From Backend/core-api/src/routes/inventory.ts
GET /api/inventory/vehicles?status=available&category=all
GET /api/inventory/vehicles/:id
PUT /api/inventory/vehicles/:id

// From Backend/core-api/src/routes/leads.ts
GET /api/leads?source=website&status=all
GET /api/leads/:id
PUT /api/leads/:id/status

// From Backend/core-api/src/routes/service.ts
GET /api/service/appointments?date=today
GET /api/service/bays?status=all
```

#### New Endpoints to Create

```typescript
// Automotive-specific analytics
GET /api/industries/automotive/dashboard
  Response: {
    unitsSold: number,
    unitsSoldVsLastYear: number,
   revenue: number,
   revenueGrowth: number,
   grossMargin: number,
    marginTrend: number,
    monthlyGoal: {
      target: number,
      current: number,
     percentage: number
    }
  }

GET /api/industries/automotive/inventory-summary
  Response: {
   totalStock: number,
    byCategory: Array<{
     category: 'SUV' | 'Sedan' | 'Truck' | 'Electric' | 'Hybrid',
     count: number,
     percentage: number
    }>,
   lowStockAlerts: Array<{
     category: string,
      currentStock: number,
      minThreshold: number
    }>
  }

GET /api/industries/automotive/lead-pipeline
  Response: {
   totalLeads: number,
   leads: Array<{
     id: string,
     name: string,
      interestedVehicle: string,
      budgetRange: { min: number, max: number },
      temperature: 'hot' | 'warm' | 'cold',
     nextAction: string,
     scheduledAppointment?: {
        date: string,
        time: string
      },
      financingStatus?: 'pre-approved' | 'pending' | 'not-started'
    }>
  }

GET /api/industries/automotive/service-bay-schedule?date=today
  Response: {
    bays: Array<{
      bayId: string,
      bayNumber: number,
      currentAppointment?: {
        vehicle: string,
        service: string,
       status: 'in-progress' | 'waiting' | 'completed' | 'next',
        eta?: string,
       completedAt?: string
      },
      utilizationPercentage: number
    }>,
    dailyMetrics: {
     totalAppointments: number,
     completed: number,
     pending: number,
     revenue: number
    }
  }

GET /api/industries/automotive/market-insights
  Response: {
    avgDaysOnLot: number,
    marketAverageDays: number,
   topSellingCategory: {
     category: string,
     growthPercentage: number
    },
    tradeInValues: {
      trend: 'increasing' | 'stable' | 'decreasing',
     changePercentage: number
    }
  }
```

#### WebSocket Integration

```typescript
ws://localhost:3001/ws/automotive-dashboard

// Subscribe to channels
{ action: 'subscribe', channels: ['new-leads', 'service-bay-updates', 'inventory-changes'] }

// Receive new lead notifications
{
  type: 'new-lead',
  payload: {
   leadId: 'LEAD-789',
  name: 'Robert Johnson',
    interestedVehicle: '2026 Chevrolet Tahoe',
    source: 'website-form',
    temperature: 'warm',
    phone: '555-0123'
  }
}

{
  type: 'service-bay-status',
  payload: {
    bayId: 'BAY-3',
    bayNumber: 3,
   newStatus: 'completed',
    vehicle: '2024 Ford F-150',
    service: 'Oil Change & Inspection',
   nextVehicle: '2026 Tesla Model 3'
  }
}

{
  type: 'inventory-low',
  payload: {
   category: 'Hybrid Sedan',
    currentStock: 3,
    minThreshold: 10,
   recommendedAction: 'Contact supplier for restock'
  }
}
```

### Key Features

1. **Vehicle Inventory Grid**: Visual inventory tracker with category breakdown
2. **Lead Temperature System**: Hot/warm/cold indicators with follow-up scheduling
3. **Service Bay Utilization**: Real-time bay occupancy with ETA tracking
4. **Financing Calculator**: Integrated payment estimator with custom quotes
5. **Market Intelligence**: Days on lot, trending categories, trade-in values
6. **Monthly Goal Tracking**: Sales target progress with percentage completion
7. **Dark Mode Precision**: High-contrast interface for technical environments

---

## NEXT STEPS

**Proceed to MASTER_DESIGN_PLAN_PART4_FINAL.md for remaining 14 industries:**
- Travel/Hospitality (Natural Warmth)
- Nonprofit (Natural Warmth)
- Education (Signature Clean)
- Services (Signature Clean)
- Creative/Arts (Premium Glass)
- Grocery/Food Market (Natural Warmth)
- Kitchen/KDS (Modern Dark) - Detailed spec
- Wholesale/B2B (Signature Clean)
- Marketplace (Signature Clean)
- Blog/Media (Signature Clean)
- SaaS/Tech (Modern Dark)
- Bar/Lounge (Bold Energy)
- Wellness/Fitness (Natural Warmth)
- Professional Services (Signature Clean)

---

*Document continues in PART4_FINAL...*
