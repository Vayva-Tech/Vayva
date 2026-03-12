import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { withOpsAPI } from "@/lib/api-handler";
import { logger } from "@vayva/shared";

/**
 * GET /api/ops/analytics/timeseries
 * 
 * Query params:
 * - metric: 'gmv' | 'merchants' | 'orders' (required)
 * - period: '7d' | '30d' | '90d' | '1y' (default: 30d)
 * - granularity: 'day' | 'week' | 'month' (default: day)
 */
const getHandler = withOpsAPI(
  async (req: any, context: any) => {
    const { user, requestId } = context;
    
    const { searchParams } = new URL(req.url);
    const metric = searchParams.get("metric") || "gmv";
    const period = searchParams.get("period") || "30d";
    const granularity = searchParams.get("granularity") || "day";

    // Parse period to days
    const periodDays = period === "7d" ? 7 : period === "90d" ? 90 : period === "1y" ? 365 : 30;
    
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - periodDays);

    let data: Array<{ date: string; value: number; label: string }> = [];

    if (metric === "gmv") {
      // GMV by day
      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
          paymentStatus: "SUCCESS",
        },
        select: {
          createdAt: true,
          total: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      // Group by date
      const grouped = orders.reduce((acc: any, order: any) => {
        const date = order.createdAt.toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + Number(order.total || 0);
        return acc;
      }, {} as Record<string, number>);

      // Fill in missing dates
      data = fillDateRange(startDate, endDate, grouped, granularity);

    } else if (metric === "merchants") {
      // New merchants by day
      const merchants = await prisma.store.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const grouped = merchants.reduce((acc: any, merchant: any) => {
        const date = merchant.createdAt.toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      data = fillDateRange(startDate, endDate, grouped, granularity);

    } else if (metric === "orders") {
      // Orders by day
      const orders = await prisma.order.findMany({
        where: {
          createdAt: {
            gte: startDate,
            lte: endDate,
          },
        },
        select: {
          createdAt: true,
        },
        orderBy: {
          createdAt: "asc",
        },
      });

      const grouped = orders.reduce((acc: any, order: any) => {
        const date = order.createdAt.toISOString().split("T")[0];
        acc[date] = (acc[date] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      data = fillDateRange(startDate, endDate, grouped, granularity);
    }

    logger.info("[TIMESERIES_QUERY]", {
      requestId,
      userId: user.id,
      metric,
      period,
      granularity,
      dataPoints: data.length,
    });

    return NextResponse.json({
      success: true,
      data: {
        metric,
        period,
        granularity,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        dataPoints: data,
        summary: {
          total: data.reduce((sum: any, d: any) => sum + d.value, 0),
          average: data.length > 0 
            ? Math.round(data.reduce((sum: any, d: any) => sum + d.value, 0) / data.length)
            : 0,
          peak: data.length > 0 ? Math.max(...data.map((d: any) => d.value)) : 0,
          lowest: data.length > 0 ? Math.min(...data.map((d: any) => d.value)) : 0,
        },
      },
    });
  },
  { requiredPermission: "ops:analytics:view" }
);

export async function GET(
  req: NextRequest,
  context: { params: Promise<Record<string, string>> }
) {
  const params = await context.params;
  return getHandler(req, { params } as any);
}

/**
 * Fill in missing dates in the range
 */
function fillDateRange(
  startDate: Date,
  endDate: Date,
  data: Record<string, number>,
  granularity: string
): Array<{ date: string; value: number; label: string }> {
  const result: Array<{ date: string; value: number; label: string }> = [];
  
  const current = new Date(startDate);
  
  while (current <= endDate) {
    const dateStr = current.toISOString().split("T")[0];
    const value = data[dateStr] || 0;
    
    let label = dateStr;
    if (granularity === "week") {
      label = `Week of ${dateStr}`;
    } else if (granularity === "month") {
      label = current.toLocaleDateString("en-US", { month: "short", year: "numeric" });
    } else {
      label = current.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    }
    
    result.push({ date: dateStr, value, label });
    
    // Move to next day
    current.setDate(current.getDate() + 1);
  }
  
  return result;
}
