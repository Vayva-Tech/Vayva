# Manual QA Testing Guide - Dual Trial Mode System

## Overview
This guide provides step-by-step instructions for manually testing the dual trial mode system in both configurations.

---

## 🧪 PRE-REQUISITES

### **Test Environment Setup**
1. ✅ Staging environment deployed with latest code
2. ✅ Database migrations applied
3. ✅ Workers running (trial-nurture, winback-campaign, milestone-tracker)
4. ✅ Redis queue operational
5. ✅ Resend email integration configured
6. ✅ Sentry DSN configured (optional but recommended)
7. ✅ Ops Console access for feature flag toggling

### **Test Accounts Required**
- 3 fresh test emails for new signups
- 1 expired trial account (for win-back testing)
- Admin access to Ops Console

---

## ✅ TEST 1: Feature Flag Toggle (Ops Console → Marketing Site)

**Objective:** Verify that the `STARTER_FIRST_MONTH_FREE` feature flag correctly controls trial behavior without redeployment.

### **Test Steps:**

#### **A. First Month Free Mode (Flag ON)**

1. **Login to Ops Console**
   - URL: `https://ops.vayva.ng` (or staging equivalent)
   - Navigate to: Feature Flags → Billing

2. **Enable Feature Flag**
   - Find: `STARTER_FIRST_MONTH_FREE`
   - Set to: `TRUE`
   - Save changes

3. **Verify Marketing Site Updates** (wait 2-3 minutes for cache refresh)
   - Visit: `https://vayva.ng/pricing`
   - **Expected Results:**
     - ✅ Starter plan shows "First Month Free" badge
     - ✅ Price displays as "₦0 first month, then ₦25,000/month"
     - ✅ No credit card required message visible
     - ✅ Pro plan shows "7-day trial" messaging
     - ✅ Pro+ plan shows "No trial - Pay immediately"

4. **Test Signup Flow**
   - Click "Start Free Trial" on Starter plan
   - Complete signup with test email
   - **Expected Results:**
     - ✅ Checkout skips payment method selection
     - ✅ Subscription activates with ₦0 charge
     - ✅ Trial period = ~30 days
     - ✅ Welcome email received

5. **Verify Merchant Dashboard**
   - Login to merchant dashboard
   - Check billing page
   - **Expected Results:**
     - ✅ Trial countdown banner shows ~30 days
     - ✅ Plan shows as "Starter (First Month Free)"
     - ✅ Next billing date = ~30 days from now

---

#### **B. Standard Trial Mode (Flag OFF)**

1. **Disable Feature Flag in Ops Console**
   - Navigate to: Feature Flags → Billing
   - Set `STARTER_FIRST_MONTH_FREE` to: `FALSE`
   - Save changes

2. **Verify Marketing Site Updates** (wait 2-3 minutes)
   - Visit: `https://vayva.ng/pricing`
   - **Expected Results:**
     - ✅ All plans show "7-day trial" messaging
     - ✅ Starter plan: "₦25,000/month after 7 days"
     - ✅ Pro plan: "₦35,000/month after 7 days"
     - ✅ Pro+ plan: "₦50,000/month after 7 days"
     - ✅ Credit card required message visible

3. **Test Signup Flow**
   - Click "Start Free Trial" on any plan
   - Complete signup with test email
   - **Expected Results:**
     - ✅ Payment method selection required
     - ✅ Paystack checkout appears
     - ✅ Trial period = 7 days
     - ✅ No immediate charge (authorization only)

4. **Verify Merchant Dashboard**
   - Login to merchant dashboard
   - Check billing page
   - **Expected Results:**
     - ✅ Trial countdown banner shows 7 days
     - ✅ Plan shows trial period correctly
     - ✅ Payment method on file displayed

---

## ✅ TEST 2: First Month Free Mode - End-to-End Flow

**Objective:** Validate complete user journey in First Month Free scenario.

### **User Journey:**

#### **Day 0: Signup**
1. **Signup Process**
   - Email: `test-starter-free@example.com`
   - Plan: Starter
   - **Verify:**
     - ✅ No payment required
     - ✅ Immediate access granted
     - ✅ Welcome email received
     - ✅ Onboarding includes plan selection quiz

2. **Onboarding Completion**
   - Complete all onboarding steps
   - **Verify:**
     - ✅ Plan selector recommends Starter plan
     - ✅ Industry selection impacts dashboard
     - ✅ Product tour available
     - ✅ Milestone tracking initialized

#### **Day 7: Trial Nurture Email #1**
- **Wait:** 7 days (or manually trigger worker)
- **Email Expected:** "Getting value? Here's how to maximize your Vayva trial 🚀"
- **Verify:**
  - ✅ Email received with educational checklist
  - ✅ Links track clicks
  - ✅ Email renders correctly on mobile
  - ✅ Unsubscribe link present

#### **Day 27: Trial Nurture Email #2**
- **Wait:** Until 3 days before expiry
- **Email Expected:** "Success story: Similar merchant grew 3x with AI"
- **Verify:**
  - ✅ Social proof case study included
  - ✅ CTA button prominent
  - ✅ Urgency messaging appropriate

#### **Day 29: Trial Nurture Email #3**
- **Wait:** Until 1 day before expiry
- **Email Expected:** "⏰ Last chance! Your trial ends tomorrow"
- **Verify:**
  - ✅ Urgent tone
  - ✅ 20% discount code TRIAL20 included
  - ✅ Clear consequences of inaction
  - ✅ Upgrade CTA prominent

#### **Day 30: Trial Expiry**
- **Event:** Trial expires
- **Email Expected:** "Your trial has expired - You have a 3-day grace period"
- **Verify:**
  - ✅ Grace period explained (3 days)
  - ✅ Features still accessible
  - ✅ Upgrade options clear
  - ✅ Data preserved during grace period

#### **Day 33: Grace Period Ends**
- **Event:** Access restricted
- **Verify:**
  - ✅ Dashboard shows upgrade prompt
  - ✅ Data intact and recoverable
  - ✅ Win-back sequence initiated

---

## ✅ TEST 3: Standard Trial Mode - End-to-End Flow

**Objective:** Validate complete user journey in Standard 7-Day Trial scenario.

### **User Journey:**

#### **Day 0: Signup**
1. **Signup Process**
   - Email: `test-standard-trial@example.com`
   - Plan: Pro
   - **Verify:**
     - ✅ Payment method required
     - ✅ Paystack checkout works
     - ✅ 7-day trial activated
     - ✅ Welcome email received

2. **Dashboard Experience**
   - **Verify:**
     - ✅ Trial countdown shows 7 days
     - ✅ All Pro features accessible
     - ✅ Product tour offered
     - ✅ Milestone tracking active

#### **Day 1: Trial Nurture Email #1**
- **Email Expected:** Educational tips email
- **Verify:**
  - ✅ Quick wins highlighted
  - ✅ Feature adoption encouraged
  - ✅ Support contact visible

#### **Day 5: Trial Nurture Email #2**
- **Email Expected:** Social proof email
- **Verify:**
  - ✅ Success story featured
  - ✅ Relevant to selected industry
  - ✅ Upgrade CTA clear

#### **Day 7: Trial Nurture Email #3**
- **Email Expected:** Urgent reminder
- **Verify:**
  - ✅ Payment will be processed tomorrow
  - ✅ Amount clearly stated
  - ✅ Cancel option available

#### **Day 8: Payment Processing**
- **Event:** First payment attempt
- **Scenarios to Test:**

  **A. Payment Successful**
  - ✅ Charge processed via Paystack
  - ✅ Subscription status = ACTIVE
  - ✅ Receipt email sent
  - ✅ Trial banner removed from dashboard

  **B. Payment Failed**
  - ✅ Retry logic triggered (3 attempts)
  - ✅ Grace period initiated
  - ✅ "Payment failed" email sent
  - ✅ Dashboard shows payment update required

---

## ✅ TEST 4: Win-Back Campaign Testing

**Objective:** Verify win-back emails send correctly for expired trials.

### **Setup:**
1. Create expired trial account: `test-winback@example.com`
2. Manually set `trial_expires_at` to desired dates for testing
3. Trigger win-back worker manually or wait for Monday 2PM schedule

### **Win-Back Sequence:**

#### **Day +3: First Win-Back Email**
- **Email Expected:** "We miss you! Here's 20% off to come back 💚"
- **Verify:**
  - ✅ Discount code COMEBACK20 included
  - ✅ 48-hour validity mentioned
  - ✅ Feature highlights shown
  - ✅ Reactivation CTA prominent

#### **Day +7: Second Win-Back Email**
- **Email Expected:** "Your customers are waiting - Don't miss these opportunities 🛍️"
- **Verify:**
  - ✅ FOMO messaging
  - ✅ Revenue potential statistics
  - ✅ Customer success testimonial
  - ✅ No discount (value-focused)

#### **Day +14: Third Win-Back Email**
- **Email Expected:** "Final chance for special pricing ⏳"
- **Verify:**
  - ✅ 50% discount code FINAL50
  - ✅ Scarcity messaging
  - ✅ Free onboarding call offer
  - ✅ Priority support mentioned

#### **Day +30: Fourth Win-Back Email**
- **Email Expected:** "Ready to restart? Your account is waiting 🌟"
- **Verify:**
  - ✅ Fresh start messaging
  - ✅ New features announcement
  - ✅ New 7-day trial offer
  - ✅ No credit card required

---

## ✅ TEST 5: Milestone Celebrations

**Objective:** Verify milestone detection and celebration emails.

### **Milestones to Test:**

#### **First Order Milestone**
1. **Trigger:** Create first order in dashboard
2. **Expected Email:** "🎉 Congratulations! Your first AI-powered order"
3. **Verify:**
   - ✅ Celebration theme
   - ✅ Order details shown
   - ✅ Encouragement message
   - ✅ Next steps suggested

#### **Revenue Milestones**
1. **Trigger:** Record revenue reaching thresholds
   - ₦50,000
   - ₦100,000
   - ₦500,000
   - ₦1,000,000

2. **Expected Emails:** Progressive celebration
3. **Verify:**
   - ✅ Threshold acknowledged
   - ✅ Progress visualization
   - ✅ Motivational messaging
   - ✅ Growth tips included

#### **Product Count Milestones**
1. **Trigger:** Add products to catalog (10, 50, 100)
2. **Expected:** In-app celebration + optional email
3. **Verify:**
   - ✅ Badge/achievement unlocked
   - ✅ Progress bar updated
   - ✅ Social sharing option

---

## ✅ TEST 6: Email Campaign Worker Execution

**Objective:** Verify workers execute on schedule and handle errors gracefully.

### **Manual Worker Triggers:**

#### **Trial Nurture Worker (Daily 10AM)**
```bash
# Trigger manually via admin API or CLI
curl -X POST https://api.vayva.ng/admin/workers/trial-nurture/trigger \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Verify:**
- ✅ Worker starts successfully
- ✅ Logs show merchants fetched
- ✅ Emails queued for eligible trials
- ✅ Errors captured in Sentry
- ✅ Execution completes within 5 minutes

#### **Win-Back Worker (Weekly Mon 2PM)**
```bash
curl -X POST https://api.vayva.ng/admin/workers/winback/trigger \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Verify:**
- ✅ Expired merchants identified
- ✅ Correct email sequence selected
- ✅ Duplicate sends prevented
- ✅ Recovery tracking initialized

#### **Milestone Tracker (Hourly)**
```bash
curl -X POST https://api.vayva.ng/admin/workers/milestone/trigger \
  -H "Authorization: Bearer YOUR_ADMIN_TOKEN"
```

**Verify:**
- ✅ All merchants scanned
- ✅ Milestones detected accurately
- ✅ Celebration emails sent
- ✅ Duplicate milestones prevented

---

## ✅ TEST 7: Mobile Responsiveness

**Objective:** Ensure all emails render correctly on mobile devices.

### **Test Devices:**
- iPhone (iOS Mail app)
- Android (Gmail app)
- iPad (tablet view)

### **Test Checklist:**
For each email template:
- [ ] Text readable without zooming
- [ ] CTA buttons easily tappable (>44px)
- [ ] Images scale properly
- [ ] No horizontal scrolling
- [ ] Subject line not truncated
- [ ] Preheader text displays correctly

---

## ✅ TEST 8: Edge Cases & Error Handling

### **Edge Cases to Test:**

1. **Merchant with Multiple Stores**
   - ✅ Each store tracked separately
   - ✅ Emails sent per store
   - ✅ Milestones aggregated correctly

2. **Timezone Handling**
   - ✅ Trial expiry calculated in merchant timezone
   - ✅ Workers respect timezone boundaries
   - ✅ Emails sent at appropriate local times

3. **Email Delivery Failures**
   - ✅ Bounced emails marked appropriately
   - ✅ Retry logic works (if implemented)
   - ✅ Hard bounces stop future sends

4. **Concurrent Worker Execution**
   - ✅ No duplicate emails sent
   - ✅ Race conditions handled
   - ✅ Database locks work correctly

5. **Large Merchant Volume**
   - ✅ Worker processes 1000+ merchants efficiently
   - ✅ Queue doesn't overflow
   - ✅ Memory usage stable

---

## 📊 TEST RESULTS DOCUMENTATION

### **Results Template:**

```markdown
## Test Session: [DATE]
**Tester:** [NAME]
**Environment:** Staging / Production
**Duration:** [X] hours

### Tests Executed:
| Test ID | Test Name | Status | Notes |
|---------|-----------|--------|-------|
| TEST 1 | Feature Flag Toggle | ✅ PASS / ❌ FAIL | [Notes] |
| TEST 2 | First Month Free Flow | ✅ PASS / ❌ FAIL | [Notes] |
| TEST 3 | Standard Trial Flow | ✅ PASS / ❌ FAIL | [Notes] |
| TEST 4 | Win-Back Campaign | ✅ PASS / ❌ FAIL | [Notes] |
| TEST 5 | Milestone Celebrations | ✅ PASS / ❌ FAIL | [Notes] |
| TEST 6 | Worker Execution | ✅ PASS / ❌ FAIL | [Notes] |
| TEST 7 | Mobile Responsiveness | ✅ PASS / ❌ FAIL | [Notes] |
| TEST 8 | Edge Cases | ✅ PASS / ❌ FAIL | [Notes] |

### Issues Found:
1. **[SEVERITY]** Issue description
   - Steps to reproduce
   - Expected vs actual behavior
   - Screenshot/log attachment

### Recommendations:
- [List any improvements or follow-up tasks]
```

---

## 🚀 DEPLOYMENT SIGN-OFF

### **Go/No-Go Decision Criteria:**

**All must be ✅ PASS for production deployment:**
- [ ] TEST 1: Feature Flag Toggle
- [ ] TEST 2: First Month Free Flow
- [ ] TEST 3: Standard Trial Flow
- [ ] TEST 4: Win-Back Campaign (critical emails)
- [ ] TEST 5: Milestone Celebrations (first order)
- [ ] TEST 6: Worker Execution (no critical errors)
- [ ] TEST 7: Mobile Responsiveness (core templates)
- [ ] TEST 8: Edge Cases (critical paths only)

### **Sign-Off Required From:**
- [ ] Engineering Lead
- [ ] Product Manager
- [ ] QA Engineer
- [ ] DevOps Engineer

---

*Last Updated: March 26, 2026*  
*Version: 1.0*  
*Owner: QA Team*
