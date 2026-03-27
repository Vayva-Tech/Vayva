# Merchant Grant System Audit

**Audit Date:** March 26, 2026  
**Auditor:** Vayva AI Agent  
**Scope:** Complete grant management system gap analysis for nonprofit merchants  
**Status:** 🔴 CRITICAL GAPS IDENTIFIED

---

## Executive Summary

This audit reveals **critical architectural mismatches** between the frontend merchant grant UI, backend API implementations, and database schema. The system has **three incompatible grant models** causing data inconsistency, broken functionality, and production readiness risks.

### Critical Findings

1. **Schema Mismatch:** Backend APIs expect `nonprofitGrant` and `nonprofitGrantApplication` models that **DO NOT EXIST** in Prisma schema
2. **UI-Service Disconnect:** Frontend grants page uses simplified service methods that don't match backend API capabilities
3. **Missing Application Tracking:** No support for grant applications, deadlines, or multi-application workflow
4. **Incomplete Financial Tracking:** Grant expense tracking exists but not integrated with UI
5. **No Discovery Mechanism:** Missing external grant opportunities database/discovery feature

**Impact:** System is **NOT PRODUCTION READY** for nonprofit grant management

---

## 1. Architecture Overview

### Current State Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Merchant)                       │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  Grants Page (dashboard/nonprofit/grants/page.tsx)   │   │
│  │  - Basic CRUD operations                             │   │
│  │  - Simple status tracking                            │   │
│  │  - Manual grant entry only                           │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│            apiJson("/api/nonprofit/grants")                  │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  NonprofitService (src/services/nonprofit.service.ts)│   │
│  │  - Uses prisma.grant (simple model)                  │   │
│  │  - Missing application tracking                      │   │
│  │  - Limited filtering/sorting                         │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
          (Mismatch - Different API Contract)
                          ↓
┌─────────────────────────────────────────────────────────────┐
│                 BACKEND (core-api)                           │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /api/nonprofit/grants/route.ts                      │   │
│  │  - Expects prisma.nonprofitGrant                     │   │
│  │  - Advanced filtering & pagination                   │   │
│  │  - Application metrics calculation                   │   │
│  │  - Success rate analytics                            │   │
│  └──────────────────────────────────────────────────────┘   │
│                          ↓                                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │  /api/nonprofit/grants/applications/route.ts         │   │
│  │  - Grant application management                      │   │
│  │  - Budget breakdowns                                 │   │
│  │  - Team member tracking                              │   │
│  │  - Deadline enforcement                              │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                          ↓
          (Runtime Error - Model Not Found)
                          ↓
┌─────────────────────────────────────────────────────────────┐
│              DATABASE SCHEMA (prisma/schema.prisma)          │
│  ❌ model NonprofitGrant - DOES NOT EXIST                   │
│  ❌ model NonprofitGrantApplication - DOES NOT EXIST        │
│  ✅ model Grant - EXISTS (simplified)                        │
│  ✅ model GrantExpense - EXISTS                              │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. Database Schema Gaps

### 2.1 Missing Core Models

**Backend Expects:**
```prisma
model NonprofitGrant {
  id                      String   @id @default(uuid())
  storeId                 String
  title                   String
  funder                  String
  description             String
  requestedAmount         Decimal
  duration                Int      // months
  deadline                DateTime
  website                 String?
  contactName             String?
  contactEmail            String?
  contactPhone            String?
  eligibilityRequirements Json?
  requiredDocuments       Json?
  evaluationCriteria      Json?
  notes                   String?
  status                  String   // draft, submitted, under_review, funded, rejected, closed
  applications            NonprofitGrantApplication[]
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt
  
  @@index([storeId, status])
  @@map("nonprofit_grants")
}

model NonprofitGrantApplication {
  id                    String   @id @default(uuid())
  storeId               String
  grantId               String
  projectName           String
  projectDescription    String
  requestedAmount       Decimal
  startDate             DateTime
  endDate               DateTime
  teamMembers           Json     // [{name, role, qualifications}]
  budgetBreakdown       Json     // [{category, amount, description}]
  expectedOutcomes      Json     // [string]
  sustainabilityPlan    String?
  supportingDocuments   Json     // [string URLs]
  notes                 String?
  status                String   // draft, submitted, under_review, awarded, rejected
  submittedAt           DateTime?
  reviewedAt            DateTime?
  awardedAmount         Decimal?
  feedback              String?
  grant                 NonprofitGrant @relation(fields: [grantId], references: [id])
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
  
  @@index([storeId, grantId])
  @@index([storeId, status])
  @@map("nonprofit_grant_applications")
}
```

**What Actually Exists:**
```prisma
model Grant {
  id                String   @id @default(uuid())
  storeId           String
  name              String
  funder            String
  amount            Decimal
  currency          String   @default("USD")
  startDate         DateTime
  endDate           DateTime
  status            String   @default("pending")
  requirements      String?
  restrictions      String?
  reportingSchedule String?
  fundsAllocated    Decimal  @default(0)
  fundsSpent        Decimal  @default(0)
  documents         Json?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt

  @@index([storeId, status])
  @@map("grants")
}

model GrantExpense {
  id          String   @id @default(uuid())
  grantId     String
  category    String
  description String
  amount      Decimal
  receiptUrl  String?
  date        DateTime
  approvedBy  String?
  status      String   @default("pending")
  createdAt   DateTime @default(now())

  @@index([grantId])
  @@map("grant_expenses")
}
```

**Gap Analysis:**
- ❌ No application tracking (one-to-many relationship missing)
- ❌ No deadline management
- ❌ No contact information storage
- ❌ No eligibility requirements structure
- ❌ No evaluation criteria
- ❌ No review workflow (submittedAt, reviewedAt, feedback)
- ❌ No awarded amount tracking (separate from requested)
- ❌ No team member assignment
- ❌ No budget breakdown capability
- ❌ No expected outcomes tracking

**Priority:** 🔴 CRITICAL  
**Effort:** High (requires schema migration + data migration)

---

## 3. Frontend UI Gaps

### 3.1 Current UI Limitations

**What Exists:**
- ✅ Basic grant list view
- ✅ Add/Edit grant dialog
- ✅ Status badges (draft, applied, approved, rejected, active, completed, reporting)
- ✅ Simple stats cards (total grants, total amount, active count)
- ✅ Delete confirmation

**What's Missing:**
- ❌ Grant application creation wizard
- ❌ Deadline countdown/timeline
- ❌ Funder contact information display
- ❌ Eligibility requirements checklist
- ❌ Required documents upload/management
- ❌ Evaluation criteria scoring
- ❌ Application submission workflow
- ❌ Review status tracking
- ❌ Feedback/rejection reason display
- ❌ Awarded vs requested amount comparison
- ❌ Success rate analytics
- ❌ Days until deadline calculation
- ❌ Grant recommendations
- ❌ Reporting schedule calendar
- ❌ Fund allocation vs spending tracking
- ❌ Expense categorization
- ❌ Receipt attachment
- ❌ Multi-year grant tracking
- ❌ Renewal reminders

### 3.2 Missing UI Components

```typescript
// REQUIRED components for production-ready grant management:
- GrantOpportunityCard (for discovery)
- ApplicationWizard (multi-step form)
- DeadlineTracker (countdown + alerts)
- FunderDirectory (searchable database)
- DocumentUploader (with validation)
- BudgetBuilder (interactive breakdown)
- TeamAssignmentForm
- OutcomeTracker (metrics dashboard)
- ReportingCalendar (schedule visualization)
- ExpenseTracker (categorized spending)
- SuccessRateDashboard (analytics)
- GrantRecommendationEngine (AI-powered)
```

**Priority:** 🟡 HIGH  
**Effort:** 2-3 weeks

---

## 4. Backend API Gaps

### 4.1 API Route Incompatibility

**Frontend Calls:**
```typescript
// Frontend/merchant/src/app/api/nonprofit/grants/route.ts
GET  /api/nonprofit/grants?storeId=xxx&status=xxx
POST /api/nonprofit/grants
PATCH /api/nonprofit/grants?id=xxx (approve only)
DELETE /api/nonprofit/grants/:id
```

**Backend Expects:**
```typescript
// Backend/core-api/src/app/api/nonprofit/grants/route.ts
GET  /api/nonprofit/grants?page=1&limit=20&status=xxx&funder=xxx&minAmount=xxx&maxAmount=xxx&deadlineFrom=xxx&deadlineTo=xxx
POST /api/nonprofit/grants (complex schema with contacts, eligibility, documents)

// Backend/core-api/src/app/api/nonprofit/grants/applications/route.ts
GET  /api/nonprofit/grants/applications?page=1&limit=20&status=xxx&grantId=xxx
POST /api/nonprofit/grants/applications (application creation with team, budget, outcomes)
```

**Mismatch Issues:**
1. Frontend doesn't support pagination
2. Missing advanced filtering (funder, amount range, deadline range)
3. No application endpoint in frontend
4. Simplified POST body (missing contacts, eligibility, documents)
5. No success rate calculation in frontend service
6. No days-until-deadline computation

### 4.2 Service Layer Gaps

**Frontend Service (src/services/nonprofit.service.ts):**
```typescript
async getGrants(storeId: string, filters?: { status?: GrantStatus }): Promise<Grant[]>
async createGrant(data: CreateGrantInput): Promise<Grant>
async approveGrant(id: string, storeId: string): Promise<Grant>
async getGrantExpenses(storeId: string, grantId: string): Promise<GrantExpense[]>
async createGrantExpense(storeId: string, data: CreateGrantExpenseInput): Promise<GrantExpense>
```

**Missing Service Methods:**
```typescript
// CRITICAL missing methods:
- async getGrantApplications(grantId: string): Promise<GrantApplication[]>
- async createGrantApplication(application: CreateApplicationInput): Promise<GrantApplication>
- async submitApplication(id: string): Promise<void>
- async updateApplicationStatus(id: string, status: string, feedback?: string): Promise<void>
- async getUpcomingDeadlines(daysAhead: number): Promise<Grant[]>
- async getSuccessRateAnalytics(): Promise<SuccessRateMetrics>
- async getFunderDirectory(filters: FunderFilters): Promise<Funder[]>
- async getGrantRecommendations(): Promise<GrantRecommendation[]>
- async trackReportingDeadline(grantId: string): Promise<ReportingDeadline>
- async calculateDaysUntilDeadline(grantId: string): Promise<number>
```

**Priority:** 🔴 CRITICAL  
**Effort:** 1-2 weeks

---

## 5. Missing Features

### 5.1 Grant Discovery & Opportunities

**Finding:** No mechanism to discover external grant opportunities.

**What's Needed:**
```typescript
interface GrantOpportunity {
  id: string;
  title: string;
  funder: string;
  description: string;
  requestedAmount: number;
  deadline: DateTime;
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  website: string;
  contactInfo: ContactInfo;
  matchScore: number; // AI-powered relevance scoring
  tags: string[];
  sourceUrl: string;
  lastUpdated: DateTime;
}

// Required API endpoints:
GET /api/grants/opportunities/search?q=education&amount=50000-100000&deadline=2026-Q2
GET /api/grants/opportunities/recommended
POST /api/grants/opportunities/:id/save
```

**Priority:** 🟠 MEDIUM  
**Effort:** 2-3 weeks (includes web scraping/integration with grant databases)

---

### 5.2 Application Workflow Management

**Finding:** No support for multi-stage application process.

**Required Workflow:**
```
Research → Draft → Internal Review → Submitted → Under Review → 
(Awarded | Rejected) → Active → Reporting → Completed
```

**Missing Features:**
- Application versioning (track changes over time)
- Collaboration tools (multiple team members)
- Review comments/feedback threads
- Submission confirmation
- Deadline reminders (email/SMS)
- Extension request handling

**Priority:** 🟡 HIGH  
**Effort:** 1-2 weeks

---

### 5.3 Financial Tracking & Compliance

**Finding:** Basic expense tracking exists but lacks depth.

**Missing Capabilities:**
- Budget vs actual variance analysis
- Restricted fund tracking (use limitations)
- Indirect cost calculation
- Multi-year budget tracking
- Financial reporting automation
- Audit trail for expenses
- Receipt OCR/scanning
- Integration with accounting software (QuickBooks, Xero)

**Priority:** 🟡 HIGH  
**Effort:** 2-3 weeks

---

### 5.4 Reporting & Analytics

**Finding:** Minimal analytics despite backend reporting endpoint existence.

**Missing Dashboards:**
```typescript
interface GrantAnalytics {
  // Pipeline Metrics
  totalPipelineValue: number;
  averageGrantSize: number;
  conversionRate: number; // submitted → awarded
  averageTimeToAward: number; // days
  
  // Success Metrics
  successRateByFunder: Map<string, number>;
  successRateByCategory: Map<string, number>;
  rejectionReasons: Array<{reason: string; count: number}>;
  
  // Financial Metrics
  fundsReceived: number;
  fundsPending: number;
  fundsSpent: number;
  burnRate: number; // monthly spend rate
  
  // Operational Metrics
  applicationsPerMonth: number;
  averageApplicationQuality: number; // score 1-100
  deadlineComplianceRate: number; // % submitted on time
}
```

**Priority:** 🟠 MEDIUM  
**Effort:** 1-2 weeks

---

### 5.5 Deadline & Reminder System

**Finding:** No automated reminder system.

**Required Reminders:**
- ⏰ Grant deadline approaching (14 days, 7 days, 2 days, 1 day)
- ⏰ Report due dates (30 days, 14 days, 7 days)
- ⏰ Renewal deadlines
- ⏰ Mid-term check-ins
- ⏰ Final report deadlines

**Integration Needed:**
- Email notifications (Resend/SendGrid)
- SMS notifications (Twilio)
- In-app notifications (existing notification service)
- Calendar integration (Google Calendar, Outlook)

**Priority:** 🟡 HIGH  
**Effort:** 1 week

---

## 6. Security & Compliance Gaps

### 6.1 Permission Requirements

**Finding:** No granular permission checks for grant operations.

**Required Permissions:**
```typescript
enum GrantPermissions {
  GRANTS_VIEW = 'grants:view',
  GRANTS_CREATE = 'grants:create',
  GRANTS_EDIT = 'grants:edit',
  GRANTS_DELETE = 'grants:delete',
  GRANTS_SUBMIT = 'grants:submit',
  GRANTS_APPROVE = 'grants:approve',
  GRANTS_REJECT = 'grants:reject',
  GRANTS_EXPENSES_CREATE = 'grants:expenses:create',
  GRANTS_EXPENSES_APPROVE = 'grants:expenses:approve',
  GRANTS_REPORTS_VIEW = 'grants:reports:view',
  GRANTS_REPORTS_SUBMIT = 'grants:reports:submit',
}
```

**Priority:** 🟡 HIGH  
**Effort:** 2-3 days

---

### 6.2 Data Privacy Concerns

**Finding:** Sensitive funder contact information stored without encryption.

**Sensitive Data Requiring Encryption:**
- Funder contact emails
- Funder phone numbers
- Application feedback/rejection reasons
- Internal review notes
- Budget details (before public announcement)

**Priority:** 🟠 MEDIUM  
**Effort:** 3-5 days

---

## 7. Recommended Fixes

### Phase 1: Critical Schema & API Alignment (Week 1-2)

#### 7.1 Update Prisma Schema

**Action:** Add missing models to `infra/db/prisma/schema.prisma`:

```prisma
model NonprofitGrant {
  id                      String   @id @default(uuid())
  storeId                 String
  title                   String
  funder                  String
  description             String
  requestedAmount         Decimal
  duration                Int
  deadline                DateTime
  website                 String?
  contactName             String?
  contactEmail            String?
  contactPhone            String?
  eligibilityRequirements Json?    @default("[]")
  requiredDocuments       Json?    @default("[]")
  evaluationCriteria      Json?    @default("[]")
  notes                   String?
  status                  String   @default("draft")
  applications            NonprofitGrantApplication[]
  createdAt               DateTime @default(now())
  updatedAt               DateTime @updatedAt

  store Store @relation(fields: [storeId], references: [id], onDelete: Cascade)

  @@index([storeId, status])
  @@index([storeId, deadline])
  @@map("nonprofit_grants")
}

model NonprofitGrantApplication {
  id                    String   @id @default(uuid())
  storeId               String
  grantId               String
  projectName           String
  projectDescription    String
  requestedAmount       Decimal
  startDate             DateTime
  endDate               DateTime
  teamMembers           Json     @default("[]")
  budgetBreakdown       Json     @default("[]")
  expectedOutcomes      Json     @default("[]")
  sustainabilityPlan    String?
  supportingDocuments   Json     @default("[]")
  notes                 String?
  status                String   @default("draft")
  submittedAt           DateTime?
  reviewedAt            DateTime?
  awardedAmount         Decimal?
  feedback              String?
  grant                 NonprofitGrant @relation(fields: [grantId], references: [id], onDelete: Cascade)
  expenses              GrantExpense[]
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt

  @@index([storeId, grantId])
  @@index([storeId, status])
  @@index([grantId])
  @@map("nonprofit_grant_applications")
}
```

**Migration Steps:**
1. Add models to schema
2. Create migration: `pnpm dlx prisma migrate dev --name add_nonprofit_grant_models`
3. Backfill existing `Grant` data if needed
4. Update relationships with `GrantExpense`

#### 7.2 Align Frontend API with Backend

**Action:** Update `Frontend/merchant/src/app/api/nonprofit/grants/route.ts`:

```typescript
// Add pagination support
const page = parseInt(searchParams.get('page') || '1');
const limit = parseInt(searchParams.get('limit') || '20');
const skip = (page - 1) * limit;

// Add advanced filtering
const status = searchParams.get('status');
const funder = searchParams.get('funder');
const minAmount = searchParams.get('minAmount');
const maxAmount = searchParams.get('maxAmount');

// Include applications in response
const grants = await prisma.nonprofitGrant.findMany({
  where: { storeId, /* filters */ },
  include: {
    applications: {
      select: {
        id: true,
        status: true,
        submittedAt: true,
        awardedAmount: true,
      }
    }
  },
  skip,
  take: limit,
});

// Calculate metrics
const grantsWithMetrics = grants.map(grant => ({
  ...grant,
  applicationCount: grant.applications.length,
  awardedApplications: grant.applications.filter(a => a.status === 'awarded').length,
  totalAwarded: grant.applications.reduce((sum, app) => sum + (Number(app.awardedAmount) || 0), 0),
  successRate: grant.applications.length > 0 
    ? Math.round((grant.applications.filter(a => a.status === 'awarded').length / grant.applications.length) * 10000) / 100
    : 0,
  daysUntilDeadline: Math.ceil((new Date(grant.deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24)),
}));

return NextResponse.json({
  data: grantsWithMetrics,
  meta: {
    total: await prisma.nonprofitGrant.count({ where: { storeId } }),
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  }
});
```

**Files to Update:**
- `Frontend/merchant/src/app/api/nonprofit/grants/route.ts`
- `Frontend/merchant/src/app/api/nonprofit/grants/[id]/route.ts` (create new)
- `Frontend/merchant/src/app/api/nonprofit/grants/applications/route.ts` (create new)

#### 7.3 Update Service Layer

**Action:** Enhance `Frontend/merchant/src/services/nonprofit.service.ts`:

```typescript
export class NonprofitService {
  // ===== GRANT APPLICATIONS =====
  
  async getGrantApplications(storeId: string, grantId: string): Promise<GrantApplication[]> {
    const apps = await prisma.nonprofitGrantApplication.findMany({
      where: { storeId, grantId },
      include: { grant: { select: { title: true, funder: true } } },
      orderBy: { createdAt: 'desc' },
    });
    
    return apps.map(app => ({
      ...app,
      teamMembers: JSON.parse(app.teamMembers || '[]'),
      budgetBreakdown: JSON.parse(app.budgetBreakdown || '[]'),
      expectedOutcomes: JSON.parse(app.expectedOutcomes || '[]'),
      supportingDocuments: JSON.parse(app.supportingDocuments || '[]'),
    }));
  }
  
  async createApplication(data: CreateApplicationInput): Promise<GrantApplication> {
    const app = await prisma.nonprofitGrantApplication.create({
      data: {
        storeId: data.storeId,
        grantId: data.grantId,
        projectName: data.projectName,
        projectDescription: data.projectDescription,
        requestedAmount: data.requestedAmount,
        startDate: data.startDate,
        endDate: data.endDate,
        teamMembers: JSON.stringify(data.teamMembers),
        budgetBreakdown: JSON.stringify(data.budgetBreakdown),
        expectedOutcomes: JSON.stringify(data.expectedOutcomes),
        sustainabilityPlan: data.sustainabilityPlan,
        supportingDocuments: JSON.stringify(data.supportingDocuments),
        status: 'draft',
      },
      include: { grant: true },
    });
    
    return {
      ...app,
      teamMembers: JSON.parse(app.teamMembers),
      budgetBreakdown: JSON.parse(app.budgetBreakdown),
      expectedOutcomes: JSON.parse(app.expectedOutcomes),
      supportingDocuments: JSON.parse(app.supportingDocuments),
    };
  }
  
  async submitApplication(id: string, storeId: string): Promise<void> {
    await prisma.nonprofitGrantApplication.update({
      where: { id, storeId },
      data: { 
        status: 'submitted',
        submittedAt: new Date(),
      },
    });
  }
  
  // ===== DEADLINE TRACKING =====
  
  async getUpcomingDeadlines(storeId: string, daysAhead: number = 30): Promise<NonprofitGrant[]> {
    const cutoff = new Date(Date.now() + daysAhead * 24 * 60 * 60 * 1000);
    return prisma.nonprofitGrant.findMany({
      where: {
        storeId,
        deadline: {
          lte: cutoff,
          gte: new Date(),
        },
        status: {
          in: ['draft', 'submitted', 'under_review'],
        },
      },
      orderBy: { deadline: 'asc' },
    });
  }
  
  async calculateDaysUntilDeadline(grantId: string, storeId: string): Promise<number> {
    const grant = await prisma.nonprofitGrant.findFirst({
      where: { id, storeId },
      select: { deadline: true },
    });
    
    if (!grant) throw new Error('Grant not found');
    
    return Math.ceil((grant.deadline.getTime() - Date.now()) / (1000 * 60 * 60 * 24));
  }
  
  // ===== ANALYTICS =====
  
  async getSuccessRateAnalytics(storeId: string): Promise<SuccessRateMetrics> {
    const allGrants = await prisma.nonprofitGrant.findMany({
      where: { storeId },
      include: {
        applications: {
          select: { status: true, awardedAmount: true },
        },
      },
    });
    
    const totalApplications = allGrants.reduce((sum, g) => sum + g.applications.length, 0);
    const awardedApplications = allGrants.reduce(
      (sum, g) => sum + g.applications.filter(a => a.status === 'awarded').length,
      0
    );
    const totalAwarded = allGrants.reduce(
      (sum, g) => sum + g.applications.reduce((s, a) => s + (Number(a.awardedAmount) || 0), 0),
      0
    );
    
    return {
      totalApplications,
      awardedApplications,
      totalAwarded,
      successRate: totalApplications > 0 
        ? Math.round((awardedApplications / totalApplications) * 10000) / 100
        : 0,
    };
  }
}
```

---

### Phase 2: UI Enhancement (Week 3-4)

#### 7.4 Create Application Wizard Component

**New File:** `Frontend/merchant/src/components/grants/ApplicationWizard.tsx`

Features:
- Multi-step form (Project Info → Team → Budget → Outcomes → Review)
- Auto-save drafts
- Validation at each step
- Progress indicator
- Submit confirmation

#### 7.5 Enhance Grants Dashboard

**Update:** `Frontend/merchant/src/app/(dashboard)/dashboard/nonprofit/grants/page.tsx`

Add:
- Pagination controls
- Advanced filters (funder, amount range, deadline range)
- Sort options (deadline, amount, status)
- Quick stats (success rate, avg grant size, pipeline value)
- Deadline countdown badges
- "Apply Now" CTA for open grants

#### 7.6 Grant Detail Page

**New File:** `Frontend/merchant/src/app/(dashboard)/dashboard/nonprofit/grants/[id]/page.tsx`

Sections:
- Grant overview (title, funder, amount, deadline)
- Applications list (if multiple allowed)
- Contact information
- Eligibility requirements checklist
- Required documents
- Evaluation criteria
- Notes (private/internal)
- Activity timeline

#### 7.7 Application Detail Page

**New File:** `Frontend/merchant/src/app/(dashboard)/dashboard/nonprofit/applications/[id]/page.tsx`

Sections:
- Project summary
- Team members
- Budget breakdown (visual chart)
- Expected outcomes
- Supporting documents
- Submission status
- Feedback/review comments
- Edit/Draft/Submit actions

---

### Phase 3: Advanced Features (Week 5-6)

#### 7.8 Deadline Reminder System

**Integration:** Connect with notification service

```typescript
// Frontend/merchant/src/services/grant-reminders.service.ts
export async function scheduleDeadlineReminder(
  grantId: string,
  userId: string,
  daysBefore: number[]
): Promise<void> {
  // Create scheduled notifications for 14, 7, 2, 1 days before deadline
  for (const days of daysBefore) {
    await notificationService.schedule({
      type: 'grant_deadline_reminder',
      recipientId: userId,
      scheduledAt: new Date(Date.now() + days * 24 * 60 * 60 * 1000),
      data: { grantId, daysUntilDeadline: days },
    });
  }
}
```

#### 7.9 Funder Directory

**New Feature:** Searchable database of funders

API Endpoint:
```typescript
GET /api/nonprofit/funders?q=education&location=Nigeria
```

UI Component:
- Search by cause area, location, amount range
- Funder profiles (history, preferences, typical grant sizes)
- Saved funders list
- Match scoring

---

### Phase 4: Analytics & Reporting (Week 7-8)

#### 7.10 Grant Analytics Dashboard

**New Page:** `Frontend/merchant/src/app/(dashboard)/dashboard/nonprofit/grants/analytics/page.tsx`

Visualizations:
- Success rate trends over time
- Pipeline value by stage
- Amount awarded vs requested
- Top funders by success rate
- Average time to award
- Rejection reasons breakdown

#### 7.11 Financial Reports

**Feature:** Generate PDF reports for funders

```typescript
POST /api/nonprofit/grants/:id/report/generate
Body: { template: 'quarterly' | 'final' | 'custom', includeExpenses: true }
```

---

## 8. Testing Requirements

### Unit Tests Needed
- [ ] Grant application creation validation
- [ ] Deadline calculation logic
- [ ] Success rate analytics
- [ ] Budget breakdown calculations
- [ ] Eligibility matching algorithm

### Integration Tests Needed
- [ ] Full application submission workflow
- [ ] Notification delivery on deadlines
- [ ] Expense tracking and approval
- [ ] Report generation

### E2E Tests Needed
- [ ] Discover grant → Create application → Submit → Track → Report
- [ ] Multi-user collaboration on application
- [ ] Funder review and approval workflow

---

## 9. Migration Strategy

### Data Migration Plan

If migrating from existing `Grant` model:

```sql
-- Step 1: Preserve existing grants
CREATE TABLE grants_backup AS SELECT * FROM grants;

-- Step 2: Migrate to new schema (pseudo-code)
INSERT INTO nonprofit_grants (id, storeId, title, funder, description, requestedAmount, deadline, status, createdAt, updatedAt)
SELECT id, storeId, name, funder, requirements, amount, endDate, status, createdAt, updatedAt
FROM grants_backup;

-- Step 3: Update foreign keys in GrantExpense
ALTER TABLE grant_expenses DROP CONSTRAINT IF EXISTS grant_expenses_grantId_fkey;
ALTER TABLE grant_expenses ADD COLUMN nonprofitGrantApplicationId STRING;
-- Note: Requires manual mapping based on business logic
```

### Rollback Plan

If issues detected:
1. Revert database migration
2. Restore `grants_backup` table
3. Redirect API routes to old schema
4. Feature flag to disable new grant features

---

## 10. Production Readiness Checklist

### Before Launch
- [ ] All CRITICAL items fixed
- [ ] Schema migration tested in staging
- [ ] Data migration script validated
- [ ] API compatibility verified
- [ ] Frontend UI complete
- [ ] Permission checks implemented
- [ ] Notifications working
- [ ] Analytics dashboard functional
- [ ] Test coverage >80% for critical paths
- [ ] Performance testing passed (<500ms API responses)
- [ ] Security audit completed
- [ ] Accessibility audit (WCAG 2.1 AA)
- [ ] Documentation updated
- [ ] User training materials created

### Post-Launch Monitoring
- [ ] Error tracking enabled (Sentry)
- [ ] Performance monitoring (DataDog)
- [ ] User analytics configured
- [ ] Support ticket categories created
- [ ] Feedback collection mechanism ready

---

## 11. Cost Estimate

### Development Effort
- **Phase 1 (Critical):** 80-100 hours
- **Phase 2 (UI):** 120-150 hours
- **Phase 3 (Advanced):** 80-100 hours
- **Phase 4 (Analytics):** 60-80 hours
- **Testing & QA:** 40-60 hours
- **Documentation:** 20-30 hours

**Total:** 400-520 hours (~10-13 weeks for 1 developer)

### Infrastructure Costs
- Additional database storage: ~₦50,000/month
- Notification service (emails/SMS): ~₦100,000/month
- File storage (documents/receipts): ~₦30,000/month
- Analytics/monitoring tools: ~₦150,000/month

**Total Monthly:** ~₦330,000

---

## 12. Risk Assessment

### High-Risk Items
1. **Schema Migration:** Potential data loss or corruption
   - Mitigation: Comprehensive backup, staging testing, rollback plan
   
2. **API Incompatibility:** Existing integrations may break
   - Mitigation: Versioned APIs, gradual rollout, feature flags

3. **User Confusion:** Major UI changes may frustrate existing users
   - Mitigation: User testing, progressive disclosure, help documentation

### Medium-Risk Items
1. **Performance Degradation:** Complex queries may slow down
   - Mitigation: Query optimization, indexing, caching strategy

2. **Notification Overload:** Too many reminders may annoy users
   - Mitigation: Configurable notification preferences, digest mode

---

## Conclusion

The merchant grant management system requires **significant architectural changes** to achieve production readiness. The critical mismatch between backend API expectations and database schema must be resolved immediately. 

**Recommended Immediate Actions:**
1. ✅ Halt grant feature marketing until Phase 1 complete
2. ✅ Allocate dedicated developer resources (2-3 engineers)
3. ✅ Create project tracking board (Linear/Jira)
4. ✅ Daily standups during Phase 1 implementation
5. ✅ Weekly stakeholder updates on progress

**Timeline to Production:** 10-13 weeks (aggressive)  
**Minimum Viable Product:** End of Phase 2 (6-7 weeks)

---

**Document Version:** 1.0  
**Last Updated:** March 26, 2026  
**Next Review:** After Phase 1 completion  
**Owner:** Engineering Leadership
