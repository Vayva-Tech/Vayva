import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";
import { calculateProration, validateProrationInput, formatProrationForDisplay } from "@vayva/billing";

interface ProrationRequest {
  targetPlan: string;
  effectiveDate?: string;
  billingCycle?: 'monthly' | 'quarterly';
}

// POST /api/billing/proration/calculate - Calculate proration for plan change
export const POST = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req, { storeId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = parsedBody as Record<string, unknown>;
      const targetPlan = typeof body.targetPlan === 'string' ? body.targetPlan : undefined;
      const effectiveDateStr = typeof body.effectiveDate === 'string' ? body.effectiveDate : undefined;
      const billingCycle = (typeof body.billingCycle === 'string' && 
        ['monthly', 'quarterly'].includes(body.billingCycle)) 
        ? body.billingCycle as 'monthly' | 'quarterly' 
        : 'monthly';

      if (!targetPlan) {
        return NextResponse.json({ error: "Target plan is required" }, { status: 400 });
      }

      // Get current subscription and store details
      const [store, subscription] = await Promise.all([
        prisma.store.findUnique({
          where: { id: storeId },
          select: { plan: true },
        }),
        prisma.merchantAiSubscription.findUnique({
          where: { storeId },
          select: { 
            creditsRemaining: true,
            periodStart: true,
            periodEnd: true,
          },
        }),
      ]);

      if (!store?.plan) {
        return NextResponse.json({ error: "Store or plan not found" }, { status: 404 });
      }

      const currentPlan = store.plan;

      // Plan prices mapping
      const PLAN_PRICES: Record<string, number> = {
        FREE: 0,
        STARTER: 25000,
        PRO: 35000,
        PRO_PLUS: 50000,
      };

      const currentAmount = PLAN_PRICES[currentPlan] || 0;
      const targetAmount = PLAN_PRICES[targetPlan.toUpperCase()] || 0;

      if (currentAmount === 0 && targetAmount === 0) {
        return NextResponse.json({ error: "Invalid plan combination" }, { status: 400 });
      }

      // Determine cycle dates
      const now = new Date();
      const cycleStartDate = subscription?.periodStart || now;
      const cycleEndDate = subscription?.periodEnd || new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
      const effectiveDate = effectiveDateStr ? new Date(effectiveDateStr) : now;

      // Validate inputs
      const validation = validateProrationInput({
        currentPlan,
        targetPlan: targetPlan.toUpperCase(),
        currentAmount,
        targetAmount,
        cycleStartDate,
        cycleEndDate,
        effectiveDate,
        isUpgrade: targetAmount > currentAmount,
        existingCredits: subscription?.creditsRemaining || 0,
        billingCycle,
      });

      if (!validation.valid) {
        return NextResponse.json(
          { error: "Invalid proration inputs", details: validation.errors },
          { status: 400 }
        );
      }

      // Calculate proration
      const prorationResult = calculateProration({
        currentPlan,
        targetPlan: targetPlan.toUpperCase(),
        currentAmount,
        targetAmount,
        cycleStartDate,
        cycleEndDate,
        effectiveDate,
        isUpgrade: targetAmount > currentAmount,
        existingCredits: subscription?.creditsRemaining || 0,
        billingCycle,
      });

      // Determine if this is upgrade or downgrade
      const isUpgrade = targetAmount > currentAmount;
      const isDowngrade = targetAmount < currentAmount;

      logger.info("[PRORATION_CALCULATED]", {
        storeId,
        currentPlan,
        targetPlan,
        isUpgrade,
        isDowngrade,
        prorationCredit: prorationResult.prorationCredit,
        amountDueNow: prorationResult.amountDueNow,
        daysRemaining: prorationResult.daysRemaining,
      });

      return NextResponse.json({
        success: true,
        data: {
          currentPlan,
          targetPlan: targetPlan.toUpperCase(),
          isUpgrade,
          isDowngrade,
          calculation: {
            daysRemaining: prorationResult.daysRemaining,
            totalDays: prorationResult.totalDays,
            dailyRateCurrent: prorationResult.dailyRateCurrent,
            dailyRateTarget: prorationResult.dailyRateTarget,
          },
          financials: {
            prorationCredit: prorationResult.prorationCredit,
            creditsApplied: prorationResult.creditsApplied,
            totalCredit: prorationResult.totalCredit,
            amountDueNow: prorationResult.amountDueNow,
            nextBillingAmount: prorationResult.nextBillingAmount,
            breakdown: prorationResult.breakdown,
          },
          timing: {
            effectiveDate: prorationResult.effectiveDate.toISOString(),
            nextBillingDate: prorationResult.nextBillingDate.toISOString(),
            currentPeriodEnd: cycleEndDate.toISOString(),
          },
          display: formatProrationForDisplay(prorationResult),
        },
        message: isUpgrade 
          ? `Upgrade to ${targetPlan.toUpperCase()} will cost ${formatCurrency(prorationResult.amountDueNow)} now`
          : `Downgrade to ${targetPlan.toUpperCase()} will credit ${formatCurrency(prorationResult.prorationCredit)}`,
      });
    } catch (error: unknown) {
      logger.error("[PRORATION_POST]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);

// GET /api/billing/proration/preview - Preview proration without commitment
export const GET = withVayvaAPI(
  PERMISSIONS.BILLING_MANAGE,
  async (req, { storeId }) => {
    try {
      const searchParams = new URL(req.url).searchParams;
      const targetPlan = searchParams.get('targetPlan');
      const effectiveDateStr = searchParams.get('effectiveDate');

      if (!targetPlan) {
        return NextResponse.json(
          { error: "Missing targetPlan parameter" },
          { status: 400 }
        );
      }

      // Reuse POST logic by constructing request
      const mockReq = new Request(req.url, {
        method: 'POST',
        body: JSON.stringify({
          targetPlan,
          effectiveDate: effectiveDateStr || undefined,
        }),
      });

      // Call POST handler
      const postHandler = await POST(mockReq, { params: Promise.resolve({ storeId }) } as any);
      return postHandler;
    } catch (error: unknown) {
      logger.error("[PRORATION_GET]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);

/**
 * Helper function to format currency
 */
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
}
