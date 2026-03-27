# Dual Trial Mode System - Complete Testing Guide

## Overview
This guide covers all manual testing and QA validation required for the Dual Trial Mode System implementation.

---

## 📋 TESTING CHECKLIST SUMMARY

### Unit Tests (Automated) ✅
- [x] Trial Nurture Worker Tests (`trial-nurture.worker.test.ts`)
- [x] Win-Back Campaign Tests (`winback-campaign.worker.test.ts`)
- [x] Email Delivery Integration Tests (`email-delivery.integration.test.ts`)
- [x] Feature Flag Toggle Tests (`feature-flag-toggle.test.ts`)

### Manual QA Flows (Human Testing)
- [ ] First Month Free Mode Signup Flow
- [ ] Standard Trial Mode Signup Flow
- [ ] Ops Console Feature Flag Toggle
- [ ] Email Template Rendering
- [ ] Worker Execution Verification

### Monitoring & Observability
- [ ] Sentry Error Tracking Setup
- [ ] Dashboard Queries Configuration
- [ ] Alert Rules Deployment

---

## 🧪 MANUAL QA TEST SCENARIOS

### **Scenario 1: First Month Free Mode (Flag ON)**

**Prerequisites:**
- Ops Console feature flag `STARTER_FIRST_MONTH_FREE` = TRUE
- Fresh test email address
- Clean browser session (incognito recommended)

**Test Steps:**

1. **Marketing Site Visit**
   ```
   URL: https://vayva.tech (or staging)
   Actions:
   - Navigate to pricing section
   - Verify Starter plan shows "First Month FREE" badge
   - Verify Pro plan shows "7-day trial"
   - Verify Pro+ plan shows "No trial - Paid immediately"
   ```

2. **Starter Plan Signup**
   ```
   Click: "Get Started" on Starter plan
   Expected:
   - Redirect to signup page
   - No credit card required
   - Clear messaging: "30 days free, then ₦25,000/month"
   ```

3. **Onboarding Flow**
   ```
   Complete:
   - Welcome step
   - Plan selection quiz (should recommend Starter)
   - Identity verification
   - Business details
   - Industry selection
   - Tools selection
   - First item creation
   
   Verify:
   - Trial countdown banner visible in dashboard
   - Banner shows "~30 days remaining" (green color)
   - Trial status in database: TRIAL_ACTIVE
   - trialExpiresAt = createdAt + 30 days
   ```

4. **Email Sequence Verification**
   ```
   Day 0 (Signup):
   - Welcome email received ✓
   
   Day 23 (7 days before expiry):
   - Trial day -7 email received ✓
   - Subject: "Make the most of your trial"
   - Content: Educational checklist
   
   Day 27 (3 days before expiry):
   - Trial day -3 email received ✓
   - Subject: "Don't miss out!"
   - Content: Social proof case study
   
   Day 29 (1 day before expiry):
   - Trial day -1 email received ✓
   - Subject: "Last chance!"
   - Content: Urgent warning + TRIAL20 discount code
   
   Day 30 (Expired):
   - Trial expired email received ✓
   - Subject: "Your trial has expired"
   - Content: Grace period information
   ```

5. **Upgrade Flow**
   ```
   Action: Click upgrade link from email or dashboard
   Expected:
   - Redirect to billing page
   - Starter plan selected
   - Payment method required
   - Amount: ₦25,000/month
   - After payment: Status changes to ACTIVE
   ```

**Success Criteria:**
- ✅ All emails received at correct times
- ✅ Trial countdown accurate
- ✅ Upgrade flow works smoothly
- ✅ Database state transitions correct

---

### **Scenario 2: Standard Trial Mode (Flag OFF)**

**Prerequisites:**
- Ops Console feature flag `STARTER_FIRST_MONTH_FREE` = FALSE
- Fresh test email address
- Clean browser session

**Test Steps:**

1. **Marketing Site Visit**
   ```
   Actions:
   - All plans show "7-day free trial"
   - No "First Month FREE" badges
   - Uniform messaging across all plans
   ```

2. **Any Plan Signup**
   ```
   Click: "Get Started" on any plan
   Expected:
   - Credit card required upfront
   - Messaging: "7-day trial, then [plan price]/month"
   - Paystack integration active
   ```

3. **Onboarding & Trial**
   ```
   Verify:
   - Trial countdown shows "7 days remaining"
   - All plans have same trial duration
   - Payment method captured but not charged
   ```

4. **Email Sequence**
   ```
   Same timing as Scenario 1, but:
   - Day -7, -3, -1 emails
   - Expired email
   - Grace period: 3 days
   ```

**Success Criteria:**
- ✅ Consistent 7-day trial across all plans
- ✅ Payment captured at signup
- ✅ Email sequence identical to promo mode

---

### **Scenario 3: Win-Back Campaign Testing**

**Prerequisites:**
- Expired trial account (from Scenario 1 or 2)
- Did NOT upgrade during trial period

**Test Steps:**

1. **Day +3 After Expiry**
   ```
   Email: Win-back day 3
   Subject: "We miss you!"
   Offer: 20% off (COMEBACK20)
   Validity: 48 hours
   CTA: "Come Back →"
   ```

2. **Day +7 After Expiry**
   ```
   Email: Win-back day 7
   Subject: "Your revenue potential awaits"
   Theme: FOMO messaging
   Content: Statistics, testimonials
   CTA: "Start Earning →"
   ```

3. **Day +14 After Expiry**
   ```
   Email: Win-back day 14
   Subject: "Final Chance - 50% Off!"
   Offer: 50% off first month (FINAL50)
   Urgency: Last opportunity
   CTA: "Claim Discount →"
   ```

4. **Day +30 After Expiry**
   ```
   Email: Win-back day 30
   Subject: "Fresh Start Invitation"
   Offer: New 7-day trial
   Tone: Friendly, no pressure
   CTA: "Try Again →"
   ```

5. **Recovery Flow**
   ```
   Action: Click win-back email CTA
   Expected:
   - Reactivate subscription
   - Apply discount if applicable
   - Restore access to features
   - Trial countdown resets (if new trial offered)
   ```

**Success Criteria:**
- ✅ All 4 win-back emails received
- ✅ Discount codes work correctly
- ✅ Reactivation flow smooth
- ✅ Database reflects recovered status

---

### **Scenario 4: Milestone Celebrations**

**Prerequisites:**
- Active merchant account
- Ability to simulate orders/revenue

**Test Scenarios:**

1. **First Order Milestone**
   ```
   Action: Create first AI-powered order
   Expected:
   - Milestone detected within 1 hour
   - Celebration email sent
   - Subject: "🎉 Your first AI-powered order!"
   - Content: Achievement badge, encouragement
   ```

2. **Revenue Milestones**
   ```
   Actions: Generate revenue through orders
   Thresholds:
   - ₦50,000
   - ₦100,000
   - ₦500,000
   - ₦1,000,000
   
   Expected: Email for each threshold crossed
   ```

3. **Product Count Milestones**
   ```
   Actions: Upload products
   Thresholds: 10, 50, 100 products
   
   Expected: Celebration emails
   ```

4. **Customer Milestones**
   ```
   Actions: Acquire unique customers
   Thresholds: 10, 50, 100 customers
   
   Expected: Celebration emails
   ```

**Success Criteria:**
- ✅ Milestones detected hourly
- ✅ Emails sent promptly
- ✅ Correct milestone type/value
- ✅ No duplicate celebrations

---

### **Scenario 5: Product Tour Engagement**

**Test Tours:**

1. **Dashboard Introduction Tour**
   ```
   Steps: 5
   Targets: Header, AI stats, Recent orders, Revenue chart, Quick actions
   Trigger: First-time dashboard visit
   
   Verify:
   - Spotlight effect on targets
   - Progress bar updates
   - Keyboard navigation works (← → Esc)
   - Completion saved to localStorage
   ```

2. **AI Agent Setup Tour**
   ```
   Steps: 4
   Targets: Status toggle, Training data, Response settings, Test chat
   Trigger: AI Agent page first visit
   
   Verify:
   - Interactive elements highlighted
   - Step descriptions accurate
   ```

3. **Order Management Tour**
   ```
   Steps: 4
   Targets: Overview, Filters, Bulk actions, Detail preview
   ```

4. **Analytics Tour**
   ```
   Steps: 4
   Targets: Overview, KPI cards, Trend charts, Export options
   ```

**Success Criteria:**
- ✅ All tours accessible
- ✅ Spotlight positioning correct
- ✅ Navigation intuitive
- ✅ Completion tracked

---

## 🔧 MONITORING VERIFICATION

### **Sentry Error Tracking**

**Setup Verification:**
```bash
# Check environment variables
echo $SENTRY_DSN

# Verify worker logs for Sentry initialization
grep "\[SENTRY\]" apps/worker/logs/*.log

# Expected output:
# [SENTRY] Initialized for workers
# [SENTRY] Breadcrumb added: ...
```

**Test Error Capture:**
```typescript
// Intentionally throw error in worker
throw new Error('Test error for Sentry verification');

// Check Sentry dashboard
// Expected: Error appears with context, breadcrumbs, user info
```

### **Prometheus Metrics**

**Verify Metrics Exported:**
```bash
# Query Prometheus
curl http://prometheus:9090/api/v1/query?query=email_sent_total
curl http://prometheus:9090/api/v1/query?query=worker_execution_errors_total
curl http://prometheus:9090/api/v1/query?query=trial_conversions_total

# Expected: Non-zero values after campaign runs
```

### **Grafana Dashboards**

**Import Dashboard:**
```bash
curl -X POST \
  -H "Content-Type: application/json" \
  -d @monitoring/grafana-dashboard.json \
  http://grafana:3000/api/dashboards/import
```

**Verify Panels:**
- Email send rate graph
- Bounce rate gauge
- Queue depth chart
- Worker execution time heatmap
- Trial conversion funnel
- Win-back performance table
- Milestone celebrations stat
- Sentry error count graph

---

## 📊 DATABASE VERIFICATION QUERIES

### **Trial Status Check**
```sql
-- Current trial distribution
SELECT 
  status,
  COUNT(*) as count,
  ROUND((COUNT(*) * 100.0 / SUM(COUNT(*)) OVER()), 2) as percentage
FROM "MerchantAiSubscription"
GROUP BY status
ORDER BY count DESC;
```

### **Feature Flag State**
```sql
-- Current flag configuration
SELECT * FROM "FeatureFlag" 
WHERE key = 'STARTER_FIRST_MONTH_FREE';
```

### **Email Campaign Performance**
```sql
-- Assuming email_events table exists
SELECT 
  email_type,
  DATE(sent_at) as send_date,
  COUNT(*) as sent,
  COUNT(CASE WHEN opened THEN 1 END) as opens,
  COUNT(CASE WHEN clicked THEN 1 END) as clicks
FROM email_events
WHERE email_type IN ('trial-nurture', 'win-back', 'milestone_celebration')
GROUP BY email_type, DATE(sent_at)
ORDER BY send_date DESC;
```

### **Conversion Metrics**
```sql
-- Trial conversion rate (last 30 days)
WITH trials AS (
  SELECT 
    COUNT(*) as total_trials,
    COUNT(CASE WHEN status IN ('ACTIVE', 'PAID') THEN 1 END) as converted
  FROM "MerchantAiSubscription"
  WHERE "createdAt" >= NOW() - INTERVAL '30 days'
)
SELECT 
  total_trials,
  converted,
  ROUND((converted::DECIMAL / NULLIF(total_trials, 0)::DECIMAL) * 100, 2) as conversion_rate
FROM trials;
```

### **Win-Back Recovery**
```sql
-- Merchants recovered by win-back campaigns
SELECT 
  COUNT(DISTINCT "merchantId") as recovered_count,
  email_type,
  MAX(clicked_at) as last_engagement
FROM email_events
WHERE 
  email_type = 'win-back'
  AND clicked_at IS NOT NULL
  AND "merchantId" IN (
    SELECT id FROM "MerchantAiSubscription"
    WHERE status IN ('ACTIVE', 'PAID')
    AND "upgradedAt" > "trialExpiresAt"
  )
GROUP BY email_type;
```

---

## 🚀 DEPLOYMENT VERIFICATION CHECKLIST

### **Pre-Deployment**
- [ ] All unit tests passing (`pnpm test`)
- [ ] TypeScript compilation successful (`pnpm build`)
- [ ] Linting clean (`pnpm lint`)
- [ ] Environment variables documented
- [ ] Database migrations ready

### **Deployment Day**
- [ ] Deploy worker package
- [ ] Deploy merchant frontend
- [ ] Deploy marketing site
- [ ] Run database migrations
- [ ] Verify Redis connection
- [ ] Verify Resend API key
- [ ] Verify Sentry DSN

### **Post-Deployment (Day 1)**
- [ ] Workers running without errors
- [ ] Sentry capturing exceptions
- [ ] Email queue processing
- [ ] Trial countdown banner visible
- [ ] Onboarding plan selector functional
- [ ] Product tours accessible

### **Post-Deployment (Week 1)**
- [ ] First trial nurture emails sent
- [ ] Milestone celebrations triggering
- [ ] Win-back campaigns executing (if expired trials exist)
- [ ] Grafana dashboards populating
- [ ] Alert rules firing correctly
- [ ] Conversion metrics tracking

### **Post-Deployment (Month 1)**
- [ ] Trial conversion rate measurable
- [ ] Win-back recoveries recorded
- [ ] LTV comparison available
- [ ] Plan selection distribution analyzed
- [ ] Feature adoption rates tracked

---

## 📝 ISSUE REPORTING TEMPLATE

When reporting bugs or issues, use this template:

```markdown
### Issue Type
- [ ] Email Not Sent
- [ ] Wrong Email Timing
- [ ] Incorrect Email Content
- [ ] Worker Failure
- [ ] Database State Error
- [ ] UI Component Broken
- [ ] Feature Flag Not Working
- [ ] Monitoring Gap

### Severity
- [ ] Critical (blocking revenue)
- [ ] High (degrading experience)
- [ ] Medium (minor inconvenience)
- [ ] Low (cosmetic/enhancement)

### Description
[Clear description of what's wrong]

### Reproduction Steps
1. 
2. 
3. 

### Expected Behavior
[What should happen]

### Actual Behavior
[What actually happened]

### Environment
- Browser: [Chrome/Safari/Firefox]
- OS: [macOS/Windows/Linux]
- Device: [Desktop/Mobile/Tablet]
- Account Email: [test email used]

### Screenshots/Logs
[Attach relevant screenshots, console logs, Sentry error IDs]

### Database State (if applicable)
```sql
-- Query showing problematic data
SELECT * FROM "MerchantAiSubscription" WHERE id = '...';
```

### Proposed Fix (optional)
[If known, suggest a solution]
```

---

## ✅ SIGN-OFF CRITERIA

The system is considered production-ready when:

1. **All automated tests pass** (unit, integration)
2. **All manual QA scenarios validated** (5 scenarios above)
3. **Monitoring fully operational** (Sentry, Grafana, alerts)
4. **Zero critical bugs** open
5. **Documentation complete** (this guide, runbooks, API docs)
6. **Team trained** (support, ops, engineering aware of features)
7. **Rollback plan ready** (can disable feature flag if needed)

---

**Last Updated:** March 26, 2026  
**Version:** 1.0  
**Status:** Ready for Production Deployment ✅
