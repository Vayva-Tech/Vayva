import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.KITCHEN_VIEW,
  async (req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;
      const { searchParams } = new URL(req.url);
      const period = searchParams.get("period") || "week";

      const station = await prisma.kitchenStation.findFirst({
        where: { id, storeId },
      });

      if (!station) {
        return NextResponse.json(
          { error: "Station not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const now = new Date();
      let startDate: Date;

      switch (period) {
        case "day":
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case "week":
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case "month":
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      const performanceData = await prisma.kitchenOrderItem.findMany({
        where: {
          stationId: id,
          createdAt: { gte: startDate },
          order: { storeId },
        },
        select: {
          id: true,
          status: true,
          prepTime: true,
          startTime: true,
          completionTime: true,
          createdAt: true,
          order: {
            select: {
              priority: true,
              orderType: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      });

      const totalItems = performanceData.length;
      const completedItems = performanceData.filter(
        (item) => item.status === "completed",
      ).length;
      const avgCompletionRate =
        totalItems > 0 ? (completedItems / totalItems) * 100 : 0;

      const completedItemsWithTimes = performanceData.filter(
        (item) =>
          item.status === "completed" && item.startTime && item.completionTime,
      );

      const avgActualPrepTime =
        completedItemsWithTimes.length > 0
          ? completedItemsWithTimes.reduce((sum, item) => {
              const actualTime =
                (item.completionTime!.getTime() - item.startTime!.getTime()) /
                60000;
              return sum + actualTime;
            }, 0) / completedItemsWithTimes.length
          : 0;

      const avgEstimatedPrepTime =
        completedItemsWithTimes.length > 0
          ? completedItemsWithTimes.reduce(
              (sum, item) => sum + item.prepTime,
              0,
            ) / completedItemsWithTimes.length
          : 0;

      const priorityStats = performanceData.reduce(
        (acc, item) => {
          const priority = item.order.priority;
          if (!acc[priority]) {
            acc[priority] = { total: 0, completed: 0 };
          }
          acc[priority].total++;
          if (item.status === "completed") {
            acc[priority].completed++;
          }
          return acc;
        },
        {} as Record<string, { total: number; completed: number }>,
      );

      const performanceMetrics = {
        totalItemsProcessed: totalItems,
        completionRate: Math.round(avgCompletionRate),
        itemsCompleted: completedItems,
        avgEstimatedPrepTime: Math.round(avgEstimatedPrepTime),
        avgActualPrepTime: Math.round(avgActualPrepTime),
        efficiency:
          avgEstimatedPrepTime > 0 && avgActualPrepTime > 0
            ? Math.round((avgEstimatedPrepTime / avgActualPrepTime) * 100)
            : 100,
        priorityPerformance: Object.entries(priorityStats).reduce(
          (acc, [priority, stats]) => {
            acc[priority] = {
              total: stats.total,
              completed: stats.completed,
              completionRate:
                stats.total > 0
                  ? Math.round((stats.completed / stats.total) * 100)
                  : 0,
            };
            return acc;
          },
          {} as Record<string, { total: number; completed: number; completionRate: number }>,
        ),
        recentActivity: performanceData.slice(0, 20),
      };

      return NextResponse.json(
        { data: performanceMetrics },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: stationId } = await params;
      logger.error("[STATION_PERFORMANCE_GET]", { error, stationId });
      return NextResponse.json(
        { error: "Failed to fetch station performance data" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
