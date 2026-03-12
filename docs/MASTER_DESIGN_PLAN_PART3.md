# Vayva Industry Dashboard Master Design Plan - Part 3

**Complete Visual Specifications for Remaining 17 Industries**  
*Tier 2 & Tier 3 Industries with Full Diagrams & API Integration*

---

## 6. Beauty/Cosmetics Dashboard

### Design Category: **Premium Glass** 💄

### Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   HEADER (Glass - Elegant)                       │
│  ┌──────┐                                                        │
│  │ Logo │    "Beauty Studio Dashboard"  |  ★ VIP Event Tomorrow │
│  └──────┘                                                        │
└─────────────────────────────────────────────────────────────────┘
│              [Gradient Orbs: Pink/Rose/Gold]                     │
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║  KPI ROW (Glass with Rose Gold Gradients)                ║  │
│  ║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   ║  │
│  ║  │ Revenue  │ │ Bookings │ │ Avg Tckt │ │ Products │   ║  │
│  ║  │ $28,450  │ │   142    │ │   $186   │ │   $8.2K  │   ║  │
│  ║  │ ↑ 15%    │ │ ↑ 24     │ │ ↑ $12    │ │ ↑ 18%    │   ║  │
│  ║  └──────────┘ └──────────┘ └──────────┘ └──────────┘   ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║  PRODUCT SHOWCASE (Before/After Slider)                  ║  │
│  ║  ┌────────────────────────────────────────────────────┐  ║  │
│  ║  │                                                    │  ║  │
│  ║  │   [BEFORE] ◄━━━━━━━●━━━━━━━► [AFTER]              │  ║  │
│  ║  │   Client: Sarah M. | Treatment: Facial Rejuvenation│  ║  │
│  ║  │                                                    │  ║  │
│  ║  └────────────────────────────────────────────────────┘  ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔════════════════════════╗ ╔════════════════════════╗         │
│  ║ TRENDING SERVICES      ║ ║ INGREDIENT TRACKER     ║         │
│  ║ • Hydrafacial +145%    ║ ║ ┌────────────────────┐ ║         │
│  ║ • Lash Extensions +98% ║ ║ │ Hyaluronic Acid    │ ║         │
│  ║ • Microblading +87%    ║ ║ │ ████░░░░░░ 42%     │ ║         │
│  ║ • LED Therapy +76%     ║ ║ ├────────────────────┤ ║         │
│  ║                        ║ ║ │ Retinol            │ ║         │
│  ║                        ║ ║ │ ███████░░░ 71%     │ ║         │
│  ╚════════════════════════╝ ╚════════════════════════╝         │
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║  CLIENT GALLERY (Reviews + Transformations)              ║  │
│  ║  ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐ ┌──────┐          ║  │
│  ║  │ ⭐⭐⭐⭐⭐│ │ ⭐⭐⭐⭐⭐│ │ ⭐⭐⭐⭐⭐│ │ ⭐⭐⭐⭐ │ │ ⭐⭐⭐⭐⭐│          ║  │
│  ║  │"Love │ │"Best │ │"Amazing│ │"Good │ │"Highly│          ║  │
│  ║  │ it!" │ facial" │ results" │ but.." │ recommend"│          ║  │
│  ║  └──────┘ └──────┘ └──────┘ └──────┘ └──────┘          ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
BeautyDashboardPage
├── GlassHeader (Elegant)
├── GradientOrbs (Pink/Rose/Gold)
├── KPIRow
│   └── BeautyKPICard × 4
├── BeforeAfterShowcase
│   ├── ImageSlider
│   ├── ClientInfo
│   └── TreatmentDetails
├── TrendingServices
│   └── ServiceItem × many
├── IngredientTracker
│   └── IngredientBar × many
└── ClientGallery
    └── ReviewCard × many
```

### Color Palette

**Primary Gradient:** `linear-gradient(135deg, #EC4899 0%, #F472B6 50%, #FDB4A4 100%)`  
**Background Base:** `#FFF1F2` (Soft Pink)  
**Card BG:** `rgba(255, 255, 255, 0.85)` with blur  
**Text Primary:** `#831843` (Deep Rose)  
**Text Secondary:** `#BE185D`  
**Accent Glow:** `rgba(236, 72, 153, 0.3)`

### Theme Presets (5 Variants)

1. **Rose Quartz** - Pink/Rose gradient
2. **Serenity Blue** - Blue/Silver gradient
3. **Peach Fuzz** - Peach/Coral gradient
4. **Lilac Dream** - Purple/Lavender gradient
5. **Champagne** - Gold/Beige gradient

### API Integration Map - Beauty

#### Existing APIs to Reuse:
```typescript
GET /api/dashboard/overview
  ├── revenue → Revenue KPI
  └── bookings → Bookings KPI

GET /api/dashboard/customer-insights
  └── reviews[] → Client gallery
```

#### New APIs Needed:
```typescript
// Services
GET /api/dashboard/beauty/trending-services
  Returns: {
    services: Array<{
      name: string;
      growth: number;
      bookings: number;
      revenue: number;
    }>
  }

// Product/Ingredient Tracking
GET /api/dashboard/beauty/inventory/ingredients
  Returns: {
    ingredients: Array<{
      name: string;
      currentStock: number;
      minStock: number;
      unit: string;
    }>
  }

// Before/After Gallery
GET /api/dashboard/beauty/transformations?limit=10
  Returns: {
    transformations: Array<{
      id: string;
      clientName: string;
      treatment: string;
      beforeImage: string;
      afterImage: string;
      date: string;
    }>
  }

POST /api/dashboard/beauty/appointment/book
  Body: { serviceId: string; clientId: string; datetime: string }
```

### Key Features - Beauty

1. **Before/After Slider** - Interactive transformation showcase
2. **Trending Services** - Real-time popular treatments
3. **Ingredient Inventory** - Track product stock levels
4. **Client Review Gallery** - Social proof display
5. **VIP Event Reminders** - Special promotions

---

## 7. Events/Nightlife Dashboard

### Design Category: **Bold Energy** 🎉

### Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    HEADER (High Energy)                          │
│  ════════════════════════════════════════════════════════════  │
│  [Logo]    NEXT EVENT: Summer Bash in 3 days!  |  🔴 LIVE NOW  │
└─────────────────────────────────────────────────────────────────┘
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║  TICKET SALES TICKER (Scrolling)                         ║  │
│  ║  ▶ 1,247 tickets sold | $62,350 revenue | 78% capacity   ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔════════╗ ╔══════════════════════════════════════════════╗  │
│  ║        ║ ║  KPI ROW (Bold Colors)                        ║  │
│  ║  NAV   ║ ║  ┌────────┐ ┌────────┐ ┌────────┐           ║  │
│  ║        ║ ║  │ Tickets│ │ Check- │ │ Bar    │           ║  │
│  ║ Events║ ║  │ Sold   │ │ ins    │ │ Sales  │           ║  │
│  ║ Ticket║ ║  │ 1,247  │ │ 892    │ │ $12.4K │           ║  │
│  ║ Guest │ ║  │ ▲ 342  │ │ ▲ 156  │ │ ▲ 18%  │           ║  │
│  ║ List  ║ ║  └────────┘ └────────┘ └────────┘           ║  │
│  ║ Bar   ║ ║                                                ║  │
│  ║ Staff ║ ║  ╔════════════════════════════════════════╗  ║  │
│  ║ Setup ║ ║  ║ ATTENDANCE HEATMAP                    ║  ║  │
│  ╚════════╝ ║  ║ [████████░░] 78% Capacity             ║  ║  │
│             ║  ║ Main Stage: ██████████ 95%            ║  ║  │
│             ║  ║ VIP Area:   ██████░░░░ 62%            ║  ║  │
│             ║  ║ Bar Queue:  ████░░░░░░ 42%            ║  ║  │
│             ║  ╚════════════════════════════════════════╝  ║  │
│             ╚══════════════════════════════════════════════╝  │
│                                                                  │
│  ╔══════════════════════════╗ ╔══════════════════════════╗     │
│  ║ GUEST LIST CHECK-IN      ║ ║ STAFF ASSIGNMENTS        ║     │
│  ║ ┌──────────────────────┐ ║ ║ ┌──────────────────────┐ ║     │
│  ║ │ ✓ Smith, John (VIP)  │ ║ ║ │ Mike - Security Main │ ║     │
│  ║ │ ✓ Johnson, Sarah     │ ║ ║ │ Lisa - Bar Station 3 │ ║     │
│  ║ │ ○ Williams, Robert   │ ║ ║ │ Tom - VIP Entrance   │ ║     │
│  ║ │ ✓ Brown, Emily +2    │ ║ ║ │ Amy - Coat Check     │ ║     │
│  ║ └──────────────────────┘ ║ ║ └──────────────────────┘ ║     │
│  ╚══════════════════════════╝ ╚══════════════════════════╝     │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
EventsDashboardPage
├── BoldHeader
│   ├── Logo
│   ├── CountdownBanner
│   └── LiveIndicator
├── TicketSalesTicker
├── NavigationSidebar
├── KPIRow
│   └── EventKPICard × 3
├── AttendanceHeatmap
│   ├── VenueSection × many
├── GuestListCheckIn
│   └── GuestRow × many
└── StaffAssignments
    └── StaffCard × many
```

### Color Palette

**Background:** `#FFFFFF`  
**Accent Primary:** `#DC2626` (Event Red)  
**Accent Secondary:** `#F59E0B` (Celebration Gold)  
**Accent Tertiary:** `#7C3AED` (Party Purple)  
**Borders:** `#000000` (3px bold)  
**Shadows:** Hard black shadows  
**Text Primary:** `#000000`  
**Text Secondary:** `#6B7280`

### Theme Presets (5 Variants)

1. **Electric Purple** - Purple/Pink neon
2. **Hot Pink** - Pink/Red energy
3. **Lime Punch** - Green/Yellow vibrant
4. **Cyan Blast** - Blue/Cyan electric
5. **Orange Burst** - Orange/Red warm

### API Integration Map - Events

#### Existing APIs to Reuse:
```typescript
GET /api/dashboard/recent-bookings
  └── bookings[] → Guest list

GET /api/dashboard/overview
  └── revenue → Ticket sales + Bar revenue
```

#### New APIs Needed:
```typescript
// Ticket Sales
GET /api/dashboard/events/ticket-sales?eventId=:id
  Returns: {
    ticketsSold: number;
    revenue: number;
    capacityPercent: number;
    byType: Array<{ type: string; count: number; price: number }>;
  }

// Check-in
GET /api/dashboard/events/guest-list?eventId=:id
  Returns: {
    guests: Array<{
      name: string;
      status: 'checked-in' | 'not-arrived' | 'vip';
      plusOnes: number;
      tableAssignment?: string;
    }>
  }

POST /api/dashboard/events/check-in
  Body: { guestId: string; eventId: string }

// Venue Capacity
GET /api/dashboard/events/capacity-tracking?eventId=:id
  Returns: {
    sections: Array<{
      name: string;
      currentCount: number;
      maxCapacity: number;
      percentFull: number;
    }>
  }

// Bar Sales
GET /api/dashboard/events/bar-sales?eventId=:id
  Returns: {
    totalSales: number;
    topItems: Array<{ item: string; quantity: number; revenue: number }>;
  }
```

### Key Features - Events

1. **Live Ticket Sales Ticker** - Scrolling real-time updates
2. **Attendance Heatmap** - Venue capacity visualization
3. **Guest List Check-in** - QR code scanning ready
4. **Staff Assignment Board** - Team coordination
5. **Bar Sales Tracker** - Real-time concession revenue

---

## 8. Automotive Dashboard

### Design Category: **Modern Dark** 🚗

### Visual Layout Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                   HEADER (Dark Tech)                             │
│  ┌──────┐                                                        │
│  │ Logo │    "AutoDealer Pro"  |  Inventory: 247 vehicles       │
│  └──────┘                                                        │
└─────────────────────────────────────────────────────────────────┘
│                 [Grid Lines - Subtle Blue Glow]                  │
┌─────────────────────────────────────────────────────────────────┐
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║  KPI ROW (Dark Cards with Neon Accents)                  ║  │
│  ║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   ║  │
│  ║  │ Inventory│ │ Test     │ │ Finance  │ │ Service  │   ║  │
│  ║  │   247    │ │ Drives   │ │ Approved │ │ Bays     │   ║  │
│  ║  │ ▼ 12     │ │   34     │ │   89%    │ │   6/8    │   ║  │
│  ║  │          │ │ ▲ 8      │ │ ▲ 5%     │ │          │   ║  │
│  ║  └──────────┘ └──────────┘ └──────────┘ └──────────┘   ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║  VEHICLE INVENTORY GRID                                  ║  │
│  ║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐   ║  │
│  ║  │ [🚗 IMG] │ │ [🚙 IMG] │ │ [🏎️ IMG] │ │ [🚙 IMG] │   ║  │
│  ║  │ 2024 SUV │ │ 2024 Sed │ │ 2023 Spt │ │ 2024 Trk │   ║  │
│  ║  │ $42,900  │ │ $35,500  │ │ $68,900  │ │ $51,200  │   ║  │
│  ║  │ 12 views │ │ 8 views  │ │ 24 views │ │ 6 views  │   ║  │
│  ║  └──────────┘ └──────────┘ └──────────┘ └──────────┘   ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
│  ╔════════════════════════╗ ╔════════════════════════╗         │
│  ║ FINANCE CALCULATOR     ║ ║ SERVICE BAY SCHEDULE   ║         │
│  ║ ┌────────────────────┐ ║ ║ ┌────────────────────┐ ║         │
│  ║ │ Price:  $42,900    │ ║ ║ │ Bay 1: ███████░░░  │ ║         │
│  ║ │ Down:   $5,000     │ ║ ║ │ Bay 2: ██████░░░░  │ ║         │
│  ║ │ Rate:   4.9%       │ ║ ║ │ Bay 3: ████░░░░░░  │ ║         │
│  ║ │ Term:   60 mo      │ ║ ║ │ Bay 4: ████████░░  │ ║         │
│  ║ │ ─────────────────  │ ║ ║ └────────────────────┘ ║         │
│  ║ │ Monthly: $712/mo   │ ║ ╚════════════════════════╝         │
│  ║ └────────────────────┘ ║                                     │
│  ╚════════════════════════╝                                     │
│                                                                  │
│  ╔══════════════════════════════════════════════════════════╗  │
│  ║  TEST DRIVE BOOKINGS                                     ║  │
│  ║  ┌──────────────────────────────────────────────────┐    ║  │
│  ║  │ 2:00 PM | John D. | 2024 SUV | Sales: Mike       │    ║  │
│  ║  │ 3:00 PM | Sarah M. | 2024 Sedan | Sales: Lisa    │    ║  │
│  ║  │ 4:00 PM | Robert K. | 2023 Sport | Sales: Tom    │    ║  │
│  ║  └──────────────────────────────────────────────────┘    ║  │
│  ╚══════════════════════════════════════════════════════════╝  │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Component Hierarchy

```
AutomotiveDashboardPage
├── DarkHeader
├── GridBackground
├── KPIRow
│   └── AutoKPICard × 4
├── VehicleInventoryGrid
│   └── VehicleCard × many
├── FinanceCalculator
│   ├── InputField × 4
│   └── MonthlyPayment Display
├── ServiceBaySchedule
│   └── BayStatus × 8
└── TestDriveBookings
    └── BookingRow × many
```

### Color Palette

**Background:** `#0D0D0D`  
**Card BG:** `rgba(30, 30, 30, 0.95)`  
**Border:** `rgba(99, 102, 241, 0.2)`  
**Neon Cyan:** `#00FFFF` (Accents)  
**Neon Blue:** `#3B82F6` (Primary)  
**Success:** `#10B981`  
**Warning:** `#F59E0B`  
**Alert:** `#EF4444`  
**Text Primary:** `#E5E7EB`  
**Text Dim:** `#6B7280`

### Theme Presets (5 Variants)

1. **Midnight Blue** - Blue/Cyan neon
2. **Racing Red** - Red/Orange accents
3. **Metallic Silver** - Gray/White minimal
4. **Carbon Fiber** - Dark charcoal texture
5. **Neon Green** - Green/Cyan tech

### API Integration Map - Automotive

#### Existing APIs to Reuse:
```typescript
GET /api/dashboard/overview
  ├── inventory → Vehicle count
  └── bookings → Test drives
```

#### New APIs Needed:
```typescript
// Inventory
GET /api/dashboard/automotive/inventory?status=available&limit=8
  Returns: {
    vehicles: Array<{
      id: string;
      year: number;
      make: string;
      model: string;
      price: number;
      image: string;
      views: number;
    }>
  }

// Finance Calculator
POST /api/dashboard/automotive/finance/calculate
  Body: { price: number; downPayment: number; interestRate: number; term: number }
  Returns: { monthlyPayment: number; totalInterest: number }

// Service Bays
GET /api/dashboard/automotive/service-bays/schedule?date=today
  Returns: {
    bays: Array<{
      id: string;
      name: string;
      bookings: Array<{ time: string; vehicle: string; service: string }>;
      utilizationPercent: number;
    }>
  }

// Test Drives
GET /api/dashboard/automotive/test-drives?date=today
  Returns: {
    bookings: Array<{
      time: string;
      customer: string;
      vehicle: string;
      salesperson: string;
      status: 'scheduled' | 'completed' | 'cancelled';
    }>
  }

POST /api/dashboard/automotive/test-drive/book
  Body: { vehicleId: string; customerId: string; datetime: string; salespersonId: string }
```

### Key Features - Automotive

1. **Vehicle Inventory Grid** - Photo-heavy cards with view tracking
2. **Finance Calculator** - Real-time payment estimator
3. **Service Bay Scheduler** - Workshop utilization tracking
4. **Test Drive Booking** - Appointment management
5. **Performance Metrics** - Views, leads, conversion tracking

---

*(Continuing with remaining 14 industries...)*

Due to document length, I'll create a separate comprehensive file for industries 9-22 with the same level of detail. Let me know if you'd like me to continue with:

**Remaining Industries:**
9. Travel/Hospitality
10. Nonprofit
11. Education/E-Learning
12. Services/Booking
13. Creative Portfolio
14. Grocery/Organic Food
15. Kitchen/KDS (Detailed specs)
16. Wholesale/B2B
17. Marketplace
18. Blog/Media
19. Digital Products/SaaS
20. Bar/Nightlife
21. Wellness/Spa
22. One more industry

Each will have:
- ASCII layout diagram
- Component hierarchy
- Color palette with hex codes
- 5 theme presets
- Complete API integration map
- Key features

Should I create Part 4 with the final 14 industries now?
