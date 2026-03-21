# MISSING FEATURE GATING ANALYSIS
## Features That Need Proper Plan-Based Gating

**Date:** March 20, 2026  
**Status:** Critical Review  

---

## 🚨 CRITICAL: Ungated Features (Must Fix Immediately)

### 1. **Advanced Analytics Page** 
**File:** `Frontend/merchant/src/app/(dashboard)/dashboard/analytics/page.tsx`

**Current Status:** ❌ NO GATING - All plans can access

**Why It Should Be Gated:**
- Shows deep analytics insights
- Includes advanced charts and reports
- PRO feature per our plan structure

**Required Gating:**
```typescript
// Add at top of page component
const { data: subscription } = useSubscription();

if (subscription?.plan !== 'PRO') {
  return <PlanTierGate requiredTier="pro" feature="advanced_analytics" />;
}
```

**Fix Priority:** 🔴 CRITICAL

---

### 2. **AI Assistant Block on Dashboard**
**File:** `Frontend/merchant/src/components/dashboard-v2/AIAssistantBlock.tsx`

**Current Status:** ❌ Shown to ALL plans on dashboard

**Why It Should Be Gated:**
- FREE users should NOT see AI features (except WhatsApp Evolution API)
- STARTER users don't have autopilot but might see AI assistant
- Only PRO should see AI assistant prominently displayed

**Required Gating:**
```typescript
// In DashboardV2Content.tsx
{plan === 'PRO' && <AIAssistantBlock />}
// OR hide from FREE entirely
{plan !== 'FREE' && <AIAssistantBlock />}
```

**Fix Priority:** 🔴 CRITICAL (False Advertising)

---

### 3. **AI Usage Chart Component**
**File:** `Frontend/merchant/src/components/dashboard-v2/AIUsageChart.tsx`

**Current Status:** ❌ Likely shown to all plans

**Why It Should Be Gated:**
- Shows AI credit usage
- FREE users shouldn't have this (they have simple 100 message limit)
- Only relevant for STARTER and PRO with credit system

**Required Gating:**
- Hide from FREE users
- Show only to STARTER and PRO

**Fix Priority:** 🟠 HIGH

---

### 4. **TaskBoard Component**
**File:** `Frontend/merchant/src/components/dashboard-v2/TaskBoard.tsx`

**Current Status:** ⚠️ Unclear if gated

**Why It Might Need Gating:**
- If it includes AI-generated tasks → PRO only
- If basic manual tasks → OK for all plans
- Need to verify implementation

**Required Action:**
- Check if tasks are AI-generated or manual
- If AI-generated → gate to PRO only
- Add `PlanTierGate` if needed

**Fix Priority:** 🟡 MEDIUM (Needs Investigation)

---

### 5. **Dashboard Metric Count**
**File:** `Frontend/merchant/src/components/dashboard-v2/DashboardV2Content.tsx`

**Current Status:** ❌ ALL metrics shown to ALL plans

**Per Plan Structure:**
```
FREE: 4 metrics (Revenue, Orders, Customers, Conversion Rate)
STARTER: 6 metrics (+ AOV, CLV)
PRO: 10 metrics (All metrics including AI conversions)
```

**Required Gating:**
```typescript
// Limit visible KPI blocks based on plan
const MAX_METRICS = {
  basic: 4,    // FREE
  standard: 6, // STARTER
  pro: 10,     // PRO
};

const visibleMetrics = allMetrics.slice(0, MAX_METRICS[dashboardPlanTier]);
```

**Fix Priority:** 🔴 CRITICAL

---

### 6. **Financial Charts (Income vs Expense)**
**File:** `Frontend/merchant/src/components/dashboard-v2/IncomeExpenseChart.tsx`

**Current Status:** ❌ Available to ALL plans

**Why It Should Be Gated:**
- Paid feature (STARTER and above)
- FREE users get basic dashboard only

**Required Gating:**
```typescript
// In DashboardV2Content.tsx
{plan !== 'FREE' && (
  <div className="grid grid-cols-2">
    <IncomeExpenseChart />
    {/* other chart */}
  </div>
)}
```

**Fix Priority:** 🟠 HIGH

---

### 7. **Industry Dashboard Switcher**
**File:** `Frontend/merchant/src/components/dashboard-v2/DashboardSwitcher.tsx`

**Current Status:** ⚠️ Potentially dangerous

**Why It Should Be Gated:**
- Industry-specific dashboards are PRO feature
- FREE and STARTER should see generic Pro dashboard only
- This switcher might allow changing to industry views

**Required Gating:**
```typescript
// Hide industry dashboard options from non-PRO
if (plan !== 'PRO') {
  // Show only "Default" option
  // Or hide entire switcher
}
```

**Fix Priority:** 🟠 HIGH

---

### 8. **Autopilot Banner**
**File:** `Frontend/merchant/src/components/dashboard-v2/AutopilotBanner.tsx`

**Current Status:** ✅ Already has some gating (line 60 checks `isPaidPlan`)

**Issue:** 
- Line 60: `isPaidPlan` is too vague
- Should specifically check for PRO plan
- STARTER users should NOT see this

**Required Fix:**
```typescript
// Change from isPaidPlan to explicit PRO check
if (plan !== 'PRO') {
  return null; // Don't even show banner
}
```

**Fix Priority:** 🟠 HIGH

---

## 🟡 MEDIUM PRIORITY: Features to Review

### 9. **Customer Insights Section**
**File:** `Frontend/merchant/src/components/dashboard-v2/CustomerInsights.tsx` (if exists)

**Current Status:** Needs verification

**Recommendation:**
- Basic customer count → OK for all plans
- Advanced insights (LTV, retention, cohorts) → STARTER+ or PRO only

**Action:** Review implementation and add appropriate gating

---

### 10. **Product Health Section**
**File:** `Frontend/merchant/src/components/dashboard-v2/ProductHealth.tsx` (if exists)

**Current Status:** Needs verification

**Recommendation:**
- Basic stock levels → OK for all plans
- AI-powered recommendations → PRO only

**Action:** Review and gate accordingly

---

### 11. **Suggested Actions List**
**File:** `Frontend/merchant/src/components/dashboard-v2/SuggestedActionsList.tsx`

**Current Status:** Needs verification

**Recommendation:**
- Manual suggestions → OK for all
- AI-generated actions → PRO only

**Action:** Check if AI-powered and gate appropriately

---

## 📋 COMPLETE GATING CHECKLIST

### Dashboard Components (DashboardV2Content.tsx):
- [ ] **KPI Blocks** - Limit count: FREE=4, STARTER=6, PRO=10
- [ ] **Financial Charts** - Hide from FREE
- [ ] **AI Assistant Block** - Hide from FREE
- [ ] **AI Usage Chart** - Hide from FREE
- [ ] **Autopilot Banner** - Show to PRO only (fix existing gating)
- [ ] **Dashboard Switcher** - Hide industry options from non-PRO
- [ ] **TaskBoard** - Verify if AI-generated, gate if yes
- [ ] **Customer Insights** - Gate advanced metrics
- [ ] **Product Health** - Gate AI recommendations

### Standalone Pages:
- [ ] `/dashboard/analytics` - PRO only
- [ ] `/dashboard/ai-insights` - PRO only  
- [ ] `/dashboard/autopilot` - PRO only (already done?)
- [ ] `/dashboard/customers/insights` - STARTER+ or PRO?
- [ ] `/dashboard/control-center/pro` - Already gated?

### Features Within Pages:
- [ ] Export functionality - Charge credits?
- [ ] Advanced filtering - Charge credits?
- [ ] Custom reports - PRO only?
- [ ] Data visualization options - PRO only?

---

## 💡 RECOMMENDED IMPLEMENTATION ORDER

### Phase 4A: Critical Dashboard Gating (1-2 days)
1. Fix metric count limiting (FREE=4, STARTER=6, PRO=10)
2. Hide financial charts from FREE users
3. Remove AI Assistant Block from FREE dashboard
4. Fix Autopilot Banner to show PRO only
5. Gate dashboard switcher (industry views = PRO only)

### Phase 4B: Page-Level Gating (1 day)
1. Add PRO gate to `/dashboard/analytics`
2. Add PRO gate to `/dashboard/ai-insights`
3. Verify `/dashboard/autopilot` gating is correct
4. Review and gate other advanced pages

### Phase 4C: Feature-Level Gating (1-2 days)
1. Review customer insights section
2. Review product health section
3. Review suggested actions
4. Add credit charges for premium actions (exports, etc.)

---

## 🔍 VERIFICATION METHOD

After implementing each gate, verify:

1. **Login as FREE user** → Should see basic dashboard only
2. **Login as STARTER user** → Should see standard features, NO autopilot
3. **Login as PRO user** → Should see everything unlocked

Use browser dev tools to check:
- Network requests to gated API routes return proper errors
- UI components are actually hidden (not just visually)
- Credit deduction works for STARTER and PRO

---

## ⚠️ WARNINGS

### DO NOT:
1. Just hide UI buttons - also gate the API routes
2. Rely solely on frontend gating - backend must enforce too
3. Forget to update error messages to mention correct plan names
4. Miss the difference between "feature not available" and "insufficient credits"

### ALWAYS:
1. Test with all three plan types (FREE, STARTER, PRO)
2. Check both the UI and the API layer
3. Update documentation when adding gates
4. Consider edge cases (trial expired, low credits, etc.)

---

## 📊 IMPACT ASSESSMENT

### What FREE Users Will Lose Access To:
- ❌ AI Assistant Block (but keep WhatsApp Evolution API)
- ❌ Financial charts
- ❌ Advanced analytics page
- ❌ Autopilot banner
- ❌ Industry dashboard switcher
- ❌ Metrics beyond first 4

**This is CORRECT** - they should only see basic dashboard during 14-day trial.

### What STARTER Users Will Lose Access To:
- ❌ Autopilot (PRO only)
- ❌ Industry dashboards (PRO only)
- ❌ Advanced analytics (if we decide PRO only)
- ❌ Some metrics (beyond 6)

**This is CORRECT** - they pay ₦25k, not ₦40k.

### What PRO Users Get:
- ✅ Everything unlocked
- ✅ 10,000 credits/month
- ✅ All features, all metrics, all pages

**This is CORRECT** - they pay premium price.

---

## 🎯 SUCCESS CRITERIA

✅ **FREE User Experience:**
- Sees ONLY 4 basic metrics
- No AI features visible (except WhatsApp Evolution API which works via Evolution, not credits)
- No financial charts
- No autopilot anywhere
- No analytics page access
- After 14 days → Trial expired message

✅ **STARTER User Experience:**
- Sees 6 metrics
- Has financial charts
- NO autopilot
- NO industry dashboards
- Credit widget shows 5,000/month
- Can use AI (costs 1 credit/message)

✅ **PRO User Experience:**
- Sees all 10 metrics
- Full autopilot access
- Can switch industry dashboards
- Advanced analytics unlocked
- Credit widget shows 10,000/month
- Truly unlimited feeling

---

## CONCLUSION

**Most Critical Issue Right Now:**
The dashboard is showing AI features (AI Assistant Block, AI Usage Chart) to FREE users who shouldn't have access to AI at all (except the 100 WhatsApp Evolution API messages). This is **false advertising**.

**Immediate Action Required:**
1. Hide AI Assistant Block from FREE users
2. Hide AI Usage Chart from FREE users  
3. Limit KPI blocks to 4 for FREE
4. Hide financial charts from FREE
5. Fix Autopilot Banner to be PRO-only

These should be done BEFORE we proceed with frontend credit widget and other Phase 4 work.

**Estimated Time:** 2-3 hours for critical fixes, 1-2 days for complete gating.
