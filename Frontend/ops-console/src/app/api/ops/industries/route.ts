import { NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthService } from "@/lib/ops-auth";
import { logger } from "@vayva/shared";

export async function GET() {
  await OpsAuthService.requireSession();

  try {
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    // Get industry breakdown
    const industryData = await prisma.store.groupBy({
      by: ["industrySlug"],
      _count: { id: true },
    });

    const industries = await Promise.all(
      industryData.map(async (ind) => {
        const industry = ind.industrySlug || "general";

        // Active merchants (had orders in last 30 days)
        const activeCount = await prisma.store.count({
          where: {
            industrySlug: ind.industrySlug,
            orders: { some: { createdAt: { gte: thirtyDaysAgo } } },
          },
        });

        // GMV for this industry
        const gmvResult = await prisma.order.aggregate({
          _sum: { total: true },
          _avg: { total: true },
          where: {
            paymentStatus: "SUCCESS",
            store: { industrySlug: ind.industrySlug },
          },
        });

        return {
          industry,
          count: ind._count.id,
          activeCount,
          gmv: Number(gmvResult._sum?.total || 0),
          avgOrderValue: Number(gmvResult._avg?.total || 0),
        };
      }),
    );

    // Sort by GMV descending
    industries.sort((a, b) => b.gmv - a.gmv);

    return NextResponse.json({
      industries,
      total: industries.reduce((sum, i) => sum + i.count, 0),
    });
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[INDUSTRIES_FETCH_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to fetch industries" },
      { status: 500 },
    );
  }
}
