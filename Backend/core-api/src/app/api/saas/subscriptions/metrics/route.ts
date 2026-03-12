import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

interface SubscriptionMetrics {
  total: number;
  byStatus: {
    active: number;
    trialing: number;
    cancelled: number;
  };
  byPlan: Array<{
    planId: string;
    planName: string;
    count: number;
    mrr: number;
  }>;
  byBillingCycle: {
    monthly: number;
    yearly: number;
  };
  mrrBreakdown: {
    total: number;
    byTier: Array<{
      tier: string;
      amount: number;
      percentage: number;
      subscribers: number;
    }>;
    addOns: number;
    expansion: number;
    contraction: number;
  };
}

export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request: NextRequest, { storeId }: APIContext) => {
    try {
      // Get all subscriptions
      const subscriptions = await prisma.subscription.findMany({
        where: { storeId },
        include: { plan: true },
      });

      // Count by status
      const byStatus = {
        active: subscriptions.filter(s => s.status === "active").length,
        trialing: subscriptions.filter(s => s.status === "trialing").length,
        cancelled: subscriptions.filter(s => s.status === "cancelled").length,
      };

      // Group by plan
      const planGroups = subscriptions.reduce((acc, sub) => {
        const key = sub.planId;
        if (!acc[key]) {
          acc[key] = {
            planId: sub.planId,
            planName: sub.plan.name,
            count: 0,
            mrr: 0,
          };
        }
        acc[key].count += 1;
        acc[key].mrr += sub.price || 0;
        return acc;
      }, {} as Record<string, { planId: string; planName: string; count: number; mrr: number }>);

      const byPlan = Object.values(planGroups);

      // Group by billing cycle
      const byBillingCycle = {
        monthly: subscriptions.filter(s => s.billingCycle === "monthly").length,
        yearly: subscriptions.filter(s => s.billingCycle === "yearly").length,
      };

      // Calculate MRR breakdown
      const totalMRR = subscriptions.reduce((acc, sub) => acc + (sub.price || 0), 0);
      
      // Group by tier (Starter, Professional, Enterprise based on price)
      const tierGroups = subscriptions.reduce((acc, sub) => {
        let tier = "Other";
        if (sub.price && sub.price < 50) tier = "Starter";
        else if (sub.price && sub.price >= 50 && sub.price < 200) tier = "Professional";
        else if (sub.price && sub.price >= 200) tier = "Enterprise";
        
        if (!acc[tier]) {
          acc[tier] = {
            tier,
            amount: 0,
            subscribers: 0,
          };
        }
        acc[tier].amount += sub.price || 0;
        acc[tier].subscribers += 1;
        return acc;
      }, {} as Record<string, { tier: string; amount: number; subscribers: number }>);

      const byTier = Object.values(tierGroups).map(tier => ({
        ...tier,
        percentage: totalMRR > 0 ? Math.round((tier.amount / totalMRR) * 100) : 0,
      }));

      // Placeholder values for add-ons, expansion, contraction
      // In production, these would be calculated from usage data and upgrades/downgrades
      const addOns = totalMRR * 0.1; // 10% estimate
      const expansion = totalMRR * 0.15; // 15% estimate
      const contraction = totalMRR * 0.04; // 4% estimate

      const metrics: SubscriptionMetrics = {
        total: subscriptions.length,
        byStatus,
        byPlan,
        byBillingCycle,
        mrrBreakdown: {
          total: Math.round(totalMRR),
          byTier,
          addOns: Math.round(addOns),
          expansion: Math.round(expansion),
          contraction: Math.round(contraction),
        },
      };

      return NextResponse.json({ metrics }, {
        headers: { "Cache-Control": "no-store" },
      });
    } catch (error: unknown) {
      logger.error("[SAAS_SUBSCRIPTION_METRICS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch subscription metrics" },
        { status: 500 }
      );
    }
  }
);
