import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withOpsAuth, OpsAuthContext } from "@/lib/withOpsAuth";

export const GET = withOpsAuth(async (_req: NextRequest, context: OpsAuthContext) => {
    const { user } = context;
  try {
    // Get date ranges for last 6 months
    const now = new Date();
    const months = [];

    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(
        now.getFullYear(),
        now.getMonth() - i + 1,
        0,
        23,
        59,
        59,
      );

      months.push({
        start: monthStart,
        end: monthEnd,
        label: monthStart.toLocaleDateString("en-US", { month: "short" }),
      });
    }

    // Fetch historical data for each month
    const historicalData = await Promise.all(
      months.map(async (month) => {
        // Subscription revenue (count active subscriptions in that month)
        const subscriptions = await prisma.subscription?.count({
          where: {
            status: { in: ["ACTIVE", "TRIALING"] },
            createdAt: { lte: month.end },
          },
        });

        const subscriptionRevenue = subscriptions * 35000; // Average of Starter + Pro

        // Delivery revenue
        const deliveryResult = await prisma.$queryRaw<Array<{ total: bigint }>>`
          SELECT COALESCE(SUM(CAST(delivery_fee AS DECIMAL)), 0) as total
          FROM "Order"
          WHERE delivery_fee IS NOT NULL
            AND created_at >= ${month.start}
            AND created_at <= ${month.end}
        `;

        const deliveryRevenue = Number(deliveryResult[0]?.total || 0);

        // Withdrawal fees
        const withdrawalResult = await prisma.$queryRaw<
          Array<{ total: bigint }>
        >`
          SELECT COALESCE(SUM(CAST(amount AS DECIMAL)), 0) as total
          FROM "Withdrawal"
          WHERE status = 'COMPLETED'
            AND created_at >= ${month.start}
            AND created_at <= ${month.end}
        `;

        const withdrawalVolume = Number(withdrawalResult[0]?.total || 0);
        const withdrawalFees = withdrawalVolume * 0.015;

        return {
          month: month.label,
          subscriptions: subscriptionRevenue,
          delivery: deliveryRevenue,
          withdrawal: withdrawalFees,
        };
      }),
    );

    return NextResponse.json(historicalData);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    console.error("Historical revenue error:", error);
    return NextResponse.json(
      { error: "Failed to fetch historical data" },
      { status: 500 },
    );
  }
});
