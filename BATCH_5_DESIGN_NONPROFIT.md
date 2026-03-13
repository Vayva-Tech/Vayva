# Batch 5 Design Specification: Nonprofit & Foundation Platform

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  VAYVA NONPROFIT - Signature Clean Design                                           │
│  [Dashboard] [Donations] [Campaigns] [Donors] [Programs] [Grants] [Finance] [Settings]│
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  📊 IMPACT OVERVIEW                                     🔔 8 Notifications          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  Total Raised YTD: $2.4M    │  Active Donors: 1,847      │  Campaigns Live  │   │
│  │  ▲ 23% vs last year         │  ▲ 312 new this month     │  12 active       │   │
│  │                             │                            │  ▲ 3 launching   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  💝 DONATION TRENDS                                 👥 DONOR SEGMENTS              │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Monthly Donation Revenue        │  │  Donor Type Distribution              │ │
│  │  $280K ┤        ╭──╮              │  │  ┌─────────────────────────────────┐  │ │
│  │  $220K ┤     ╭──╯  ╰──╮           │  │  │ Individuals    68% ██████████░░│  │ │
│  │  $160K ┤  ╭──╯        ╰──╮        │  │  │ Foundations    18% ███░░░░░░░░░│  │ │
│  │  $100K ┤──╯                ╰──╮   │  │  │ Corporates     10% ██░░░░░░░░░░│  │ │
│  │         Jan  Feb  Mar  Apr  May │  │  │ Grants          4% ░░░░░░░░░░░░░│  │ │
│  │  Avg Gift: $1,298              │  │  └─────────────────────────────────┘  │ │
│  │  Recurring: 42% of revenue     │  │                                         │ │
│  │  Major Gifts (>10K): 87 donors │  │  Donor Retention Rate: 76%            │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  🎯 ACTIVE CAMPAIGNS                                📈 CAMPAIGN PERFORMANCE         │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  Campaign Name              Goal      Raised     %      Days Left   Status │   │
│  │  Annual Fund 2026          $500K      $387K     77%     45 days    On Track│   │
│  │  Building Renovation       $250K      $142K     57%     89 days    Needs Push│   │
│  │  Scholarship Program       $100K      $94K      94%     12 days    Almost There│   │
│  │  Emergency Relief          $75K       $71K      95%     5 days     Urgent   │   │
│  │  Youth Development         $150K      $68K      45%     67 days    Early    │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  📋 GRANT PIPELINE                                  🤝 CORPORATE PARTNERSHIPS       │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Grant Applications            │  │  Partner Engagement                      │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Submitted: 24           │  │  │  │ Platinum Partners: 3             │  │ │
│  │  │ In Progress: 8          │  │  │  │ Gold Partners: 7                 │  │ │
│  │  │ Planning: 12            │  │  │  │ Silver Partners: 15              │  │ │
│  │  │ Awarded: $890K          │  │  │  │                                 │  │ │
│  │  │ Pending: $340K          │  │  │  │ Total Partnership Value:        │  │ │
│  │  └──────────────────────────┘  │  │  │ $1.2M annually                  │  │ │
│  │                                │  │  │                                 │  │ │
│  │  Upcoming Deadlines:          │  │  │ Upcoming Renewals:               │  │ │
│  │  • Gates Foundation - Apr 30  │  │  │ • TechCorp - May 15             │  │ │
│  │  • Ford Foundation - May 15   │  │  │ • FinanceInc - Jun 1            │  │ │
│  │  • MacArthur - Jun 1          │  │  │ • RetailCo - Jun 30             │  │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  📊 PROGRAM IMPACT                                  💰 EXPENSE TRACKING             │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Programs Funded               │  │  Expense Allocation                      │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Education: 45%          │  │  │  │ Program Services    78%         │  │ │
│  │  │ Healthcare: 28%         │  │  │  │ Management          12%         │  │ │
│  │  │ Community: 18%          │  │  │  │ Fundraising         10%         │  │ │
│  │  │ Research: 9%            │  │  │  └──────────────────────────────────┘  │ │
│  │  └──────────────────────────┘  │  │                                         │ │
│  │  People Served: 12,847        │  │  Program Efficiency Ratio: 78%          │ │
│  │  Communities: 34              │  │  (Industry benchmark: 75%)              │ │
│  │  Volunteer Hours: 8,234       │  │  Administrative Cost: 12%               │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  📧 ENGAGEMENT METRICS                              🏆 MAJOR DONORS                 │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Email Campaign Performance    │  │  Top Donors This Quarter               │ │
│  │  Open Rate: 28.4%              │  │  ┌──────────────────────────────────┐  │ │
│  │  Click Rate: 4.2%              │  │  │ 1. Johnson Family    $125,000   │  │ │
│  │  Unsubscribe: 0.3%             │  │  │ 2. Smith Foundation   $85,000   │  │ │
│  │                                 │  │  │ 3. Corporate Give     $67,500   │  │ │
│  │  Social Media:                  │  │  │ 4. Anonymous        $50,000   │  │ │
│  │  Followers: 45.2K (+12%)       │  │  │ 5. Williams Trust     $45,000   │  │ │
│  │  Engagement: 6.8%              │  │  └──────────────────────────────────┘  │ │
│  │  Shares: 1,234                 │  │                                         │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  📅 UPCOMING EVENTS                                 ⚠️ ACTION REQUIRED              │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Spring Gala - May 20          │  │  Tasks & Reminders                       │ │
│  │  Tickets Sold: 187/250         │  │  ☐ Process matching gifts (12 pending)  │ │
│  │  Revenue: $47,250              │  │  ☑ Send thank you letters (done)        │ │
│  │  Sponsors: 8 confirmed         │  │  ☐ Review grant reports (due Apr 25)    │ │
│  │                                 │  │  ☐ Call major donors (8 to contact)     │ │
│  │  Fundraiser Walk - Jun 15      │  │  ☐ Update website impact stories        │ │
│  │  Registrations: 342            │  │  ☐ Prepare board report (May 1)         │ │
│  │  Goal: 500 participants        │  │  ☐ Verify expense receipts (15 pending) │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Design Category: Signature Clean

**Primary Color:** Trust Green `#10B981`
**Accent Colors:** Hope Blue `#3B82F6`, Impact Purple `#8B5CF6`, Warm Orange `#F59E0B`

**Visual Characteristics:**
- Clean white backgrounds with subtle shadows
- Professional typography emphasizing readability
- Data visualizations with clear labels and legends
- Progress bars and thermometers for campaign goals
- Impact metrics with human-centered imagery
- Transparency-focused financial breakdowns
- Donor recognition displays

**Component Styling:**
- Cards: White backgrounds with subtle green accent borders
- Metrics: Large, bold numerals with clear dollar amounts
- Charts: Bar and line charts with gradient fills
- Progress Indicators: Thermometer-style campaign trackers
- Tables: Clean rows with donor/campaign information
- Impact Stories: Card layouts with photos and testimonials

## Component Hierarchy

```
NonprofitDashboard (root)
├── ImpactOverview
│   ├── TotalRaisedYTD (amount, YoY comparison, trend)
│   ├── ActiveDonors (count, new donors, retention rate)
│   └── CampaignsLive (active count, launching soon)
├── DonationTrends
│   ├── MonthlyRevenueChart (line/area chart)
│   ├── AverageGiftMetric (current amount, trend)
│   ├── RecurringPercentage (pie chart or metric)
│   └── MajorDonorsList (donors giving >$10K)
├── DonorSegments
│   ├── DonorTypeDistribution (horizontal bar chart)
│   ├── DonorRetentionRate (metric with trend)
│   ├── FirstTimeDonors (count this period)
│   └── LapsedDonors (reactivation opportunities)
├── ActiveCampaigns
│   ├── CampaignList (table with progress)
│   ├── CampaignItem (name, goal, raised, percentage, days left)
│   ├── ProgressBar (visual funding progress)
│   ├── StatusBadge (on track, needs push, almost there, urgent)
│   └── CampaignDetailsModal (full campaign view)
├── CampaignPerformance
│   ├── TopPerformersList (by percentage raised)
│   ├── RevenueBySource (individual, corporate, foundation)
│   ├── ConversionMetrics (views to donations)
│   └── SocialSharesTracker (viral coefficient)
├── GrantPipeline
│   ├── ApplicationStatusSummary (submitted, in progress, planning)
│   ├── AwardedAmount (total won)
│   ├── PendingAmount (awaiting decisions)
│   ├── UpcomingDeadlines (list with dates)
│   └── SuccessRateMetric (awarded vs submitted)
├── CorporatePartnerships
│   ├── PartnerTierSummary (platinum, gold, silver counts)
│   ├── TotalPartnershipValue (annual recurring value)
│   ├── UpcomingRenewals (partners due for renewal)
│   └── PartnershipBenefits Tracker (fulfillment status)
├── ProgramImpact
│   ├── ProgramsFundedBreakdown (percentage by program area)
│   ├── PeopleServedMetric (total beneficiaries)
│   ├── CommunitiesCount (geographic reach)
│   ├── VolunteerHours (total contributed time)
│   └── ImpactStories (featured success stories)
├── ExpenseTracking
│   ├── ExpenseAllocationChart (pie chart: programs vs admin vs fundraising)
│   ├── ProgramEfficiencyRatio (percentage vs benchmark)
│   ├── AdministrativeCostPercentage (transparency metric)
│   └── BudgetVarianceReport (planned vs actual)
├── EngagementMetrics
│   ├── EmailPerformance (open rate, click rate, unsubscribe)
│   ├── SocialMediaStats (followers, engagement, shares)
│   ├── WebsiteTraffic (visitors, donation page views)
│   └── EventAttendance (average turnout)
├── MajorDonors
│   ├── TopDonorsList (quarterly or annual ranking)
│   ├── DonorProfileCard (giving history, interests, contacts)
│   ├── GivingCapacity (estimated potential)
│   └── StewardshipActivities (engagement touchpoints)
├── UpcomingEvents
│   ├── EventCard (name, date, tickets sold, revenue)
│   ├── TicketSalesProgress (goal tracking)
│   ├── SponsorList (confirmed partners)
│   └── EventRevenueProjection (forecasted total)
└── ActionRequired
    ├── TaskList (pending actions with priority)
    ├── MatchingGiftsPending (count requiring processing)
    ├── ThankYouLetters (acknowledgment queue)
    ├── GrantReportsDue (upcoming deadlines)
    ├── MajorDonorCalls (stewardship reminders)
    └── BoardReportPreparation (scheduled deliverables)
```

## Theme Presets

### Theme 1: Growth Green (Default)
```css
.primary: #10B981;        /* Emerald Green */
.secondary: #3B82F6;      /* Trust Blue */
.accent: #F59E0B;         /* Amber */
.background: #F0FDF4;     /* Green Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.98);
.border-radius: 12px;
.shadow: 0 4px 24px rgba(16, 185, 129, 0.15);
```

### Theme 2: Ocean Trust
```css
.primary: #3B82F6;        /* Blue }
.secondary: #06B6D4;      /* Cyan */
.accent: #8B5CF6;         /* Purple */
.background: #EFF6FF;     /* Blue Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(239, 246, 255, 0.98);
.border-radius: 12px;
.shadow: 0 4px 24px rgba(59, 130, 246, 0.15);
```

### Theme 3: Impact Purple
```css
.primary: #8B5CF6;        /* Violet }
.secondary: #EC4899;      /* Pink */
.accent: #F59E0B;         /* Golden */
.background: #F5F3FF;     /* Purple Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(245, 243, 255, 0.98);
.border-radius: 12px;
.shadow: 0 4px 24px rgba(139, 92, 246, 0.15);
```

### Theme 4: Warmth Orange
```css
.primary: #F59E0B;        /* Amber }
.secondary: #EF4444;      /* Red */
.accent: #10B981;         /* Emerald */
.background: #FFFBEB;     /* Amber Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 251, 235, 0.98);
.border-radius: 12px;
.shadow: 0 4px 24px rgba(245, 158, 11, 0.15);
```

### Theme 5: Compassion Rose
```css
.primary: #EC4899;        /* Pink }
.secondary: #F43F5E;      /* Rose */
.accent: #8B5CF6;         /* Violet */
.background: #FDF2F8;     /* Pink Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(253, 242, 248, 0.98);
.border-radius: 12px;
.shadow: 0 4px 24px rgba(236, 72, 153, 0.15);
```

## Settings Expansion

### Base Settings (Universal)
- Account Management
- Team Members & Permissions
- Security & Authentication
- Notifications & Alerts
- Billing & Subscription
- API Access

### Nonprofit-Specific Settings

#### 1. Donation Configuration
- **Payment Processing**
  - Stripe/PayPal integration setup
  - Credit card processing settings
  - ACH/bank transfer options
  - Cryptocurrency donation acceptance
  - Donor-advised fund (DAF) transfers
- **Donation Form Customization**
  - Suggested gift amounts
  - Custom amount minimums/maximums
  - Recurring gift options (monthly, quarterly, annual)
  - Tribute gift options (honorary/memorial)
  - Field customization (name, email, phone, etc.)
  - Multi-step vs. single-page forms
- **Tax Receipt Settings**
  - Automatic receipt generation
  - EIN/tax ID display
  - No-goods-or-services-provided language
  - Threshold settings for auto-receipts
  - Paperless receipt preferences

#### 2. Donor Management
- **Donor Profiles**
  - Contact information fields
  - Giving history tracking
  - Communication preferences
  - Interest areas/causes
  - Relationship mapping (family, business)
  - Donor notes and interactions log
- **Donor Segmentation**
  - Custom segment creation
  - Giving level categories (major, mid-level, annual)
  - Recency filters (first-time, lapsed, recurring)
  - Demographic segmentation
  - Geographic segmentation
- **Stewardship Tracking**
  - Touchpoint logging (calls, meetings, emails)
  - Thank you letter templates
  - Recognition society criteria
  - VIP event invitation lists

#### 3. Campaign Management
- **Campaign Setup**
  - Campaign goal amounts
  - Start/end dates
  - Campaign type (annual, capital, emergency)
  - Public/private visibility
  - Matching gift configuration
- **Page Customization**
  - Campaign story/description
  - Hero images and videos
  - Progress thermometer display
  - Donor wall of fame
  - Social sharing buttons
- **Team Fundraising**
  - Peer-to-peer campaign settings
  - Team captain permissions
  - Individual fundraising pages
  - Leaderboard display options

#### 4. Grant Management
- **Grant Calendar**
  - Application deadline tracking
  - Reporting deadline reminders
  - Site visit schedules
  - Board approval dates
- **Foundation Profiles**
  - Funder contact information
  - Giving history
  - Application guidelines
  - Program interests alignment
  - Decision timelines
- **Proposal Tracking**
  - LOI submission tracking
  - Full proposal status
  - Award amount recording
  - Rejection analysis
  - Resubmission planning

#### 5. Program Tracking
- **Program Definitions**
  - Program name and description
  - Target population served
  - Geographic service area
  - Program goals and objectives
  - Key performance indicators
- **Outcome Measurement**
  - Pre/post surveys
  - Success metrics definition
  - Data collection methods
  - Long-term follow-up tracking
- **Budget Allocation**
  - Program budget assignment
  - Expense tracking by program
  - Indirect cost allocation
  - Restricted fund tracking

#### 6. Event Management
- **Event Configuration**
  - Event type (gala, walk, auction, tournament)
  - Ticket pricing tiers
  - Table sales configuration
  - Sponsorship package levels
  - Silent auction item setup
- **Registration Settings**
  - Registration form fields
  - Payment plans (installments)
  - Early bird discounts
  - Group registration options
  - Volunteer sign-up slots
- **Check-in Tools**
  - QR code ticket scanning
  - Day-of registration
  - Name badge printing
  - Auction bidder paddle lookup

#### 7. Financial Compliance
- **Fund Accounting**
  - Unrestricted funds
  - Temporarily restricted funds
  - Permanently restricted funds (endowment)
  - Board-designated funds
- **990 Reporting**
  - Part VIII revenue categories
  - Part IX expense functional allocation
  - Part X balance sheet
  - Officer compensation reporting
- **Audit Preparation**
  - Document repository
  - Year-end close checklist
  - Auditor request tracker
  - Internal control documentation

#### 8. Board & Governance
- **Board Management**
  - Board member roster
  - Term expiration tracking
  - Committee assignments
  - Board giving participation
- **Meeting Management**
  - Meeting schedule calendar
  - Agenda builder
  - Minutes template
  - Board packet distribution
- **Policy Documentation**
  - Conflict of interest policy
  - Whistleblower policy
  - Document retention policy
  - Financial oversight policies

## API Endpoint Mappings

### Existing APIs (Can be reused)
```
GET    /api/donations                     - List all donations
POST   /api/donations                     - Create donation
GET    /api/donations/:id                 - Get donation details
GET    /api/donors                        - List donors
GET    /api/donors/:id                    - Get donor profile
GET    /api/campaigns                     - List campaigns
POST   /api/campaigns                     - Create campaign
GET    /api/campaigns/:id                 - Get campaign details
PUT    /api/campaigns/:id                 - Update campaign
GET    /api/events                        - List events
POST   /api/events                        - Create event
GET    /api/analytics/overview            - Dashboard analytics
```

### New APIs Required for Nonprofit Industry

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| **Donation Management APIs** |
| GET | `/api/donations/recurring` | Get recurring donations list | P0 |
| POST | `/api/donations/recurring` | Create recurring donation | P0 |
| PUT | `/api/donations/recurring/:id` | Update recurring donation | P0 |
| DELETE | `/api/donations/recurring/:id` | Cancel recurring donation | P0 |
| GET | `/api/donations/trends` | Get donation trend analytics | P0 |
| GET | `/api/donations/by-segment` | Get donations by donor segment | P0 |
| GET | `/api/donations/matching-gifts` | Get matching gift eligible donations | P1 |
| POST | `/api/donations/:id/process-matching` | Process matching gift request | P1 |
| **Donor Management APIs** |
| GET | `/api/donors/segments` | Get donor segments | P0 |
| POST | `/api/donors/segments` | Create donor segment | P0 |
| PUT | `/api/donors/segments/:id` | Update segment criteria | P1 |
| GET | `/api/donors/:id/giving-history` | Get donor complete giving history | P0 |
| PUT | `/api/donors/:id/notes` | Add donor interaction note | P0 |
| GET | `/api/donors/:id/relationships` | Get donor relationship map | P1 |
| GET | `/api/donors/lapsed` | Get lapsed donor list | P1 |
| POST | `/api/donors/:id/reactivate` | Reactivate lapsed donor | P1 |
| GET | `/api/donors/major-donors` | Get major donor list (>$10K) | P0 |
| GET | `/api/donors/retention-rate` | Calculate donor retention rate | P0 |
| **Campaign Management APIs** |
| GET | `/api/campaigns/active` | Get all active campaigns | P0 |
| GET | `/api/campaigns/:id/performance` | Get campaign performance metrics | P0 |
| GET | `/api/campaigns/:id/donors` | Get campaign donor list | P0 |
| POST | `/api/campaigns/:id/share` | Share campaign to social media | P1 |
| GET | `/api/campaigns/:id/leaderboard` | Get top fundraisers leaderboard | P1 |
| PUT | `/api/campaigns/:id/status` | Update campaign status | P0 |
| **Grant Management APIs** |
| GET | `/api/grants` | List all grants | P0 |
| POST | `/api/grants` | Create grant record | P0 |
| GET | `/api/grants/:id` | Get grant details | P0 |
| PUT | `/api/grants/:id` | Update grant information | P0 |
| DELETE | `/api/grants/:id` | Delete grant record | P1 |
| GET | `/api/grants/pipeline` | Get grant pipeline summary | P0 |
| GET | `/api/grants/deadlines` | Get upcoming grant deadlines | P0 |
| POST | `/api/grants/:id/status-update` | Update grant application status | P0 |
| GET | `/api/grants/funders` | List foundation funders | P1 |
| POST | `/api/grants/funders` | Add new funder profile | P1 |
| **Program Management APIs** |
| GET | `/api/programs` | List all programs | P0 |
| POST | `/api/programs` | Create program | P0 |
| GET | `/api/programs/:id` | Get program details | P0 |
| PUT | `/api/programs/:id` | Update program | P0 |
| GET | `/api/programs/:id/metrics` | Get program outcome metrics | P0 |
| POST | `/api/programs/:id/metrics` | Record program data point | P0 |
| GET | `/api/programs/impact-summary` | Get overall impact report | P0 |
| GET | `/api/programs/beneficiaries` | Get people served count | P0 |
| **Event Management APIs** |
| GET | `/api/events/:id/ticket-sales` | Get event ticket sales analytics | P0 |
| POST | `/api/events/:id/tickets` | Purchase event tickets | P0 |
| GET | `/api/events/:id/attendees` | Get attendee list | P0 |
| POST | `/api/events/:id/check-in` | Check in attendee at event | P0 |
| GET | `/api/events/:id/sponsors` | Get event sponsors | P0 |
| POST | `/api/events/:id/sponsors` | Add event sponsor | P0 |
| GET | `/api/events/:id/auction-items` | Get auction items list | P1 |
| POST | `/api/events/:id/auction-bids` | Place auction bid | P1 |
| **Partnership Management APIs** |
| GET | `/api/partnerships` | List corporate partnerships | P0 |
| POST | `/api/partnerships` | Create partnership | P0 |
| GET | `/api/partnerships/:id` | Get partnership details | P0 |
| PUT | `/api/partnerships/:id` | Update partnership | P0 |
| GET | `/api/partnerships/renewals` | Get upcoming renewals | P0 |
| GET | `/api/partnerships/tiers` | Get partner tier breakdown | P0 |
| **Engagement APIs** |
| GET | `/api/engagement/email-stats` | Get email campaign performance | P0 |
| GET | `/api/engagement/social-stats` | Get social media analytics | P0 |
| GET | `/api/engagement/website-traffic` | Get website donation traffic | P1 |
| POST | `/api/engagement/thank-you` | Send automated thank you email | P0 |
| GET | `/api/engagement/stewardship-tasks` | Get stewardship task list | P0 |
| **Financial APIs** |
| GET | `/api/finance/expense-allocation` | Get functional expense breakdown | P0 |
| GET | `/api/finance/program-efficiency` | Calculate program efficiency ratio | P0 |
| GET | `/api/finance/fund-balances` | Get fund balance report | P0 |
| GET | `/api/finance/restricted-funds` | Get restricted funds tracking | P0 |
| GET | `/api/finance/budget-variance` | Get budget vs actual report | P0 |
| **Reporting APIs** |
| GET | `/api/reports/donor-retention` | Generate donor retention report | P0 |
| GET | `/api/reports/campaign-roi` | Calculate campaign ROI | P1 |
| GET | `/api/reports/board-dashboard` | Get board dashboard metrics | P0 |
| GET | `/api/reports/990-data` | Export 990 report data | P0 |
| GET | `/api/reports/impact-story` | Generate impact story report | P1 |

**Total New APIs for Nonprofit: 22 endpoints**

---

**Implementation Notes:**
- Integrate with payment processors (Stripe, PayPal) for donation processing
- Support recurring donation management with automatic billing
- Implement donor-advised fund (DAF) transfer workflows
- Build peer-to-peer fundraising capabilities
- Create grant deadline reminder system
- Implement matching gift automation
- Support event ticketing and check-in functionality
- Build comprehensive donor CRM with relationship mapping
- Implement tax receipt generation and compliance
- Create board dashboard with key metrics
