import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

interface SubscriptionLifecycle {
  trialConversion: {
    totalTrials: number;
    converted: number;
    conversionRate: number;
    avgConversionDays: number;
    expiringSoon: {
      storeId: string;
      storeName: string;
      trialEndsAt: string;
      daysLeft: number;
      activityScore: number;
      conversionLikelihood: "high" | "medium" | "low";
    }[];
  };
  churnAnalysis: {
    totalChurned30d: number;
    churnRate: number;
    avgLifetimeValue: number;
    avgTenureDays: number;
    topChurnReasons: { reason: string; count: number }[];
    atRiskMerchants: {
      storeId: string;
      storeName: string;
      riskScore: number;
      riskFactors: string[];
      mrr: number;
    }[];
  };
  planChanges: {
    upgrades30d: number;
    downgrades30d: number;
    netRevenueImpact: number;
    recentChanges: {
      storeId: string;
      storeName: string;
      fromPlan: string;
      toPlan: string;
      changeType: "upgrade" | "downgrade";
      mrrImpact: number;
      changedAt: string;
    }[];
  };
  failedPayments: {
    totalFailed30d: number;
    recoveryRate: number;
    dunningActive: number;
    recoveredAmount: number;
    failedPaymentMerchants: {
      storeId: string;
      storeName: string;
      failedCount: number;
      lastFailedAt: string;
      amountDue: number;
      recoveryStatus: string;
    }[];
  };
}

export async function GET() {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPS_SUPPORT");

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Trial Conversion Analysis
    const trialSubscriptions = await prisma.subscription.findMany({
      where: {
        status: { in: ["TRIALING", "ACTIVE", "CANCELED"] },
        trialEndsAt: { not: null },
      },
      include: {
        store: { select: { id: true, name: true } },
      },
    });

    const totalTrials = trialSubscriptions.length;
    const convertedTrials = trialSubscriptions.filter(
      (s) => s.status === "ACTIVE" && s.trialEndsAt && s.trialEndsAt < now,
    );
    const conversionRate = totalTrials > 0 ? (convertedTrials.length / totalTrials) * 100 : 0;

    // Calculate average conversion days
    const avgConversionDays =
      convertedTrials.length > 0
        ? convertedTrials.reduce((acc, s) => {
            if (s.trialEndsAt && s.currentPeriodStart) {
              const trialEnd = new Date(s.trialEndsAt).getTime();
              const periodStart = new Date(s.currentPeriodStart).getTime();
              return acc + (trialEnd - periodStart) / (1000 * 60 * 60 * 24);
            }
            return acc;
          }, 0) / convertedTrials.length
        : 0;

    // Expiring trials with activity scoring
    const expiringTrials = await prisma.subscription.findMany({
      where: {
        status: "TRIALING",
        trialEndsAt: {
          lte: sevenDaysFromNow,
          gte: now,
        },
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            _count: {
              select: {
                orders: true,
                products: true,
              },
            },
          },
        },
      },
    });

    const expiringSoon = expiringTrials.map((sub) => {
      const daysLeft = sub.trialEndsAt
        ? Math.ceil((new Date(sub.trialEndsAt).getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : 0;

      // Calculate activity score (0-100)
      const orderCount = (sub.store as any)?._count?.orders || 0;
      const productCount = (sub.store as any)?._count?.products || 0;
      const activityScore = Math.min(100, orderCount * 10 + productCount * 5);

      // Determine conversion likelihood
      let conversionLikelihood: "high" | "medium" | "low" = "low";
      if (activityScore > 50 && daysLeft > 2) conversionLikelihood = "high";
      else if (activityScore > 20 || daysLeft > 3) conversionLikelihood = "medium";

      return {
        storeId: sub.storeId,
        storeName: sub.store?.name || "Unknown",
        trialEndsAt: sub.trialEndsAt?.toISOString() || "",
        daysLeft,
        activityScore,
        conversionLikelihood,
      };
    });

    // Churn Analysis
    const churnedSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "CANCELED",
        updatedAt: { gte: thirtyDaysAgo },
      },
      include: {
        store: { select: { id: true, name: true } },
        InvoiceV2: true,
      },
    });

    const activeSubscriptions = await prisma.subscription.count({
      where: { status: "ACTIVE" },
    });

    const churnRate =
      activeSubscriptions + churnedSubscriptions.length > 0
        ? (churnedSubscriptions.length / (activeSubscriptions + churnedSubscriptions.length)) * 100
        : 0;

    // Calculate average lifetime value from invoices
    const avgLifetimeValue =
      churnedSubscriptions.length > 0
        ? churnedSubscriptions.reduce((acc, s) => {
            const totalPaid = s.InvoiceV2.reduce((sum, inv) => sum + Number(inv.totalKobo), 0);
            return acc + totalPaid;
          }, 0) / churnedSubscriptions.length
        : 0;

    const avgTenureDays =
      churnedSubscriptions.length > 0
        ? churnedSubscriptions.reduce((acc, s) => {
            if (s.createdAt && s.updatedAt) {
              return acc + (s.updatedAt.getTime() - s.createdAt.getTime()) / (1000 * 60 * 60 * 24);
            }
            return acc;
          }, 0) / churnedSubscriptions.length
        : 0;

    // At-risk merchants (low engagement, expiring soon)
    const atRiskSubscriptions = await prisma.subscription.findMany({
      where: {
        status: "ACTIVE",
        OR: [
          {
            currentPeriodEnd: {
              lte: new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000),
            },
          },
          {
            cancelAtPeriodEnd: true,
          },
        ],
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      take: 20,
    });

    // Get order counts and failed invoices for at-risk merchants
    const storeIds = atRiskSubscriptions.map(s => s.storeId);
    
    const orderCounts = await prisma.order.groupBy({
      by: ["storeId"],
      where: {
        storeId: { in: storeIds },
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: {
        storeId: true,
      },
    });

    const failedInvoiceCounts = await prisma.invoiceV2.groupBy({
      by: ["storeId"],
      where: {
        storeId: { in: storeIds },
        status: "OVERDUE",
        createdAt: { gte: thirtyDaysAgo },
      },
      _count: {
        storeId: true,
      },
    });

    const orderCountMap = new Map(orderCounts.map(o => [o.storeId, o._count.storeId]));
    const failedInvoiceMap = new Map(failedInvoiceCounts.map(i => [i.storeId, i._count.storeId]));

    const atRiskMerchants = atRiskSubscriptions.map((sub) => {
      const failedCount = failedInvoiceMap.get(sub.storeId) || 0;
      const recentOrders = orderCountMap.get(sub.storeId) || 0;
      const riskFactors: string[] = [];

      if (failedCount > 0) riskFactors.push("Payment failures");
      if (recentOrders === 0) riskFactors.push("No recent orders");
      if (sub.cancelAtPeriodEnd) riskFactors.push("Cancelling at period end");
      if (sub.currentPeriodEnd && sub.currentPeriodEnd < new Date(now.getTime() + 3 * 24 * 60 * 60 * 1000)) {
        riskFactors.push("Subscription expiring soon");
      }

      const riskScore = Math.min(100, failedCount * 20 + (recentOrders === 0 ? 30 : 0) + (sub.cancelAtPeriodEnd ? 40 : 0));

      // Plan pricing for MRR
      const planPrices: Record<string, number> = {
        STARTER: 0,
        PROFESSIONAL: 15000,
        BUSINESS: 35000,
        ENTERPRISE: 100000,
      };

      return {
        storeId: sub.storeId,
        storeName: sub.store?.name || "Unknown",
        riskScore,
        riskFactors,
        mrr: planPrices[sub.planKey] || 0,
      };
    });

    // Plan Changes - track via audit log since subscriptionChange model doesn't exist
    const planChangeEvents = await prisma.auditLog.findMany({
      where: {
        action: { in: ["SUBSCRIPTION_UPGRADE", "SUBSCRIPTION_DOWNGRADE", "PLAN_CHANGE"] },
        createdAt: { gte: thirtyDaysAgo },
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    // Get store names for the changes
    const changeStoreIds = planChangeEvents.map(e => e.targetId).filter(Boolean);
    const changeStores = await prisma.store.findMany({
      where: { id: { in: changeStoreIds } },
      select: { id: true, name: true },
    });
    const changeStoreMap = new Map(changeStores.map(s => [s.id, s.name]));

    const upgrades30d = planChangeEvents.filter((e) => e.action.includes("UPGRADE")).length;
    const downgrades30d = planChangeEvents.filter((e) => e.action.includes("DOWNGRADE")).length;

    // Calculate MRR impact from plan changes
    const planPrices: Record<string, number> = {
      STARTER: 0,
      PROFESSIONAL: 15000,
      BUSINESS: 35000,
      ENTERPRISE: 100000,
    };

    const netRevenueImpact = planChangeEvents.reduce((acc, e) => {
      const metadata = e.metadata as any;
      if (metadata?.fromPlan && metadata?.toPlan) {
        const impact = (planPrices[metadata.toPlan] || 0) - (planPrices[metadata.fromPlan] || 0);
        return acc + impact;
      }
      return acc;
    }, 0);

    const recentChanges = planChangeEvents.slice(0, 10).map((change) => {
      const metadata = change.metadata as any;
      const fromPlan = metadata?.fromPlan || "Unknown";
      const toPlan = metadata?.toPlan || "Unknown";
      const mrrImpact = (planPrices[toPlan] || 0) - (planPrices[fromPlan] || 0);
      
      return {
        storeId: change.targetId || "",
        storeName: changeStoreMap.get(change.targetId) || "Unknown",
        fromPlan,
        toPlan,
        changeType: (mrrImpact > 0 ? "upgrade" : "downgrade") as "upgrade" | "downgrade",
        mrrImpact,
        changedAt: change.createdAt.toISOString(),
      };
    });

    // Failed Payments - use InvoiceV2 with OVERDUE status (no FAILED status in enum)
    const failedInvoices = await prisma.invoiceV2.findMany({
      where: {
        status: "OVERDUE",
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    // Get store names for failed invoices
    const failedStoreIds = [...new Set(failedInvoices.map(i => i.storeId))];
    const failedStores = await prisma.store.findMany({
      where: { id: { in: failedStoreIds } },
      select: { id: true, name: true },
    });
    const failedStoreMap = new Map(failedStores.map(s => [s.id, s.name]));

    // Recovered payments - invoices that were OVERDUE then became PAID
    const recoveredInvoices = await prisma.invoiceV2.findMany({
      where: {
        status: "PAID",
        updatedAt: { gte: thirtyDaysAgo },
        createdAt: { gte: thirtyDaysAgo },
      },
    });

    const recoveryRate =
      failedInvoices.length > 0
        ? Math.min(100, (recoveredInvoices.length / failedInvoices.length) * 100)
        : 0;

    const recoveredAmount = recoveredInvoices.reduce((acc, inv) => acc + Number(inv.totalKobo), 0);

    // Group failed invoices by merchant
    const failedByMerchant = new Map<
      string,
      {
        storeName: string;
        failedCount: number;
        lastFailedAt: Date;
        amountDue: number;
      }
    >();

    failedInvoices.forEach((invoice) => {
      const existing = failedByMerchant.get(invoice.storeId) || {
        storeName: failedStoreMap.get(invoice.storeId) || "Unknown",
        failedCount: 0,
        lastFailedAt: invoice.createdAt,
        amountDue: 0,
      };
      existing.failedCount++;
      existing.amountDue += Number(invoice.totalKobo);
      if (invoice.createdAt > existing.lastFailedAt) {
        existing.lastFailedAt = invoice.createdAt;
      }
      failedByMerchant.set(invoice.storeId, existing);
    });

    // Dunning attempts - use PENDING status
    const dunningActive = await prisma.dunningAttempt.count({
      where: {
        status: "PENDING",
      },
    });

    const failedPaymentMerchants = Array.from(failedByMerchant.entries())
      .map(([storeId, data]) => ({
        storeId,
        storeName: data.storeName,
        failedCount: data.failedCount,
        lastFailedAt: data.lastFailedAt.toISOString(),
        amountDue: data.amountDue,
        recoveryStatus: data.failedCount > 2 ? "Critical" : data.failedCount > 1 ? "At Risk" : "Recovering",
      }))
      .sort((a, b) => b.failedCount - a.failedCount)
      .slice(0, 10);

    const lifecycle: SubscriptionLifecycle = {
      trialConversion: {
        totalTrials,
        converted: convertedTrials.length,
        conversionRate: Math.round(conversionRate * 10) / 10,
        avgConversionDays: Math.round(avgConversionDays),
        expiringSoon,
      },
      churnAnalysis: {
        totalChurned30d: churnedSubscriptions.length,
        churnRate: Math.round(churnRate * 10) / 10,
        avgLifetimeValue: Math.round(avgLifetimeValue),
        avgTenureDays: Math.round(avgTenureDays),
        topChurnReasons: [], // Would need churn reason tracking
        atRiskMerchants: atRiskMerchants.sort((a, b) => b.riskScore - a.riskScore).slice(0, 10),
      },
      planChanges: {
        upgrades30d,
        downgrades30d,
        netRevenueImpact,
        recentChanges,
      },
      failedPayments: {
        totalFailed30d: failedInvoices.length,
        recoveryRate: Math.round(recoveryRate * 10) / 10,
        dunningActive,
        recoveredAmount,
        failedPaymentMerchants,
      },
    };

    return NextResponse.json({ data: lifecycle });
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

    logger.error("[SUBSCRIPTION_LIFECYCLE_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
