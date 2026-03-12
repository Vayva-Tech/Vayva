import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withOpsAuth, OpsAuthContext } from "@/lib/withOpsAuth";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withOpsAuth(async (req: NextRequest, context: OpsAuthContext) => {
    const { user } = context;
  const requestId =
    req.headers?.get("x-correlation-id") || `ops_${Date.now().toString(36)}`;
  try {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [activeSubscriptions, totalStores, orderResult, withdrawalResult] =
      await Promise.all([
        prisma.subscription?.count({
          where: { status: { in: ["ACTIVE", "TRIALING"] } },
        }),
        prisma.store?.count(),
        prisma.$queryRaw<Array<{ total: bigint }>>`
                SELECT COALESCE(SUM(CAST(delivery_fee AS DECIMAL)), 0) as total
                FROM "Order"
                WHERE delivery_fee IS NOT NULL
                  AND created_at >= ${thirtyDaysAgo}
            `,
        prisma.$queryRaw<Array<{ total: bigint }>>`
                SELECT COALESCE(SUM(CAST(amount AS DECIMAL)), 0) as total
                FROM "Withdrawal"
                WHERE status = 'COMPLETED'
                  AND created_at >= ${thirtyDaysAgo}
            `,
      ]);

    const subscriptionRevenue = activeSubscriptions * 35000;
    const deliveryRevenue = Number(orderResult[0]?.total || 0);
    const withdrawalVolume = Number(withdrawalResult[0]?.total || 0);
    const withdrawalFees = withdrawalVolume * 0.015;

    return NextResponse.json(
      {
        subscriptionRevenue,
        deliveryRevenue,
        withdrawalFees,
        totalRevenue: subscriptionRevenue + deliveryRevenue + withdrawalFees,
        activeSubscriptions,
        totalStores,
        period: "30d",
      },
      { headers: standardHeaders(requestId) },
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("Revenue summary error", {
      error: error instanceof Error ? error.message : String(error),
      requestId,
    });
    return NextResponse.json(
      { error: "Failed to fetch revenue summary", requestId },
      { status: 500, headers: standardHeaders(requestId) },
    );
  }
});
