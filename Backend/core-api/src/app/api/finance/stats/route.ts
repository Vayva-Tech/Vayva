import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (_req, { storeId }) => {
    try {
      const [wallet, orderAgg, dailySales] = await Promise.all([
        prisma.wallet.findUnique({
          where: { storeId },
          select: { availableKobo: true, pendingKobo: true },
        }),
        prisma.order.aggregate({
          where: { storeId, status: { not: "CANCELLED" } },
          _sum: { total: true },
          _count: true,
        }),
        // Last 14 days of daily sales
        prisma.$queryRaw`
                SELECT
                    DATE(o."createdAt") as date,
                    COALESCE(SUM(o."total"), 0)::float as sales,
                    COUNT(*)::int as orders
                FROM "Order" o
                WHERE o."storeId" = ${storeId}
                  AND o."status" != 'CANCELLED'
                  AND o."createdAt" >= NOW() - INTERVAL '14 days'
                GROUP BY DATE(o."createdAt")
                ORDER BY date ASC
            ` as Promise<Array<{ date: Date; sales: number; orders: number }>>,
      ]);

      const totalSales = Number(orderAgg._sum?.total || 0);
      const platformFeeRate = 0.03;
      const platformFees = totalSales * platformFeeRate;
      const netEarnings = totalSales - platformFees;
      const availableBalance = Number(wallet?.availableKobo || 0) / 100;
      const pendingBalance = Number(wallet?.pendingKobo || 0) / 100;

      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
      const formattedDailySales = (dailySales || []).map((d) => ({
        name: dayNames[new Date(d.date).getDay()],
        sales: Number(d.sales || 0),
        orders: Number(d.orders || 0),
      }));

      return NextResponse.json(
        {
          totalSales,
          platformFees,
          netEarnings,
          availableBalance,
          pendingBalance,
          currency: "NGN",
          dailySales: formattedDailySales,
        },
        {
          headers: { "Cache-Control": "no-store" },
        },
      );
    } catch (error) {
      logger.error("[FINANCE_STATS_GET]", error);
      return NextResponse.json(
        { error: "Failed to load finance stats" },
        { status: 500 },
      );
    }
  },
);
