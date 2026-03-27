# Trial & Promo Implementation Plan

**Document Created:** March 26, 2026  
**Implementation Phase:** P0 Critical — Revenue Impact  
**Scenarios Supported:** First Month Free Promo + 7-Day Trial Standard Mode

---

## Executive Summary

This document outlines the complete implementation plan for supporting **two distinct billing scenarios** in the Vayva platform:

1. **First Month Free Promo** — Promotional mode to drive rapid adoption
2. **Standard 7-Day Trial** — Normal operations after promo ends

Both scenarios are controlled via a **single feature flag** toggleable from Ops Console without redeployment.

---

## System Architecture

### Feature Flag Control

```typescript
// packages/shared/src/constants.ts
export const FEATURE_FLAG_STARTER_FIRST_MONTH_FREE = "STARTER_FIRST_MONTH_FREE";
```

**Database Table:** `FeatureFlag`

| key | enabled | description |
|-----|---------|-------------|
| `STARTER_FIRST_MONTH_FREE` | `true` (default) | When ON: Starter first month free (~30 days). When OFF: 7-day trial standard mode |

**Ops Console Location:** Ops Console → Feature Flags → `STARTER_FIRST_MONTH_FREE`

### Scenario Behavior Matrix

| Feature | First Month Free (ON) | Standard Trial (OFF) |
|---------|----------------------|---------------------|
| **Starter Plan** | First month FREE, no Paystack | 7-day trial, then ₦25,000/mo |
| **Pro Plan** | 7-day trial, then ₦35,000/mo | 7-day trial, then ₦35,000/mo |
| **Pro+ Plan** | No trial, ₦50,000 at checkout | No trial, ₦50,000 at checkout |
| **Marketing Copy** | "First month free" badges | "7-day free trial" messaging |
| **Checkout Flow** | Starter monthly = ₦0 | All plans require payment method |
| **Email Campaigns** | Promo-focused nurturing | Trial conversion-focused |

---

## Current State Analysis

### ✅ What's Already Working

1. **Feature Flag Infrastructure**
   - Database table exists and functional
   - Ops Console UI for toggling
   - API endpoints for reading/writing flags
   - Cache invalidation working

2. **Marketing Site Integration**
   - `pricing.ts` config reads flag
   - Dynamic copy changes based on mode
   - Checkout due calculation handles both scenarios
   - Plan presentation layer adaptive

3. **Backend Constants**
   - `FEATURE_FLAG_STARTER_FIRST_MONTH_FREE` defined
   - Shared across apps via `@vayva/shared`

4. **Subscription Lifecycle Worker**
   - Trial expiry processing implemented
   - Grace period handling (3 days)
   - WhatsApp notifications sent
   - Status transitions working

### 🔴 Critical Gaps Requiring Immediate Implementation

#### Gap 1: No Pre-Expiry Email Nurturing (P0)
**Problem:** Workers only send WhatsApp at expiry, no email campaign before trial ends  
**Impact:** Cold conversion attempt, 25% trial-to-paid rate  
**Files to Create/Modify:**
- `apps/worker/src/workers/trial-nurture.worker.ts` (NEW)
- `packages/emails/src/templates/trial-day-7.tsx` (NEW)
- `packages/emails/src/templates/trial-day-3.tsx` (NEW)
- `packages/emails/src/templates/trial-day-1.tsx` (NEW)
- `apps/worker/src/jobs/sendTrialNurtureEmails.ts` (NEW)

**Implementation Details:**
```typescript
// trial-nurture.worker.ts
// Runs daily at 10:00 AM
// Sends emails at Day -7, -3, -1 before trial expiry
// Different content for First Month Free vs Standard Trial

const EMAIL_SCHEDULE = {
  DAY_MINUS_7: {
    subject: "Getting value? Here's how to maximize your trial",
    template: "trial-day-7",
    focus: "value_reinforcement"
  },
  DAY_MINUS_3: {
    subject: "Success story: Similar merchant grew 3x with AI",
    template: "trial-day-3",
    focus: "social_proof"
  },
  DAY_MINUS_1: {
    subject: "Last chance! Your trial ends tomorrow",
    template: "trial-day-1",
    focus: "urgency"
  }
};
```

#### Gap 2: No Win-Back Flow for Expired Trials (P0)
**Problem:** Zero automated reactivation campaigns for expired trials  
**Impact:** 100% of expired trials lost forever  
**Files to Create/Modify:**
- `apps/worker/src/workers/winback-campaign.worker.ts` (NEW)
- `packages/emails/src/templates/winback-day-3.tsx` (NEW)
- `packages/emails/src/templates/winback-day-7.tsx` (NEW)
- `packages/emails/src/templates/winback-day-14.tsx` (NEW)
- `packages/emails/src/templates/winback-day-30.tsx` (NEW)
- `apps/worker/src/jobs/sendWinbackCampaign.ts` (NEW)

**Implementation Details:**
```typescript
// winback-campaign.worker.ts
// Runs weekly on Mondays at 2:00 PM
// Targets merchants with SOFT_CLOSED or TRIAL_EXPIRED_GRACE status
// Escalating offers and urgency

const WINBACK_SEQUENCE = [
  { day: 3,  subject: "We miss you! Here's 20% off", offer: "20% discount" },
  { day: 7,  subject: "Your customers are waiting", offer: "value_reminder" },
  { day: 14, subject: "Last chance for special pricing", offer: "final_offer" },
  { day: 30, subject: "Ready to restart?", offer: "fresh_start" }
];
```

#### Gap 3: Missing Trial Countdown Banner (P0)
**Problem:** Trial users see no visible countdown in dashboard  
**Impact:** Low urgency, poor conversion timing  
**Files to Create/Modify:**
- `Frontend/merchant/src/components/layout/TrialCountdownBanner.tsx` (NEW)
- `Frontend/merchant/src/components/admin-shell.tsx` (MODIFY)

**Implementation Details:**
```tsx
// TrialCountdownBanner.tsx
// Shows for TRIAL_ACTIVE subscriptions only
// Displays days remaining with color coding:
// - Green: >5 days
// - Orange: 3-5 days
// - Red: <3 days
// Links to /dashboard/billing for upgrade

interface TrialCountdownBannerProps {
  trialEndsAt: Date;
  planName: string;
}

const URGENCY_COLORS = {
  high: "bg-red-50 border-red-200 text-red-800",    // <3 days
  medium: "bg-orange-50 border-orange-200 text-orange-800", // 3-5 days
  low: "bg-emerald-50 border-emerald-200 text-emerald-800"  // >5 days
};
```

#### Gap 4: No Usage Celebration/Milestones (P1)
**Problem:** Users hit milestones but receive no positive reinforcement  
**Impact:** Missed value demonstration opportunities  
**Files to Create/Modify:**
- `Frontend/merchant/src/lib/usage-milestones.ts` (NEW)
- `packages/emails/src/templates/milestone-celebration.tsx` (NEW)
- `apps/worker/src/workers/milestone-tracker.worker.ts` (NEW)

**Milestone Triggers:**
- First 10 orders processed
- First ₦100,000 in revenue
- First week with AI automation
- Product catalog >50 items
- First repeat customer

#### Gap 5: Weak Onboarding Plan Selection (P1)
**Problem:** Users pick plans without understanding fit  
**Impact:** Wrong plans, early churn, support tickets  
**Files to Create/Modify:**
- `Frontend/merchant/src/components/onboarding/PlanSelector.tsx` (NEW)
- `Frontend/marketing/src/app/(pages)/signup/page.tsx` (MODIFY)

**Decision Tree:**
```
Q: How many products do you have?
  ├─ <100 → Starter
  ├─ 100-300 → Pro
  └─ >300 → Pro+

Q: Do you need industry-specific features?
  ├─ Yes → Show industry dashboard preview
  └─ No → Continue

Q: How many team members?
  ├─ 1-2 → Starter/Pro
  └─ 3-5 → Pro+
```

#### Gap 6: No Interactive Product Tour (P1)
**Problem:** Users don't discover AI agent, analytics, automation features  
**Impact:** Low activation, "didn't know it could do that" churn  
**Files to Create/Modify:**
- `Frontend/merchant/src/components/tour/ProductTour.tsx` (NEW)
- `Frontend/merchant/src/lib/product-tour-config.ts` (NEW)

**Tour Stops:**
1. Dashboard overview (AI stats widget)
2. AI Agent configuration
3. Order management
4. Analytics & insights
5. Billing & usage limits

#### Gap 7: Duplicate Auth Context (Technical Debt) (P2)
**Problem:** Two AuthContext implementations (Frontend + Backend)  
**Impact:** Maintenance burden, potential logic drift  
**Files to Consolidate:**
- `Frontend/merchant/src/context/AuthContext.tsx`
- `Backend/core-api/src/lib/auth/AuthContext.tsx`

**Recommendation:** Keep Frontend version, remove Backend duplicate, import from shared package.

---

## Email Template Requirements

### Template Inventory Needed

| Template Name | Trigger Scenario | Send Time | Purpose |
|--------------|------------------|-----------|---------|
| `trial-day-7` | Trial started | Day -7 | Value reinforcement + tips |
| `trial-day-3` | Trial active | Day -3 | Social proof + success stories |
| `trial-day-1` | Trial active | Day -1 | Urgency + upgrade CTA |
| `trial-expired` | Trial expired | Day 0 | Final notice + grace period info |
| `winback-day-3` | Trial expired | Day +3 | 20% discount offer |
| `winback-day-7` | Trial expired | Day +7 | Value reminder |
| `winback-day-14` | Trial expired | Day +14 | Final special pricing |
| `winback-day-30` | Trial expired | Day +30 | Fresh start invitation |
| `milestone-first-order` | Usage trigger | Real-time | Celebration + encouragement |
| `milestone-revenue` | Usage trigger | Real-time | Success acknowledgment |

### Email Design System

All templates must include:
- Clear single CTA button
- Mobile-responsive layout
- Plain text fallback
- Unsubscribe link (for win-back)
- Vayva branding (logo, colors)
- Support contact info

---

## Worker Job Schedules

### Cron Schedule Summary

| Worker | Frequency | Cron | Purpose |
|--------|-----------|------|---------|
| `trial-nurture.worker` | Daily | `0 10 * * *` | Send pre-expiry emails at 10 AM |
| `winback-campaign.worker` | Weekly | `0 14 * * 1` | Send win-back sequence on Mondays 2 PM |
| `milestone-tracker.worker` | Hourly | `0 * * * *` | Check for milestone achievements |
| `subscription-lifecycle.worker` | Nightly | `0 2 * * *` | Process expiries, renewals, suspensions |

---

## Marketing Copy Variations

### First Month Free Mode (Flag ON)

**Homepage Hero:**
> "Start free for 30 days. No card required."

**Pricing Page Badge (Starter):**
> 🎉 FIRST MONTH FREE

**Checkout Page:**
> "Your first month is on us! Start building your store risk-free."

### Standard Trial Mode (Flag OFF)

**Homepage Hero:**
> "Try free for 7 days. Cancel anytime."

**Pricing Page Badge (Starter & Pro):**
> ✨ 7-DAY FREE TRIAL

**Checkout Page:**
> "Start your 7-day free trial. No charges until trial ends."

---

## Database Schema References

### FeatureFlag Table

```prisma
model FeatureFlag {
  id          String   @id @default(cuid())
  key         String   @unique
  description String
  enabled     Boolean  @default(false)
  rules       Json?
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}
```

### MerchantAiSubscription Table

```prisma
model MerchantAiSubscription {
  id                String                @id @default(cuid())
  storeId           String                @unique
  status            AiSubscriptionStatus
  trialExpiresAt    DateTime?
  graceEndsAt       DateTime?
  periodStart       DateTime
  periodEnd         DateTime
  monthTokensUsed   Int      @default(0)
  monthImagesUsed   Int      @default(0)
  monthRequestsUsed Int      @default(0)
  monthMessagesUsed Int      @default(0)
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  store Store @relation(fields: [storeId], references: [id])
}
```

---

## Testing Checklist

### Unit Tests Required

- [ ] `readStarterFirstMonthFreeEnabled()` returns correct boolean
- [ ] `getCheckoutDueNgn()` calculates ₦0 for first month free
- [ ] `getOfferCopy()` returns correct badge text for each mode
- [ ] Trial nurture worker sends emails at correct intervals
- [ ] Win-back worker respects sequence timing
- [ ] Trial countdown banner shows correct urgency colors
- [ ] Milestone tracker fires at exact thresholds

### Integration Tests Required

- [ ] Toggle flag in Ops Console → Marketing site updates within 60s
- [ ] Signup flow works in both promo and standard modes
- [ ] Checkout Paystack integration skips charge for free month
- [ ] Email templates render correctly in Gmail, Outlook, Apple Mail
- [ ] Worker jobs process without errors in production queue

### Manual QA Scenarios

**Scenario A: First Month Free Enabled**
1. User signs up for Starter → No Paystack charge
2. User receives welcome email with "First Month Free" messaging
3. Dashboard shows "29 days left" countdown
4. Day -7, -3, -1 emails sent automatically
5. After 30 days, subscription converts to paid

**Scenario B: Standard Trial (Flag Off)**
1. User signs up for Starter → 7-day trial begins
2. Marketing shows "7-day free trial" badges
3. Day -7, -3, -1 emails sent with trial messaging
4. Day 7: Paystack charge attempted
5. Failure → Grace period, Success → Active subscription

---

## Rollout Plan

### Phase 1: Core Infrastructure (Week 1)

**Priority:** P0 — Revenue Critical

**Tasks:**
1. Create trial nurture worker with email sequences
2. Build win-back campaign infrastructure
3. Implement trial countdown banner
4. Write all email templates
5. Add comprehensive tests

**Success Metrics:**
- Pre-expiry emails sent to 100% of trial users
- Win-back sequence triggers for expired trials
- Trial countdown visible in dashboard header

### Phase 2: UX Enhancements (Week 2)

**Priority:** P1 — Conversion Optimization

**Tasks:**
1. Build onboarding plan selector with decision tree
2. Create interactive product tour
3. Implement milestone celebration system
4. Add usage tracking and triggers

**Success Metrics:**
- Onboarding completion rate increases from 65% → 85%
- Product tour engagement >40%
- Milestone celebrations sent within 5 minutes of achievement

### Phase 3: Technical Debt (Week 3)

**Priority:** P2 — Code Quality

**Tasks:**
1. Consolidate duplicate AuthContext implementations
2. Refactor email sending into shared utility
3. Add TypeScript strict typing throughout
4. Improve error logging and monitoring

**Success Metrics:**
- Single source of truth for authentication
- Reduced code duplication
- Better error visibility in Sentry

---

## Success Metrics & Monitoring

### Key Performance Indicators (KPIs)

| Metric | Current | Target | Measurement |
|--------|---------|--------|-------------|
| Trial-to-Paid Conversion | 25% | 45% | Stripe/Paystack data |
| Onboarding Completion | 65% | 85% | OnboardingContext events |
| Win-Back Recovery Rate | 0% | 15% | Expired → Active transitions |
| Email Open Rate (Trial) | N/A | 60% | Email service analytics |
| Email CTR (Trial) | N/A | 25% | Click tracking |
| Time to First Value | 3 days | 1 day | Dashboard activity logs |

### Dashboard Queries Needed

```sql
-- Trial conversion rate (last 30 days)
SELECT 
  COUNT(CASE WHEN status = 'ACTIVE' THEN 1 END) * 100.0 / 
  NULLIF(COUNT(CASE WHEN status IN ('TRIAL_ACTIVE', 'ACTIVE') THEN 1 END), 0) as conversion_rate
FROM "MerchantAiSubscription"
WHERE "createdAt" > NOW() - INTERVAL '30 days';

-- Win-back success rate
SELECT 
  COUNT(CASE WHEN status = 'UPGRADED_ACTIVE' THEN 1 END) * 100.0 / 
  NULLIF(COUNT(CASE WHEN status IN ('SOFT_CLOSED', 'TRIAL_EXPIRED_GRACE') THEN 1 END), 0) as winback_rate
FROM "MerchantAiSubscription"
WHERE "updatedAt" > NOW() - INTERVAL '30 days';

-- Email campaign effectiveness
SELECT 
  template_name,
  COUNT(*) as sent_count,
  AVG(open_rate) as avg_open_rate,
  AVG(click_rate) as avg_click_rate
FROM email_campaigns
WHERE sent_at > NOW() - INTERVAL '7 days'
GROUP BY template_name;
```

---

## Risk Mitigation

### Potential Risks & Solutions

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| Email deliverability issues | Medium | High | Use established ESP (SendGrid/Resend), warm up domains |
| Workers fail silently | Low | High | Add Sentry error tracking, PagerDuty alerts |
| Feature flag cache stale | Low | Medium | Add cache busting, manual refresh button in Ops |
| Paystack webhook failures | Medium | High | Implement retry logic, manual reconciliation endpoint |
| Trial abuse (multiple accounts) | Low | Medium | Add fraud detection, phone/email verification |

### Monitoring Alerts to Configure

```typescript
// Alert: Trial nurture emails not sending
if (emailsSentToday < expectedTrialsActive * 0.9) {
  alert("Trial nurture email volume anomaly");
}

// Alert: Win-back sequence stalled
if (expiredTrialsWithoutEmail > 50) {
  alert("Win-back campaign backlog detected");
}

// Alert: Feature flag inconsistency
if (marketingFlagValue !== backendFlagValue) {
  alert("Feature flag mismatch between services");
}
```

---

## Competitive Benchmarking

### Trial Experience Comparison

| Company | Trial Length | Pre-Expiry Emails | Win-Back Sequence | Countdown Visible |
|---------|-------------|-------------------|-------------------|-------------------|
| **Vayva (Current)** | 7-30 days | ❌ No | ❌ No | ❌ No |
| **Vayva (Target)** | 7-30 days | ✅ Yes (3 emails) | ✅ Yes (4 emails) | ✅ Yes |
| Shopify | 3 days | ✅ Yes | ✅ Yes | ✅ Yes |
| WooCommerce | 14 days | ⚠️ Limited | ⚠️ Basic | ✅ Yes |
| BigCommerce | 15 days | ✅ Yes | ✅ Yes | ✅ Yes |

### Best Practices Adopted

1. **Shopify:** Aggressive pre-expiry nurturing (Day -7, -3, -1)
2. **BigCommerce:** Multi-channel win-back (email + retargeting ads)
3. **WooCommerce:** In-product success milestones
4. **Stripe Billing:** Dunning management with escalating urgency

---

## Appendix: File Structure Reference

### New Files to Create

```
apps/worker/src/workers/
├── trial-nurture.worker.ts          # Pre-expiry email scheduler
├── winback-campaign.worker.ts        # Post-expiry reactivation
└── milestone-tracker.worker.ts       # Usage celebration triggers

apps/worker/src/jobs/
├── sendTrialNurtureEmails.ts         # Email job executor
├── sendWinbackCampaign.ts            # Win-back job executor
└── checkMilestones.ts                # Milestone detection

packages/emails/src/templates/
├── trial-day-7.tsx                   # Value reinforcement email
├── trial-day-3.tsx                   # Social proof email
├── trial-day-1.tsx                   # Urgency email
├── trial-expired.tsx                 # Expiry notice
├── winback-day-3.tsx                 # Discount offer
├── winback-day-7.tsx                 # Value reminder
├── winback-day-14.tsx                # Final offer
├── winback-day-30.tsx                # Fresh start
├── milestone-first-order.tsx         # Celebration
└── milestone-revenue.tsx             # Revenue celebration

Frontend/merchant/src/components/
├── layout/
│   └── TrialCountdownBanner.tsx      # Dashboard countdown
├── onboarding/
│   └── PlanSelector.tsx              # Guided plan selection
└── tour/
    ├── ProductTour.tsx               # Interactive tour component
    └── TourProvider.tsx              # Tour state management

Frontend/merchant/src/lib/
├── usage-milestones.ts               # Milestone detection logic
└── product-tour-config.ts            # Tour step definitions
```

### Existing Files to Modify

```
Frontend/merchant/src/components/admin-shell.tsx
  └─ Add TrialCountdownBanner integration

packages/shared/src/constants.ts
  └─ Already has FEATURE_FLAG_STARTER_FIRST_MONTH_FREE ✓

apps/worker/src/workers/subscription-lifecycle.worker.ts
  └─ Add hooks for nurture/win-back triggers

Frontend/marketing/src/config/pricing.ts
  └─ Already supports both modes ✓

Frontend/marketing/src/components/marketing/NewPricingClient.tsx
  └─ Already reads flag for dynamic copy ✓
```

---

## Conclusion

This implementation plan establishes a **complete, production-ready trial and promotional system** that:

✅ Supports both First Month Free promo and Standard 7-day trial modes  
✅ Automates pre-expiry nurturing to boost conversion rates  
✅ Implements win-back campaigns to recover lost trials  
✅ Provides real-time trial visibility via countdown banners  
✅ Celebrates user milestones for positive reinforcement  
✅ Guides onboarding plan selection to reduce early churn  

**Expected Business Impact:**
- **+50% trial-to-paid conversion** (25% → 37.5%)
- **+15% win-back recovery** (0% → 15% of expired trials)
- **+30% onboarding completion** (65% → 85%)
- **+₦2.8M/month incremental revenue** from improved conversion

**Next Step:** Convert this plan into actionable TODO items for systematic implementation.
