# Batch 5 Design Specification: Legal & Law Firm Platform

## Visual Layout

```
┌─────────────────────────────────────────────────────────────────────────────────────┐
│  VAYVA LEGAL - Premium Glass Design                                                 │
│  [Dashboard] [Cases] [Clients] [Calendar] [Documents] [Billing] [Trust] [Reports]   │
├─────────────────────────────────────────────────────────────────────────────────────┤
│                                                                                     │
│  📊 FIRM PERFORMANCE                                    🔔 11 Notifications         │
│  ┌─────────────────────────────────────────────────────────────────────────────┐   │
│  │  Active Cases: 89           │  Billable Hours MTD: 347  │  Collections MTD │   │
│  │  ▲ 5 new this week          │  ▲ 12% vs last month      │  $287K         │   │
│  │                             │  Target: 360 hours        │  ▲ 8% vs plan   │   │
│  └─────────────────────────────────────────────────────────────────────────────┘   │
│                                                                                     │
│  ⚖️ CASE PIPELINE                                   📅 COURT CALENDAR               │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Cases by Practice Area          │  │  Today's Schedule                      │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Criminal Defense   24   │  │  │  │ 9:00 AM - Arraignment (Dept 3A) │  │ │
│  │  │ Personal Injury    21   │  │  │  │     State v. Johnson             │  │ │
│  │  │ Family Law         18   │  │  │  │                                  │  │ │
│  │  │ DUI/DWI            15   │  │  │  │ 10:30 AM - Motion Hearing (Dept │  │ │
│  │  │ Civil Litigation   11   │  │  │  │ 7B)                              │  │ │
│  │  │                         │  │  │  │     Smith v. ABC Corp            │  │ │
│  │  │ Pending Intake: 7 cases │  │  │  │                                  │  │ │
│  │  │ Conflicts Pending: 3    │  │  │  │ 2:00 PM - Client Meeting (Office)│  │ │
│  │  │                         │  │  │  │     Estate Planning - Williams   │  │ │
│  │  │ Win Rate: 78.4%         │  │  │  │                                  │  │ │
│  │  │ Avg Case Value: $12,450 │  │  │  │ 3:30 PM - Deposition (Conf Room)│  │ │
│  │  │                         │  │  │  │     Jones v. XYZ Inc             │  │ │
│  │  └──────────────────────────┘  │  │  └──────────────────────────────────┘  │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  ⏱️ TIME TRACKING                                   💰 TRUST ACCOUNT                  │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  This Week's Time                │  │  IOLTA Trust Account                   │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Billed: 87.5 hours      │  │  │  │ Total Balance: $234,567.89       │  │ │
│  │  │ WIP (Unbilled): 23.2 hrs│  │  │  │                                  │  │ │
│  │  │ Non-Billable: 8.3 hours │  │  │  │ Client Balances:                 │  │ │
│  │  │ Write-offs: 4.0 hours   │  │  │  │ • Martinez: $45,000.00           │  │ │
│  │  │                          │  │  │  │ • Thompson: $32,500.00           │  │ │
│  │  │ Realization: 91.2%      │  │  │  │ • Chen: $28,750.00               │  │ │
│  │  │ Collection: 96.8%       │  │  │  │ • Davis: $18,200.00              │  │ │
│  │  │                          │  │  │  │ • Other (12 clients): $110,117.89│  │ │
│  │  │ Top Producer: J. Smith  │  │  │  │                                  │  │ │
│  │  │ (34.5 hours this week)  │  │  │  │ Disbursements Pending: 3         │  │ │
│  │  └──────────────────────────┘  │  │  │ Transfers to Operating: $12,340  │  │ │
│  │                                 │  │  └──────────────────────────────────┘  │ │
│  │  Unsubmitted Timesheets: 2     │  │                                         │ │
│  │  Deadline: End of Day Friday   │  │  Reconciliation Status: ✅ Current    │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  📄 DOCUMENT CENTER                                 🔔 CRITICAL DEADLINES           │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Document Status Overview        │  │  Upcoming Deadlines                    │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Drafting: 23 docs       │  │  │  │ TODAY: Answer Due (Smith v. Doe)│  │ │
│  │  │ In Review: 12 docs      │  │  │  │                                  │  │ │
│  │  │ Awaiting Signature: 8    │  │  │  │ TOMORROW: Discovery Deadline    │  │ │
│  │  │ Executed/Filed: 47 docs │  │  │  │ (Johnson Case #2024-CV-5678)     │  │ │
│  │  │                          │  │  │  │                                  │  │ │
│  │  │ Template Library: 156    │  │  │  │ Fri Mar 15: Motion to Dismiss   │  │ │
│  │  │ Clause Library: 89       │  │  │  │ (Thompson Matter)               │  │ │
│  │  │                          │  │  │  │                                  │  │ │
│  │  │ E-Signature Pending: 5   │  │  │  │ Mon Mar 18: Trial Prep Due      │  │ │
│  │  │ Notarization Scheduled: 2│  │  │  │ (Martinez Criminal Defense)     │  │ │
│  │  └──────────────────────────┘  │  │  └──────────────────────────────────┘  │ │
│  │                                 │  │                                         │ │
│  │  Most Used Templates:          │  │  Statute of Limitations Alerts:         │ │
│  │  • Complaint Template (34x)    │  │  • Garcia PI Case: 45 days remaining   │ │
│  │  • Engagement Letter (28x)     │  │  • Wilson Medical Malpractice: 89 days │ │
│  │  • Subpoena Form (23x)         │  │  └──────────────────────────────────┘  │ │
│  └──────────────────────────────────┘                                          │ │
│                                                                                     │
│  💼 CLIENT MATTERS                                  📊 CASE FINANCIALS              │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Active Client Matters           │  │  Matter Profitability                  │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ Martinez Criminal        │  │  │  │ Martinez Criminal Defense        │  │ │
│  │  │ Retainer: $50K | Used: $ │  │  │  │ Budget: $50K | Billed: $32K      │  │ │
│  │  │ Status: Active Good 👍   │  │  │  │ Margin: 78% | Status: ✅ On Track│  │ │
│  │  │                          │  │  │  │                                  │  │ │
│  │  │ Thompson PI              │  │  │  │ Thompson Personal Injury         │  │ │
│  │  │ Contingency: 33%         │  │  │  │ Contingency (33%) | Est: $150K   │  │ │
│  │  │ Est. Settlement: $150K   │  │  │  │ Billed: $18K | Status: ⏳ Pending│  │ │
│  │  │                          │  │  │  │                                  │  │ │
│  │  │ Williams Estate          │  │  │  │ Williams Estate Planning         │  │ │
│  │  │ Flat Fee: $8K | Paid ✓   │  │  │  │ Flat Fee: $8K | Complete ✅      │  │ │
│  │  │ Documents: 95% complete  │  │  │  │ Final Review: Scheduled Mon      │  │ │
│  │  └──────────────────────────┘  │  │  └──────────────────────────────────┘  │ │
│  │                                 │  │                                         │ │
│  │  Low Retainer Alerts: 2        │  │  WIP (Work in Progress): $34,567      │ │
│  │  Overdue Invoices: 3 clients   │  │  Accounts Receivable: $67,234         │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
│                                                                                     │
│  🎯 TASK MANAGEMENT                                 ⚠️ ACTION REQUIRED              │
│  ┌──────────────────────────────────┐  ┌─────────────────────────────────────────┐ │
│  │  Team Task Queue                   │  │  Tasks & Reminders                   │ │
│  │  ┌──────────────────────────┐  │  │  ┌──────────────────────────────────┐  │ │
│  │  │ High Priority: 8 tasks  │  │  │  │ ☑ Review timesheets (done)       │  │ │
│  │  │ Due Today: 12 tasks     │  │  │  │ ☐ Approve trust disbursement (2) │  │ │
│  │  │ Overdue: 2 tasks ⚠️     │  │  │  │ ☐ File answer (Smith v. Doe)     │  │ │
│  │  │                          │  │  │  │ ☐ Client update calls (4)        │  │ │
│  │  │ By Role:                │  │  │  │ ☐ Review discovery responses     │  │ │
│  │  │ • Attorneys: 18 tasks   │  │  │  │ ☐ Deposition prep (2pm)          │  │ │
│  │  │ • Paralegals: 14 tasks  │  │  │  │ ☐ Trust reconciliation (by Fri)  │  │ │
│  │  │ • Staff: 6 tasks        │  │  │  │ ☐ CLE seminar registration       │  │ │
│  │  └──────────────────────────┘  │  │  │ ☐ Bar dues renewal (due Mar 31)  │  │ │
│  │                                 │  │  │ ☐ Annual malpractice disclosure  │  │ │
│  │  Task Completion: 94.7%        │  │  └──────────────────────────────────┘  │ │
│  └──────────────────────────────────┘  └─────────────────────────────────────────┘ │
└─────────────────────────────────────────────────────────────────────────────────────┘
```

## Design Category: Premium Glass

**Primary Color:** Justice Blue `#1E40AF`
**Accent Colors:** Authority Gold `#D97706`, Integrity Green `#059669**, Alert Red `#DC2626`

**Visual Characteristics:**
- Authoritative glass morphism with professional blur effects
- Scales of justice and legal iconography integration
- Court calendar visualizations with appearance indicators
- Trust accounting compliance dashboards
- Case timeline and milestone tracking
- Document execution status workflows
- Billing realization metrics

**Component Styling:**
- Cards: Semi-transparent backgrounds with navy/gold accent borders
- Metrics: Bold serif numerals for traditional legal aesthetic
- Charts: Conservative area charts with gradient fills
- Progress Indicators: Circular progress rings for case milestones
- Status Badges: Professional color-coding (active, pending, closed, urgent)
- Calendar Views: Court appearance schedules with location details

## Component Hierarchy

```
LegalDashboard (root)
├── FirmPerformance
│   ├── ActiveCasesCount (total, new this week, closed this month)
│   ├── BillableHoursMTD (hours logged, vs target, variance)
│   └── CollectionsMTD (amount collected, vs plan, percentage)
├── CasePipeline
│   ├── CasesByPracticeArea (criminal, PI, family, DUI, civil counts)
│   ├── PracticeAreaCard (name, case count, percentage, avg value)
│   ├── PendingIntakeCount (cases awaiting initial consultation)
│   ├── ConflictsPendingList (cases awaiting conflicts clearance)
│   ├── WinRateMetric (cases won vs lost, by practice area)
│   └── AverageCaseValueCalculator (revenue per matter type)
├── CourtCalendar
│   ├── TodaysSchedule (all court appearances, meetings, depositions)
│   ├── CourtAppearanceCard (time, department, case, judge, type)
│   ├── LocationDetails (address, parking, appearance requirements)
│   ├── UpcomingHearingsList (next 7 days of scheduled appearances)
│   ├── JudgeAssignmentTracker (which judges assigned to active cases)
│   └── CourtRulesIntegration (judge-specific standing orders)
├── TimeTracking
│   ├── WeeklyTimeSummary (billed, WIP, non-billable, write-offs)
│   ├── TimeCategoryCard (category, hours, percentage, realization)
│   ├── RealizationRateMetric (collected hours / worked hours)
│   ├── CollectionRateMetric (actual collections / billings)
│   ├── TopProducerHighlight (attorney with most hours this period)
│   ├── UnsubmittedTimesheetsAlert (count, names, deadline reminder)
│   └── TimesheetSubmissionDeadline (countdown to Friday EOD)
├── TrustAccount
│   ├── IOLTABalance (total trust balance across all accounts)
│   ├── ClientBalanceCard (client name, balance, matter reference)
│   ├── TotalTrustLiability (sum of all client ledger balances)
│   ├── ThreeWayReconciliationStatus (operating + trust = liability check)
│   ├── DisbursementsPending (awaiting authorization)
│   ├── TransfersToOperating (earned fees moved from trust)
│   └── NegativeBalanceAlerts (any client ledgers below zero)
├── DocumentCenter
│   ├── DocumentStatusOverview (drafting, review, signature, filed counts)
│   ├── DocumentStageCard (stage, count, average completion time)
│   ├── TemplateLibraryStats (templates available, usage frequency)
│   ├── ClauseLibraryCount (standard clauses available)
│   ├── ESignaturePendingList (documents awaiting client signature)
│   ├── NotarizationSchedule (upcoming notary appointments)
│   └── MostUsedTemplatesRanking (top templates by practice area)
├── CriticalDeadlines
│   ├── TodaysDeadlinesList (must-complete today)
│   ├── UpcomingDeadlinesTracker (sorted by date and urgency)
│   ├── DeadlineItem (date, type, case, responsible attorney, status)
│   ├── StatuteOfLimitationsAlerts (critical dates approaching)
│   ├── OverdueFilingsAlert (missed deadlines requiring action)
│   ├── DiscoveryDeadlinesTracker (interrogatories, requests, responses)
│   └── TrialPreparationTimeline (countdown to trial date)
├── ClientMatters
│   ├── ActiveMattersList (all open client matters)
│   ├── MatterFinancialCard (retainer type, balance, status indicator)
│   ├── RetainerDepletionAlert (matters nearing retainer exhaustion)
│   ├── ContingencyCaseTracker (estimated value, costs advanced, status)
│   ├── FlatFeeMatterProgress (percentage complete, deliverables)
│   ├── LowRetainerWarnings (clients needing replenishment)
│   └── OverdueInvoiceTracker (unpaid bills by client)
├── CaseFinancials
│   ├── MatterProfitabilityList (all cases with financial metrics)
│   ├── MatterFinancialCard (budget, billed, margin, status badge)
│   ├── BudgetVsActualComparison (planned vs actual spend)
│   ├── WIPTotal (work in progress - unbilled time and expenses)
│   ├── AccountsReceivableTotal (outstanding invoices)
│   ├── ContingencyEstimate (potential revenue from pending settlements)
│   └── WriteOffAnalysis (reasons and amounts written off)
├── TaskManagement
│   ├── TaskQueueSummary (high priority, due today, overdue, assigned)
│   ├── TaskPriorityCard (priority level, count, examples)
│   ├── TasksByRoleBreakdown (attorneys, paralegals, staff counts)
│   ├── TaskCompletionRateMetric (percentage on-time completion)
│   ├── AverageTaskTurnaroundMetric (assignment to completion time)
│   └── TaskAssignmentInterface (delegate to team member with deadline)
└── ActionRequired
    ├── TaskList (prioritized daily tasks)
    ├── TrustDisbursementApprovals (pending client fund transfers)
    ├── CourtFilingRequirements (today's mandatory filings)
    ├── ClientUpdateCalls (relationship maintenance outreach)
    ├── DiscoveryReviewSessions (scheduled document reviews)
    ├── DepositionPreparations (upcoming witness exams)
    ├── TrustReconciliationReminder (monthly three-way balancing)
    ├── CLERegistrationDeadlines (continuing education requirements)
    ├── BarAssociationCompliance (dues, disclosures, renewals)
    └── MalpracticeRenewalReminder (annual policy renewal date)
```

## Theme Presets

### Theme 1: Justice Blue (Default)
```css
.primary: #1E40AF;        /* Navy Blue */
.secondary: #D97706;      /* Authority Gold */
.accent: #059669;         /* Integrity Green */
.background: #EFF6FF;     /* Blue Tint */
.success: #059669;
.warning: #D97706;
.danger: #DC2626;         /* Red */
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.92);
.border-radius: 12px;
.shadow: 0 4px 24px rgba(30, 64, 175, 0.15);
backdrop-filter: blur(12px);
```

### Theme 2: Criminal Defense Dark
```css
.primary: #DC2626;        /* Red }
.secondary: #1E293B;      /* Dark Slate */
.accent: #D97706;         /* Gold */
.background: #1E293B;     /* Very Dark */
.success: #059669;
.warning: #D97706;
.danger: #DC2626;
.text-primary: #F1F5F9;
.text-secondary: #94A3B8;
.card-bg: rgba(30, 41, 59, 0.95);
.border-radius: 12px;
.shadow: 0 4px 24px rgba(220, 38, 38, 0.2);
backdrop-filter: blur(12px);
```

### Theme 3: Estate Planning Green
```css
.primary: #059669;        /* Emerald }
.secondary: #D97706;      /* Amber */
.accent: #7C3AED;         /* Violet */
.background: #ECFDF5;     /* Green Tint */
.success: #059669;
.warning: #D97706;
.danger: #DC2626;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.92);
.border-radius: 12px;
.shadow: 0 4px 24px rgba(5, 150, 105, 0.15);
backdrop-filter: blur(12px);
```

### Theme 4: Corporate Law Purple
```css
.primary: #7C3AED;        /* Deep Violet }
.secondary: #1E40AF;      /* Navy */
.accent: #059669;         /* Green */
.background: #F5F3FF;     /* Purple Tint */
.success: #059669;
.warning: #D97706;
.danger: #DC2626;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.92);
.border-radius: 12px;
.shadow: 0 4px 24px rgba(124, 58, 237, 0.15);
backdrop-filter: blur(12px);
```

### Theme 5: Family Law Warmth
```css
.primary: #EA580C;        /* Orange }
.secondary: #0891B2;      /* Cyan */
.accent: #7C3AED;         /* Violet */
.background: #FFF7ED;     /* Orange Tint */
.success: #059669;
.warning: #D97706;
.danger: #DC2626;
.text-primary: #1E293B;
.text-secondary: #64748B;
.card-bg: rgba(255, 255, 255, 0.92);
.border-radius: 12px;
.shadow: 0 4px 24px rgba(234, 88, 12, 0.15);
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

### Legal-Specific Settings

#### 1. Case/Matter Management
- **Case Setup**
  - Case type classification (litigation, transactional, criminal, civil)
  - Practice area assignment (criminal defense, PI, family law, etc.)
  - Lead attorney assignment
  - Co-counsel designations
  - Fee arrangement configuration (hourly, flat fee, contingency, retainer)
  - Case caption information (plaintiff, defendant, case number)
- **Case Workflow**
  - Custom matter stages by practice area
  - Pleading stage → Discovery → Pre-trial → Trial → Post-trial/Appeal
  - Stage transition checklists
  - Required filing lists per stage
  - Client approval checkpoints
  - Case closing procedures
- **Conflict Checking**
  - Automated party name searching (clients, opposing parties, witnesses)
  - Related matter identification
  - Ethical wall configurations (for lateral attorney hires)
  - Conflicts clearance documentation and retention
  - Ongoing monitoring as new parties are added

#### 2. Time Entry & Billing
- **Time Entry Standards**
  - Minimum increment rules (6 min, 10 min, 15 min, quarter-hour)
  - Narrative description requirements (action verbs, specificity, no block billing)
  - Task code assignment (required for some practice areas)
  - Expense allocation to matters
  - Timely entry enforcement policies
- **Billing Configurations**
  - Hourly rates by attorney level (partner, associate, counsel, paralegal)
  - Blended rate arrangements
  - Flat fee milestone definitions
  - Contingency percentage (33%, 40%, sliding scale)
  - Retainer drawdown automation
  - Costs advanced tracking (filing fees, expert witness fees, copying)
- **Write-off Management**
  - Approval authority levels (senior attorney up to $X, managing partner above)
  - Write-off reason codes (administrative error, relationship goodwill, quality issue)
  - Client notification workflows
  - Financial impact analysis and reporting
  - Pattern identification (repeat write-offs by attorney or client)

#### 3. Trust Accounting (IOLTA/NON-IOLTA)
- **Trust Account Configuration**
  - IOLTA account setup (pooled interest-bearing trust account)
  - Non-IOLTA accounts for large deposits (individual client accounts earning interest to client)
  - Client-specific trust ledger tracking
  - Three-way reconciliation requirements (cash + ledgers = liability)
  - Negative balance prevention alerts
- **Trust Operations**
  - Trust receipt recording (client deposits, settlement proceeds)
  - Trust disbursement authorization workflows (attorney request → approving partner)
  - Transfer automation (trust to operating when fees earned)
  - Client refund processing
  - Escheatment tracking (unclaimed property reporting)
- **Compliance Reporting**
  - Monthly three-way reconciliation generation
  - Client ledger statements (available on request)
  - Deposit journals and disbursement journals
  - NSF check tracking and follow-up
  - Annual certification filings with state bar

#### 4. Court Calendar & Deadlines
- **Court Integration**
  - Court rule-based deadline calculation (count backward from hearing/trial using business days)
  - County-specific holiday calendars integrated
  - Judge-specific standing orders database (individual judge requirements)
  - E-filing system integrations (where available)
  - Physical filing logistics (courier services, drop-off locations)
- **Deadline Categories**
  - Statute of limitations (hard, non-extendable except tolling)
  - Court-ordered deadlines (discovery cut-off, motion deadlines, pre-trial conference)
  - Contractual deadlines (closing dates, option exercise periods, notice requirements)
  - Internal firm deadlines (draft completion, review cycles, preparation deadlines)
- **Reminder Systems**
  - Escalating reminders (7 days out, 3 days, 1 day, morning of)
  - Multiple recipient notifications (attorney, paralegal, backup coverage)
  - Vacation/absence coverage assignments
  - Emergency contact protocols

#### 5. Document Management & Assembly
- **Template Library**
  - Practice-area-specific template organization
  - Pleading templates (complaints, answers, motions, briefs)
  - Transactional templates (contracts, wills, trusts, incorporation documents)
  - Clause libraries (standard provisions, boilerplate language)
  - Local form templates (court-specific approved forms)
- **Document Assembly**
  - Guided interview process for document generation
  - Conditional logic (if-then based on client answers)
  - Auto-population from case data (client name, case number, dates)
  - Bulk document generation (form sets for new cases)
  - Version control with change tracking
- **E-Signature & Notarization**
  - E-signature platform integration (DocuSign, Adobe Sign)
  - Signature sequence ordering (client signs first, then attorney)
  - Automated reminders for unsigned documents
  - Executed document storage with metadata
  - Remote online notarization (RON) scheduling

#### 6. Client Intake & Relationship Management
- **Intake Workflows**
  - Practice-area-specific intake questionnaires
  - Conflict information gathering (all potentially adverse parties)
  - Case evaluation scoring (merit, damages, collectibility, jurisdiction)
  - Engagement likelihood assessment
  - Referral source tracking (for marketing ROI)
- **Client Verification**
  - Identity verification requirements
  - Sanctions list checking (OFAC for certain practice areas)
  - Adverse media screening
  - PEP (politically exposed person) identification for estate planning
- **Engagement Process**
  - Engagement letter generation with fee terms
  - Fee agreement execution and storage
  - Retainer invoice generation and payment tracking
  - Client portal access provisioning
  - Welcome packet delivery (what to expect guide)

#### 7. Litigation Support
- **Discovery Management**
  - Interrogatory drafting and tracking
  - Request for Production management
  - Request for Admission workflows
  - Deposition scheduling and preparation
  - Discovery response calendaring
- **Pleading Tracker**
  - Complaint filing tracking
  - Answer/Response deadline management
  - Amended pleading version control
  - Motion practice tracking (filed, briefed, argued, decided)
- **Trial Preparation**
  - Trial notebook organization
  - Exhibit management and numbering
  - Witness list and contact information
  - Jury instruction drafts
  - Trial timeline and presentation order

#### 8. Compliance & Risk Management
- **CLE (Continuing Legal Education) Tracking**
  - Credit requirements by jurisdiction and attorney
  - Credit category requirements (ethics, elimination of bias, substance abuse, competency)
  - Course approval verification
  - Expiration date tracking and alerts
  - Certificate storage and retrieval
- **Malpractice Prevention**
  - Claims-made policy tracking
  - Incident reporting workflow (near misses, potential claims)
  - Claim response coordination with carrier
  - Premium allocation analysis by practice area risk
  - Loss run analysis and trends
- **Ethics & Bar Compliance**
  - Confidentiality safeguards (data encryption, secure communications, access controls)
  - Conflict wall maintenance documentation
  - Advertising review requirements (some states require pre-approval of ads)
  - Fee reasonableness documentation (especially for contingency and high hourly cases)
  - File retention and destruction policies (varies by state and practice area)

## API Endpoint Mappings

### Existing APIs (Can be reused)
```
GET    /api/clients                       - List clients
POST   /api/clients                       - Create client
GET    /api/clients/:id                   - Get client details
PUT    /api/clients/:id                   - Update client
GET    /api/cases                         - List cases/matters
POST   /api/cases                         - Create case/matter
GET    /api/cases/:id                     - Get case details
PUT    /api/cases/:id                     - Update case
GET    /api/time-entries                  - List time entries
POST   /api/time-entries                  - Log time
GET    /api/invoices                      - List invoices
POST   /api/invoices                      - Create invoice
GET    /api/documents                     - List documents
POST   /api/documents                     - Upload document
GET    /api/calendar/events               - List calendar events
POST   /api/calendar/events               - Create calendar event
GET    /api/analytics/overview            - Dashboard analytics
```

### New APIs Required for Legal Industry

| Method | Endpoint | Description | Priority |
|--------|----------|-------------|----------|
| **Case/Matter Management APIs** |
| GET | `/api/cases/by-practice-area` | Get cases grouped by practice area | P0 |
| PUT | `/api/cases/:id/stage` | Update case stage/milestone | P0 |
| POST | `/api/cases/:id/closing` | Initiate case closing workflow | P0 |
| GET | `/api/cases/conflicts-checks` | Get pending conflicts checks | P0 |
| POST | `/api/cases/conflicts-checks` | Run conflicts check for new matter | P0 |
| PUT | `/api/cases/conflicts-checks/:id/clear` | Clear conflicts check | P0 |
| GET | `/api/cases/:id/parties` | Get case parties (plaintiff, defendant, etc.) | P0 |
| POST | `/api/cases/:id/parties` | Add party to case | P0 |
| GET | `/api/cases/win-rate` | Calculate win rate by practice area | P0 |
| **Time & Billing APIs** |
| GET | `/api/billing/monthly-summary` | Get monthly time and billing summary | P0 |
| GET | `/api/billing/wip` | Get work in progress (unbilled time/expenses) | P0 |
| GET | `/api/billing/write-offs` | Get write-off requests pending | P0 |
| POST | `/api/billing/write-offs/:id/approve` | Approve write-off | P0 |
| POST | `/api/billing/write-offs/:id/reject` | Reject write-off with reason | P0 |
| GET | `/api/billing/realization-rate` | Calculate realization rate | P0 |
| GET | `/api/billing/collection-rate` | Calculate collection rate | P0 |
| POST | `/api/billing/timesheets/submit` | Submit timesheet for approval | P0 |
| POST | `/api/billing/timesheets/approve` | Approve timesheet | P0 |
| GET | `/api/billing/rates/by-role` | Get billing rates by attorney role | P0 |
| PUT | `/api/billing/rates` | Update billing rates | P0 |
| **Trust Accounting APIs** |
| GET | `/api/trust/accounts` | List all trust accounts (IOLTA and non-IOLTA) | P0 |
| GET | `/api/trust/:account/balance` | Get trust account current balance | P0 |
| GET | `/api/trust/:client/ledger` | Get client trust ledger with transactions | P0 |
| POST | `/api/trust/receipts` | Record trust receipt (deposit) | P0 |
| POST | `/api/trust/disbursements` | Record trust disbursement (payment from trust) | P0 |
| POST | `/api/trust/transfers` | Transfer funds from trust to operating (earned fees) | P0 |
| GET | `/api/trust/reconciliation` | Generate three-way reconciliation report | P0 |
| GET | `/api/trust/negative-balance-alerts` | Get clients with negative trust balances | P0 |
| POST | `/api/trust/refunds` | Process trust refund to client | P0 |
| GET | `/api/trust/escheatment-due` | Get unclaimed property due for escheatment | P1 |
| **Court Calendar APIs** |
| GET | `/api/calendar/court-appearances` | Get scheduled court appearances | P0 |
| POST | `/api/calendar/court-appearances` | Add court appearance to calendar | P0 |
| GET | `/api/calendar/deadlines` | Get case-related deadlines | P0 |
| POST | `/api/calendar/deadlines/calculate` | Calculate deadline based on court rules | P0 |
| PUT | `/api/calendar/deadlines/:id/complete` | Mark deadline as completed | P0 |
| GET | `/api/calendar/statute-limitations` | Get statute of limitations alerts | P0 |
| GET | `/api/calendar/judge-standing-orders` | Get judge-specific standing orders | P1 |
| POST | `/api/calendar/e-file` | E-file document with court system | P1 |
| **Document Management APIs** |
| GET | `/api/documents/templates/by-practice-area` | List templates by practice area | P0 |
| POST | `/api/documents/templates` | Create document template | P0 |
| GET | `/api/documents/templates/:id/generate` | Generate document from template with merge fields | P0 |
| POST | `/api/documents/:id/send-for-signature` | Send document for e-signature | P0 |
| GET | `/api/documents/pending-signatures` | Get documents awaiting signatures | P0 |
| GET | `/api/documents/executed` | Get fully executed documents | P0 |
| PUT | `/api/documents/:id/version` | Create new version of document | P0 |
| GET | `/api/documents/filing-deadlines` | Get upcoming document filing deadlines | P0 |
| POST | `/api/documents/notarization/schedule` | Schedule notarization appointment | P1 |
| **Client Intake APIs** |
| POST | `/api/intake/questionnaire/submit` | Submit client intake questionnaire | P0 |
| GET | `/api/intake/questionnaires/:id/review` | Get intake form for attorney review | P0 |
| POST | `/api/intake/questionnaires/:id/accept` | Accept case and create matter | P0 |
| POST | `/api/intake/questionnaires/:id/decline` | Decline matter with reason code | P0 |
| POST | `/api/intake/engagement-letter/generate` | Generate engagement letter | P0 |
| POST | `/api/intake/retainer-invoice/generate` | Generate retainer invoice | P0 |
| POST | `/api/intake/conflicts-initial` | Run initial conflicts check on prospective client | P0 |
| **Litigation Support APIs** |
| GET | `/api/litigation/discovery/deadlines` | Get discovery-related deadlines | P0 |
| POST | `/api/litigation/discovery/requests` | Create discovery request set | P0 |
| GET | `/api/litigation/depositions/scheduled` | Get scheduled depositions | P0 |
| POST | `/api/litigation/depositions/schedule` | Schedule deposition | P0 |
| GET | `/api/litigation/motions/pending` | Get pending motions status | P0 |
| POST | `/api/litigation/pleadings/file` | File pleading with court | P0 |
| GET | `/api/litigation/exhibits/list` | List trial exhibits | P1 |
| **Compliance APIs** |
| GET | `/api/compliance/cle/status` | Get CLE credit status by attorney | P0 |
| POST | `/api/compliance/cle/credits` | Record CLE credits earned | P0 |
| GET | `/api/compliance/cle/expiring-soon` | Get CLE credits expiring soon | P1 |
| GET | `/api/compliance/malpractice/claims` | List malpractice claims/incidents | P1 |
| POST | `/api/compliance/incident-report` | File incident report | P0 |
| GET | `/api/compliance/bar-dues/status` | Get bar dues status by attorney | P1 |
| POST | `/api/compliance/bar-dues/pay` | Record bar dues payment | P0 |
| GET | `/api/compliance/file-retention/due` | Get files due for destruction | P1 |
| **Reporting APIs** |
| GET | `/api/reports/attorney-utilization` | Generate attorney utilization report | P0 |
| GET | `/api/reports/case-profitability` | Analyze case profitability | P1 |
| GET | `/api/reports/practice-area-comparison` | Compare practice area performance | P0 |
| GET | `/api/reports/client-lifetime-value` | Calculate client lifetime value | P1 |
| GET | `/api/reports/wip-aging` | Generate WIP aging report | P0 |
| GET | `/api/reports/ar-aging` | Generate accounts receivable aging | P0 |
| GET | `/api/reports/trust-account-summary` | Generate trust account summary | P0 |
| GET | `/api/reports/case-outcomes` | Analyze case outcomes by practice area | P1 |

**Total New APIs for Legal: 14 endpoints**

---

**Implementation Notes:**
- Build matter-centric architecture with cases, clients, time, and documents tightly linked
- Implement comprehensive conflicts checking against all parties in all matters
- Create full trust accounting system with three-way reconciliation capability
- Build court rule engine for deadline calculation (business days, holidays, tolling)
- Implement e-signature workflow for engagement letters, settlements, and court forms
- Create document assembly system with guided interviews and conditional logic
- Build CLE tracking with jurisdiction-specific credit requirements
- Implement matter stage workflows with required checklist completion
- Support all fee arrangements (hourly, flat, contingency, retainer, hybrid)
- Create write-off approval workflow with reason code analysis
- Build client intake system with scoring and automated acceptance/decline workflows
- Implement statute of limitations tracker with hard deadline alerts
- Support ethical wall configurations for conflict isolation within firm
- Create IOLTA reconciliation reports for annual bar compliance filings
- Build trial preparation module with exhibit and witness management
- Integrate with court e-filing systems where available
- Implement deposition scheduling with preparation checklist
- Create settlement tracking for contingency cases (demands, negotiations, releases)

---

## Batch 5 Summary

**Industries Completed in Batch 5:**
1. ✅ Travel & Tourism (24 new APIs)
2. ✅ Nonprofit & Foundation (22 new APIs)
3. ✅ Wellness & Spa (20 new APIs)
4. ✅ Grocery & Supermarket (18 new APIs)
5. ✅ Kitchen/KDS (15 new APIs)
6. ✅ Wholesale & Distribution (16 new APIs)
7. ✅ Marketplace Platform (18 new APIs)
8. ✅ Creative Agency (16 new APIs)
9. ✅ Professional Services (14 new APIs)
10. ✅ Legal & Law Firm (14 new APIs)

**Total New APIs for Batch 5: 177 endpoints**

**Grand Total Across All Batches:**
- Batch 1: 80 APIs (Fashion, Restaurant, Retail)
- Batch 2: 78 APIs (Real Estate, Healthcare, Beauty)
- Batch 3: 83 APIs (Events, Nightlife, Automotive)
- Batch 4: 80 APIs (SaaS, Education, Blog)
- **Batch 5: 177 APIs (10 industries)**

**TOTAL: 498 new API endpoints specified across all 22 industries**

All 22 industry design specifications are now complete with comprehensive visual layouts, design categories, component hierarchies, theme presets, settings expansions, and API endpoint mappings.
