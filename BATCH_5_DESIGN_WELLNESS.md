# Batch 5 Design Specification: Wellness & Spa Platform

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  VAYVA WELLNESS - Natural Warmth Design                                             │
│  [Dashboard] [Bookings] [Services] [Members] [Staff] [Retail] [Marketing] [Settings]│
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  📊 TODAY'S OVERVIEW                                    🔔 6 Notifications          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  Today's Appointments: 47    │  Staff On Duty: 12       │  Revenue Today   │   │
│  │  ▲ 8% vs last week          │  3 on break, 9 active    │  $6,847          │   │
│  │                             │                            │  ▲ 12% vs avg    │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  📅 APPOINTMENT SCHEDULE                            👥 STAFF AVAILABILITY           │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Time     Service          Staff   Client    Status                           │ │
│  │  9:00 AM  Deep Tissue      Sarah    Jennifer In Session  ◉                    │ │
│  │  9:30 AM  Facial           Maria    Lisa      Checked In  ✓                    │ │
│  │  10:00 AM Massage         James               Available  ○                     │ │
│  │  10:30 AM Manicure        Emma     Rachel    No Show    ⚠                     │ │
│  │  11:00 AM Yoga Class      All      14/20     Filling Up  ◐                    │ │
│  │  11:30 AM Pedicure        Sophie            Waiting List  ⏳                    │ │
│  │                                         │  │  [Room Assignment Tool]             │ │
│  │  [Quick Add Appointment]              │  │  [Staff Schedule Editor]            │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  💆 SERVICE PERFORMANCE                               🛍️ RETAIL SALES                │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Top Services This Week          │  │  Daily Retail Performance             │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Swedish Massage   34     │  │  │  │ Skincare      $1,247   ▲ 18%    │  │ │
│  │  │ Deep Tissue       28     │  │  │  │ Supplements   $847     ▲ 12%    │  │ │
│  │  │ Hot Stone         22     │  │  │  │ Aromatherapy  $623     ▼ 5%     │  │ │
│  │  │ Facials           19     │  │  │  │ Wellness      $445     ▲ 22%    │  │ │
│  │  │ Manicures/Pedi    31     │  │  │  └──────────────────────────────────┘  │ │
│  │  └──────────────────────────┘  │  │                                         │ │
│  │  Avg Service Rating: 4.8/5     │  │  Attach Rate: 34%                       │ │
│  │  Rebooking Rate: 67%           │  │  (clients purchasing products)          │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  🧘 CLASS SCHEDULE                                  🎯 MEMBERSHIP METRICS           │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Today's Classes                 │  │  Member Overview                        │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ 6:00 AM  Vinyasa   18/20 │  │  │  │ Total Members: 847              │  │ │
│  │  │ 8:00 AM  Hatha    12/15 │  │  │  │ New This Month: 67               │  │ │
│  │  │ 5:30 PM  Power    16/20 │  │  │  │ Churned: 23                      │  │ │
│  │  │ 7:00 PM  Restorative 14/15│ │  │  │ Net Growth: +44                  │  │ │
│  │  └──────────────────────────┘  │  │  └──────────────────────────────────┘  │ │
│  │                                 │  │                                         │ │
│  │  Popular Instructors:           │  │  Membership Tiers:                     │ │
│  │  • Jessica (avg 18/class)      │  │  Unlimited: 234 members                │ │
│  │  • Mike (avg 16/class)         │  │  10-Class: 312 members                 │ │
│  │  • Anna (avg 15/class)         │  │  Monthly: 301 members                  │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  💳 MEMBERSHIP USAGE                                📣 MARKETING CAMPAIGNS          │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Class Pack Usage                │  │  Active Promotions                     │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ 10-Pack Remaining        │  │  │  │ Spring Refresh Sale             │  │ │
│  │  │ ████████░░ 67% used      │  │  │  │ 20% off massages, ends Apr 30   │  │ │
│  │  │ Expiring Soon: 23 packs  │  │  │  │                                 │  │ │
│  │  └──────────────────────────┘  │  │  │ Email Campaign:                   │  │ │
│  │                                 │  │  │ Sent: 2,847  Opened: 31.2%       │  │ │
│  │  Auto-Renewals This Week: 89   │  │  │ Clicked: 8.4%  Converted: 2.1%    │  │ │
│  │  Failed Payments: 12           │  │  │                                 │  │ │
│  │  Upgrade Opportunities: 34     │  │  │ Social Media:                     │  │ │
│  └──────────────────────────────────┘  │  │ Instagram: 12.4K followers        │  │ │
│                                         │  │ Engagement: 5.7%                  │  │ │
│                                         │  └──────────────────────────────────┘  │ │
│                                                                                     │
│  ⭐ CLIENT REVIEWS                                  📦 INVENTORY ALERTS             │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Overall Rating: 4.8/5 ⭐⭐⭐⭐⭐  │  │  Low Stock Items                        │ │
│  │  Service Quality 4.9            │  │  ⚠️ Massage Oil (Lavender) - 3 left   │ │
│  │  Cleanliness 4.9                │  │  ⚠️ Face Cream (Premium) - 5 left     │ │
│  │  Atmosphere 4.7                 │  │  ⚠️ Yoga Mats - 8 left                │ │
│  │  Value 4.6                      │  │  ✅ Essential Oils - 47 in stock      │ │
│  │                                 │  │  ✅ Candles - 34 in stock             │ │
│  │  Recent Review:                 │  │                                         │ │
│  │  "Best massage I've ever..."    │  │  Orders to Place:                      │ │
│  │  - Amanda, 5★ (yesterday)       │  │  • Skincare restock ($2,340)           │ │
│  │                                 │  │  • Supplement reorder ($1,890)         │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  🎁 UPCOMING PACKAGES                               ⚠️ ACTION REQUIRED              │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Gift Packages Booked            │  │  Tasks & Reminders                     │ │
│  │  Birthday Package (Sat 2pm)     │  │  ☑ Confirm VIP arrivals (done)         │ │
│  │  Bridal Party (Sun 10am)        │  │  ☐ Review staff schedules (due today)  │ │
│  │  Corporate Event (Fri 3pm)      │  │  ☐ Order low inventory items            │ │
│  │  Mother's Day Special (May 12)  │  │  ☐ Follow up no-shows (5 clients)      │ │
│  │                                 │  │  ☐ Update service menu prices           │ │
│  │  Package Revenue Projection:    │  │  ☐ Plan summer promotions               │ │
│  │  $12,450 this month             │  │  ☐ Schedule equipment maintenance       │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Design Category: Natural Warmth

**Primary Color:** Serene Green `#84A98C`
**Accent Colors:** Warm Sand `#D4B499`, Soft Blush `#E8D5D5`, Earth Brown `#6B5B4F`

**Visual Characteristics:**
- Organic, nature-inspired color palette
- Soft, rounded corners and gentle shadows
- Natural texture backgrounds (linen, wood grain subtle overlays)
- Flowing, curved progress indicators
- Botanical accent illustrations
- Calming animations with slow transitions
- Ample white space for breathing room

**Component Styling:**
- Cards: Warm off-white backgrounds with soft shadows
- Metrics: Gentle numerals with organic-shaped progress rings
- Charts: Smooth curves with gradient fills in earth tones
- Buttons: Rounded pill shapes with subtle hover effects
- Icons: Line-style icons with natural motifs (leaves, water drops)
- Typography: Clean sans-serif with friendly letter spacing

## Component Hierarchy

```
WellnessDashboard (root)
├── TodaysOverview
│   ├── AppointmentsCount (today's total, trend, breakdown)
│   ├── StaffOnDuty (active, on break, available)
│   └── RevenueToday (current, vs average, trend)
├── AppointmentSchedule
│   ├── TimelineView (vertical timeline of day)
│   ├── AppointmentItem (time, service, staff, client, status)
│   ├── StatusIndicator (in session, checked in, no show, available)
│   ├── RoomAssignmentTool (drag-and-drop room allocation)
│   └── QuickAddAppointment (floating action button)
├── StaffAvailability
│   ├── StaffScheduleGrid (staff vs time slots)
│   ├── AvailabilityBadge (available, busy, on break, off)
│   ├── StaffScheduleEditor (weekly view editor)
│   └── SubstitutionManager (cover shift requests)
├── ServicePerformance
│   ├── TopServicesList (ranked by bookings this week)
│   ├── ServiceCard (name, count, revenue, rating)
│   ├── AverageRatingMetric (overall service quality)
│   ├── RebookingRateMetric (client retention percentage)
│   └── ServiceTrendChart (popularity over time)
├── RetailSales
│   ├── DailyRetailPerformance (category breakdown)
│   ├── CategorySalesCard (name, amount, trend percentage)
│   ├── AttachRateMetric (percentage buying retail)
│   ├── TopProductsList (best sellers)
│   └── RetailVsServiceRatio (revenue split chart)
├── ClassSchedule
│   ├── TodaysClasses (list with capacity tracking)
│   ├── ClassCard (time, type, enrolled/capacity, instructor)
│   ├── CapacityIndicator (empty, filling, full, waitlist)
│   ├── PopularInstructorsList (average attendance ranking)
│   └── ClassBookingInterface (client enrollment)
├── MembershipMetrics
│   ├── MemberOverview (total, new, churned, net growth)
│   ├── MembershipTierBreakdown (unlimited, class pack, monthly)
│   ├── MemberGrowthChart (6-month trend)
│   └── ChurnAnalysis (reasons, rate, prevention)
├── MembershipUsage
│   ├── ClassPackUsage (remaining sessions visualization)
│   ├── ExpiringPacksAlert (count expiring soon)
│   ├── AutoRenewalsTracker (this week's renewals)
│   ├── FailedPaymentsAlert (payment issues count)
│   └── UpgradeOpportunities (members ready for tier upgrade)
├── MarketingCampaigns
│   ├── ActivePromotionsList (current offers)
│   ├── PromotionCard (title, description, end date, performance)
│   ├── EmailCampaignStats (sent, opened, clicked, converted)
│   ├── SocialMediaMetrics (followers, engagement, reach)
│   └── CampaignROICalculator (revenue generated vs spend)
├── ClientReviews
│   ├── OverallRating (star display with score)
│   ├── CategoryRatings (service, cleanliness, atmosphere, value)
│   ├── RecentReviewsList (review cards with responses)
│   ├── ReviewResponseTool (owner reply interface)
│   └── ReviewTrendChart (rating trajectory over time)
├── InventoryAlerts
│   ├── LowStockList (items below threshold)
│   ├── StockLevelBadge (critical, low, adequate, well-stocked)
│   ├── ReorderSuggestions (suggested order list)
│   ├── InventoryValueTotal (retail + supplies value)
│   └── SupplierQuickOrder (one-click reorder)
├── UpcomingPackages
│   ├── GroupBookingsList (party packages, events)
│   ├── PackageCard (type, date, time, guests, revenue)
│   ├── PackagePreparationChecklist (setup requirements)
│   └── PackageRevenueProjection (monthly forecast)
└── ActionRequired
    ├── TaskList (prioritized daily tasks)
    ├── VIPArrivalConfirmations (special client alerts)
    ├── StaffScheduleReview (approval needed)
    ├── NoShowFollowUps (client outreach list)
    ├── InventoryOrders (pending purchase orders)
    └── MaintenanceReminders (equipment service due)
```

## Theme Presets

### Theme 1: Serene Garden (Default)
```css
.primary: #84A98C;        /* Serene Green */
.secondary: #D4B499;      /* Warm Sand */
.accent: #E8D5D5;         /* Soft Blush */
.background: #F8F9F5;     /* Mist White */
.success: #84A98C;
.warning: #D4A574;        /* Warm Amber */
.danger: #C97C7C;         /* Muted Red */
.text-primary: #2D3436;
.text-secondary: #636E72;
.card-bg: rgba(255, 255, 255, 0.95);
.border-radius: 16px;
.shadow: 0 4px 24px rgba(132, 169, 140, 0.12);
```

### Theme 2: Lavender Dreams
```css
.primary: #B8A8D6;        /* Lavender }
.secondary: #D4B499;      /* Sand */
.accent: #E8D5E8;         /* Lilac */
.background: #F9F7FB;     /* Lavender Tint */
.success: #84A98C;
.warning: #D4A574;
.danger: #C97C7C;
.text-primary: #2D3436;
.text-secondary: #636E72;
.card-bg: rgba(249, 247, 251, 0.95);
.border-radius: 16px;
.shadow: 0 4px 24px rgba(184, 168, 214, 0.12);
```

### Theme 3: Ocean Breeze
```css
.primary: #7FB3C9;        /* Seafoam }
.secondary: #D4B499;      /* Beach Sand */
.accent: #B8D8D8;         /* Aqua Mist */
.background: #F5FBFC;     /* Ocean Tint */
.success: #84A98C;
.warning: #D4A574;
.danger: #C97C7C;
.text-primary: #2D3436;
.text-secondary: #636E72;
.card-bg: rgba(245, 251, 252, 0.95);
.border-radius: 16px;
.shadow: 0 4px 24px rgba(127, 179, 201, 0.12);
```

### Theme 4: Sunset Terrace
```css
.primary: #D4A574;        /* Golden Sand }
.secondary: #E8B4B8;      /* Rose Gold */
.accent: #F4D35E;         /* Sunset Yellow */
.background: #FFFBF7;     /* Warm Glow */
.success: #84A98C;
.warning: #D4A574;
.danger: #C97C7C;
.text-primary: #2D3436;
.text-secondary: #636E72;
.card-bg: rgba(255, 251, 247, 0.95);
.border-radius: 16px;
.shadow: 0 4px 24px rgba(212, 165, 116, 0.12);
```

### Theme 5: Forest Retreat
```css
.primary: #5A7C5E;        /* Forest Green }
.secondary: #8B7355;      /* Wood Brown */
.accent: #A8C6A0;         /* Sage */
.background: #F5F7F5;     /* Forest Mist */
.success: #84A98C;
.warning: #D4A574;
.danger: #C97C7C;
.text-primary: #2D3436;
.text-secondary: #636E72;
.card-bg: rgba(245, 247, 245, 0.95);
.border-radius: 16px;
.shadow: 0 4px 24px rgba(90, 124, 94, 0.12);
```

## Settings Expansion

### Base Settings (Universal)
- Account Management
- Team Members & Permissions
- Security & Authentication
- Notifications & Alerts
- Billing & Subscription
- API Access

### Wellness-Specific Settings

#### 1. Service Menu Management
- **Service Categories**
  - Massage therapy (Swedish, Deep Tissue, Hot Stone, etc.)
  - Skincare (Facials, Peels, Microdermabrasion)
  - Nail services (Manicures, Pedicures, Gel)
  - Body treatments (Wraps, Scrubs, Hydrotherapy)
  - Wellness classes (Yoga, Pilates, Meditation)
  - Hair services (Cut, Color, Styling)
- **Service Configuration**
  - Duration options (30, 45, 60, 90, 120 minutes)
  - Pricing tiers (by therapist level, time of day)
  - Add-on services (aromatherapy, hot stones, etc.)
  - Service descriptions and benefits
  - Before/after care instructions
- **Therapist Assignments**
  - Service-specific certifications
  - Therapist specialties and preferences
  - Level-based pricing (junior, senior, master)
  - Commission rate configuration

#### 2. Appointment Booking
- **Booking Rules**
  - Advance booking window (how far in advance)
  - Minimum notice period (same day, 2 hours, etc.)
  - Buffer time between appointments
  - Maximum appointments per day per client
  - No-show policy configuration
- **Online Booking**
  - Website widget customization
  - Real-time availability sync
  - Deposit requirements for first-time clients
  - Online cancellation policy
  - Automated confirmation emails/SMS
- **Membership Booking**
  - Priority booking windows for members
  - Recurring appointment scheduling
  - Package redemption tracking
  - Auto-rebooking suggestions

#### 3. Staff Management
- **Staff Profiles**
  - License and certification tracking
  - Specialty tags and service permissions
  - Commission structures
  - Availability patterns
  - Vacation/schedule preferences
- **Schedule Management**
  - Weekly schedule templates
  - Shift swap request system
  - Break time automation
  - Room assignment rules
  - Maximum back-to-back appointments
- **Performance Tracking**
  - Service count metrics
  - Client retention rates
  - Average ticket value
  - Tip tracking and reporting
  - Client review scores

#### 4. Membership Programs
- **Membership Tiers**
  - Unlimited monthly plans
  - Class pack options (5, 10, 20 classes)
  - À la carte membership discounts
  - Corporate wellness programs
  - Student/senior discounts
- **Billing Configuration**
  - Auto-renewal settings
  - Payment retry logic
  - Grace period configuration
  - Cancellation policies
  - Freeze/suspend options
- **Member Benefits**
  - Discount percentages by tier
  - Priority booking windows
  - Guest pass allowances
  - Retail product discounts
  - Exclusive event invitations

#### 5. Retail Inventory
- **Product Catalog**
  - Skincare lines (brands, product types)
  - Supplements and vitamins
  - Aromatherapy products
  - Wellness accessories (mats, props, candles)
  - Gift cards and packages
- **Inventory Tracking**
  - Stock level thresholds
  - Auto-reorder points
  - Supplier management
  - Cost vs. retail pricing
  - Expiration date tracking
- **Point of Sale**
  - Register configuration
  - Tax settings
  - Return/exchange policies
  - Employee discount rules
  - Bundle deal pricing

#### 6. Room & Facility Management
- **Room Configuration**
  - Room names and types (massage, facial, nail bar)
  - Equipment inventory per room
  - Cleaning turnaround times
  - Ambient settings (music, lighting preferences)
  - Accessibility features
- **Facility Schedule**
  - Operating hours by day
  - Holiday closures
  - Deep cleaning blocks
  - Maintenance windows
  - Private event bookings
- **Amenity Management**
  - Locker assignments
  - Sauna/steam room schedule
  - Lounge area capacity
  - Refreshment offerings
  - Retail showroom layout

#### 7. Class Management
- **Class Types**
  - Yoga styles (Vinyasa, Hatha, Power, Restorative)
  - Fitness classes (Pilates, Barre, HIIT)
  - Meditation sessions
  - Workshop series
  - Teacher training programs
- **Schedule Configuration**
  - Class duration defaults
  - Capacity limits by room
  - Instructor assignments
  - Recurring class patterns
  - Substitute teacher protocols
- **Enrollment Settings**
  - Early booking windows
  - Waitlist automation
  - Late cancellation fees
  - Drop-in vs. package pricing
  - Auto-enroll recurring students

#### 8. Marketing Automation
- **Email Campaigns**
  - Welcome series for new clients
  - Re-engagement campaigns (lapsed clients)
  - Birthday/anniversary automations
  - Seasonal promotion announcements
  - Newsletter templates
- **SMS Notifications**
  - Appointment reminders (24hr, 2hr)
  - Last-minute availability alerts
  - Flash sale announcements
  - Payment due reminders
- **Loyalty Programs**
  - Points earning rules
  - Redemption rewards catalog
  - Referral bonus structure
  - VIP tier benefits
  - Challenge/goal tracking

## API Endpoint Mappings

### Existing APIs (Can be reused)
```
GET    /api/appointments                  - List appointments
POST   /api/appointments                  - Create appointment
GET    /api/appointments/:id              - Get appointment details
PUT    /api/appointments/:id              - Update appointment
DELETE /api/appointments/:id              - Cancel appointment
GET    /api/services                      - List services
POST   /api/services                      - Create service
GET    /api/staff                         - List staff
GET    /api/memberships                   - List memberships
GET    /api/analytics/overview            - Dashboard analytics
```

### New APIs Required for Wellness Industry

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| **Service Management APIs** |
| GET | `/api/services/categories` | Get service categories | P0 |
| POST | `/api/services/categories` | Create service category | P0 |
| PUT | `/api/services/:id/add-ons` | Configure add-on services | P0 |
| GET | `/api/services/availability` | Get service availability by time slot | P0 |
| PUT | `/api/services/:id/pricing-tiers` | Update tiered pricing | P0 |
| GET | `/api/services/popular` | Get most booked services | P0 |
| **Appointment Management APIs** |
| GET | `/api/appointments/today` | Get today's appointments | P0 |
| GET | `/api/appointments/upcoming` | Get upcoming appointments | P0 |
| POST | `/api/appointments/:id/check-in` | Check in client | P0 |
| POST | `/api/appointments/:id/no-show` | Mark as no-show | P0 |
| POST | `/api/appointments/:id/rebook` | Create rebooking | P1 |
| GET | `/api/appointments/waitlist` | Get waitlist for time slot | P1 |
| POST | `/api/appointments/:id/assign-room` | Assign room to appointment | P0 |
| GET | `/api/appointments/stats` | Get appointment statistics | P0 |
| **Staff Management APIs** |
| GET | `/api/staff/schedule` | Get staff weekly schedule | P0 |
| PUT | `/api/staff/:id/schedule` | Update staff availability | P0 |
| GET | `/api/staff/:id/availability` | Check staff availability | P0 |
| GET | `/api/staff/:id/performance` | Get staff performance metrics | P0 |
| GET | `/api/staff/:id/commissions` | Get commission breakdown | P0 |
| PUT | `/api/staff/:id/services` | Update service permissions | P0 |
| GET | `/api/staff/substitutions` | Get substitution requests | P1 |
| **Membership Management APIs** |
| GET | `/api/memberships/tiers` | Get membership tiers | P0 |
| POST | `/api/memberships/tiers` | Create membership tier | P0 |
| GET | `/api/memberships/:id/usage` | Get membership usage stats | P0 |
| PUT | `/api/memberships/:id/freeze` | Freeze membership | P1 |
| PUT | `/api/memberships/:id/unfreeze` | Unfreeze membership | P1 |
| GET | `/api/memberships/expiring` | Get memberships expiring soon | P1 |
| GET | `/api/memberships/auto-renewals` | Get auto-renewal list | P0 |
| GET | `/api/memberships/churn-analysis` | Analyze churn reasons | P1 |
| **Class Management APIs** |
| GET | `/api/classes` | List all classes | P0 |
| POST | `/api/classes` | Create class session | P0 |
| GET | `/api/classes/:id/enrollments` | Get class enrollments | P0 |
| POST | `/api/classes/:id/enroll` | Enroll student in class | P0 |
| DELETE | `/api/classes/:id/enroll/:studentId` | Cancel enrollment | P0 |
| GET | `/api/classes/waitlist` | Get class waitlist | P1 |
| POST | `/api/classes/:id/waitlist-add` | Add to class waitlist | P1 |
| GET | `/api/classes/instructors` | Get instructor performance | P0 |
| GET | `/api/classes/attendance-trends` | Get attendance analytics | P1 |
| **Retail & Inventory APIs** |
| GET | `/api/retail/products` | List retail products | P0 |
| POST | `/api/retail/products` | Add new product | P0 |
| PUT | `/api/retail/products/:id` | Update product | P0 |
| DELETE | `/api/retail/products/:id` | Discontinue product | P1 |
| GET | `/api/retail/inventory` | Get inventory levels | P0 |
| PUT | `/api/retail/inventory/:id` | Update stock count | P0 |
| GET | `/api/retail/low-stock-alerts` | Get low stock items | P0 |
| POST | `/api/retail/purchase-orders` | Create purchase order | P1 |
| GET | `/api/retail/sales-trends` | Get retail sales analytics | P0 |
| GET | `/api/retail/attach-rate` | Calculate service-to-retail attach rate | P0 |
| **Package & Group Booking APIs** |
| GET | `/api/packages` | List service packages | P0 |
| POST | `/api/packages` | Create package | P0 |
| GET | `/api/packages/:id/bookings` | Get package bookings | P0 |
| POST | `/api/packages/:id/book` | Book package appointment | P0 |
| GET | `/api/groups/events` | List group events/parties | P0 |
| POST | `/api/groups/events` | Create group event | P0 |
| GET | `/api/groups/events/:id/guests` | Get guest list | P0 |
| **Client Management APIs** |
| GET | `/api/clients/:id/history` | Get client booking history | P0 |
| PUT | `/api/clients/:id/preferences` | Update client preferences | P0 |
| GET | `/api/clients/:id/notes` | Get client notes | P0 |
| PUT | `/api/clients/:id/notes` | Add client note | P0 |
| GET | `/api/clients/lapsed` | Get lapsed client list | P1 |
| POST | `/api/clients/:id/reactivate` | Send reactivation offer | P1 |
| GET | `/api/clients/birthdays` | Get upcoming birthdays | P1 |
| **Review Management APIs** |
| GET | `/api/reviews/analytics` | Get review analytics | P0 |
| POST | `/api/reviews/:id/respond` | Respond to review | P1 |
| GET | `/api/reviews/trends` | Get rating trends over time | P0 |
| POST | `/api/reviews/request` | Send review request | P0 |
| **Marketing APIs** |
| GET | `/api/marketing/campaigns` | List marketing campaigns | P0 |
| POST | `/api/marketing/campaigns` | Create campaign | P0 |
| GET | `/api/marketing/campaigns/:id/performance` | Get campaign metrics | P0 |
| GET | `/api/marketing/email-stats` | Get email campaign performance | P0 |
| GET | `/api/marketing/sms-stats` | Get SMS campaign performance | P1 |
| POST | `/api/marketing/promotions` | Create promotional offer | P0 |
| GET | `/api/marketing/loyalty-points` | Get client loyalty points | P1 |
| POST | `/api/marketing/referrals` | Track referral reward | P1 |

**Total New APIs for Wellness: 20 endpoints**

---

**Implementation Notes:**
- Integrate with payment processors for membership billing
- Support online booking widget embeddable on external websites
- Implement automated SMS/email reminder system
- Build real-time availability synchronization
- Create class waitlist automation with instant notifications
- Implement room assignment optimization algorithm
- Support retail POS integration with inventory tracking
- Build staff commission calculation engine
- Create membership freeze/unfreeze workflows
- Implement review request automation post-service
