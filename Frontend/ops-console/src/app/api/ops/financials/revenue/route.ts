import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

interface RevenueAnalytics {
  mrr: {
    current: number;
    previousMonth: number;
    growth: number;
    byPlan: { plan: string; mrr: number; merchants: number }[];
  };
  arr: {
    current: number;
    growth: number;
  };
  revenueChurn: {
    grossChurn: number;
    netChurn: number;
    churnedMrr: number;
    expansionMrr: number;
    contractionMrr: number;
  };
  revenueTrend: {
    month: string;
    mrr: number;
    newMrr: number;
    churnedMrr: number;
    expansionMrr: number;
  }[];
  topCustomers: {
    storeId: string;
    storeName: string;
    mrr: number;
    totalPaid: number;
    tenureMonths: number;
  }[];
  forecast: {
    nextMonthMrr: number;
    nextQuarterArr: number;
    growthRate: number;
  };
}

export async function GET() {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPS_SUPPORT");

    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Plan pricing in kobo
    const planPrices: Record<string, number> = {
      STARTER: 0,
      PROFESSIONAL: 15000,
      BUSINESS: 35000,
      ENTERPRISE: 100000,
    };

    // Get all active subscriptions for MRR calculation
    const activeSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
      },
      include: {
        store: {
          select: { id: true, name: true, createdAt: true },
        },
        InvoiceV2: {
          where: { status: "PAID" },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    // Calculate current MRR based on plan prices
    const currentMrr = activeSubscriptions.reduce((acc, sub) => {
      return acc + (planPrices[sub.planKey] || 0);
    }, 0);

    // Group by plan
    const planMap = new Map<string, { mrr: number; merchants: number }>();
    activeSubscriptions.forEach((sub) => {
      const plan = sub.planKey || "STARTER";
      const existing = planMap.get(plan) || { mrr: 0, merchants: 0 };
      existing.mrr += planPrices[plan] || 0;
      existing.merchants++;
      planMap.set(plan, existing);
    });

    const byPlan = Array.from(planMap.entries())
      .map(([plan, data]) => ({
        plan,
        mrr: data.mrr,
        merchants: data.merchants,
      }))
      .sort((a, b) => b.mrr - a.mrr);

    // Calculate ARR
    const currentArr = currentMrr * 12;

    // Get previous month's subscriptions for comparison
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const lastMonthSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        createdAt: { lte: lastMonth },
        cancelAtPeriodEnd: false,
      },
    });

    const previousMonthMrr = lastMonthSubscriptions.reduce((acc, sub) => {
      return acc + (planPrices[sub.planKey] || 0);
    }, 0);

    const mrrGrowth = previousMonthMrr > 0 
      ? ((currentMrr - previousMonthMrr) / previousMonthMrr) * 100 
      : 0;

    // Revenue churn analysis (last 30 days)
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    
    const churnedSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "CANCELED",
        updatedAt: { gte: thirtyDaysAgo },
      },
      include: {
        store: {
          select: { id: true, name: true },
        },
      },
    });

    const churnedMrr = churnedSubscriptions.reduce((acc, sub) => {
      return acc + (planPrices[sub.planKey] || 0);
    }, 0);
    const grossChurn = currentMrr > 0 ? (churnedMrr / currentMrr) * 100 : 0;

    // Expansion and contraction MRR - simplified without subscriptionChange model
    const expansionMrr = 0;
    const contractionMrr = 0;

    const netChurn = grossChurn + ((expansionMrr - contractionMrr) / (currentMrr || 1)) * 100;

    // Revenue trend (last 6 months)
    const revenueTrend: { month: string; mrr: number; newMrr: number; churnedMrr: number; expansionMrr: number }[] = [];
    
    for (let i = 5; i >= 0; i--) {
      const monthDate = new Date(currentYear, currentMonth - i, 1);
      const monthEnd = new Date(currentYear, currentMonth - i + 1, 0);
      const monthKey = monthDate.toLocaleDateString("en-US", { month: "short", year: "numeric" });

      // MRR at end of month
      const monthSubscriptions = await prisma.subscription.findMany({
        where: {
          status: "ACTIVE",
          createdAt: { lte: monthEnd },
          OR: [
            { cancelAtPeriodEnd: false },
            { currentPeriodEnd: { gt: monthEnd } },
          ],
        },
      });
      const monthMrr = monthSubscriptions.reduce((acc, sub) => {
        return acc + (planPrices[sub.planKey] || 0);
      }, 0);

      // New MRR from new subscriptions
      const newSubs = await prisma.subscription.findMany({
        where: {
          status: "ACTIVE",
          createdAt: {
            gte: monthDate,
            lte: monthEnd,
          },
        },
      });
      const newMrr = newSubs.reduce((acc, sub) => {
        return acc + (planPrices[sub.planKey] || 0);
      }, 0);

      // Churned MRR
      const churned = await prisma.subscription.findMany({
        where: {
          status: "CANCELED",
          updatedAt: {
            gte: monthDate,
            lte: monthEnd,
          },
        },
      });
      const monthChurnedMrr = churned.reduce((acc, sub) => {
        return acc + (planPrices[sub.planKey] || 0);
      }, 0);

      // Expansion MRR - simplified
      const monthExpansionMrr = 0;

      revenueTrend.push({
        month: monthKey,
        mrr: monthMrr,
        newMrr,
        churnedMrr: monthChurnedMrr,
        expansionMrr: monthExpansionMrr,
      });
    }

    // Top customers by invoice totals
    const storeTotals = new Map<string, { name: string; total: number; subCreatedAt: Date }>();
    
    for (const sub of activeSubscriptions) {
      const storeId = sub.storeId;
      const totalPaid = sub.InvoiceV2.reduce((acc, inv) => acc + Number(inv.totalKobo), 0);
      const existing = storeTotals.get(storeId);
      if (!existing || existing.total < totalPaid) {
        storeTotals.set(storeId, {
          name: sub.store?.name || "Unknown",
          total: totalPaid,
          subCreatedAt: sub.createdAt,
        });
      }
    }

    const topCustomers = Array.from(storeTotals.entries())
      .map(([storeId, data]) => {
        const tenureMonths = Math.max(1, Math.floor(
          (Date.now() - data.subCreatedAt.getTime()) / (30 * 24 * 60 * 60 * 1000)
        ));
        return {
          storeId,
          storeName: data.name,
          mrr: 0,
          totalPaid: data.total,
          tenureMonths,
        };
      })
      .sort((a, b) => b.totalPaid - a.totalPaid)
      .slice(0, 10);

    // Simple forecast based on current growth rate
    const growthRate = revenueTrend.length >= 2
      ? ((revenueTrend[revenueTrend.length - 1].mrr - revenueTrend[0].mrr) / (revenueTrend[0].mrr || 1)) / revenueTrend.length
      : 0;

    const nextMonthMrr = currentMrr * (1 + growthRate);
    const nextQuarterArr = nextMonthMrr * 3 * (1 + growthRate * 3);

    const analytics: RevenueAnalytics = {
      mrr: {
        current: Math.round(currentMrr),
        previousMonth: Math.round(previousMonthMrr),
        growth: Math.round(mrrGrowth * 10) / 10,
        byPlan,
      },
      arr: {
        current: Math.round(currentArr),
        growth: Math.round(mrrGrowth * 10) / 10,
      },
      revenueChurn: {
        grossChurn: Math.round(grossChurn * 10) / 10,
        netChurn: Math.round(netChurn * 10) / 10,
        churnedMrr: Math.round(churnedMrr),
        expansionMrr: Math.round(expansionMrr),
        contractionMrr: Math.round(contractionMrr),
      },
      revenueTrend,
      topCustomers,
      forecast: {
        nextMonthMrr: Math.round(nextMonthMrr),
        nextQuarterArr: Math.round(nextQuarterArr),
        growthRate: Math.round(growthRate * 100 * 10) / 10,
      },
    };

    return NextResponse.json({ data: analytics });
  } catch (error: unknown) {
    if (
      error instanceof Error ? error.message : String(error) === "Unauthorized"
    )
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    if (
      error instanceof Error
        ? error.message
        : String(error)?.includes("Insufficient permissions")
    )
      return NextResponse.json(
        { error: error instanceof Error ? error.message : String(error) },
        { status: 403 },
      );

    logger.error("[REVENUE_ANALYTICS_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
