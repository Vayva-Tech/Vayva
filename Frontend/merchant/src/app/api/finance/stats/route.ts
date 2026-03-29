import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { PERMISSIONS } from "@/lib/team/permissions";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const [wallet, orderAgg, dailySales] = await Promise.all([
            (prisma as any).wallet?.findUnique({
                where: { storeId },
                select: { availableKobo: true, pendingKobo: true },
            }),
            prisma.order?.aggregate({
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const formattedDailySales = (dailySales || []).map((d: any) => ({
            name: dayNames[new Date(d.date).getDay()],
            sales: Number(d.sales || 0),
            orders: Number(d.orders || 0),
        }));

        return NextResponse.json({
            totalSales,
            platformFees,
            netEarnings,
            availableBalance,
            pendingBalance,
            currency: "NGN",
            dailySales: formattedDailySales,
        }, {
            headers: { "Cache-Control": "no-store" },
        });
  } catch (error) {
    handleApiError(error, { endpoint: "/finance/stats", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
