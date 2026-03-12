import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

// Type for Prisma groupBy result with storeId
interface StoreUsageGroup {
  storeId: string;
  _sum: {
    costKobo: bigint | null;
    tokensCount: bigint | null;
    requestsCount: bigint | null;
  };
}

export const dynamic = "force-dynamic";

export async function GET(_request: Request) {
  try {
    const { user } = await OpsAuthService.requireSession();
    // Any Ops role can view AI stats
    if (!user)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // 1. Total Aggregates (All Time)
    // Note: Prisma aggregate on BigInt needs handling for JSON serialization
    const aggregates = await prisma.aiUsageDaily.aggregate({
      _sum: {
        tokensCount: true,
        costKobo: true,
        requestsCount: true,
        imagesCount: true,
      },
    });

    // 2. Daily Trend (Last 7 Days)
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    const dailyTrend = await prisma.aiUsageDaily.groupBy({
      by: ["date"],
      where: {
        date: { gte: sevenDaysAgo },
      },
      _sum: {
        tokensCount: true,
        costKobo: true,
      },
      orderBy: {
        date: "asc",
      },
    });

    // 3. Top Consumers (Stores with highest cost)
    const topStores = await prisma.aiUsageDaily.groupBy({
      by: ["storeId"],
      _sum: {
        costKobo: true,
        tokensCount: true,
        requestsCount: true,
      },
      orderBy: {
        _sum: {
          costKobo: "desc",
        },
      },
      take: 10,
    });

    // Fetch store names for top consumers
    const storeIds = (topStores as StoreUsageGroup[]).map((s: any) => s.storeId);
    const stores = await prisma.store.findMany({
      where: { id: { in: storeIds } },
      select: { id: true, name: true, slug: true, logoUrl: true },
    });

    const storeMap = new Map(stores.map((s: any) => [s.id, s]));

    const consumersFormatted = (topStores as StoreUsageGroup[]).map((s: any) => {
      const store = storeMap.get(s.storeId);
      return {
        storeId: s.storeId,
        name: store?.name || "Unknown Store",
        slug: store?.slug,
        logoUrl: store?.logoUrl,
        totalCostKobo: Number(s._sum.costKobo || 0),
        totalTokens: Number(s._sum.tokensCount || 0),
        totalRequests: Number(s._sum.requestsCount || 0),
      };
    });

    return NextResponse.json({
      totals: {
        tokens: aggregates._sum.tokensCount || 0,
        costKobo: Number(aggregates._sum.costKobo || 0),
        requests: aggregates._sum.requestsCount || 0,
        images: aggregates._sum.imagesCount || 0,
      },
      trend: dailyTrend.map((d: any) => ({
        date: d.date.toISOString().split("T")[0],
        tokens: d._sum.tokensCount || 0,
        costKobo: Number(d._sum.costKobo || 0),
      })),
      topConsumers: consumersFormatted,
    });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[AI_STATS_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
