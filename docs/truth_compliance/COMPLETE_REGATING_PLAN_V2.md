# Complete System Re-gating Plan v2
## With Proper Tier Differentiation & Credit System

**Created:** March 20, 2026  
**Status:** Ready for Implementation  
**Philosophy:** Clear tier benefits, credit-based tracking, industry advantages for PRO

---

## Executive Summary

### Current Problem:
- FREE users get too much access (AI Performance, advanced features)
- STARTER and PRO don't have clear differentiation
- No industry-specific advantages
- Template gating not strict enough

### New Solution:
**FREE**: Basic dashboard only, WhatsApp Evolution API only (100 messages), NO AI autopilot  
**STARTER**: 5,000 credits/month, 1 template included, pay ₦5,000 for extra templates, NO autopilot, NO custom domain  
**PRO**: 10,000 credits/month, 2 templates included, pay ₦5,000 for 3rd+, AUTOPILOT included, custom domain, INDUSTRY-SPECIFIC dashboards

---

## Phase 1: Remove Deprecated Features

### 1.1 Delete Vayva Cut Pro
**Search Patterns:**
- `vayva.*cut.*pro|VayvaCutPro|vayva-cut-pro`

**Files to Modify:**
- `Backend/core-api/src/lib/billing/access.ts` - Remove lines 123-129
- `Backend/core-api/src/config/pricing.ts` - Remove references
- Any UI components mentioning "Vayva Cut Pro"

### 1.2 Remove Marketplace Publishing (NOT Browsing)
**Keep:** Add-on gallery browsing and installation  
**Remove:** Ability for users to CREATE/PUBLISH addons

**Files to Check:**
- Search for `/addons/create` routes
- Search for "Become a Publisher" UI
- Remove publisher dashboard pages

---

## Phase 2: New Plan Structure with Clear Benefits

### FREE PLAN (Taste of Basics)
**Price:** ₦0  
**Duration:** 14 days trial, then basic view  
**Credits:** 0 credits (no AI credit system access)

#### What They Get:
✅ **Basic Dashboard Only** (4 metrics: Revenue, Orders, Customers, Conversion Rate)  
✅ **NO AI Performance Section** (completely hidden)  
✅ **NO Financial Charts** (hidden)  
✅ **NO Autopilot** (hidden)  
✅ **WhatsApp Evolution API ONLY** - Connect their WhatsApp number  
✅ **100 WhatsApp AI Messages** - Automated responses via Evolution API  
✅ **Website Builder** - Subdomain only (yourstore.vayva.ng)  
✅ **1 Template** - Can pick ONE template initially  
✅ **NO Template Changes** - Locked after initial selection  
✅ **Vayva Branding** - Cannot remove  

#### What's Hidden:
❌ AI Autopilot (entire page hidden)  
❌ Advanced analytics  
❌ Industry-specific dashboards  
❌ Custom domain support  
❌ More than 4 dashboard metrics  
❌ Template gallery browsing (after initial pick)

#### After 14 Days:
⚠️ Downgrade to read-only basic dashboard  
⚠️ Must upgrade to Starter or Pro to continue

---

### STARTER PLAN (₦25,000/month)
**Credits:** 5,000 credits/month  
**Templates:** 1 template included

#### What They Get:
✅ **Standard Dashboard** (6 metrics: + AOV, CLV)  
✅ **Financial Charts** - Income vs Expense visualization  
✅ **All Add-Ons Included** - Install any addon free  
✅ **Remove Vayva Branding**  
✅ **Custom Domain Support** - Wait, NO! This should be PRO only  
✅ **Template Lock** - Starts with 1 template  
✅ **Industry Templates** - Access to all industry templates  
✅ **WhatsApp Evolution API** - Unlimited connectivity  
✅ **500 AI Messages Included** - Uses credits (1 credit = 1 message)

#### What They Pay Extra For:
💰 **Extra Template:** ₦5,000 one-time per additional template  
💰 **Extra AI Credits:** ₦5,000 per 500 credits  
💰 **Custom Domain Setup:** 200 credits one-time (if allowed)

#### What's STILL Locked:
❌ **NO Autopilot** - This is PRO feature  
❌ **NO Industry-Specific Dashboards** - PRO only  
❌ **NO Advanced Analytics** - PRO only  
❌ **NO Predictive Insights** - PRO only  
❌ **Template Limit:** Maximum 2 templates total (1 included + 1 paid)

---

### PRO PLAN (₦40,000/month)
**Credits:** 10,000 credits/month  
**Templates:** 2 templates included

#### What They Get (EVERYTHING in Starter PLUS):
✅ **Autopilot AI** - Full business intelligence system  
✅ **Industry-Specific Dashboards** - Choose from 35+ industries  
✅ **Advanced Dashboard** (10 metrics: All metrics including AI conversions)  
✅ **Predictive Analytics** - AI-powered forecasting  
✅ **Custom Layouts** - Design your own dashboard  
✅ **2 Templates Included** - Can switch between 2 templates  
✅ **Custom Domain** - Free custom domain setup  
✅ **Priority Support**  
✅ **Advanced Analytics** - Deep dive reports

#### Industry Advantages (PRO ONLY):
Each industry gets specialized dashboard with unique KPIs:

**Retail/E-commerce:**
- Inventory turnover rate
- Stock alerts
- Product velocity analysis

**Food/Restaurant:**
- Table turnover rate
- Average prep time
- Order accuracy tracking

**Services:**
- Booking conversion rate
- Cancellation rate
- No-show tracking

**Real Estate:**
- Active listings count
- Viewings scheduled
- Deals closed

**Automotive:**
- Test drives scheduled
- Inventory turnover
- Lead conversion rate

**Healthcare:**
- Patient appointments
- Treatment success rate
- Compliance tracking

**Education:**
- Student enrollment
- Course completion rate
- Assignment submissions

**And 28+ More Industries...**

#### What They Pay Extra For:
💰 **3rd+ Template:** ₦5,000 one-time per additional template  
💰 **Extra AI Credits:** ₦5,000 per 500 credits (after 10,000 monthly)

#### Truly Unlimited:
✅ Send 10,000 AI messages/month  
✅ Use all autopilot features  
✅ Access all industry dashboards  
✅ Change between 2 templates freely  
✅ Custom layouts unlimited

---

## Phase 3: Credit System Implementation

### 3.1 Database Schema

```prisma
model CreditAllocation {
  id              String   @id @default(cuid())
  storeId         String   @unique
  plan            String   // FREE, STARTER, PRO
  monthlyCredits  Int      // 0, 5000, or 10000
  usedCredits     Int      @default(0)
  resetDate       DateTime // Monthly reset date
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
  
  store           Store    @relation(fields: [storeId], references: [id])
}

model CreditUsageLog {
  id          String   @id @default(cuid())
  storeId     String
  amount      Int
  feature     String   // ai_message, template_change, etc.
  description String
  createdAt   DateTime @default(now())
  
  allocation  CreditAllocation @relation(fields: [storeId], references: [id])
}

model Store {
  // Add these fields
  trialStartDate    DateTime? @default(now())
  trialEndDate      DateTime? 
  trialExpired      Boolean @default(false)
  currentTemplateId String?  // Their active template
  ownedTemplates    String[] // Array of template IDs they own
}
```

### 3.2 Credit Costs Table

| Feature | Cost in Credits | Frequency | Notes |
|---------|----------------|-----------|-------|
| AI Message (any type) | 1 credit | Per message | WhatsApp, chatbot, etc. |
| Template Change (STARTER) | 5,000 credits | One-time | To acquire 2nd template |
| Template Change (PRO) | 5,000 credits | One-time | For 3rd+ template only |
| Custom Domain Setup | 200 credits | One-time | STARTER only (PRO gets free) |
| Advanced Analytics Report | 50 credits | Per report | STARTER only (PRO unlimited) |
| Export Data (CSV/PDF) | 10 credits | Per export | All plans |
| Autopilot Analysis Run | 100 credits | Per run | PRO only feature |
| Industry Dashboard Switch | 0 credits | Unlimited | PRO only feature |

### 3.3 Backend Implementation

**New File:** `Backend/core-api/src/lib/credits/credit-manager.ts`

```typescript
interface CreditCheckResult {
  allowed: boolean;
  remaining: number;
  reason?: string;
  message?: string;
}

export class CreditManager {
  /**
   * Check if store has enough credits
   */
  async checkCredits(storeId: string, cost: number): Promise<CreditCheckResult> {
    const allocation = await prisma.creditAllocation.findUnique({
      where: { storeId },
    });

    if (!allocation) {
      return { allowed: false, remaining: 0, reason: 'no_allocation' };
    }

    const remaining = allocation.monthlyCredits - allocation.usedCredits;
    
    if (remaining >= cost) {
      return { allowed: true, remaining: remaining - cost };
    }

    return {
      allowed: false,
      remaining,
      reason: 'insufficient_credits',
      message: `You need ${cost} credits but have only ${remaining} remaining.`,
    };
  }

  /**
   * Deduct credits from allocation
   */
  async useCredits(
    storeId: string,
    cost: number,
    feature: string,
    description: string
  ): Promise<{ success: boolean; remaining: number }> {
    const check = await this.checkCredits(storeId, cost);
    
    if (!check.allowed) {
      return { success: false, remaining: check.remaining };
    }

    await prisma.creditAllocation.update({
      where: { storeId },
      data: { usedCredits: { increment: cost } },
    });

    await prisma.creditUsageLog.create({
      data: {
        storeId,
        amount: cost,
        feature,
        description,
      },
    });

    return { success: true, remaining: check.remaining - cost };
  }

  /**
   * Get monthly allocation based on plan
   */
  getMonthlyCreditsForPlan(plan: string): number {
    switch (plan.toUpperCase()) {
      case 'FREE':
        return 0;
      case 'STARTER':
        return 5000;
      case 'PRO':
        return 10000;
      default:
        return 0;
    }
  }

  /**
   * Reset credits on monthly renewal
   */
  async resetMonthlyCredits(storeId: string): Promise<void> {
    const allocation = await prisma.creditAllocation.findUnique({
      where: { storeId },
    });

    if (!allocation) return;

    await prisma.creditAllocation.update({
      where: { storeId },
      data: {
        usedCredits: 0,
        resetDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 days
      },
    });
  }
}
```

**New File:** `Backend/core-api/src/app/api/credits/balance/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@vayva/db';

export async function GET(req: NextRequest) {
  const storeId = req.headers.get('x-store-id');
  
  if (!storeId) {
    return Response.json({ error: 'Store ID required' }, { status: 400 });
  }

  const allocation = await prisma.creditAllocation.findUnique({
    where: { storeId },
  });

  if (!allocation) {
    return Response.json({ 
      monthlyCredits: 0,
      usedCredits: 0,
      remainingCredits: 0,
      resetDate: null,
    });
  }

  const remaining = allocation.monthlyCredits - allocation.usedCredits;

  return Response.json({
    monthlyCredits: allocation.monthlyCredits,
    usedCredits: allocation.usedCredits,
    remainingCredits: remaining,
    resetDate: allocation.resetDate,
    plan: allocation.plan,
  });
}
```

**New File:** `Backend/core-api/src/app/api/credits/use/route.ts`

```typescript
import { NextRequest } from 'next/server';
import { prisma } from '@vayva/db';
import { CreditManager } from '@/lib/credits/credit-manager';

export async function POST(req: NextRequest) {
  const storeId = req.headers.get('x-store-id');
  const { amount, feature, description } = await req.json();

  if (!storeId || !amount) {
    return Response.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const manager = new CreditManager();
  const result = await manager.useCredits(storeId, amount, feature, description);

  if (!result.success) {
    return Response.json({ 
      success: false,
      message: 'Insufficient credits',
      remaining: result.remaining,
    }, { status: 402 }); // Payment Required
  }

  return Response.json({
    success: true,
    remaining: result.remaining,
  });
}
```

---

## Phase 4: Frontend UI Gating

### 4.1 Credit Balance Widget

**New Component:** `Frontend/merchant/src/components/billing/CreditBalanceWidget.tsx`

```typescript
'use client';

import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Zap, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface CreditBalance {
  monthlyCredits: number;
  usedCredits: number;
  remainingCredits: number;
  resetDate: string | null;
  plan: string;
}

export function CreditBalanceWidget() {
  const { data: balance, isLoading } = useQuery<CreditBalance>({
    queryKey: ['credits', 'balance'],
    queryFn: async () => {
      const res = await fetch('/api/credits/balance');
      if (!res.ok) throw new Error('Failed to fetch credits');
      return res.json();
    },
    refetchInterval: 30000, // Update every 30 seconds
  });

  const percentage = balance 
    ? (balance.remainingCredits / balance.monthlyCredits) * 100
    : 0;

  const isLow = percentage < 20;

  if (isLoading || !balance) {
    return <div className="w-32 h-10 bg-muted animate-pulse rounded-lg" />;
  }

  return (
    <div className="relative group">
      {/* Widget */}
      <div className={cn(
        "flex items-center gap-2 px-3 py-2 rounded-lg border transition-colors cursor-pointer",
        isLow 
          ? "bg-destructive/10 border-destructive/30" 
          : "bg-primary/5 border-primary/20"
      )}>
        <Zap className={cn(
          "w-4 h-4",
          isLow ? "text-destructive" : "text-primary"
        )} />
        
        <div className="flex flex-col">
          <span className="text-xs font-bold text-foreground">
            {balance.remainingCredits.toLocaleString()} credits
          </span>
          {balance.plan !== 'FREE' && (
            <span className="text-[10px] text-muted-foreground">
              {percentage.toFixed(0)}% remaining
            </span>
          )}
        </div>

        {isLow && balance.plan !== 'FREE' && (
          <AlertTriangle className="w-3 h-3 text-destructive" />
        )}
      </div>

      {/* Tooltip on hover */}
      <div className="absolute right-0 top-full mt-2 w-72 p-4 bg-popover border rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
        <div className="space-y-3">
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Monthly Allocation</span>
            <span className="font-semibold">{balance.monthlyCredits.toLocaleString()}</span>
          </div>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Used This Month</span>
            <span className="font-semibold text-destructive">{balance.usedCredits.toLocaleString()}</span>
          </div>
          <div className="h-px bg-border" />
          <div className="flex justify-between text-sm font-bold">
            <span className="text-foreground">Remaining</span>
            <span className={cn("text-primary", isLow && "text-destructive")}>
              {balance.remainingCredits.toLocaleString()}
            </span>
          </div>
          
          {balance.resetDate && (
            <p className="text-xs text-muted-foreground pt-2">
              Resets on {new Date(balance.resetDate).toLocaleDateString()}
            </p>
          )}

          {isLow && (
            <button
              onClick={() => toast.info('Top-up feature coming soon')}
              className="w-full mt-2 py-2 bg-primary text-primary-foreground rounded-lg text-xs font-semibold hover:bg-primary/90"
            >
              Top Up Credits
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
```

**Placement:** Add to dashboard header near profile icon

### 4.2 Dashboard Metric Gating

**Modify:** `Frontend/merchant/src/components/dashboard-v2/DashboardV2Content.tsx`

```typescript
// At the top of component
const DASHBOARD_VARIANT_CONFIG = {
  basic: {
    maxMetrics: 4,
    showFinancialCharts: false,
    showAISection: false,
    showAutopilot: false,
    showIndustryDashboards: false,
  },
  standard: {
    maxMetrics: 6,
    showFinancialCharts: true,
    showAISection: false,
    showAutopilot: false,
    showIndustryDashboards: false,
  },
  pro: {
    maxMetrics: 10,
    showFinancialCharts: true,
    showAISection: true,
    showAutopilot: true,
    showIndustryDashboards: true,
  },
};

// In render - limit visible metrics
const config = DASHBOARD_VARIANT_CONFIG[dashboardPlanTier];
const visibleMetrics = allMetrics.slice(0, config.maxMetrics);

// Hide entire sections based on plan
{config.showAISection && <AIPerformanceSection />}
{config.showAutopilot && <AutopilotSection />}
{config.showFinancialCharts && <FinancialCharts />}
```

### 4.3 Autopilot Page Gating

**Modify:** `Frontend/merchant/src/app/(dashboard)/dashboard/autopilot/page.tsx`

```typescript
// At the top of page component
const { data: subscription } = useSubscription(); // Get user's plan

if (subscription?.plan !== 'PRO') {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh]">
      <Lock className="w-16 h-16 text-muted-foreground mb-4" />
      <h1 className="text-2xl font-bold mb-2">Autopilot is a Pro Feature</h1>
      <p className="text-muted-foreground mb-6">
        Upgrade to Pro to unlock AI-powered business recommendations
      </p>
      <Link href="/upgrade">
        <Button>Upgrade to Pro</Button>
      </Link>
    </div>
  );
}

// Rest of existing autopilot code for PRO users
```

### 4.4 Industry Dashboard Gating

**Modify:** `Frontend/merchant/src/middleware/industry-dashboard-protection.ts`

```typescript
export function checkIndustryDashboardAccess(plan: string): {
  allowed: boolean;
  redirect?: boolean;
  message?: string;
} {
  if (plan === 'PRO') {
    return { allowed: true };
  }

  return {
    allowed: false,
    redirect: true,
    message: 'Industry-specific dashboards are available on Pro plan only',
  };
}
```

---

## Phase 5: Template Gating Implementation

### 5.1 Template Ownership Tracking

**Database Migration:**
```prisma
model Store {
  // Existing fields...
  currentTemplateId String?
  ownedTemplates    String[] // Array of template IDs
  plan              String   // FREE, STARTER, PRO
}
```

### 5.2 Template Selection Flow

**Modify:** `Frontend/merchant/src/app/(dashboard)/dashboard/templates/page.tsx`

```typescript
async function handleTemplateChange(templateId: string) {
  const store = await getCurrentStore();
  const ownedCount = store.ownedTemplates.length;
  const plan = store.plan;

  // FREE users: Can only pick ONCE during onboarding
  if (plan === 'FREE') {
    if (store.currentTemplateId) {
      throw new Error('Template changes require Starter plan');
    }
    // First selection is free
    await setTemplate(templateId);
    return;
  }

  // STARTER users: Start with 1, can buy 1 more
  if (plan === 'STARTER') {
    if (ownedCount === 0) {
      // First template is included
      await purchaseTemplate(templateId, 0);
    } else if (ownedCount === 1) {
      // Second template costs ₦5,000
      await purchaseTemplate(templateId, 5000);
    } else {
      throw new Error('Maximum 2 templates on Starter plan. Upgrade to Pro.');
    }
    return;
  }

  // PRO users: Start with 2, can buy more
  if (plan === 'PRO') {
    if (ownedCount < 2) {
      // First 2 templates included
      await purchaseTemplate(templateId, 0);
    } else {
      // 3rd+ template costs ₦5,000
      await purchaseTemplate(templateId, 5000);
    }
    return;
  }
}
```

### 5.3 Template Purchase Dialog

**New Component:** `Frontend/merchant/src/components/templates/TemplatePurchaseDialog.tsx`

```typescript
interface TemplatePurchaseDialogProps {
  template: Template;
  ownedCount: number;
  plan: string;
  onClose: () => void;
}

export function TemplatePurchaseDialog({ template, ownedCount, plan, onClose }: TemplatePurchaseDialogProps) {
  const calculateCost = () => {
    if (plan === 'FREE') return { cost: 0, message: 'Template changes not available' };
    if (plan === 'STARTER') {
      if (ownedCount === 0) return { cost: 0, message: 'Included with your plan' };
      if (ownedCount === 1) return { cost: 5000, message: '₦5,000 one-time' };
      return { cost: null, message: 'Max 2 templates on Starter' };
    }
    if (plan === 'PRO') {
      if (ownedCount < 2) return { cost: 0, message: 'Included with Pro' };
      return { cost: 5000, message: '₦5,000 one-time' };
    }
  };

  const pricing = calculateCost();

  if (!pricing.cost) {
    return (
      <AlertDialog open onOpenChange={onClose}>
        <AlertDialogContent>
          <AlertDialogTitle>Template Limit Reached</AlertDialogTitle>
          <AlertDialogDescription>
            {pricing.message}
          </AlertDialogDescription>
          <Link href="/upgrade">
            <Button>Upgrade Plan</Button>
          </Link>
        </AlertDialogContent>
      </AlertDialog>
    );
  }

  return (
    <AlertDialog open onOpenChange={onClose}>
      <AlertDialogContent>
        <AlertDialogTitle>
          {pricing.cost === 0 ? 'Confirm Template' : 'Purchase Template'}
        </AlertDialogTitle>
        <AlertDialogDescription>
          {pricing.cost === 0 
            ? `This template is included with your ${plan} plan.`
            : `${pricing.message} will be charged to your account.`
          }
        </AlertDialogDescription>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={() => confirmPurchase(template.id, pricing.cost!)}
          >
            {pricing.cost === 0 ? 'Select Template' : `Pay ₦${pricing.cost}`}
          </Button>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  );
}
```

---

## Phase 6: Trial Management

### 6.1 14-Day Trial Logic

**Database Fields:**
```prisma
model Store {
  trialStartDate  DateTime? @default(now())
  trialEndDate    DateTime?
  trialExpired    Boolean @default(false)
}
```

**Calculation:**
```typescript
function calculateTrialEnd(startDate: Date): Date {
  return new Date(startDate.getTime() + 14 * 24 * 60 * 60 * 1000);
}

function isTrialExpired(endDate: Date): boolean {
  return new Date() > endDate;
}
```

### 6.2 Trial Expiration Flow

**Day 1-13:** Full FREE access (basic dashboard + 100 WhatsApp messages)

**Day 13 Warning:**
```typescript
<TrialEndingSoonBanner daysLeft={1} />
```

**Day 14 (Expired):**
```typescript
if (trialExpired && plan === 'FREE') {
  return (
    <UpgradePromptModal
      title="Trial Expired"
      message="Your 14-day free trial has ended. Upgrade to continue."
      features={[
        "Full dashboard access",
        "AI messaging",
        "Website builder",
        "Remove Vayva branding"
      ]}
    />
  );
}
```

**Grace Period (Days 15-21):**
- Read-only access to basic dashboard
- Cannot edit products, orders, or settings
- Can still view data
- Constant upgrade prompts

---

## Phase 7: Testing Scenarios

### Test Case 1: FREE User Experience
```typescript
test('FREE user sees basic dashboard only', async () => {
  // Login as FREE user
  // Verify: Only 4 metrics visible
  // Verify: AI Performance section HIDDEN
  // Verify: Autopilot link HIDDEN
  // Verify: Financial charts HIDDEN
  // Verify: Can connect WhatsApp Evolution API
  // Verify: Can send 100 messages
  // Verify: 101st message blocked
});

test('FREE user cannot change template', async () => {
  // Select initial template → Success
  // Try to change template → Blocked with upgrade prompt
});
```

### Test Case 2: STARTER User Experience
```typescript
test('STARTER user gets 5,000 credits', async () => {
  // Upgrade to STARTER
  // Check credit widget shows 5,000
  // Send 100 AI messages → 4,900 remaining
  // Verify: Standard dashboard (6 metrics)
  // Verify: Financial charts visible
  // Verify: Autopilot still HIDDEN
  // Verify: Industry dashboards HIDDEN
});

test('STARTER user template limits', async () => {
  // First template → Free
  // Second template → ₦5,000 charge
  // Third template → Blocked (max 2 on Starter)
});
```

### Test Case 3: PRO User Experience
```typescript
test('PRO user gets autopilot and industry dashboards', async () => {
  // Upgrade to PRO
  // Verify: Autopilot page accessible
  // Verify: Industry dashboard selector visible
  // Verify: 10 metrics visible
  // Verify: 10,000 credits in widget
  // Run autopilot analysis → -100 credits
  // Send 500 AI messages → 9,500 remaining
});

test('PRO user template flexibility', async () => {
  // First 2 templates → Free
  // Third template → ₦5,000 charge
  // Switch between owned 2 templates → Free
});
```

---

## Phase 8: Files to Create/Modify

### Backend Files to Create:
1. `Backend/core-api/src/lib/credits/credit-manager.ts` (NEW)
2. `Backend/core-api/src/app/api/credits/balance/route.ts` (NEW)
3. `Backend/core-api/src/app/api/credits/use/route.ts` (NEW)
4. `Backend/core-api/src/app/api/credits/topup/route.ts` (NEW)
5. `Backend/core-api/src/lib/templates/template-manager.ts` (NEW)

### Backend Files to Modify:
1. `Backend/core-api/src/lib/billing/access.ts` - Complete rewrite
2. `Backend/core-api/src/config/pricing.ts` - Update plan benefits
3. Prisma schema - Add credit tracking fields

### Frontend Files to Create:
1. `Frontend/merchant/src/components/billing/CreditBalanceWidget.tsx` (NEW)
2. `Frontend/merchant/src/components/templates/TemplatePurchaseDialog.tsx` (NEW)
3. `Frontend/merchant/src/components/gating/PlanTierGate.tsx` (ENHANCE)

### Frontend Files to Modify:
1. `Frontend/merchant/src/components/dashboard-v2/DashboardV2Content.tsx` - Add gating
2. `Frontend/merchant/src/app/(dashboard)/dashboard/autopilot/page.tsx` - Add PRO gate
3. `Frontend/merchant/src/app/(dashboard)/dashboard/templates/page.tsx` - Add purchase flow
4. `Frontend/merchant/src/middleware/industry-dashboard-protection.ts` - Enhance gating
5. `Frontend/merchant/src/app/(dashboard)/dashboard/page.tsx` - Redirect based on plan

### Marketing Files to Modify:
1. `Frontend/marketing/src/pages/pricing.tsx` - Update plan comparison
2. `Frontend/marketing/src/components/features/AutopilotFeature.tsx` - Mark as PRO only

---

## Phase 9: Pricing Page Updates

**Update:** `Frontend/marketing/src/pages/pricing.tsx`

### FREE Trial:
```markdown
**Free Trial**
Perfect for testing the waters

₦0 for 14 days

✅ Basic dashboard (4 metrics)
✅ WhatsApp Evolution API
✅ 100 AI messages
✅ 1 template (no changes)
✅ Website builder (subdomain)
❌ No AI Autopilot
❌ No financial charts
❌ No industry dashboards
❌ Vayva branding remains
```

### STARTER:
```markdown
**Starter**
For growing businesses

₦25,000/month

✅ Everything in Free, plus:
✅ 5,000 credits/month
✅ Standard dashboard (6 metrics)
✅ Financial charts
✅ All add-ons included
✅ Remove Vayva branding
✅ 1 template included
✅ Option to buy 2nd template (₦5,000)
❌ No AI Autopilot
❌ No industry dashboards
❌ No custom domain
```

### PRO:
```markdown
**Pro**
Unlimited power

₦40,000/month

✅ Everything in Starter, plus:
✅ 10,000 credits/month
✅ AI Autopilot (game-changing insights)
✅ Industry-specific dashboards (35+ options)
✅ Advanced dashboard (10 metrics)
✅ Predictive analytics
✅ Custom layouts
✅ 2 templates included
✅ Custom domain support
✅ Priority support
✅ Option to buy 3rd+ templates (₦5,000 each)
```

---

## Success Criteria

✅ **FREE users:**
- See ONLY basic dashboard (4 metrics)
- NO AI Performance section
- NO Autopilot anywhere
- Can use WhatsApp Evolution API (100 messages max)
- Template locked after initial selection

✅ **STARTER users:**
- Get 5,000 credits/month tracked properly
- See standard dashboard (6 metrics)
- See financial charts
- NO Autopilot access
- NO industry dashboards
- Can own maximum 2 templates (1 included + 1 paid)
- NO custom domain

✅ **PRO users:**
- Get 10,000 credits/month
- FULL Autopilot access
- Can select industry-specific dashboards
- See all 10 metrics
- Can own 2 templates free, pay ₦5,000 for 3rd+
- Custom domain included
- Industry advantages clearly visible

✅ **Credit System:**
- Widget visible in header
- Real-time updates
- Proper deduction for AI messages
- Proper deduction for template purchases
- Monthly reset working

✅ **Trial System:**
- 14-day trial enforced
- Warning on day 13
- Expiration on day 14
- Grace period days 15-21

---

## Estimated Timeline

**Phase 1-2 (Cleanup & Planning):** 1 day  
**Phase 3 (Credit System Backend):** 2 days  
**Phase 4 (Frontend UI Gating):** 2 days  
**Phase 5 (Template Gating):** 1 day  
**Phase 6 (Trial System):** 1 day  
**Phase 7 (Testing):** 2 days  
**Phase 8 (Documentation):** 1 day  

**Total: 10 days**

---

## Key Differentiators Summary

| Feature | FREE | STARTER | PRO |
|---------|------|---------|-----|
| **Dashboard Metrics** | 4 basic | 6 standard | 10 advanced |
| **AI Autopilot** | ❌ Hidden | ❌ Hidden | ✅ INCLUDED |
| **Industry Dashboards** | ❌ Hidden | ❌ Hidden | ✅ 35+ options |
| **Credits/Month** | 0 | 5,000 | 10,000 |
| **AI Messages** | 100 total | 5,000 included | 10,000 included |
| **Templates Included** | 1 (locked) | 1 | 2 |
| **Extra Template Cost** | Not allowed | ₦5,000 | ₦5,000 (3rd+) |
| **Custom Domain** | ❌ No | ❌ No | ✅ Yes |
| **Financial Charts** | ❌ No | ✅ Yes | ✅ Yes |
| **Remove Branding** | ❌ No | ✅ Yes | ✅ Yes |
| **Priority Support** | ❌ No | ❌ No | ✅ Yes |

---

## Conclusion

This plan creates **clear, honest differentiation** between tiers:

- **FREE**: Taste of basics, WhatsApp only, no AI autopilot
- **STARTER**: Growing businesses, 5K credits, 1 template, NO autopilot
- **PRO**: Power users, 10K credits, autopilot, industry dashboards, 2 templates

The credit system tracks usage transparently. Industry-specific dashboards give PRO users real competitive advantage. Template gating is strict but fair.

**No more confusion. No more false advertising. Just clean, simple tiers with real value at each level.**
