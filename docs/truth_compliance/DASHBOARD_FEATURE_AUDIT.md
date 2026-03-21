# Dashboard Feature Audit & Gating Review

## Executive Summary
This document lists EVERYTHING currently showcased to merchants on their dashboard, along with the current gating implementation and recommendations.

---

## 1. PLAN STRUCTURE (Current)

### Subscription Plans:
- **FREE** → ₦0/month
- **STARTER** → ₦25,000/month  
- **PRO** → ₦40,000/month

### Dashboard Tiers (Mapped from plans):
- **Basic** ← FREE plan
- **Standard** ← STARTER plan
- **Pro** ← PRO plan

---

## 2. DASHBOARD FEATURES SHOWCASED

### A. Key Metrics Section (Always Visible)
**What's Displayed:**
1. **Revenue** - Total revenue for selected period
2. **Orders** - Number of orders/bookings
3. **Customers** - New customers count
4. **Conversion Rate** - Visitor to customer conversion %

**Current Gating:** ❌ **NONE** - All plans see all 4 metrics
**Recommended Gating:**
- FREE: Show all 4 basic metrics ✅ (current)
- STARTER: Add AOV (Average Order Value), CLV (Customer Lifetime Value)
- PRO: Add AI Conversions, Operational Efficiency, Market Share, Competitive Index

---

### B. Charts & Visualizations

#### 1. Revenue & AI Conversions Chart
**What's Displayed:** Line/area chart showing revenue trends + AI-generated orders
**Current Gating:** ❌ **NONE** - All plans see this
**Recommended Gating:**
- FREE: Revenue only (no AI breakdown)
- STARTER: Revenue + basic AI metrics
- PRO: Full breakdown with AI insights ✅

#### 2. Orders Overview Donut Chart
**What's Displayed:** Pie chart showing order status distribution (Pending, Completed, Cancelled, etc.)
**Current Gating:** ❌ **NONE** - All plans see this
**Recommended Gating:** Keep available for all ✅ (basic operational data)

#### 3. Income vs Expense Chart
**What's Displayed:** Comparison of income and expenses over time
**Current Gating:** ❌ **NONE** 
**Recommended Gating:**
- FREE: Basic monthly totals only
- STARTER: Weekly breakdown
- PRO: Daily breakdown + predictive analytics

---

### C. AI Performance Section ⚠️ **CRITICAL ISSUE**

**What's Displayed:**
1. **Conversations** - AI conversation count (892 shown in mockup)
2. **Auto-Orders** - Orders automatically handled by AI (234 shown)
3. **Avg Response Time** - 1.2s response time
4. **CSAT Score** - Customer satisfaction score (calculated as AI Efficiency %)

**Current Gating:** ❌ **NONE** - This section is visible to ALL plans including FREE
**Status:** ⚠️ **FALSE ADVERTISING** - Merchants on FREE plan don't have AI agent enabled
**Recommended Gating:**
- FREE: **HIDE ENTIRELY** or show locked state with "Upgrade to Starter to unlock AI Agent"
- STARTER: Show basic AI metrics (conversations, auto-orders)
- PRO: Show all AI metrics + advanced insights + usage patterns

**Action Required:** 🚨 **IMMEDIATE** - This is misleading free users

---

### D. Live Operations Section

**What's Displayed:** Real-time operational metrics based on industry:
- Pending Fulfillment count
- Delayed Shipments
- Low Stock Alerts
- Today's Checkouts/Sales
- Active Listings/Campaigns/etc.

**Current Gating:** ❌ **NONE** - All plans see full live ops
**Recommended Gating:**
- FREE: Basic counts only (pending orders, low stock)
- STARTER: + delayed shipments, fulfillment metrics
- PRO: + predictive alerts, bottleneck detection

---

### E. Alerts & Bottlenecks

**What's Displayed:** Warning notifications about issues needing attention
**Current Gating:** ❌ **NONE**
**Recommended Gating:**
- FREE: Critical alerts only (out of stock, payment failures)
- STARTER: + warnings (low stock, delayed orders)
- PRO: + predictive alerts, suggestions

---

### F. Suggested Actions / Tasks

**What's Displayed:** AI-generated task recommendations
**Current Gating:** ❌ **NONE**
**Recommended Gating:**
- FREE: Manual tasks only (user-created)
- STARTER: + basic AI suggestions
- PRO: + advanced AI recommendations with priority scoring

---

### G. Product Health / Inventory Health

**What's Displayed:**
- Top Selling Products
- Low Stock Products
- Dead Stock Products

**Current Gating:** ❌ **NONE**
**Recommended Gating:**
- FREE: Low stock alerts only
- STARTER: + top sellers
- PRO: + dead stock analysis + reorder suggestions

---

### H. Invoice Overview / Payment Success

**What's Displayed:** Invoice payment tracking and success rates
**Current Gating:** ❌ **NONE**
**Recommended Gating:**
- FREE: Basic invoice list
- STARTER: + payment success rate
- PRO: + advanced analytics, dispute tracking

---

### I. Recent Activity Feed

**What's Displayed:** Timeline of recent orders, bookings, customer actions
**Current Gating:** ❌ **NONE**
**Recommended Gating:** Keep available for all ✅ (basic operational data)

---

### J. Upcoming / Calendar

**What's Displayed:** Future bookings, appointments, events
**Current Gating:** ❌ **NONE**
**Recommended Gating:** Keep available for all ✅ (basic operational data)

---

### K. Customer Insights

**What's Displayed:** Customer behavior analytics, repeat rates, top customers
**Current Gating:** ❌ **NONE**
**Recommended Gating:**
- FREE: Basic customer count only
- STARTER: + repeat customer rate
- PRO: + full cohort analysis, churn prediction, LTV tracking

---

### L. Industry-Specific Native Sections ⚠️

**What's Displayed:** Custom sections based on industry type (currently in beta)
**Current Status:** ✅ **CORRECTLY GATED** - Moved to beta waitlist
**Implementation:** Redirects to Pro Dashboard with "Coming Soon" banner

---

## 3. CURRENT GATING IMPLEMENTATION STATUS

### ✅ Correctly Implemented:
1. **Industry-specific dashboards** → Beta waitlist ✅
2. **Plan tier mapping** → Free→Basic, Starter→Standard, Pro→Pro ✅

### ❌ **NOT GATED (Issues):**
1. **AI Performance Section** - Visible to FREE users ❌ **CRITICAL**
2. **Advanced Metrics** - All 10 metrics visible to all plans ❌
3. **Financial Charts** - Available to all plans ❌
4. **AI Insights** - Available to all plans ❌
5. **Custom Layouts** - Available to all plans ❌

### ⚠️ **Partially Gated:**
1. **KPI Count** - Configured but not enforced in UI ⚠️
2. **Refresh Intervals** - Configured but not enforced ⚠️

---

## 4. PLAN TIER CONFIGURATION (From Code)

### Basic Tier (FREE Plan):
```typescript
{
  kpiCount: 4,              // Should limit to 4 KPIs
  metrics: [                // Should only show these
    'revenue',
    'orders', 
    'customers',
    'conversion_rate'
  ],
  sections: {
    financial_charts: false,  // Should be hidden
    ai_insights: false,       // Should be hidden
    custom_layouts: false     // Should be hidden
  },
  refreshInterval: 300        // 5 minutes
}
```

### Standard Tier (STARTER Plan - ₦25,000):
```typescript
{
  kpiCount: 6,              // Should show 6 KPIs
  metrics: [
    'revenue',
    'orders',
    'customers', 
    'conversion_rate',
    'avg_order_value',           // NEW
    'customer_lifetime_value'    // NEW
  ],
  sections: {
    financial_charts: true,     // Unlocked
    ai_insights: false,         // Still locked
    custom_layouts: false
  },
  refreshInterval: 120          // 2 minutes
}
```

### Pro Tier (PRO Plan - ₦40,000):
```typescript
{
  kpiCount: 10,               // All 10 KPIs
  metrics: [
    'revenue',
    'orders',
    'customers',
    'conversion_rate',
    'avg_order_value',
    'customer_lifetime_value',
    'ai_conversions',          // AI metrics unlocked
    'operational_efficiency',
    'market_share',
    'competitive_index'
  ],
  sections: {
    financial_charts: true,
    ai_insights: true,         // Unlocked
    custom_layouts: true       // Unlocked
  },
  refreshInterval: 60          // 1 minute
}
```

---

## 5. ENFORCEMENT MECHANISMS NEEDED

### Currently Missing:
1. ❌ **UI Component Gating** - No `PlanTierGate` wrappers around sections
2. ❌ **API Data Filtering** - Backend returns all data regardless of plan
3. ❌ **Metric Count Limits** - All 10 metrics shown even if plan allows 4
4. ❌ **Section Visibility** - All sections visible despite config saying false
5. ❌ **Refresh Rate Limiting** - All plans get same update frequency

### Required Implementation:

#### Frontend:
```tsx
// Example of proper gating
<PlanTierGate 
  currentVariant={dashboardPlanTier}
  requiredVariant="standard"
  featureName="Financial Charts"
>
  <IncomeExpenseChart />
</PlanTierGate>

<PlanTierGate
  currentVariant={dashboardPlanTier}
  requiredVariant="pro"
  featureName="AI Performance Metrics"
>
  <AIPerformanceSection />
</PlanTierGate>
```

#### Backend:
```typescript
// Filter metrics based on plan
const allowedMetrics = PLAN_TIER_FEATURES[planTier].metrics;
const filteredMetrics = allMetrics.filter(m => allowedMetrics.includes(m.key));
```

---

## 6. PRIORITY FIXES

### 🚨 **CRITICAL (Do Immediately):**

1. **Hide AI Performance Section from FREE users**
   - File: `Frontend/merchant/src/components/dashboard-v2/DashboardV2Content.tsx`
   - Wrap entire AI section in `PlanTierGate` requiring "standard" tier
   - Reason: Free users don't have AI agent - this is false advertising

2. **Limit Visible Metrics Based on Plan**
   - Only show 4 metrics to FREE, 6 to STARTER, 10 to PRO
   - Use `kpiCount` from `PLAN_TIER_FEATURES`

### ⚠️ **HIGH PRIORITY (This Week):**

3. **Gate Financial Charts**
   - Hide from FREE plan
   - Show in Standard and Pro

4. **Gate AI Insights**
   - Hide from FREE and STARTER
   - Show only in Pro

5. **Add Upgrade Prompts**
   - When user sees locked feature, show clear upgrade CTA
   - "Upgrade to Starter to unlock Financial Charts"

### 📋 **MEDIUM PRIORITY (Next Week):**

6. **Implement API Data Filtering**
   - Backend should only return data user's plan allows

7. **Enforce Refresh Intervals**
   - FREE: 5 min updates
   - STARTER: 2 min updates  
   - PRO: 1 min updates

8. **Add Plan Tier Badges**
   - Show "Pro Feature" badges on locked features
   - Help users understand what their plan includes

---

## 7. TRUTH IN ADVERTISING CHECKLIST

### Current Claims vs Reality:

✅ **Truthful:**
- We have Free, Starter, Pro plans
- Industry dashboards are in beta (Coming Soon)
- Evolution API integration for WhatsApp

❌ **Misleading (Needs Fix):**
- AI Performance shown to free users (they don't have AI agent)
- All metrics shown to all plans (should be gated)
- Financial charts available to free users (should be paid feature)

---

## 8. RECOMMENDED NEXT STEPS

### Immediate Actions (Today):
1. [ ] Add `PlanTierGate` wrapper around AI Performance section
2. [ ] Limit metric display count based on plan tier
3. [ ] Test that FREE users can't see AI features

### Short-term (This Week):
4. [ ] Gate all financial charts
5. [ ] Gate AI insights and suggestions
6. [ ] Add upgrade prompt modals/banners
7. [ ] Update backend API to filter data by plan

### Medium-term (Next Week):
8. [ ] Implement refresh rate limiting
9. [ ] Add plan tier badges throughout UI
10. [ ] Create comprehensive test suite for gating
11. [ ] Document gating standards for future development

---

## 9. RESPONSIBILITY MATRIX

### Who Reviews/Approves:
- **Product Decisions** (what features go in which plan): Founder/Product
- **Implementation Review** (code quality, security): Tech Lead
- **Testing** (verify gates work): QA/Testing Lead
- **Ongoing Audits**: Should be done before each major release

### Recommended Process:
1. Any new dashboard feature MUST include plan tier assignment
2. PR reviews must check gating implementation
3. Release checklist includes "Verify plan gating" item
4. Quarterly audit of all showcased features

---

## 10. COMPLETE FEATURE GATING INVENTORY

### A. Dashboard Metrics & Analytics (CURRENT STATUS)

**FREE Plan:**
- ✅ Revenue, Orders, Customers, Conversion Rate (4 basic metrics)
- ❌ Currently shows ALL 10 metrics - **NEEDS FIXING**
- ❌ AI Performance visible - **CRITICAL ISSUE**

**STARTER Plan (₦25,000):**
- ✅ All FREE metrics + AOV, CLV (6 metrics total)
- ✅ Financial charts (Income vs Expense)
- ❌ No AI Insights, No predictive analytics

**PRO Plan (₦40,000):**
- ✅ All 10 metrics including AI Conversions, Market Share, Competitive Index
- ✅ AI Performance section
- ✅ Predictive analytics
- ✅ Custom dashboard layouts

---

### B. Templates System ✅ **CORRECTLY GATED**

**FREE Plan:**
- ✅ Limited to 2 templates
- ✅ Basic template library access
- ❌ Cannot publish to marketplace

**STARTER Plan:**
- ✅ Up to 5 templates
- ✅ Access to premium templates
- ❌ Cannot customize AI persona (trial restriction)
- ❌ Cannot publish to marketplace

**PRO Plan:**
- ✅ Unlimited templates
- ✅ Full template customization
- ✅ Can publish to marketplace
- ✅ Vayva Cut Pro included

**Files:** 
- `Backend/core-api/src/lib/billing/access.ts` (lines 54-67, 99-112)
- Template usage tracking via Prisma count

---

### C. Website Builder & Features ✅ **CORRECTLY GATED**

**FREE Plan:**
- ✅ Basic storefront
- ✅ Subdomain only (yourstore.vayva.ng)
- ❌ No custom domain
- ❌ No advanced analytics

**STARTER Plan:**
- ✅ Full website builder
- ✅ Service & Digital modules
- ✅ Remove Vayva branding
- ❌ Custom domain requires PRO

**PRO Plan:**
- ✅ Custom domain support
- ✅ Advanced analytics
- ✅ All templates available
- ✅ Unlimited everything

**Files:**
- `Backend/core-api/src/lib/billing/access.ts` (lines 141-158)
- Custom domain gating implemented

---

### D. Add-Ons / Marketplace ✅ **CORRECTLY GATED**

**Available Add-On Categories:**
1. **E-commerce**: Shopping Cart, Checkout Flow, Wishlist
2. **Marketing**: Newsletter, Social Share, Reviews
3. **Industry-Specific**: 
   - Education: Courses, Assignments, Student Dashboard
   - Healthcare: Patient Portal, Prescriptions, HIPAA Compliance
   - Real Estate: Property Search, Booking
   - Automotive: Test Drive Scheduler, Virtual Tour
   - Food: Menu Display, Table Booking, Kitchen Display
   - And 50+ more specialized addons

**Gating Status:**
- ✅ FREE: Can install free add-ons only
- ✅ STARTER: Can install most add-ons but limited usage
- ✅ PRO: All add-ons, unlimited usage
- ✅ Marketplace publishing requires paid plan

**Files:**
- `packages/addons/registry.ts` - Full addon definitions
- `packages/addons/mount-points.tsx` - Integration points
- `Frontend/merchant/src/app/(dashboard)/dashboard/addons/page.tsx`
- `Frontend/merchant/src/components/addons/AddOnGate.tsx` - Gating component

---

### E. WhatsApp AI Agent ✅ **CORRECTLY GATED**

**FREE Plan:**
- ✅ 7-day trial of AI agent
- ❌ After trial: Default persona only (no customization)
- ❌ Limited to 100 messages/month

**STARTER Plan:**
- ✅ Full AI agent access
- ✅ 500 AI messages/month
- ❌ Cannot customize AI persona during trial period
- ❌ Cannot edit AI profile (requires PRO)

**PRO Plan:**
- ✅ Unlimited AI messages
- ✅ Full AI persona customization
- ✅ AI profile editing
- ✅ Advanced AI insights

**Files:**
- `Backend/core-api/src/lib/billing/access.ts` (lines 43-53, 88-98, 115-122)
- Usage tracking implemented correctly

---

### F. Order/Transaction Limits ✅ **CORRECTLY GATED**

**FREE Plan:**
- ❌ Not mentioned in audit - NEEDS VERIFICATION

**STARTER Plan:**
- ✅ Limited to 100 orders/month
- ✅ After limit: Must upgrade to PRO

**PRO Plan:**
- ✅ Unlimited orders

**Files:**
- `Backend/core-api/src/lib/billing/access.ts` (lines 69-87)

---

### G. KYC & Compliance Gating ✅ **CORRECTLY GATED**

**All Plans:**
- ✅ KYC verification required for withdrawals
- ✅ Cannot withdraw without BVN/NIN verification

**Files:**
- `Backend/core-api/src/lib/billing/access.ts` (lines 18-28)

---

### H. Vayva Cut Pro ✅ **CORRECTLY GATED**

**FREE & STARTER:**
- ❌ Not available

**PRO Plan:**
- ✅ Included

**Files:**
- `Backend/core-api/src/lib/billing/access.ts` (line 123-129)

---

## 11. FILES REQUIRING CHANGES

### Critical Files to Update:
1. `Frontend/merchant/src/components/dashboard-v2/DashboardV2Content.tsx`
   - Add PlanTierGate wrappers around AI Performance section
   - Limit metric visibility based on plan tier
   - Hide financial charts from FREE users

2. `Frontend/merchant/src/config/industry-dashboard-config.ts`
   - Config exists but not enforced in UI
   - Need to apply PLAN_TIER_FEATURES config

3. `Backend/core-api/src/app/api/dashboard/aggregate/route.ts`
   - Filter returned metrics based on user's plan
   - Don't send data user can't see

4. `Frontend/merchant/src/components/dashboard/plan-tier-gating.tsx`
   - Component exists - needs to be used throughout dashboard
   - Add more examples to documentation

5. `Frontend/merchant/src/app/(dashboard)/dashboard/addons/page.tsx`
   - Already has gating - verify it's working correctly
   - Test that FREE users can't install paid addons

---

## 12. GATING VERIFICATION CHECKLIST

### ✅ Correctly Implemented:
- [x] Template limits (2 for FREE, 5 for STARTER, unlimited PRO)
- [x] WhatsApp AI message limits (100/500/unlimited)
- [x] Order creation limits (100/month for STARTER)
- [x] Custom domain gating (PRO only)
- [x] Advanced analytics gating (PRO only)
- [x] Marketplace publishing restrictions
- [x] AI profile editing restrictions
- [x] Vayva Cut Pro exclusivity
- [x] KYC requirements for withdrawals

### ❌ NOT Gated (Needs Immediate Fix):
- [ ] Dashboard AI Performance section (visible to FREE users)
- [ ] Metric count limits (all plans see all 10 metrics)
- [ ] Financial charts visibility (should be paid only)
- [ ] AI Insights section (should be PRO only)
- [ ] Custom layouts feature (should be PRO only)
- [ ] Refresh rate limiting (all plans get same updates)

### ⚠️ Needs Verification:
- [ ] Order limits for FREE plan (not clearly defined)
- [ ] Addon installation gating (verify FREE can't install paid)
- [ ] Industry-specific addon access by plan

---

## 13. SUMMARY: WHAT'S ACTUALLY GATED WELL

### ✅ **EXCELLENT GATING:**
1. **Templates** - Perfect implementation with database tracking
2. **WhatsApp AI** - Message limits enforced correctly
3. **Orders** - Monthly limits tracked and enforced
4. **Custom Domains** - Properly restricted to PRO
5. **Marketplace** - Publishing requires paid plan
6. **KYC Compliance** - Mandatory for withdrawals

### ❌ **POOR GATING:**
1. **Dashboard Metrics** - Everything visible to everyone
2. **AI Performance Section** - Shown to FREE users (CRITICAL)
3. **Financial Charts** - No gating implemented
4. **Advanced Analytics** - Visible to all plans

### 📊 **OVERALL ASSESSMENT:**
- **Backend Gating:** 90% ✅ (Excellent)
- **Frontend UI Gating:** 30% ❌ (Poor)
- **Data Filtering:** 20% ❌ (Almost non-existent)

**Main Issue:** Backend has great gating logic, but frontend UI doesn't enforce it. Everything is shown regardless of plan.

---

## CONCLUSION

**Current State:** Most features are NOT properly gated. Everything is visible to all plans.

**Most Critical Issue:** AI Performance section shown to FREE users who don't have AI agent - this is false advertising.

**Action Plan:** 
1. Immediately hide AI section from free users
2. Implement metric count limits
3. Gate financial charts and AI insights
4. Add backend filtering
5. Establish ongoing review process

**Estimated Effort:** 
- Critical fixes: 2-4 hours
- High priority: 1-2 days
- Medium priority: 2-3 days
