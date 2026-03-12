import { NextRequest } from "next/server";
import { BaseIndustryController, createIndustryAPI } from "@/lib/industry/base-controller";
import { PERMISSIONS } from "@/lib/team/permissions";
import { APIContext } from "@/lib/api-handler";
import { prisma } from "@vayva/db";

class WasteTrackingController extends BaseIndustryController {
  constructor() {
    super("restaurant", "kds");
  }

  async logWaste(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const body = await this.parseBody(req);
        const { itemId, itemName, category, reason, quantity, unit, cost, notes } = body;

        if (!itemId || !itemName || !category || !reason || !quantity || !cost) {
          throw new Error("Missing required fields");
        }

        const wasteLog = await prisma.wasteLog.create({
          data: {
            storeId: context.storeId,
            itemId,
            itemName,
            category,
            reason,
            quantity,
            unit: unit || "portion",
            cost,
            loggedBy: context.user.id,
            photoUrl: body.photoUrl || null,
          },
        });

        return {
          success: true,
          data: wasteLog,
          message: "Waste logged successfully",
        };
      },
      "LOG_WASTE",
      "Waste logged successfully"
    );
  }

  async getWasteReport(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const params = this.getQueryParams(req, {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // Last 7 days
          endDate: new Date().toISOString(),
        });

        const wasteLogs = await prisma.wasteLog.findMany({
          where: {
            storeId: context.storeId,
            loggedAt: {
              gte: new Date(params.startDate),
              lte: new Date(params.endDate),
            },
          },
        });

        // Calculate totals
        const totalCost = wasteLogs.reduce((sum, log) => sum + log.cost, 0);
        
        // Group by category
        const byCategory = this.groupBy(wasteLogs, "category");
        const categoryTotals = Object.entries(byCategory).map(([category, logs]) => ({
          category,
          count: logs.length,
          totalCost: logs.reduce((sum, log) => sum + log.cost, 0),
          percentage: (logs.reduce((sum, log) => sum + log.cost, 0) / totalCost) * 100,
        }));

        // Top wasted items
        const byItem = this.groupBy(wasteLogs, "itemName");
        const topWasteItems = Object.entries(byItem)
          .map(([itemName, logs]) => ({
            itemName,
            count: logs.length,
            totalCost: logs.reduce((sum, log) => sum + log.cost, 0),
            avgCost: logs.reduce((sum, log) => sum + log.cost, 0) / logs.length,
          }))
          .sort((a, b) => b.totalCost - a.totalCost)
          .slice(0, 10);

        return {
          success: true,
          data: {
            summary: {
              totalLogs: wasteLogs.length,
              totalCost,
              avgDailyCost: totalCost / 7,
              period: {
                start: params.startDate,
                end: params.endDate,
              },
            },
            byCategory: categoryTotals,
            topWasteItems,
            trends: this.calculateTrends(wasteLogs),
          },
        };
      },
      "GET_WASTE_REPORT",
      "Waste report generated successfully"
    );
  }

  private groupBy(logs: any[], key: string): Record<string, any[]> {
    return logs.reduce((acc, log) => {
      const value = log[key as keyof typeof log];
      if (!acc[value as string]) {
        acc[value as string] = [];
      }
      acc[value as string].push(log);
      return acc;
    }, {} as Record<string, any[]>);
  }

  private calculateTrends(logs: any[]) {
    // Simple trend calculation
    const sortedLogs = [...logs].sort((a, b) => 
      new Date(a.loggedAt).getTime() - new Date(b.loggedAt).getTime()
    );

    const firstHalf = sortedLogs.slice(0, Math.floor(sortedLogs.length / 2));
    const secondHalf = sortedLogs.slice(Math.floor(sortedLogs.length / 2));

    const firstHalfCost = firstHalf.reduce((sum, log) => sum + log.cost, 0);
    const secondHalfCost = secondHalf.reduce((sum, log) => sum + log.cost, 0);

    const change = secondHalfCost - firstHalfCost;
    const changePercent = firstHalfCost > 0 ? (change / firstHalfCost) * 100 : 0;

    return {
      direction: change > 0 ? "increasing" : change < 0 ? "decreasing" : "stable",
      changePercent: changePercent.toFixed(2),
      recommendation: change > 0 ? "Review waste reduction processes" : "Good progress on waste reduction",
    };
  }
}

const controller = new WasteTrackingController();

// POST /api/restaurant/kds/waste/log - Log waste incident
export const LOG = createIndustryAPI("restaurant", PERMISSIONS.SETTINGS_EDIT, (req, context) =>
  controller.logWaste(req, context)
);

// GET /api/restaurant/kds/waste/report - Get waste analytics report
export const REPORT = createIndustryAPI("restaurant", PERMISSIONS.ANALYTICS_VIEW, (req, context) =>
  controller.getWasteReport(req, context)
);
