# Batch 5 Design Specification: Professional Services Platform

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  VAYVA PROFESSIONAL - Signature Clean Design                                        │
│  [Dashboard] [Clients] [Matters] [Time] [Finance] [Documents] [Team] [Settings]     │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  📊 FIRM OVERVIEW                                       🔔 7 Notifications          │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  Active Matters: 147        │  Utilization Rate: 82%    │  Revenue MTD    │   │
│  │  ▲ 8 new this month         │  ▲ 6% vs last quarter     │  $342K         │   │
│  │                             │  Target: 80%              │  ▲ 9% vs plan   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ⚖️ MATTER PIPELINE                                 👥 CLIENT PORTFOLIO             │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Matters by Practice Area        │  │  Client Overview                        │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Corporate Law    42     │  │  │  │ Total Clients: 234               │  │ │
│  │  │ Litigation       38     │  │  │  │ Active (12mo): 187               │  │ │
│  │  │ Real Estate      28     │  │  │  │ New This Quarter: 23             │  │ │
│  │  │ Family Law       24     │  │  │  │ Retention Rate: 91%              │  │ │
│  │  │ IP/Patent        15     │  │  │  │                                  │  │ │
│  │  └──────────────────────────┘  │  │  │ Top Client: Acme Corp ($67K YTD)│  │ │
│  │                                 │  │  │ Avg Matter Value: $8,234         │  │ │
│  │  Pending Conflicts Checks: 5   │  │  │ Avg Response Time: 4.2 hours     │  │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  ⏱️ TIME & BILLING                                  📄 DOCUMENT STATUS              │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  This Month's Hours              │  │  Document Pipeline                      │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Billed: 892 hours       │  │  │  │ Drafting: 34 documents           │  │ │
│  │  │ WIP (Unbilled): 127 hrs │  │  │  │ In Review: 18 documents          │  │ │
│  │  │ Write-offs: 23 hours    │  │  │  │ Awaiting Client Signature: 12    │  │ │
│  │  │                          │  │  │  │ Executed/Filed: 67 documents     │  │ │
│  │  │ Collection Rate: 97.8%  │  │  │  │                                  │  │ │
│  │  │ DSO: 38 days            │  │  │  │ Template Usage:                  │  │ │
│  │  │                          │  │  │  │ • NDA Templates: 23 uses         │  │ │
│  │  │ Realization Rate: 94.2% │  │  │  │ • Contract Templates: 45 uses    │  │ │
│  │  └──────────────────────────┘  │  │  └──────────────────────────────────┘  │ │
│  │                                 │  │                                         │ │
│  │  Unsubmitted Timesheets: 4     │  │  Pending Signatures: 8 clients          │ │
│  │  Approval Pending: 12 entries  │  │  Upcoming Deadlines: 15 filings         │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  💰 ACCOUNTS RECEIVABLE                             📅 COURT DATES & DEADLINES      │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Outstanding Invoices            │  │  Critical Dates                         │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Current: $187K          │  │  │  │ Today: Deposition (Smith v. Jones)│ │ │
│  │  │ 1-30 Days: $67K         │  │  │  │                                  │  │ │
│  │  │ 31-60 Days: $23K        │  │  │  │ Tomorrow: Motion Deadline (Case # │  │ │
│  │  │ 60+ Days: $8K ⚠️        │  │  │  │ 2024-CV-1234)                    │  │ │
│  │  └──────────────────────────┘  │  │  │                                  │  │ │
│  │                                 │  │  │ This Week:                       │  │ │
│  │  Top 5 Debtors: $34K total     │  │  │ • Closing: Acme Property Sale   │  │ │
│  │  Credit Hold Accounts: 2       │  │  │ • Hearing: Temporary Orders     │  │ │
│  │  Payment Plans Active: 7       │  │  │ • Filing: Patent Application    │  │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  📋 TASK MANAGEMENT                                 🔒 COMPLIANCE & CONFLICTS       │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Team Task Queue                   │  │  Risk Management                      │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ High Priority: 12 tasks │  │  │  │ Open Conflicts Checks: 5         │  │ │
│  │  │ Due Today: 8 tasks      │  │  │  │ Potential Conflicts: 2 ⚠️        │  │ │
│  │  │ Overdue: 3 tasks ⚠️     │  │  │  │ Cleared This Week: 18            │  │ │
│  │  │                          │  │  │  │                                  │  │ │
│  │  │ By Role:                │  │  │  │ CLE Compliance:                  │  │ │
│  │  │ • Attorneys: 23 tasks   │  │  │  │ Attorney A: 12/12 credits ✅     │  │ │
│  │  │ • Paralegals: 18 tasks  │  │  │  │ Attorney B: 8/12 credits ⚠️      │  │ │
│  │  │ • Admin: 7 tasks        │  │  │  │ Attorney C: 10/12 credits ✅     │  │ │
│  │  └──────────────────────────┘  │  │  └──────────────────────────────────┘  │ │
│  │                                 │  │                                         │ │
│  │  Task Completion Rate: 96.4%   │  │  Malpractice Claims: 0 open             │ │
│  │  Avg Turnaround: 2.3 days      │  │  Ethics Inquiries: 0 pending            │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  🎯 BUSINESS DEVELOPMENT                            ⚠️ ACTION REQUIRED              │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Pipeline Opportunities          │  │  Tasks & Reminders                     │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Qualified Leads: 18     │  │  │  │ ☑ Review timesheets (done)       │  │ │
│  │  │ Proposals Out: 7        │  │  │  │ ☐ Approve invoice write-offs (3) │  │ │
│  │  │ Est. Value: $487K       │  │  │  │ ☐ Client intake meetings (4)     │  │ │
│  │  │                         │  │  │  │ ☐ Conflicts check review (5)     │  │ │
│  │  │ Win Rate: 42%           │  │  │  │ ☐ Document review session (2pm)  │  │ │
│  │  │                         │  │  │  │ ☐ Court filing deadline (4pm)    │  │ │
│  │  │ Closing This Month: $87K│  │  │  │ ☐ Partner meeting (3pm)          │  │ │
│  │  └──────────────────────────┘  │  │  │ ☐ CLE training registration      │  │ │
│  │                                 │  │  │ ☐ Annual trust accounting (due)  │  │ │
│  │  Top Opportunity: $125K (TechCo│  │  │ ☐ IOLTA reconciliation (Fri)     │  │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Design Category: Signature Clean

**Primary Color:** Trust Blue `#3B82F6`
**Accent Colors:** Success Green `#10B981`, Warning Amber `#F59E0B`, Professional Purple `#8B5CF6`

**Visual Characteristics:**
- Conservative, professional layouts with clear hierarchy
- Matter-centric organization with client context
- Calendar and deadline visualizations
- Trust accounting compliance indicators
- Document status tracking displays
- Time entry and billing workflows
- Conflict checking interfaces

**Component Styling:**
- Cards: White backgrounds with subtle blue borders
- Metrics: Bold numerals with clear currency/time formatting
- Tables: Dense row layouts for matter lists
- Status Badges: Professional color-coding (active, pending, closed)
- Progress Bars: Matter completion percentage
- Calendar Views: Court dates, filing deadlines, hearing schedules

## Component Hierarchy

```
ProfessionalServicesDashboard (root)
├── FirmOverview
│   ├── ActiveMattersCount (total, new this month, closed this month)
│   ├── UtilizationRateMetric (billable hours / available hours, vs target)
│   └── RevenueMTD (month-to-date revenue, vs plan, variance)
├── MatterPipeline
│   ├── MattersByPracticeArea (corporate, litigation, real estate, family, IP counts)
│   ├── PracticeAreaCard (name, matter count, percentage, revenue YTD)
│   ├── PendingConflictsChecks (count awaiting clearance)
│   ├── MatterStatusBreakdown (active, on hold, pending close, closed)
│   └── MatterAgingReport (matters by days open)
├── ClientPortfolio
│   ├── ClientMetrics (total, active, new, retention rate)
│   ├── ClientSegmentPieChart (active vs inactive vs one-time)
│   ├── TopClientsList (by revenue YTD, ranked 1-10)
│   ├── AverageMatterValueMetric (revenue per matter)
│   ├── ClientResponseTimeMetric (average hours to respond)
│   └── ClientSatisfactionScore (post-matter survey results)
├── TimeAndBilling
│   ├── MonthlyHoursSummary (billed, WIP, write-offs, collection rate)
│   ├── HoursCategoryCard (category, hours, percentage, realization)
│   ├── D SOMetric (days sales outstanding, trend)
│   ├── RealizationRateCalculator (collected / worked hours percentage)
│   ├── UnsubmittedTimesheetsAlert (count and names)
│   └── ApprovalPendingList (timesheets awaiting partner approval)
├── DocumentStatus
│   ├── DocumentPipelineSummary (drafting, review, signature, executed counts)
│   ├── DocumentStageCard (stage, count, average turnaround time)
│   ├── TemplateUsageTracker (most-used document templates)
│   ├── PendingSignaturesList (documents awaiting client execution)
│   ├── UpcomingFilingDeadlines (court/administrative filing dates)
│   └── DocumentVersionControl (latest versions with change tracking)
├── AccountsReceivable
│   ├── OutstandingInvoicesSummary (by aging bucket)
│   ├── AgingBucketCard (bucket name, amount, count, percentage)
│   ├── TopDebtorsList (clients with highest overdue balances)
│   ├── CreditHoldAccounts (clients blocked from new work)
│   ├── PaymentPlansActive (installment agreements in place)
│   └── CollectionPriorityList (who to contact first)
├── CourtDatesAndDeadlines
│   ├── TodaysCourtCalendar (hearings, depositions, closings scheduled)
│   ├── UpcomingDeadlinesList (sorted by date, urgency)
│   ├── DeadlineItem (date, type, matter, assigned attorney, status)
│   ├── OverdueFilingsAlert (missed deadlines requiring action)
│   ├── StatuteOfLimitationsTracker (critical dates approaching)
│   └── CourtLocationMapper (addresses, parking, appearance requirements)
├── TaskManagement
│   ├── TaskQueueSummary (high priority, due today, overdue counts)
│   ├── TaskPriorityCard (priority level, count, examples)
│   ├── TasksByRole (attorneys, paralegals, admin staff breakdown)
│   ├── TaskCompletionRateMetric (percentage completed on time)
│   ├── AverageTurnaroundTimeMetric (days from assignment to completion)
│   └── TaskAssignmentInterface (delegate to team member)
├── ComplianceAndConflicts
│   ├── ConflictsCheckQueue (open checks, potential conflicts, cleared)
│   ├── ConflictsCheckCard (status, count, matter examples)
│   ├── CLEComplianceTracker (continuing legal education credits by attorney)
│   ├── MalpracticeClaimsLog (open claims, history)
│   ├── EthicsInquiriesPending (bar association investigations)
│   └── TrustAccountingCompliance (IOLTA reconciliation status)
├── BusinessDevelopment
│   ├── PipelineOpportunities (leads, proposals, estimated value, win rate)
│   ├── OpportunityStageCard (stage, count, total value, probability)
│   ├── WinRateMetric (proposals won vs lost, by practice area)
│   ├── ExpectedClosingsThisMonth (likely conversions)
│   ├── TopOpportunityCard (highest value deal in pipeline)
│   ├── SourceAttribution (referrals, website, events, repeat clients)
│   └── MarketingROITracker (cost per acquired client)
└── ActionRequired
    ├── TaskList (prioritized daily tasks)
    ├── TimesheetApprovals (awaiting partner review)
    ├── InvoiceWriteOffs (needing approval)
    ├── ClientIntakeMeetings (scheduled consultations)
    ├── ConflictsCheckReviews (clearance required before proceeding)
    ├── DocumentReviewSessions (scheduled critiques)
    ├── CourtFilingDeadlines (today's filings)
    ├── PartnerMeetings (firm management meetings)
    ├── CLERegistrations (upcoming continuing education)
    ├── TrustAccountingReconciliation (monthly IOLTA balancing)
    └── AnnualComplianceFilings (required regulatory submissions)
```

## Theme Presets

### Theme 1: Corporate Law (Default)
```css
.primary: #3B82F6;        /* Trust Blue */
.secondary: #10B981;      /* Success Green */
.accent: #F59E0B;         /* Amber */
.background: #EFF6FF;     /* Blue Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.98);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(59, 130, 246, 0.15);
```

### Theme 2: Litigation Red
```css
.primary: #DC2626;        /* Red }
.secondary: #1E293B;      /* Dark Slate */
.accent: #F59E0B;         /* Amber */
.background: #FEF2F2;     /* Red Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #DC2626;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.98);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(220, 38, 38, 0.15);
```

### Theme 3: Estate Planning Green
```css
.primary: #059669;        /* Emerald }
.secondary: #D97706;      /* Amber */
.accent: #7C3AED;         /* Violet */
.background: #ECFDF5;     /* Green Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.98);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(5, 150, 105, 0.15);
```

### Theme 4: IP Tech Purple
```css
.primary: #8B5CF6;        /* Violet }
.secondary: #3B82F6;      /* Blue */
.accent: #10B981;         /* Green */
.background: #F5F3FF;     /* Purple Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.98);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(139, 92, 246, 0.15);
```

### Theme 5: Family Law Warmth
```css
.primary: #EA580C;        /* Orange }
.secondary: #0891B2;      /* Cyan */
.accent: #7C3AED;         /* Violet */
.background: #FFF7ED;     /* Orange Tint */
.success: #10B981;
.warning: #F59E0B;
.danger: #EF4444;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.98);
.border-radius: 8px;
.shadow: 0 4px 24px rgba(234, 88, 12, 0.15);
```

## Settings Expansion

### Base Settings (Universal)
- Account Management
- Team Members & Permissions
- Security & Authentication
- Notifications & Alerts
- Billing & Subscription
- API Access

### Professional Services-Specific Settings

#### 1. Matter Management
- **Matter Setup**
  - Matter type classification (litigation, transactional, advisory)
  - Practice area assignment (corporate, family, IP, real estate, etc.)
  - Responsible attorney assignment
  - Fee arrangement configuration (hourly, flat fee, contingency, retainer)
  - Client authorization forms
  - Engagement letter templates
- **Matter Workflow**
  - Custom matter stages by practice area
  - Stage transition checklists
  - Required document lists per stage
  - Client approval gates
  - Matter closing procedures
- **Conflict Checking**
  - Automated conflicts search (parties, witnesses, related matters)
  - Manual conflicts review workflow
  - Ethical wall configurations (for lateral hires)
  - Conflicts clearance documentation
  - Ongoing monitoring for new conflicts

#### 2. Time Tracking & Billing
- **Time Entry Policies**
  - Minimum increment settings (6 min, 10 min, 15 min)
  - Required fields (matter, task code, description, duration)
  - Narrative format requirements (action verbs, specificity)
  - Block billing prevention
  - Timely entry enforcement (daily submission encouraged)
- **Billing Rules**
  - Hourly rates by attorney level (partner, associate, paralegal)
  - Blended rate configurations
  - Flat fee milestone billing
  - Contingency percentage tracking
  - Retainer drawdown rules
  - Expense markup policies
- **Write-off Authority**
  - Approval levels by amount (senior attorney up to $500, managing partner above)
  - Write-off reason codes (administrative, relationship, quality issue)
  - Client notification requirements
  - Financial impact reporting

#### 3. Trust Accounting (IOLTA)
- **Trust Account Setup**
  - IOLTA account configuration
  - Non-IOLTA trust accounts (large deposits earning interest)
  - Client-specific trust ledgers
  - Three-way reconciliation requirements
  - Negative balance prevention alerts
- **Trust Transactions**
  - Trust receipt recording (client deposits)
  - Trust disbursement authorization
  - Transfer from trust to operating (earned fees)
  - Client trust refund processing
  - Escheatment tracking (unclaimed property)
- **Compliance Reporting**
  - Monthly three-way reconciliation reports
  - Client ledger statements
  - Deposit/disbursement journals
  - NSF check tracking
  - Annual certification filings

#### 4. Document Management
- **Document Templates**
  - Template library by practice area
  - Clause libraries (standard provisions)
  - Merge field configuration (client name, case number, dates)
  - Version control settings
  - Template approval workflow
- **Document Assembly**
  - Guided interview for document generation
  - Conditional logic (if-then clauses based on answers)
  - Auto-population from matter data
  - Bulk document generation (form sets)
- **E-Signature Integration**
  - Signature platform integration (DocuSign, Adobe Sign)
  - Signature order sequencing
  - Reminder automation for unsigned documents
  - Executed document storage
  - Notarization scheduling

#### 5. Calendar & Deadlines
- **Court Calendar Integration**
  - Court rule-based deadline calculation (count backward from hearing)
  - Holiday calendar integration (court closures)
  - Judge-specific rules (individual standing orders)
  - Filing method deadlines (e-filing vs physical filing timing)
- **Deadline Types**
  - Statute of limitations (non-extendable)
  - Court-ordered deadlines (motions, discovery)
  - Contractual deadlines (closing dates, option periods)
  - Internal deadlines (draft completions, reviews)
- **Reminder Configuration**
  - Escalating reminders (7 days, 3 days, 1 day, day of)
  - Multiple recipient notifications
  - Backup attorney assignments
  - Coverage arrangements for vacations

#### 6. Client Intake & Onboarding
- **Intake Forms**
  - Practice-area-specific questionnaires
  - Conflict information gathering (opposing parties, related entities)
  - Case evaluation criteria scoring
  - Engagement likelihood assessment
  - Referral source tracking
- **Client Verification**
  - Identity verification (KYB/KYC requirements)
  - Sanctions list checking (OFAC)
  - Adverse media screening
  - PEP (politically exposed person) identification
- **Engagement Process**
  - Engagement letter generation
  - Fee agreement execution
  - Retainer invoice generation
  - Client portal access provisioning
  - Welcome packet delivery

#### 7. Business Development
- **Lead Management**
  - Lead capture from website forms
  - Lead scoring criteria (case value, likelihood, fit)
  - Follow-up task automation
  - Conversion tracking (inquiry to client)
  - Declined matter tracking (reasons, referrals given)
- **Proposal Management**
  - RFP response templates
  - Pitch deck libraries
  - Fee proposal calculators
  - Engagement terms negotiation
  - Win/loss analysis
- **Referral Network**
  - Referral source database (past clients, other attorneys, professionals)
  - Referral tracking and acknowledgment
  - Co-counsel relationships
  - Reciprocal referral arrangements

#### 8. Compliance & Risk Management
- **CLE Tracking**
  - Credit requirement by jurisdiction
  - Credit category requirements (ethics, elimination of bias, substance abuse)
  - Course approval verification
  - Expiration date tracking
  - Certificate storage
- **Malpractice Prevention**
  - Claims-made policy tracking
  - Incident reporting workflow
  - Claim response coordination
  - Premium allocation by practice area
  - Loss run analysis
- **Ethics Compliance**
  - Confidentiality safeguards (data encryption, access controls)
  - Conflict wall maintenance
  - Advertising review requirements (some states require pre-approval)
  - Fee reasonableness documentation
  - File retention and destruction policies

## API Endpoint Mappings

### Existing APIs (Can be reused)
```
GET    /api/clients                       - List clients
POST   /api/clients                       - Create client
GET    /api/clients/:id                   - Get client details
PUT    /api/clients/:id                   - Update client
GET    /api/matters                       - List matters
POST   /api/matters                       - Create matter
GET    /api/matters/:id                   - Get matter details
PUT    /api/matters/:id                   - Update matter
GET    /api/time-entries                  - List time entries
POST   /api/time-entries                  - Log time
GET    /api/invoices                      - List invoices
POST   /api/invoices                      - Create invoice
GET    /api/documents                     - List documents
POST   /api/documents                     - Upload document
GET    /api/analytics/overview            - Dashboard analytics
```

### New APIs Required for Professional Services Industry

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| **Matter Management APIs** |
| GET | `/api/matters/by-practice-area` | Get matters grouped by practice area | P0 |
| PUT | `/api/matters/:id/stage` | Update matter stage | P0 |
| POST | `/api/matters/:id/closing` | Initiate matter closing workflow | P0 |
| GET | `/api/matters/conflicts-checks` | Get pending conflicts checks | P0 |
| POST | `/api/matters/conflicts-checks` | Run conflicts check | P0 |
| PUT | `/api/matters/conflicts-checks/:id/clear` | Clear conflicts check | P0 |
| GET | `/api/matters/:id/related` | Get related matters | P1 |
| POST | `/api/matters/:id/hold` | Place matter on hold | P0 |
| **Time & Billing APIs** |
| GET | `/api/billing/monthly-summary` | Get monthly hours summary | P0 |
| GET | `/api/billing/wip` | Get work in progress (unbilled time) | P0 |
| GET | `/api/billing/write-offs` | Get write-off requests | P0 |
| POST | `/api/billing/write-offs/:id/approve` | Approve write-off | P0 |
| POST | `/api/billing/write-offs/:id/reject` | Reject write-off | P0 |
| GET | `/api/billing/realization-rate` | Calculate realization rate | P0 |
| GET | `/api/billing/collection-rate` | Calculate collection rate | P0 |
| POST | `/api/billing/timesheets/submit` | Submit timesheet for approval | P0 |
| POST | `/api/billing/timesheets/approve` | Approve timesheet | P0 |
| GET | `/api/billing/rates` | Get billing rates by role | P0 |
| PUT | `/api/billing/rates` | Update billing rates | P0 |
| **Trust Accounting APIs** |
| GET | `/api/trust/accounts` | List trust accounts | P0 |
| GET | `/api/trust/:account/balance` | Get trust account balance | P0 |
| GET | `/api/trust/:client/ledger` | Get client trust ledger | P0 |
| POST | `/api/trust/receipts` | Record trust receipt | P0 |
| POST | `/api/trust/disbursements` | Record trust disbursement | P0 |
| POST | `/api/trust/transfers` | Transfer trust to operating | P0 |
| GET | `/api/trust/reconciliation` | Generate three-way reconciliation | P0 |
| GET | `/api/trust/negative-balance-alerts` | Get negative balance alerts | P0 |
| POST | `/api/trust/refunds` | Process trust refund to client | P0 |
| **Document Management APIs** |
| GET | `/api/documents/templates` | List document templates | P0 |
| POST | `/api/documents/templates` | Create document template | P0 |
| GET | `/api/documents/templates/:id/generate` | Generate document from template | P0 |
| POST | `/api/documents/:id/send-signature` | Send for e-signature | P0 |
| GET | `/api/documents/pending-signatures` | Get documents awaiting signature | P0 |
| GET | `/api/documents/executed` | Get executed documents | P0 |
| PUT | `/api/documents/:id/version` | Create new document version | P0 |
| GET | `/api/documents/deadlines` | Get upcoming filing deadlines | P0 |
| POST | `/api/documents/e-file` | E-file document with court | P1 |
| **Calendar & Deadlines APIs** |
| GET | `/api/calendar/court-dates` | Get scheduled court appearances | P0 |
| POST | `/api/calendar/court-dates` | Add court date | P0 |
| GET | `/api/calendar/deadlines` | Get matter deadlines | P0 |
| POST | `/api/calendar/deadlines` | Calculate deadline from court rules | P0 |
| PUT | `/api/calendar/deadlines/:id/complete` | Mark deadline complete | P0 |
| GET | `/api/calendar/statute-limitations` | Get approaching statute of limitations | P0 |
| GET | `/api/calendar/judge-rules` | Get judge-specific standing orders | P1 |
| **Client Intake APIs** |
| POST | `/api/intake/forms/submit` | Submit client intake form | P0 |
| GET | `/api/intake/forms/:id/review` | Get intake form for review | P0 |
| POST | `/api/intake/forms/:id/accept` | Accept client/matter | P0 |
| POST | `/api/intake/forms/:id/decline` | Decline matter with reason | P0 |
| POST | `/api/intake/conflicts-check` | Run initial conflicts check | P0 |
| POST | `/api/intake/engagement-letter` | Generate engagement letter | P0 |
| POST | `/api/intake/retainer-invoice` | Generate retainer invoice | P0 |
| **Business Development APIs** |
| GET | `/api/bd/leads` | List all leads | P0 |
| POST | `/api/bd/leads` | Create new lead | P0 |
| PUT | `/api/bd/leads/:id/status` | Update lead status | P0 |
| GET | `/api/bd/proposals` | List all proposals | P0 |
| POST | `/api/bd/proposals` | Create proposal | P0 |
| GET | `/api/bd/proposals/:id/convert` | Convert proposal to matter | P0 |
| GET | `/api/bd/win-rate` | Calculate win rate by practice area | P0 |
| GET | `/api/bd/source-attribution` | Analyze lead sources | P0 |
| POST | `/api/bd/referrals/track` | Track referral source | P0 |
| **Compliance APIs** |
| GET | `/api/compliance/cle-credits` | Get CLE credit tracking by attorney | P0 |
| POST | `/api/compliance/cle-credits` | Record CLE credit earned | P0 |
| GET | `/api/compliance/cle-expiring` | Get expiring CLE credits | P1 |
| GET | `/api/compliance/malpractice-claims` | List malpractice claims | P1 |
| POST | `/api/compliance/incident-report` | File incident report | P0 |
| GET | `/api/compliance/ethics-inquiries` | Get ethics inquiry status | P1 |
| GET | `/api/compliance/file-retention` | Get files due for destruction | P1 |
| **Reporting APIs** |
| GET | `/api/reports/utilization` | Generate utilization report by attorney | P0 |
| GET | `/api/reports/matter-profitability` | Analyze matter profitability | P1 |
| GET | `/api/reports/practice-area-performance` | Compare practice areas | P0 |
| GET | `/api/reports/client-lifetime-value` | Calculate client LTV | P1 |
| GET | `/api/reports/work-in-progress` | Generate WIP report | P0 |
| GET | `/api/reports/accounts-receivable-aging` | Generate AR aging report | P0 |
| GET | `/api/reports/trust-account-summary` | Generate trust account report | P0 |

**Total New APIs for Professional Services: 14 endpoints**

---

**Implementation Notes:**
- Build matter-centric data model with client, matters, and time entries linked
- Implement automated conflicts checking against all matters and clients
- Create trust accounting system with three-way reconciliation capability
- Build court rule-based deadline calculator (count business days backward)
- Implement e-signature integration for engagement letters and court forms
- Create document assembly engine with merge fields and conditional logic
- Build CLE credit tracking with jurisdiction-specific requirements
- Implement matter stage workflows with checklist enforcement
- Support multiple fee arrangements (hourly, flat, contingency, retainer)
- Create write-off approval workflow with reason code tracking
- Build client intake form system with scoring and acceptance workflow
- Implement statute of limitations tracker with hard deadline alerts
- Support ethical wall configurations for conflict isolation
- Create IOLTA reconciliation reports for annual compliance filings
