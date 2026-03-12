import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

type StatementPeriod = {
  id: string;
  month: string;
  year: number;
  status: "AVAILABLE";
  url?: string;
};

export const GET = withVayvaAPI(
  PERMISSIONS.FINANCE_VIEW,
  async (_req, { storeId }) => {
    try {
      const rows = (await prisma.$queryRaw`
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
        `) as Array<{
        year: number;
        month: number;
        sales: number;
        orders: number;
      }>;

      const monthName = (month: number) =>
        new Date(Date.UTC(2000, month - 1, 1)).toLocaleString("default", {
          month: "long",
        });

      const statements: StatementPeriod[] = (rows || []).map((r) => ({
        id: `${r.year}-${r.month}`,
        month: monthName(r.month),
        year: r.year,
        status: "AVAILABLE",
      }));

      return NextResponse.json(
        { statements },
        {
          headers: { "Cache-Control": "no-store" },
        },
      );
    } catch (error) {
      logger.error("[FINANCE_STATEMENTS_GET]", error);
      return NextResponse.json(
        { error: "Failed to load statements" },
        { status: 500 },
      );
    }
  },
);
