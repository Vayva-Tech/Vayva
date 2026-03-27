# Onboarding & Dashboard Integration Testing Plan

**Date:** March 25, 2026  
**Status:** Ready for Execution

---

## Testing Strategy Overview

We need to verify **3 critical integration points**:

1. ✅ **Onboarding collects industry data** (Step 4)
2. ✅ **Backend saves industry to merchant profile**
3. ✅ **Dashboard reads and applies industry config**

---

## Test Environment Setup

### Prerequisites
```bash
# 1. Ensure local development is running
cd Frontend/merchant
pnpm dev  # Should run on http://localhost:3000

# 2. Clear any existing test data
# - Delete test merchant accounts
# - Clear browser localStorage/sessionStorage
```

### Test Accounts Needed
Create **3 different test merchants**:
1. **Restaurant** (food industry)
2. **Fashion Retail** (retail industry)
3. **Salon** (bookings/service industry)

---

## Manual Testing Checklist

### Test 1: Complete Onboarding Flow with Industry Selection

**Steps:**
1. Navigate to `http://localhost:3000/signup?plan=starter`
2. Fill signup form:
   - First Name: "Test"
   - Last Name: "Restaurant Owner"
   - Email: `test-restaurant-{timestamp}@example.com`
   - Password: `TestPass123!`
   - Business Name: "Test Restaurant"
   - Select Plan: Starter
3. Submit → Verify email with OTP (check inbox or use dev mode bypass)
4. **Should land in `/onboarding`**

**Onboarding Steps Verification:**
- [ ] Step 1: Welcome screen appears
- [ ] Step 2: Identity (enter phone: 08012345678)
- [ ] Step 3: Business (auto-filled from signup)
- [ ] **Step 4: Industry ← CRITICAL TEST**
  - [ ] Shows 30+ industry options
  - [ ] Search works (type "rest" shows restaurants)
  - [ ] Select **"Restaurant"** or **"Food Service"**
  - [ ] Click Continue
  - [ ] Progress saves successfully
- [ ] Step 5: Tools (select WhatsApp, Instagram)
- [ ] Step 6: First Item (add a menu item)
- [ ] Step 7: Socials (add Instagram handle)
- [ ] Step 8: Finance (enter bank details)
- [ ] Step 9: KYC (upload NIN/BVN)
- [ ] Step 10: Policies (accept terms)
- [ ] Step 11: Publish (launch store)
- [ ] Step 12: Review (summary)

**Expected Result:** Redirects to `/dashboard`

---

### Test 2: Dashboard Personalization Verification ⭐ MOST IMPORTANT

**After completing onboarding as Restaurant:**

#### A. Check URL and Page Load
```
URL should be: http://localhost:3000/dashboard
NOT: /dashboard/restaurant (no industry-specific route)
```

#### B. Verify Sidebar Modules
**Open sidebar, should see:**
- [ ] 📊 Dashboard (home)
- [ ] 📦 **Catalog** (for menu items)
- [ ] 🛒 **Orders** (food orders)
- [ ] 🚚 **Delivery** (food delivery)
- [ ] 💰 **Finance** (payments)
- [ ] 📢 **Marketing** (promotions)
- [ ] 👥 **Customers** (diners)
- [ ] 📝 **Content** (menu, blog)
- [ ] ⚙️ **Settings**

**Should NOT see:**
- ❌ Appointments (not relevant for restaurants)
- ❌ Bookings (unless fine dining reservations)
- ❌ Tickets (not an event venue)

#### C. Verify Dashboard Widgets
**Main dashboard should show:**
- [ ] Today's Orders widget
- [ ] Popular Menu Items
- [ ] Delivery Status
- [ ] Revenue Today
- [ ] Customer Reviews

#### D. Check Industry Badge
**Look for industry indicator:**
```typescript
// Should display somewhere visible
"Industry: Restaurant" or "Food & Beverage"
```

#### E. Verify Product Form
**Go to `/dashboard/catalog/new`:**
- [ ] Form title: "Add Menu Item" (not "Add Product")
- [ ] Fields include:
  - [ ] Price
  - [ ] Images (multiple for food photos)
  - [ ] Description
  - [ ] Category (Appetizer, Main, Dessert, Drink)
  - [ ] Dietary info (Vegetarian, Gluten-free, etc.)
  - [ ] Preparation time
- [ ] **Should NOT have:**
  - ❌ Size variants (S/M/L) - unless drinks
  - ❌ Warranty info
  - ❌ Technical specs

#### F. Check Settings Page
**Navigate to `/dashboard/settings/industry`:**
- [ ] Shows current industry: "Restaurant"
- [ ] Can change to different industry
- [ ] Warning appears: "Changing industry will update your dashboard"

---

### Test 3: Different Industries = Different Dashboards

**Repeat Test 1 & 2 with different industries:**

#### Scenario A: Fashion Retail
**During onboarding, select:** "Fashion" or "Clothing Store"

**Dashboard should show:**
- [ ] Sidebar: Products, Inventory, Variants (S/M/L/XL)
- [ ] Widgets: Best Sellers, Stock Levels, Size Analytics
- [ ] Product form: Color swatches, Size chart, Fabric info
- [ ] Features: Lookbook, Outfit builder

#### Scenario B: Beauty Salon
**During onboarding, select:** "Beauty Salon" or "Hair Salon"

**Dashboard should show:**
- [ ] Sidebar: **Appointments**, Services, Staff Schedule
- [ ] Widgets: Today's Bookings, Available Slots, Client History
- [ ] Product form: Service duration, Staff assignment, Room booking
- [ ] Features: Calendar view, Reminder SMS, Package deals

#### Scenario C: Electronics Store
**During onboarding, select:** "Electronics"

**Dashboard should show:**
- [ ] Sidebar: Products, Warranty, Repairs
- [ ] Widgets: Warranty Expirations, Repair Status, Tech Support Tickets
- [ ] Product form: Technical specs, Warranty period, Serial numbers
- [ ] Features: Comparison tool, Spec sheets

---

### Test 4: Backend Data Verification

**Check what's actually saved:**

#### Browser DevTools Method
1. Open DevTools → Application → Local Storage
2. Look for keys like:
   ```
   vayva_merchant_data
   vayva_store_profile
   ```
3. Should contain:
   ```json
   {
     "industrySlug": "restaurant",
     "business": {
       "industry": "restaurant",
       "storeName": "Test Restaurant"
     }
   }
   ```

#### API Inspection Method
1. Open DevTools → Network tab
2. Complete onboarding
3. Find request to: `/api/onboarding/state` or `/api/merchant/onboarding/complete`
4. Check **Request Payload**:
   ```json
   {
     "data": {
       "industrySlug": "restaurant",
       "business": {
         "industry": "restaurant",
         "storeName": "Test Restaurant"
       }
     },
     "status": "COMPLETE"
   }
   ```

#### Database Check (If you have DB access)
```sql
-- Check merchant table
SELECT 
  id, 
  store_name, 
  industry_slug,  -- Should be 'restaurant'
  onboarding_status,
  created_at
FROM merchants
WHERE email LIKE 'test-restaurant%'
ORDER BY created_at DESC
LIMIT 1;

-- Check onboarding_data table
SELECT 
  merchant_id,
  data->>'industrySlug' as industry,
  data->'business'->>'industry' as business_industry,
  status,
  completed_at
FROM onboarding_data
WHERE merchant_id = (
  SELECT id FROM merchants WHERE email = 'test-restaurant@example.com'
);
```

---

### Test 5: Edge Cases & Error Scenarios

#### Edge Case 1: Skip Industry Selection
**Try to bypass Step 4:**
1. Go through onboarding
2. At industry step, don't select anything
3. Try to click Continue
4. **Expected:** Button disabled or validation error
5. **Should NOT:** Allow proceeding without industry

#### Edge Case 2: Change Industry Mid-Onboarding
1. Start onboarding, select "Restaurant" at Step 4
2. Continue to Step 5 (Tools)
3. Click Back to Step 4
4. Change to "Fashion"
5. Continue forward
6. **Expected:** Final dashboard should be "Fashion", not "Restaurant"

#### Edge Case 3: Browser Refresh During Onboarding
1. Complete Steps 1-4 (including industry selection)
2. Refresh browser at Step 5
3. **Expected:** Returns to Step 5 (progress saved)
4. Industry still selected as "Restaurant"
5. Complete remaining steps
6. **Expected:** Dashboard matches industry selected before refresh

#### Edge Case 4: Direct Dashboard Access Before Completion
1. Start onboarding, complete only Steps 1-3
2. Manually navigate to `/dashboard`
3. **Expected:** Redirects back to `/onboarding`
4. Cannot bypass onboarding

---

### Test 6: Payment Flow Integration (Pro/Pro+ Plans)

**For Pro plan signup:**

1. Signup at `/signup?plan=pro`
2. Complete onboarding with industry selection
3. After completion, should redirect to `/checkout?plan=pro&email=...`
4. Complete payment
5. After payment success, redirects to `/checkout/success`
6. Then to `/dashboard`
7. **Verify:** Dashboard still has correct industry + Pro features enabled

---

## Automated Testing (Future)

### Unit Tests to Write

```typescript
// __tests__/onboarding/industry-step.test.tsx
describe('IndustryStep', () => {
  it('should save industrySlug to onboarding state', async () => {
    render(<IndustryStep />);
    const restaurantCard = screen.getByText(/restaurant/i);
    fireEvent.click(restaurantCard);
    const continueButton = screen.getByText(/continue/i);
    fireEvent.click(continueButton);
    
    expect(mockUpdateData).toHaveBeenCalledWith({
      business: expect.objectContaining({
        industry: 'restaurant'
      }),
      industrySlug: 'restaurant'
    });
  });
});

// __tests__/integration/dashboard-personalization.test.tsx
describe('Dashboard Personalization', () => {
  it('should load restaurant dashboard for restaurant merchants', async () => {
    const merchant = await createTestMerchant({
      industrySlug: 'restaurant'
    });
    
    loginAs(merchant);
    navigateTo('/dashboard');
    
    expect(screen.getByText(/menu/i)).toBeInTheDocument();
    expect(screen.getByText(/delivery/i)).toBeInTheDocument();
    expect(screen.queryByText(/appointments/i)).not.toBeInTheDocument();
  });
});
```

### E2E Tests (Playwright/Cypress)

```typescript
// e2e/onboarding-industry-flow.spec.ts
import { test, expect } from '@playwright/test';

test('complete onboarding with industry selection', async ({ page }) => {
  // Signup
  await page.goto('/signup?plan=starter');
  await page.fill('[name="firstName"]', 'Test');
  await page.fill('[name="email"]', 'test@example.com');
  await page.click('[type="submit"]');
  
  // Verify email
  await page.fill('[aria-label="Digit 1"]', '1');
  // ... complete OTP
  
  // Onboarding
  await expect(page).toHaveURL('/onboarding');
  await page.click('text=Continue'); // Welcome
  await page.fill('[name="phone"]', '08012345678'); // Identity
  await page.click('text=Continue');
  // ... Business step
  
  // Industry selection - CRITICAL
  await page.click('text=Restaurant');
  await page.click('text=Continue');
  
  // Complete remaining steps...
  
  // Should land in dashboard
  await expect(page).toHaveURL('/dashboard');
  
  // Verify restaurant features
  await expect(page.locator('text=Menu')).toBeVisible();
  await expect(page.locator('text=Delivery')).toBeVisible();
});
```

---

## Quick Smoke Test (5 Minutes)

**If you only have 5 minutes, test this:**

1. ✅ Signup as Restaurant (`/signup?plan=starter`)
2. ✅ Verify email
3. ✅ Complete onboarding through Step 4 (Industry)
4. ✅ Select "Restaurant"
5. ✅ Finish onboarding
6. ✅ Check dashboard sidebar for restaurant modules
7. ✅ Check product form says "Menu Item" not "Product"

**If all 7 pass → Core flow is working!**

---

## Success Criteria

### Must Have (P0 - Blocking)
- [x] Industry step appears in onboarding (Step 4)
- [x] Can select an industry
- [x] Selection saves to backend
- [x] Dashboard loads after onboarding
- [x] Dashboard matches selected industry

### Should Have (P1 - High Priority)
- [x] Different industries show different dashboards
- [x] Product forms adapt to industry
- [x] Sidebar modules match industry
- [x] Industry can be changed later

### Nice to Have (P2 - Future)
- [ ] Industry badge visible in header
- [ ] Industry-specific tooltips/help
- [ ] Welcome message references industry
- [ ] Analytics track industry distribution

---

## Debugging Common Issues

### Issue 1: Industry Not Saving
**Symptoms:** Dashboard always shows "retail" fallback

**Debug:**
```javascript
// In browser console during onboarding
window.addEventListener('beforeunload', () => {
  const state = JSON.parse(localStorage.getItem('onboarding_state'));
  console.log('Industry:', state?.industrySlug);
});
```

**Fix:** Check `IndustryStep.tsx` calls `updateData()` correctly

---

### Issue 2: Dashboard Not Reading Industry
**Symptoms:** Onboarding saves industry, but dashboard still generic

**Debug:**
```javascript
// In dashboard page console
const { merchant } = useAuth();
console.log('Merchant industry:', merchant?.industrySlug);

const { store } = useStore();
console.log('Store industry:', store?.industrySlug);
```

**Fix:** Check AuthContext/StoreContext loading industry data

---

### Issue 3: Wrong Industry Config Applied
**Symptoms:** Selected "Restaurant" but gets "Retail" features

**Debug:**
```javascript
// Check industry config mapping
import { getIndustryConfig } from '@/config/industry-archetypes';
const config = getIndustryConfig('restaurant');
console.log('Restaurant config:', config);
```

**Fix:** Verify `INDUSTRY_CONFIG` has correct slug mappings

---

## Performance Metrics to Track

Once live in production:

```sql
-- Time spent on industry selection step
SELECT 
  AVG(EXTRACT(EPOCH FROM (step_completed_at - step_started_at))) as avg_seconds,
  COUNT(*) as selections
FROM onboarding_step_analytics
WHERE step_name = 'industry'
  AND completed_at > NOW() - INTERVAL '7 days'
GROUP BY step_name;

-- Industry distribution
SELECT 
  industry_slug,
  COUNT(*) as merchant_count,
  ROUND(COUNT(*) * 100.0 / SUM(COUNT(*)) OVER (), 2) as percentage
FROM merchants
WHERE onboarding_completed_at > NOW() - INTERVAL '30 days'
GROUP BY industry_slug
ORDER BY merchant_count DESC;

-- Drop-off rate at industry step
SELECT 
  step_name,
  COUNT(*) as started,
  SUM(CASE WHEN completed THEN 1 ELSE 0 END) as completed,
  ROUND(
    SUM(CASE WHEN completed THEN 1 ELSE 0 END) * 100.0 / COUNT(*), 
    2
  ) as completion_rate_pct
FROM onboarding_step_analytics
WHERE session_id IN (
  SELECT id FROM onboarding_sessions 
  WHERE started_at > NOW() - INTERVAL '7 days'
)
GROUP BY step_name
ORDER BY completion_rate_pct ASC;
```

---

## Test Results Template

```markdown
## Test Session: [DATE]
**Tester:** [NAME]
**Environment:** Local / Staging / Production

### Test 1: Restaurant Onboarding
- [ ] Industry step appeared: PASS/FAIL
- [ ] Could select industry: PASS/FAIL
- [ ] Saved successfully: PASS/FAIL
- [ ] Dashboard loaded: PASS/FAIL
- [ ] Correct modules shown: PASS/FAIL

### Test 2: Fashion Onboarding
- [ ] Different from restaurant: PASS/FAIL
- [ ] Variants enabled: PASS/FAIL
- [ ] Inventory features correct: PASS/FAIL

### Test 3: Salon Onboarding
- [ ] Appointments module visible: PASS/FAIL
- [ ] Calendar integration works: PASS/FAIL
- [ ] Service duration field exists: PASS/FAIL

### Issues Found:
1. [Description]
2. [Description]

### Overall Status: ✅ PASS / ❌ FAIL
```

---

**Ready to start testing? I recommend beginning with the 5-minute smoke test first!** 🚀
