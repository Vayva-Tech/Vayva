import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (req, { storeId }) => {
    try {
      // Database-level Aggregation (Scalable)
      const customerStats = await prisma.order.groupBy({
        by: ["customerId", "customerEmail"],
        where: {
          storeId,
          status: { not: "DRAFT" }, // Only count confirmed orders
        },
        _sum: {
          total: true,
        },
        _count: {
          id: true,
        },
        _max: {
          createdAt: true,
        },
        _min: {
          createdAt: true,
        },
      });

      // Compute Segments from Aggregated Data
      const now = new Date();
      const segments = {
        vip: { count: 0, revenue: 0 },
        loyal: { count: 0, revenue: 0 },
        atRisk: { count: 0, revenue: 0 },
        new: { count: 0, revenue: 0 },
      };

      const VIP_SPEND_THRESHOLD = 50000;
      const LOYAL_COUNT_THRESHOLD = 2;
      const AT_RISK_DAYS = 60;
      const NEW_DAYS = 30;

      let totalRevenue = 0;
      let totalOrders = 0;

      for (const stat of customerStats) {
        const sales = Number(stat._sum.total) || 0;
        const count = stat._count.id;
        const lastOrderDate = stat._max.createdAt
          ? new Date(stat._max.createdAt)
          : new Date();
        const firstOrderDate = stat._min.createdAt
          ? new Date(stat._min.createdAt)
          : new Date();

        totalRevenue += sales;
        totalOrders += count;

        const daysSinceLast =
          (now.getTime() - lastOrderDate.getTime()) / (1000 * 3600 * 24);
        const daysSinceFirst =
          (now.getTime() - firstOrderDate.getTime()) / (1000 * 3600 * 24);

        let isNew = false;
        if (sales > VIP_SPEND_THRESHOLD) {
          segments.vip.count++;
          segments.vip.revenue += sales;
        }
        if (count >= LOYAL_COUNT_THRESHOLD) {
          segments.loyal.count++;
          segments.loyal.revenue += sales;
        }
        if (daysSinceFirst <= NEW_DAYS) {
          segments.new.count++;
          segments.new.revenue += sales;
          isNew = true;
        }
        if (!isNew && daysSinceLast > AT_RISK_DAYS) {
          segments.atRisk.count++;
        }
      }

      return NextResponse.json(
        {
          stats: {
            totalRevenue,
            totalOrders,
            averageOrderValue: totalOrders > 0 ? totalRevenue / totalOrders : 0,
          },
          segments,
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error) {
      logger.error("[CUSTOMERS_INSIGHTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);
