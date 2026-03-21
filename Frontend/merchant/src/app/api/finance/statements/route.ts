import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";
import { prisma } from "@vayva/db";

type StatementPeriod = {
  id: string;
  month: string;
  year: number;
  status: "AVAILABLE";
  url?: string;
};

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const rows = await prisma.$queryRaw`
      SELECT
        EXTRACT(YEAR FROM o."createdAt")::int as year,
        EXTRACT(MONTH FROM o."createdAt")::int as month,
        COALESCE(SUM(o."total"), 0)::float as sales,
        COUNT(*)::int as orders
      FROM "Order" o
      WHERE o."storeId" = ${storeId}
        AND o."status" != 'CANCELLED'
        AND o."createdAt" >= NOW() - INTERVAL '12 months'
      GROUP BY 1,2
      ORDER BY 1 DESC, 2 DESC
    ` as Array<{ year: number; month: number; sales: number; orders: number }>;

    const monthName = (month: number) => new Date(Date.UTC(2000, month - 1, 1)).toLocaleString("default", { month: "long" });

    const statements: StatementPeriod[] = (rows || []).map((r) => ({
      id: `${r.year}-${r.month}`,
      month: monthName(r.month),
      year: r.year,
      status: "AVAILABLE",
    }));

    return NextResponse.json({ statements }, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/finance/statements',
      operation: 'GET_STATEMENTS',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
