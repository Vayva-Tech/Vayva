# Batch 5 Design Specification: Travel & Tourism Platform

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  VAYVA TRAVEL - Premium Glass Design                                                │
│  [Dashboard] [Bookings] [Properties] [Guests] [Marketing] [Finance] [Settings]      │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  📊 ACTIVE BOOKINGS OVERVIEW                              🔔 12 Notifications       │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  Today's Check-ins: 24    │  Tonight's Occupancy: 78%   │  Avg Daily Rate   │   │
│  │  ▲ 18% vs last week       │  ▲ 12 units available       │  $289/night       │   │
│  │                             │                             │  ▲ 8% vs last month│   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  🗺️ PROPERTY OCCUPANCY MAP                          📅 CALENDAR VIEW               │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  [Interactive Map with Pins]     │  │  [Monthly Calendar Grid]                │ │
│  │  🔴 Full (8)  🟡 Limited (12)    │  │  █ Booked  ░ Available  ▒ Maintenance  │ │
│  │  🟢 Available (24) 🔵 Event (4)  │  │  [Date Selection Tool]                  │ │
│  │                                  │  │  [Seasonal Pricing Overlay]             │ │
│  │  [Property Type Filter]          │  │                                         │ │
│  │  □ All  □ Villas  □ Apartments   │  │                                         │ │
│  │  □ Studios  □ Shared Rooms       │  │                                         │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  📈 REVENUE ANALYTICS                               👥 GUEST DEMOGRAPHICS           │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Monthly Revenue Trend           │  │  Guest Origin Map                      │ │
│  │  $180K ┤        ╭──╮              │  │  [World Map with Heat Zones]          │ │
│  │  $140K ┤     ╭──╯  ╰──╮           │  │  🇺🇸 USA 32%  🇬🇧 UK 18%  🇩🇪 DE 12%   │ │
│  │  $100K ┤  ╭──╯        ╰──╮        │  │  🇫🇷 FR 8%   🇦🇺 AU 7%   🇯🇵 JP 6%     │ │
│  │  $60K  ┤──╯                ╰──╮   │  │  🇨🇦 CA 5%   🇮🇹 IT 4%   Other 8%      │ │
│  │         Jan  Feb  Mar  Apr  May │  │                                         │ │
│  │  ADR: $289  RevPAR: $225       │  │  Repeat Guest Rate: 34%                 │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  🧳 UPCOMING RESERVATIONS                           ⚠️ ACTION REQUIRED              │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  Date       Guest            Property          Nights   Status     Action   │   │
│  │  Mar 15     John Smith       Ocean Villa       5 nights Confirmed  [Check-in]│   │
│  │  Mar 15     Emma Wilson      City Loft         3 nights Pending    [Approve] │   │
│  │  Mar 16     Michael Brown    Mountain Retreat  7 nights Confirmed  [Prepare] │   │
│  │  Mar 16     Sarah Davis      Beach Condo       4 nights Confirmed  [Check-in]│   │
│  │  Mar 17     David Lee        Garden Studio     2 nights Pending    [Review]  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  📣 MARKETING PERFORMANCE                           🧹 HOUSEKEEPING STATUS          │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Channel Performance            │  │  Room Status Dashboard                 │ │
│  │  Booking.com 45%  ████████░░    │  │  ✅ Clean: 32 rooms                    │ │
│  │  Airbnb 28%     █████░░░░░░░    │  │  🔄 In Progress: 8 rooms               │ │
│  │  Direct 18%     ███░░░░░░░░░    │  │  ⏳ Pending: 12 rooms                  │ │
│  │  Expedia 9%     ██░░░░░░░░░░    │  │  🔧 Maintenance: 4 rooms               │ │
│  │                                 │  │                                         │ │
│  │  Conversion Rate: 3.2%          │  │  [Priority Cleaning List]               │ │
│  │  Avg Booking Value: $1,247      │  │  [Amenity Restocking Alerts]            │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  🌟 GUEST REVIEWS                                   🎯 SEASONAL INSIGHTS           │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Overall Rating: 4.7/5 ⭐⭐⭐⭐⭐  │  │  Peak Season Forecast                  │ │
│  │  Cleanliness 4.8  Location 4.9   │  │  Next 30 days: 89% occupancy           │ │
│  │  Communication 4.6  Value 4.5    │  │  Revenue projection: $245K             │ │
│  │  Accuracy 4.7  Check-in 4.8      │  │  Recommended rate increase: +15%       │ │
│  │                                 │  │                                         │ │
│  │  Recent Review:                 │  │  Low Season Strategy                   │ │
│  │  "Amazing property with..."     │  │  Jun-Aug: 45% avg occupancy            │ │
│  │  - Jennifer, 5★ (2 days ago)    │  │  Promotional packages recommended      │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Design Category: Premium Glass

**Primary Color:** Professional Blue `#4A90E2`
**Accent Colors:** Sunset Orange `#FF6B35`, Ocean Teal `#00B4D8`, Sand Beige `#F4D35E`

**Visual Characteristics:**
- Frosted glass panels with subtle blur effects
- Gradient overlays inspired by travel destinations
- High-quality property imagery as background elements
- Map-based visualizations with custom pins
- Calendar and booking widgets with smooth animations
- Currency conversion displays with live rates
- Multi-language support indicators

**Component Styling:**
- Cards: Semi-transparent white backgrounds with location-based imagery
- Metrics: Large numerals with trend indicators using travel-themed icons
- Charts: Area charts with gradient fills resembling landscapes
- Maps: Interactive property maps with custom markers
- Calendars: Month view with availability color coding
- Reviews: Star rating displays with guest photos

## Component Hierarchy

```
TravelDashboard (root)
├── OccupancyOverview
│   ├── TodayCheckIns (count, trend, list)
│   ├── TonightOccupancy (units, percentage, availability)
│   └── AverageDailyRate (current, comparison, trend)
├── PropertyMap
│   ├── InteractiveMap (Leaflet/Google Maps integration)
│   ├── PropertyPins (status-coded markers)
│   ├── PropertyTypeFilter (checkbox group)
│   └── PropertyDetailsModal (on pin click)
├── CalendarView
│   ├── MonthlyCalendar (grid display)
│   ├── AvailabilityLegend (color coding)
│   ├── DateSelectionTool (range picker)
│   └── SeasonalPricingOverlay (toggle view)
├── RevenueAnalytics
│   ├── MonthlyRevenueTrend (line/area chart)
│   ├── ADRMetric (average daily rate)
│   ├── RevPARMetric (revenue per available room)
│   └── RevenueBreakdown (by property type/channel)
├── GuestDemographics
│   ├── OriginMap (world map with heat zones)
│   ├── CountryBreakdown (percentage list with flags)
│   ├── RepeatGuestRate (metric card)
│   └── GuestTypeDistribution (business/leisure split)
├── UpcomingReservations
│   ├── ReservationList (table format)
│   ├── ReservationItem (date, guest, property, nights, status)
│   ├── StatusBadge (confirmed, pending, cancelled)
│   └── QuickActions (check-in, approve, prepare, review)
├── MarketingPerformance
│   ├── ChannelPerformance (OTA breakdown with bars)
│   ├── ConversionRateMetric (booking site conversion)
│   ├── AverageBookingValue (revenue metric)
│   └── ChannelComparison (YoY performance)
├── HousekeepingStatus
│   ├── RoomStatusDashboard (clean/in-progress/pending/maintenance)
│   ├── PriorityCleaningList (sorted by check-in time)
│   └── AmenityRestockingAlerts (low inventory notifications)
├── GuestReviews
│   ├── OverallRating (star display with score)
│   ├── CategoryRatings (cleanliness, location, communication, etc.)
│   ├── RecentReviewsList (review cards)
│   └── ReviewResponseTool (owner reply interface)
└── SeasonalInsights
    ├── PeakSeasonForecast (occupancy, revenue, rate recommendations)
    ├── LowSeasonStrategy (promotional suggestions)
    ├── DemandCalendar (heat map view)
    └── CompetitorAnalysis (market positioning)
```

## Theme Presets

### Theme 1: Ocean Breeze (Default)
```css
.primary: #4A90E2;        /* Professional Blue */
.secondary: #00B4D8;      /* Ocean Teal */
.accent: #FF6B35;         /* Sunset Orange */
.background: #F0F8FF;     /* Alice Blue */
.success: #10B981;        /* Emerald Green */
.warning: #F59E0B;        /* Amber */
.danger: #EF4444;         /* Red */
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.95);
.border-radius: 12px;
.shadow: 0 4px 24px rgba(74, 144, 226, 0.15);
```

### Theme 2: Tropical Sunset
```css
.primary: #FF6B35;        /* Sunset Orange */
.secondary: #F4D35E;      /* Sand Beige */
.accent: #FF8E72;         /* Coral Pink */
.background: #FFF5EB;     /* Warm Cream */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 245, 235, 0.95);
.border-radius: 12px;
.shadow: 0 4px 24px rgba(255, 107, 53, 0.15);
```

### Theme 3: Mountain Retreat
```css
.primary: #059669;        /* Forest Green */
.secondary: #8B7355;      /* Mountain Brown */
.accent: #D4A574;         /* Wood Tan */
.background: #F5F5F0;     /* Stone Gray */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(245, 245, 240, 0.95);
.border-radius: 12px;
.shadow: 0 4px 24px rgba(5, 150, 105, 0.15);
```

### Theme 4: Urban Chic
```css
.primary: #6366F1;        /* Indigo */
.secondary: #EC4899;      /* Pink */
.accent: #8B5CF6;         /* Violet */
.background: #F8FAFC;     /* Slate White */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(248, 250, 252, 0.95);
.border-radius: 12px;
.shadow: 0 4px 24px rgba(99, 102, 241, 0.15);
```

### Theme 5: Coastal Luxury
```css
.primary: #0891B2;        /* Cyan }
.secondary: #14B8A6;      /* Teal */
.accent: #F59E0B;         /* Golden */
.background: #ECFEFF;     /* Cyan Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(236, 254, 255, 0.95);
.border-radius: 12px;
.shadow: 0 4px 24px rgba(8, 145, 178, 0.15);
```

## Settings Expansion

### Base Settings (Universal)
- Account Management
- Team Members & Permissions
- Security & Authentication
- Notifications & Alerts
- Billing & Subscription
- API Access

### Travel-Specific Settings

#### 1. Property Management
- **Property Listings**
  - Add/edit/remove properties
  - Photo gallery management
  - Amenities checklist
  - House rules configuration
  - Instant book vs. request settings
- **Pricing Configuration**
  - Base nightly rates
  - Weekend pricing
  - Weekly/monthly discounts
  - Seasonal pricing calendars
  - Smart pricing (dynamic rates)
  - Extra guest fees
  - Cleaning fees
  - Security deposits
- **Availability Calendar**
  - Blocked dates management
  - Minimum/maximum stay requirements
  - Advance notice periods
  - Preparation time between bookings
  - Sync with external calendars (iCal)

#### 2. Booking Management
- **Reservation Settings**
  - Instant book eligibility
  - Booking window (how far in advance)
  - Cancellation policies (flexible, moderate, strict)
  - Check-in/check-out times
  - Same-day booking rules
- **Guest Requirements**
  - Government ID verification
  - Profile photo requirements
  - Guest reviews requirement
  - Minimum age restrictions
- **Automation Rules**
  - Auto-accept criteria
  - Auto-decline criteria
  - Message templates
  - Automated review requests

#### 3. Channel Management
- **OTA Integrations**
  - Airbnb connection & sync
  - Booking.com integration
  - Expedia/Vrbo integration
  - Direct booking website
  - Google Hotel Ads
- **Channel Rules**
  - Pricing parity settings
  - Availability synchronization
  - Booking restrictions per channel
  - Commission tracking
- **Distribution Strategy**
  - Preferred channels priority
  - Channel-specific promotions
  - Last-minute deals distribution

#### 4. Guest Communication
- **Message Templates**
  - Booking confirmation
  - Pre-arrival instructions
  - Check-in guide
  - During-stay support
  - Check-out instructions
  - Review request
- **Automated Messaging**
  - Timing triggers (days before arrival, etc.)
  - Personalization tokens
  - Multi-language support
  - SMS vs. email preferences
- **Communication Preferences**
  - Response time goals
  - Quiet hours settings
  - Emergency contact information
  - Local recommendations database

#### 5. Housekeeping & Maintenance
- **Cleaning Schedules**
  - Turnover cleaning assignments
  - Mid-stay cleaning schedules
  - Deep cleaning schedules
  - Inspection checklists
- **Maintenance Tracking**
  - Issue reporting system
  - Vendor contact list
  - Preventive maintenance schedules
  - Supply inventory management
- **Amenity Management**
  - Toiletries restocking levels
  - Kitchen supplies inventory
  - Linen par levels
  - Welcome amenity options

#### 6. Revenue Management
- **Dynamic Pricing**
  - Market demand analysis
  - Competitor rate monitoring
  - Event-based pricing
  - Length-of-stay discounts
- **Financial Reporting**
  - Revenue by property
  - Revenue by channel
  - Occupancy trends
  - ADR and RevPAR tracking
  - Expense tracking
- **Tax Configuration**
  - Occupancy tax rates
  - VAT/GST settings
  - Tax exemption handling
  - Automatic tax collection

## API Endpoint Mappings

### Existing APIs (Can be reused)
```
GET    /api/bookings                    - List all bookings
POST   /api/bookings                    - Create new booking
GET    /api/bookings/:id                - Get booking details
PUT    /api/bookings/:id                - Update booking
DELETE /api/bookings/:id                - Cancel booking
GET    /api/properties                  - List all properties
POST   /api/properties                  - Create property
GET    /api/properties/:id              - Get property details
PUT    /api/properties/:id              - Update property
DELETE /api/properties/:id              - Delete property
GET    /api/guests                      - List guests
GET    /api/guests/:id                  - Get guest profile
GET    /api/reviews                     - List reviews
POST   /api/reviews                     - Submit review
GET    /api/analytics/overview          - Dashboard analytics
```

### New APIs Required for Travel Industry

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| **Property Management APIs** |
| POST | `/api/properties/:id/photos` | Upload property photos | P0 |
| DELETE | `/api/properties/:id/photos/:photoId` | Remove photo | P1 |
| PUT | `/api/properties/:id/amenities` | Update amenities list | P0 |
| GET | `/api/properties/:id/availability` | Get availability calendar | P0 |
| PUT | `/api/properties/:id/availability` | Update blocked dates | P0 |
| GET | `/api/properties/:id/pricing` | Get pricing calendar | P0 |
| PUT | `/api/properties/:id/pricing` | Update seasonal pricing | P0 |
| **Booking Management APIs** |
| GET | `/api/bookings/upcoming` | Get upcoming reservations | P0 |
| GET | `/api/bookings/checkins-today` | Get today's check-ins | P0 |
| GET | `/api/bookings/checkouts-today` | Get today's check-outs | P0 |
| POST | `/api/bookings/:id/check-in` | Process guest check-in | P0 |
| POST | `/api/bookings/:id/check-out` | Process guest check-out | P0 |
| POST | `/api/bookings/:id/approve` | Approve pending booking | P0 |
| POST | `/api/bookings/:id/decline` | Decline booking request | P0 |
| PUT | `/api/bookings/:id/status` | Update booking status | P0 |
| **Guest Management APIs** |
| GET | `/api/guests/:id/history` | Get guest booking history | P1 |
| GET | `/api/guests/:id/reviews` | Get guest reviews received | P1 |
| PUT | `/api/guests/:id/notes` | Add guest notes | P1 |
| GET | `/api/guests/demographics` | Get guest demographics analytics | P1 |
| GET | `/api/guests/repeat-rate` | Get repeat guest rate | P1 |
| **Channel Management APIs** |
| GET | `/api/channels` | List connected channels | P0 |
| POST | `/api/channels/connect` | Connect new OTA channel | P0 |
| DELETE | `/api/channels/:id/disconnect` | Disconnect channel | P1 |
| GET | `/api/channels/performance` | Get channel performance metrics | P0 |
| PUT | `/api/channels/:id/sync` | Force channel synchronization | P1 |
| GET | `/api/channels/calendar-sync` | Get iCal sync settings | P1 |
| PUT | `/api/channels/calendar-sync` | Update calendar sync | P1 |
| **Housekeeping APIs** |
| GET | `/api/housekeeping/status` | Get room status dashboard | P0 |
| PUT | `/api/housekeeping/:roomId/status` | Update room cleaning status | P0 |
| GET | `/api/housekeeping/assignments` | Get cleaning assignments | P0 |
| POST | `/api/housekeeping/assignments` | Create cleaning task | P1 |
| GET | `/api/housekeeping/inspections` | Get inspection checklists | P1 |
| POST | `/api/housekeeping/inspections/:id` | Submit inspection report | P1 |
| GET | `/api/housekeeping/inventory` | Get supply inventory levels | P1 |
| PUT | `/api/housekeeping/inventory` | Update inventory counts | P1 |
| **Revenue Management APIs** |
| GET | `/api/revenue/adr` | Get average daily rate trends | P0 |
| GET | `/api/revenue/revpar` | Get revenue per available room | P0 |
| GET | `/api/revenue/forecast` | Get revenue forecast | P1 |
| GET | `/api/revenue/by-property` | Get revenue breakdown by property | P0 |
| GET | `/api/revenue/by-channel` | Get revenue by distribution channel | P0 |
| GET | `/api/pricing/dynamic-suggestions` | Get dynamic pricing suggestions | P1 |
| PUT | `/api/pricing/smart-pricing` | Configure smart pricing rules | P1 |
| GET | `/api/pricing/competitor-rates` | Get competitor rate analysis | P1 |
| **Review Management APIs** |
| GET | `/api/reviews/analytics` | Get review analytics (ratings breakdown) | P0 |
| POST | `/api/reviews/:id/respond` | Respond to guest review | P1 |
| GET | `/api/reviews/pending` | Get reviews awaiting response | P1 |
| GET | `/api/reviews/category-scores` | Get category-wise ratings | P0 |
| **Marketing APIs** |
| GET | `/api/marketing/conversion-rate` | Get booking conversion metrics | P1 |
| GET | `/api/marketing/channel-mix` | Get channel performance breakdown | P0 |
| GET | `/api/marketing/listing-performance` | Get listing view-to-booking stats | P1 |
| POST | `/api/marketing/promotions` | Create promotional offer | P1 |
| GET | `/api/marketing/promotions` | List active promotions | P1 |
| **Seasonal Insights APIs** |
| GET | `/api/insights/seasonal-forecast` | Get seasonal demand forecast | P1 |
| GET | `/api/insights/events-calendar` | Get local events impact analysis | P1 |
| GET | `/api/insights/demand-heatmap` | Get demand calendar heatmap | P1 |
| GET | `/api/insights/market-trends` | Get market trend analysis | P1 |

**Total New APIs for Travel: 24 endpoints**

---

**Implementation Notes:**
- Integrate with mapping services (Google Maps, Mapbox) for property locations
- Support multi-currency display with live exchange rates
- Implement real-time availability synchronization across OTAs
- Build automated messaging system with template support
- Create dynamic pricing engine with market data integration
- Support iCal export/import for calendar synchronization
- Implement guest verification workflows
- Build housekeeping mobile app integration
