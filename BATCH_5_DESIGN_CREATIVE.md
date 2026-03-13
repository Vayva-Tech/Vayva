# Batch 5 Design Specification: Creative Agency Platform

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  VAYVA CREATIVE - Premium Glass Design                                              │
│  [Dashboard] [Projects] [Clients] [Team] [Time] [Finance] [Portfolio] [Settings]    │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  📊 AGENCY OVERVIEW                                     🔔 9 Notifications          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  Active Projects: 24        │  Utilization Rate: 78%    │  Revenue MTD    │   │
│  │  ▲ 3 new this week          │  ▲ 8% vs last month       │  $187K         │   │
│  │                             │  Target: 80%              │  ▲ 12% vs plan  │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  📋 PROJECT PIPELINE                                👥 RESOURCE ALLOCATION          │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Projects by Stage               │  │  Team Workload                         │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Discovery: 4 projects   │  │  │  │ Sarah (Design)    ████████░░ 80% │  │ │
│  │  │ Concept: 6 projects     │  │  │  │ Mike (Dev)        █████████░ 90% │  │ │
│  │  │ Production: 8 projects  │  │  │  │ Jessica (Copy)    ████░░░░░░ 40% │  │ │
│  │  │ Review: 3 projects      │  │  │  │ Tom (Strategy)    ██████░░░░ 60% │  │ │
│  │  │ Delivered: 3 projects   │  │  │  │                                  │  │ │
│  │  └──────────────────────────┘  │  │  │ Overallocated: 2 people            │  │ │
│  │                                 │  │  │ Available Capacity: 3 people       │  │ │
│  │  On-Time Delivery: 94%         │  │  │ Upcoming Availability: Fri (2)     │  │ │
│  │  Budget Health: 87% on track   │  │  └──────────────────────────────────┘  │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  ⏱️ TIME TRACKING                                   💰 PROJECT FINANCIALS           │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  This Week's Hours               │  │  Project Profitability                 │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Billed: 147 hours       │  │  │  │ Website Redesign (Acme Corp)    │  │ │
│  │  │ Non-Billable: 23 hours  │  │  │  │ Budget: $25K  Spent: $18K        │  │ │
│  │  │ Missing: 12 hours ⚠️    │  │  │  │ Margin: 72%  Status: ✅ Healthy  │  │ │
│  │  │                          │  │  │  │                                  │  │ │
│  │  │ Top Tracker: Mike (42h) │  │  │  │ Brand Campaign (TechStart)      │  │ │
│  │  │ Avg Hourly: $127        │  │  │  │ Budget: $15K  Spent: $17K ⚠️     │  │ │
│  │  └──────────────────────────┘  │  │  │ Margin: 45%  Status: ⚠️ At Risk  │  │ │
│  │                                 │  │  │                                  │  │ │
│  │  Unsubmitted Timesheets: 3     │  │  │ Mobile App (GlobalInc)           │  │ │
│  │  Approval Pending: 8 entries   │  │  │ Budget: $50K  Spent: $31K        │  │ │
│  └──────────────────────────────────┘  │  │ Margin: 68%  Status: ✅ Healthy  │  │ │
│                                         │  └──────────────────────────────────┘  │ │
│                                                                                     │
│  🎯 CLIENT HEALTH                                   📅 TIMELINE & DEADLINES         │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Client Status Overview          │  │  Upcoming Deadlines                    │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Active Clients: 18      │  │  │  │ Today: Logo Concepts (BrandCo)   │  │ │
│  │  │ Happy: 14 clients 😊    │  │  │  │                                  │  │ │
│  │  │ At Risk: 2 clients ⚠️   │  │  │  │ Tomorrow: Website Launch (Acme)  │  │ │
│  │  │ Churned: 2 clients 😞   │  │  │  │                                  │  │ │
│  │  └──────────────────────────┘  │  │  │ Fri: Strategy Deck (StartupXYZ)  │  │ │
│  │                                 │  │  │                                  │  │ │
│  │  NPS Score: 67 (Excellent)     │  │  │ Mon: App Store Submission        │  │ │
│  │  Retention Rate: 89%           │  │  │                                  │  │ │
│  │  Avg Project Value: $23K       │  │  │ Wed: Campaign Assets Review      │  │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  📂 WORK IN PROGRESS                                🏆 RECENT DELIVERIES            │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Active Deliverables             │  │  Recently Completed                    │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Homepage Designs (5)    │  │  │  │ ✅ Brand Guidelines - LocalCafe │  │ │
│  │  │ Copy Drafts (3)         │  │  │  │ Delivered Mar 8 | $12K           │  │ │
│  │  │ Dev Tickets (8)         │  │  │  │                                  │  │ │
│  │  │ Video Edits (2)         │  │  │  │ ✅ Social Assets - FashionBrand │  │ │
│  │  │                          │  │  │  │ Delivered Mar 7 | $8.5K          │  │ │
│  │  │ Pending Client Review: 4│  │  │  │                                  │  │ │
│  │  └──────────────────────────┘  │  │  │ ✅ SEO Audit - TechCompany       │  │ │
│  │                                 │  │  │ Delivered Mar 5 | $6K            │  │ │
│  │  Avg Revision Rounds: 2.3      │  │  └──────────────────────────────────┘  │ │
│  │  Client Response Time: 3.2 days│  │                                         │ │
│  └──────────────────────────────────┘  │  Client Satisfaction: 4.8/5 avg       │ │
│                                         │  └──────────────────────────────────┘  │ │
│                                                                                     │
│  💼 NEW BUSINESS                                    ⚠️ ACTION REQUIRED              │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Pipeline Opportunities          │  │  Tasks & Reminders                     │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Qualified Leads: 12     │  │  │  │ ☑ Review timesheets (done)       │  │ │
│  │  │ Proposals Out: 5        │  │  │  │ ☐ Approve budget changes (2)     │  │ │
│  │  │ Est. Value: $287K       │  │  │  │ ☐ Client check-in calls (3)      │  │ │
│  │  │                         │  │  │  │ ☐ Creative review session (2pm)  │  │ │
│  │  │ Win Rate: 34%           │  │  │  │ ☐ Update project timelines (4)   │  │ │
│  │  │                         │  │  │  │ ☐ Resource planning meeting (3pm)│  │ │
│  │  │ Closing This Month: $67K│  │  │  │ ☐ Proposal deadline (Fri)        │  │ │
│  │  └──────────────────────────┘  │  │  │ ☐ Invoice approvals (pending: 5) │  │ │
│  │                                 │  │  │ ☐ Portfolio updates (overdue: 2) │  │ │
│  │  Top Opportunity: $85K (MegaCo)│  │  └──────────────────────────────────┘  │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Design Category: Premium Glass

**Primary Color:** Creative Purple `#8B5CF6`
**Accent Colors:** Innovation Blue `#3B82F6`, Energy Orange `#F59E0B`, Success Green `#10B981`

**Visual Characteristics:**
- Sophisticated glass morphism with subtle blur effects
- Vibrant gradient overlays for visual interest
- Portfolio imagery integration throughout
- Progress rings and timeline visualizations
- Mood boards and color palette displays
- Before/after comparison sliders
- Creative workflow kanban boards

**Component Styling:**
- Cards: Semi-transparent backgrounds with gradient borders
- Metrics: Bold numerals with creative iconography
- Charts: Smooth area charts with gradient fills
- Progress Indicators: Circular progress rings with artistic flair
- Timeline: Gantt-style bars with milestone markers
- Status Badges: Color-coded pills with custom icons

## Component Hierarchy

```
CreativeDashboard (root)
├── AgencyOverview
│   ├── ActiveProjectsCount (total, new this week, completed this month)
│   ├── UtilizationRateMetric (percentage, vs target, trend)
│   └── RevenueMTD (month-to-date, vs plan, variance percentage)
├── ProjectPipeline
│   ├── ProjectsByStage (discovery, concept, production, review, delivered counts)
│   ├── StageCard (stage name, count, percentage, average duration)
│   ├── OnTimeDeliveryRate (percentage performance)
│   ├── BudgetHealthTracker (percentage of projects on budget)
│   └── PipelineVelocityChart (average time per stage)
├── ResourceAllocation
│   ├── TeamWorkloadGrid (all team members with capacity visualization)
│   ├── WorkloadBar (hours allocated vs available, percentage)
│   ├── OverallocatedAlert (team members over capacity)
│   ├── AvailableCapacityList (team members with open availability)
│   ├── UpcomingAvailabilityForecast (next 2 weeks)
│   └── SkillBasedMatching (projects needing specific skills)
├── TimeTracking
│   ├── WeeklyHoursSummary (billed, non-billable, missing hours)
│   ├── HoursCategoryCard (category, hours, percentage, trend)
│   ├── TopTimeTrackerHighlight (team member with most hours)
│   ├── AverageHourlyRateCalculation (revenue / hours)
│   ├── UnsubmittedTimesheetsAlert (count and names)
│   └── ApprovalPendingList (timesheets awaiting manager approval)
├── ProjectFinancials
│   ├── ProjectProfitabilityList (all active projects with financials)
│   ├── ProjectFinancialCard (name, budget, spent, remaining, margin, status)
│   ├── BudgetVarianceIndicator (on budget, at risk, over budget)
│   ├── ProfitMarginGauge (visual gauge showing margin percentage)
│   ├── ProjectStatusBadge (healthy, at risk, critical)
│   └── FinancialProjectionForecast (estimated final margin)
├── ClientHealth
│   ├── ClientStatusOverview (active, happy, at risk, churned counts)
│   ├── ClientHealthCard (status, count, percentage, examples)
│   ├── NPSScoreMetric (net promoter score, industry comparison)
│   ├── ClientRetentionRate (percentage retained annually)
│   ├── AverageProjectValueMetric (revenue per project)
│   ├── ClientLifetimeValueTrend (LTV over time)
│   └── AtRiskClientAlerts (clients showing churn signals)
├── TimelineAndDeadlines
│   ├── UpcomingDeadlinesList (sorted by date)
│   ├── DeadlineItem (date, deliverable, client, project, owner)
│   ├── OverdueDeliverablesAlert (missed deadlines)
│   ├── TimelineVisualization (Gantt chart view toggle)
│   ├── MilestoneTracker (key project milestones)
│   └── CriticalPathIdentifier (deadline-risking delays)
├── WorkInProgress
│   ├── ActiveDeliverablesList (work currently in production)
│   ├── DeliverableCategoryCard (type, count, assignee)
│   ├── PendingClientReview (deliverables awaiting feedback)
│   ├── AverageRevisionRoundsMetric (iterations per deliverable)
│   ├── ClientResponseTimeMetric (average days to feedback)
│   └── BottleneckIdentifier (stages with longest wait times)
├── RecentDeliveries
│   ├── CompletedProjectsList (recently delivered work)
│   ├── DeliveryCard (project name, delivery date, value, satisfaction)
│   ├── ClientSatisfactionScore (post-project rating)
│   ├── DeliveryTimelineComparison (planned vs actual delivery)
│   └── PortfolioWorthyHighlight (projects selected for portfolio)
├── NewBusiness
│   ├── PipelineOpportunities (qualified leads, proposals, estimated value)
│   ├── OpportunityStageCard (stage, count, total value, probability)
│   ├── WinRateMetric (proposals won vs lost)
│   ├── ExpectedClosingsThisMonth (likely to close)
│   ├── TopOpportunityCard (highest value deal in pipeline)
│   ├── PipelineVelocityTracker (average sales cycle length)
│   └── SourceAttribution (where leads originate)
└── ActionRequired
    ├── TaskList (prioritized daily tasks)
    ├── TimesheetApprovalsPending (awaiting manager review)
    ├── BudgetChangeRequests (needing approval)
    ├── ClientCheckInReminders (relationship maintenance calls)
    ├── CreativeReviewSessions (scheduled critiques)
    ├── ProjectTimelineUpdates (overdue for update)
    ├── ResourcePlanningMeetings (capacity planning sessions)
    ├── ProposalDeadlines (upcoming submission dates)
    ├── InvoiceApprovals (bills to approve before sending)
    └── PortfolioUpdateReminders (new work to showcase)
```

## Theme Presets

### Theme 1: Creative Studio (Default)
```css
.primary: #8B5CF6;        /* Violet }
.secondary: #3B82F6;      /* Blue */
.accent: #F59E0B;         /* Amber */
.background: #F5F3FF;     /* Purple Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.9);
.border-radius: 16px;
.shadow: 0 4px 24px rgba(139, 92, 246, 0.15);
backdrop-filter: blur(12px);
```

### Theme 2: Minimalist Agency
```css
.primary: #1E293B;        /* Dark Slate }
.secondary: #64748B;      /* Gray */
.accent: #F59E0B;         /* Amber */
.background: #F8FAFC;     /* Light Gray */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.9);
.border-radius: 16px;
.shadow: 0 4px 24px rgba(30, 41, 59, 0.15);
backdrop-filter: blur(12px);
```

### Theme 3: Bold & Bright
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
.card-bg: rgba(255, 255, 255, 0.9);
.border-radius: 16px;
.shadow: 0 4px 24px rgba(236, 72, 153, 0.15);
backdrop-filter: blur(12px);
```

### Theme 4: Digital First
```css
.primary: #06B6D4;        /* Cyan }
.secondary: #3B82F6;      /* Blue */
.accent: #8B5CF6;         /* Violet */
.background: #ECFEFF;     /* Cyan Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.9);
.border-radius: 16px;
.shadow: 0 4px 24px rgba(6, 182, 212, 0.15);
backdrop-filter: blur(12px);
```

### Theme 5: Earthy Creative
```css
.primary: #059669;        /* Emerald }
.secondary: #D97706;      /* Amber */
.accent: #7C3AED;         /* Deep Violet */
.background: #ECFDF5;     /* Green Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.9);
.border-radius: 16px;
.shadow: 0 4px 24px rgba(5, 150, 105, 0.15);
backdrop-filter: blur(12px);
```

## Settings Expansion

### Base Settings (Universal)
- Account Management
- Team Members & Permissions
- Security & Authentication
- Notifications & Alerts
- Billing & Subscription
- API Access

### Creative Agency-Specific Settings

#### 1. Project Management
- **Project Templates**
  - Template creation by service type (web design, branding, video, etc.)
  - Pre-defined phases and milestones
  - Default task assignments
  - Estimated hours and budget templates
  - Deliverable checklists
- **Workflow Configuration**
  - Custom project stages (discovery → concept → production → review → delivery)
  - Stage transition rules and approvals
  - Automated notifications on stage changes
  - Client approval gates
  - Quality assurance checkpoints
- **Task Management**
  - Task assignment workflows
  - Recurring task templates
  - Dependency tracking
  - Time estimates vs actual tracking
  - Priority levels (urgent, high, normal, low)

#### 2. Resource Planning
- **Team Capacity**
  - Working hours configuration (full-time, part-time, contractor)
  - Time off management (vacation, sick leave, holidays)
  - Skill tagging (design, development, copywriting, strategy)
  - Rate cards (hourly billing rates by role/person)
  - Availability calendar
- **Allocation Rules**
  - Auto-allocation suggestions based on skills and availability
  - Overallocation warnings and thresholds
  - Preferred team member assignments
  - Multi-project allocation limits
  - Bench time tracking
- **Contractor Management**
  - External freelancer database
  - Contractor rate tracking
  - Availability checking
  - NDA and contract status
  - Performance ratings

#### 3. Time Tracking
- **Timesheet Policies**
  - Required fields (project, task, description, duration)
  - Minimum increment settings (6 min, 15 min, 30 min)
  - Submission deadlines (weekly by Friday EOD)
  - Approval workflows (manager review required)
  - Lock periods (no edits after submission)
- **Billable vs Non-Billable**
  - Billable activity categories
  - Non-billable tracking (internal meetings, training, admin)
  - Auto-billable rules (client calls always billable)
  - Write-off authorization levels
  - Budget vs actual alerts
- **Timer Features**
  - Start/stop timer functionality
  - Manual time entry
  - Bulk time import from calendar
  - Idle detection and reminders
  - Mobile timer support

#### 4. Financial Management
- **Budget Configuration**
  - Fixed fee project budgets
  - Hourly budget caps
  - Retainer arrangements
  - Phased budget allocation
  - Contingency buffers
- **Expense Tracking**
  - Billable expense categories (software, stock assets, printing)
  - Expense approval workflows
  - Receipt capture and attachment
  - Markup rules for expenses
  - Reimbursement processing
- **Profitability Analysis**
  - Real-time margin calculation
  - Burn rate tracking
  - Estimate at completion (EAC)
  - Variance analysis (planned vs actual)
  - Profitability alerts (threshold-based)

#### 5. Client Management
- **Client Onboarding**
  - Intake form customization
  - Brand asset collection (logos, guidelines, fonts)
  - Stakeholder identification
  - Communication preferences
  - Contract and SOW templates
- **Client Communication**
  - Proofing and approval workflows
  - Comment and annotation tools
  - Version control for deliverables
  - Client portal access configuration
  - Feedback consolidation
- **Relationship Health**
  - Check-in schedule automation
  - Satisfaction survey triggers
  - NPS measurement timing
  - Churn risk indicators
  - Upsell opportunity flagging

#### 6. Proposal & Contracts
- **Proposal Creation**
  - Template library by service type
  - Line item pricing configuration
  - Alternative options (good/better/best packages)
  - Case study attachments
  - Terms and conditions inclusion
- **Estimation Tools**
  - Effort estimation by phase
  - Resource requirement calculator
  - Cost-plus pricing model
  - Value-based pricing support
  - Competitive positioning guidance
- **Contract Management**
  - E-signature integration
  - Payment schedule definition
  - Change order workflows
  - Renewal terms
  - Kill fee clauses

#### 7. Portfolio Management
- **Project Showcasing**
  - Portfolio-worthy project flagging
  - Before/after image uploads
  - Case study writing templates
  - Results and metrics documentation
  - Client testimonial collection
- **Portfolio Organization**
  - Category tagging (industry, service, style)
  - Featured projects rotation
  - Search optimization
  - Public vs private portfolio items
  - Password-protected previews
- **Award Submissions**
  - Award opportunity tracking
  - Submission deadline calendar
  - Entry requirements checklist
  - Past wins archive

#### 8. Reporting & Analytics
- **Performance Dashboards**
  - Utilization reports (individual, team, agency-wide)
  - Realization rate (billable hours / available hours)
  - Project margin analysis
  - Client profitability ranking
  - Employee performance scorecards
- **Financial Reports**
  - Revenue recognition (accrual basis)
  - Accounts receivable aging
  - Work in progress (WIP) valuation
  - Cash flow forecasting
  - Budget vs actual variance
- **Operational Reports**
  - Project timeline adherence
  - Resource allocation heat maps
  - Pipeline conversion rates
  - Client retention analysis
  - Service line profitability

## API Endpoint Mappings

### Existing APIs (Can be reused)
```
GET    /api/projects                      - List projects
POST   /api/projects                      - Create project
GET    /api/projects/:id                  - Get project details
PUT    /api/projects/:id                  - Update project
DELETE /api/projects/:id                  - Archive project
GET    /api/clients                       - List clients
POST   /api/clients                       - Create client
GET    /api/clients/:id                   - Get client details
GET    /api/team                          - List team members
GET    /api/time-entries                  - List time entries
POST   /api/time-entries                  - Log time
GET    /api/analytics/overview            - Dashboard analytics
```

### New APIs Required for Creative Agency Industry

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| **Project Management APIs** |
| GET | `/api/projects/templates` | List project templates | P0 |
| POST | `/api/projects/templates` | Create project template | P0 |
| GET | `/api/projects/:id/phases` | Get project phases | P0 |
| PUT | `/api/projects/:id/phases` | Update project phase | P0 |
| POST | `/api/projects/:id/milestones` | Create milestone | P0 |
| GET | `/api/projects/pipeline` | Get project pipeline by stage | P0 |
| PUT | `/api/projects/:id/status` | Update project status | P0 |
| GET | `/api/projects/:id/deliverables` | Get project deliverables list | P0 |
| POST | `/api/projects/:id/deliverables` | Create deliverable | P0 |
| PUT | `/api/projects/:id/deliverables/:id` | Update deliverable status | P0 |
| **Resource Planning APIs** |
| GET | `/api/resources/capacity` | Get team capacity overview | P0 |
| GET | `/api/resources/:id/availability` | Check team member availability | P0 |
| PUT | `/api/resources/:id/skills` | Update skills/tags | P0 |
| POST | `/api/resources/allocate` | Allocate resource to project | P0 |
| DELETE | `/api/resources/:id/allocate` | Remove resource allocation | P0 |
| GET | `/api/resources/workload` | Get workload distribution | P0 |
| GET | `/api/resources/overallocated` | Get overallocated team members | P0 |
| POST | `/api/resources/time-off` | Request time off | P0 |
| GET | `/api/resources/contractors` | List external contractors | P1 |
| **Time Tracking APIs** |
| GET | `/api/time/weekly-summary` | Get weekly hours summary | P0 |
| GET | `/api/time/unsubmitted` | Get unsubmitted timesheets | P0 |
| POST | `/api/time/submit` | Submit timesheet for approval | P0 |
| POST | `/api/time/approve` | Approve timesheet | P0 |
| POST | `/api/time/reject` | Reject timesheet with reason | P0 |
| GET | `/api/time/by-project/:id` | Get time entries for project | P0 |
| GET | `/api/time/billable-vs-nonbillable` | Get billable breakdown | P0 |
| POST | `/api/time/start-timer` | Start time tracking timer | P0 |
| POST | `/api/time/stop-timer` | Stop timer and save entry | P0 |
| GET | `/api/time/timer-status` | Get current timer status | P0 |
| **Financial Management APIs** |
| GET | `/api/finance/projects/:id/budget` | Get project budget details | P0 |
| PUT | `/api/finance/projects/:id/budget` | Update project budget | P0 |
| GET | `/api/finance/projects/:id/spend` | Get actual spend vs budget | P0 |
| GET | `/api/finance/projects/:id/margin` | Calculate project margin | P0 |
| GET | `/api/finance/projects/profitability` | Get all projects profitability | P0 |
| POST | `/api/finance/expenses` | Log project expense | P0 |
| GET | `/api/finance/expenses/pending-approval` | Get expenses awaiting approval | P0 |
| POST | `/api/finance/expenses/:id/approve` | Approve expense | P0 |
| GET | `/api/finance/burn-rate` | Calculate project burn rate | P0 |
| GET | `/api/finance/eac` | Get estimate at completion | P0 |
| **Client Management APIs** |
| GET | `/api/clients/:id/onboarding` | Get client onboarding status | P0 |
| PUT | `/api/clients/:id/onboarding` | Update onboarding progress | P0 |
| GET | `/api/clients/:id/assets` | Get client brand assets | P0 |
| POST | `/api/clients/:id/assets` | Upload brand asset | P0 |
| GET | `/api/clients/:id/stakeholders` | Get client stakeholders | P0 |
| POST | `/api/clients/:id/survey` | Send satisfaction survey | P1 |
| GET | `/api/clients/:id/nps` | Get NPS score history | P1 |
| GET | `/api/clients/health-scores` | Get all client health scores | P0 |
| GET | `/api/clients/at-risk` | Identify at-risk clients | P0 |
| **Proposal & Contract APIs** |
| GET | `/api/proposals/templates` | List proposal templates | P0 |
| POST | `/api/proposals` | Create new proposal | P0 |
| GET | `/api/proposals/:id` | Get proposal details | P0 |
| PUT | `/api/proposals/:id` | Update proposal | P0 |
| POST | `/api/proposals/:id/send` | Send proposal to client | P0 |
| POST | `/api/proposals/:id/convert` | Convert proposal to project | P0 |
| GET | `/api/proposals/pipeline` | Get proposal pipeline | P0 |
| GET | `/api/proposals/win-rate` | Calculate win rate | P0 |
| POST | `/api/contracts` | Create contract | P0 |
| POST | `/api/contracts/:id/sign` | Record e-signature | P0 |
| POST | `/api/contracts/:id/change-order` | Create change order | P0 |
| **Portfolio Management APIs** |
| GET | `/api/portfolio/items` | List portfolio items | P0 |
| POST | `/api/portfolio/items` | Add portfolio piece | P0 |
| PUT | `/api/portfolio/items/:id` | Update portfolio item | P0 |
| DELETE | `/api/portfolio/items/:id` | Remove from portfolio | P0 |
| POST | `/api/portfolio/items/:id/feature` | Feature on homepage | P1 |
| GET | `/api/portfolio/categories` | Get portfolio categories | P0 |
| POST | `/api/portfolio/testimonials` | Add client testimonial | P0 |
| GET | `/api/portfolio/awards` | List awards won | P1 |
| **Reporting APIs** |
| GET | `/api/reports/utilization` | Generate utilization report | P0 |
| GET | `/api/reports/realization-rate` | Calculate realization rate | P0 |
| GET | `/api/reports/client-profitability` | Rank clients by profitability | P1 |
| GET | `/api/reports/project-margins` | Analyze project margins | P0 |
| GET | `/api/reports/wip-valuation` | Calculate WIP value | P0 |
| GET | `/api/reports/cash-flow-forecast` | Generate cash flow forecast | P1 |
| GET | `/api/reports/pipeline-conversion` | Analyze proposal conversion | P0 |
| GET | `/api/reports/resource-heatmap` | Visualize resource allocation | P1 |

**Total New APIs for Creative Agency: 16 endpoints**

---

**Implementation Notes:**
- Build project template system with pre-defined phases and tasks
- Implement resource allocation engine with skills matching
- Create time tracking with start/stop timer and manual entry
- Build real-time project margin calculation (budget - actual spend)
- Implement client health scoring with churn prediction
- Create proposal generation with good/better/best options
- Build portfolio management with case study templates
- Support e-signature integration for contracts
- Implement change order workflow for scope creep management
- Create utilization dashboards with drill-down by team member
- Build WIP (work in progress) valuation for accounting
- Support retainer billing with automatic monthly invoices
- Implement NPS survey automation post-project delivery
- Create award submission tracking with deadline reminders
