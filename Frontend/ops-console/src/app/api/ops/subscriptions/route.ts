import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export async function GET() {
  await OpsAuthService.requireSession();

  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sevenDaysFromNow = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);

    // Active subscriptions
    const totalActive = await prisma.merchantAiSubscription.count({
      where: { status: "UPGRADED_ACTIVE" },
    });

    // Trial users
    const totalTrial = await prisma.merchantAiSubscription.count({
      where: { status: "TRIAL_ACTIVE" },
    });

    // Cancelled in last 30 days
    const totalCancelled = await prisma.merchantAiSubscription.count({
      where: {
        status: { in: ["EXPIRED", "SOFT_CLOSED"] },
        updatedAt: { gte: thirtyDaysAgo },
      },
    });

    // Plan pricing
    const planPrices: Record<string, number> = {
      FREE: 0,
      STARTER: 5000,
      GROWTH: 15000,
      PRO: 35000,
      ENTERPRISE: 100000,
    };

    // Plan breakdown with revenue
    const planData = await prisma.merchantAiSubscription.groupBy({
      by: ["planKey"],
      where: { status: "UPGRADED_ACTIVE" },
      _count: { id: true },
    });

    const planBreakdown = planData.map(
      (p) => ({
        plan: p.planKey?.toUpperCase() || "FREE",
        count: p._count?.id ?? 0,
        revenue:
          (p._count?.id ?? 0) * (planPrices[p.planKey?.toUpperCase() || "FREE"] || 0),
      }),
    );

    // Calculate MRR
    const mrr = planBreakdown.reduce(
      (sum: number, p: { revenue: number }) => sum + p.revenue,
      0,
    );

    // Recent subscriptions (last 30 days)
    const recentSubs = await prisma.merchantAiSubscription.findMany({
      where: {
        trialStartedAt: { gte: thirtyDaysAgo },
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { trialStartedAt: "desc" },
      take: 20,
    });

    const recentSubscriptions = recentSubs.map((sub) => ({
      id: sub.id,
      storeId: sub.storeId,
      storeName: sub.store?.name || "Unknown",
      storeSlug: sub.store?.slug || "",
      planKey: sub.planKey || "FREE",
      status: sub.status,
      periodStart: sub.periodStart?.toISOString() || "",
      periodEnd: sub.periodEnd?.toISOString() || "",
      trialExpiresAt: sub.trialExpiresAt?.toISOString() || null,
      createdAt: sub.trialStartedAt.toISOString(),
    }));

    // Expiring trials (within 7 days)
    const expiringTrialSubs = await prisma.merchantAiSubscription.findMany({
      where: {
        status: "TRIAL_ACTIVE",
        trialExpiresAt: {
          gte: now,
          lte: sevenDaysFromNow,
        },
      },
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
      },
      orderBy: { trialExpiresAt: "asc" },
      take: 20,
    });

    const expiringTrials = expiringTrialSubs.map((sub) => ({
      id: sub.id,
      storeId: sub.storeId,
      storeName: sub.store?.name || "Unknown",
      storeSlug: sub.store?.slug || "",
      planKey: sub.planKey || "FREE",
      status: sub.status,
      periodStart: sub.periodStart?.toISOString() || "",
      periodEnd: sub.periodEnd?.toISOString() || "",
      trialExpiresAt: sub.trialExpiresAt?.toISOString() || null,
      createdAt: sub.trialStartedAt.toISOString(),
    }));

    return NextResponse.json({
      totalActive,
      totalTrial,
      totalCancelled,
      mrr,
      mrrGrowth: 0, // Would need historical data
      planBreakdown,
      recentSubscriptions,
      expiringTrials,
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[SUBSCRIPTIONS_STATS_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to fetch subscription stats" },
      { status: 500 },
    );
  }
}
