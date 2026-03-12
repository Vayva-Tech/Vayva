import { NextRequest } from "next/server";
import { BaseIndustryController, createIndustryAPI } from "@/lib/industry/base-controller";
import { PERMISSIONS } from "@/lib/team/permissions";
import { APIContext } from "@/lib/api-handler";
import { prisma } from "@vayva/db";

class PerformanceController extends BaseIndustryController {
  constructor() {
    super("restaurant", "kds");
  }

  async getTicketTimes(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const tickets = await prisma.kitchenTicket.findMany({
          where: {
            storeId: context.storeId,
            status: {
              in: ["ready", "completed"],
            },
            createdAt: {
              gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
            },
          },
        });

        // Calculate ticket time statistics
        const ticketTimes = tickets
          .filter(t => t.startTime && t.bumpTime)
          .map(t => (new Date(t.bumpTime!).getTime() - new Date(t.startTime!).getTime()) / 1000);

        if (ticketTimes.length === 0) {
          return {
            success: true,
            data: {
              average: 0,
              median: 0,
              p90: 0,
              fastest: 0,
              slowest: 0,
              totalTickets: 0,
            },
          };
        }

        const sorted = ticketTimes.sort((a, b) => a - b);
        const average = sorted.reduce((sum, t) => sum + t, 0) / sorted.length;
        const median = sorted[Math.floor(sorted.length / 2)];
        const p90 = sorted[Math.floor(sorted.length * 0.9)];

        return {
          success: true,
          data: {
            average: Math.round(average),
            median: Math.round(median),
            p90: Math.round(p90),
            fastest: Math.round(sorted[0]),
            slowest: Math.round(sorted[sorted.length - 1]),
            totalTickets: sorted.length,
            goal: 900, // 15 minutes in seconds
            onTimePercentage: (sorted.filter(t => t <= 900).length / sorted.length) * 100,
          },
        };
      },
      "GET_TICKET_TIMES",
      "Ticket times analytics retrieved"
    );
  }

  async getAccuracyRate(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const tickets = await prisma.kitchenTicket.findMany({
          where: {
            storeId: context.storeId,
            createdAt: {
              gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // Last 7 days
            },
          },
          include: {
            items: true,
          },
        });

        const totalItems = tickets.reduce((sum, t) => sum + t.items.length, 0);
        
        // Count items without modifications (perfect orders)
        const perfectOrders = tickets.reduce((sum, t) => {
          const unmodifiedItems = t.items.filter(i => !i.modifiers || i.modifiers.length === 0).length;
          return sum + unmodifiedItems;
        }, 0);

        const accuracyRate = totalItems > 0 ? (perfectOrders / totalItems) * 100 : 0;

        return {
          success: true,
          data: {
            accuracyRate: accuracyRate.toFixed(2),
            totalOrders: tickets.length,
            perfectOrders,
            modifiedOrders: totalItems - perfectOrders,
            goal: 95,
            status: accuracyRate >= 95 ? "on_target" : "needs_improvement",
          },
        };
      },
      "GET_ACCURACY_RATE",
      "Accuracy rate calculated"
    );
  }

  async getRefires(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const params = this.getQueryParams(req, {
          startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          endDate: new Date().toISOString(),
        });

        // TODO: Implement refire tracking (requires additional schema)
        // For now, return placeholder data
        return {
          success: true,
          data: {
            totalRefires: 0,
            byReason: [],
            trend: "stable",
          },
        };
      },
      "GET_REFIRES",
      "Refire data retrieved"
    );
  }

  async getFoodCost(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        // Get all recipes for the store
        const recipes = await prisma.recipe.findMany({
          where: { storeId: context.storeId },
          include: { ingredients: true },
        });

        const totalRecipeCost = recipes.reduce((sum, r) => sum + r.totalCost, 0);
        const totalRevenue = recipes.reduce((sum, r) => sum + r.suggestedPrice, 0);
        
        const foodCostPercentage = totalRevenue > 0 
          ? (totalRecipeCost / totalRevenue) * 100 
          : 0;

        return {
          success: true,
          data: {
            actualFoodCost: foodCostPercentage.toFixed(2),
            targetFoodCost: 30, // Industry standard target
            status: foodCostPercentage <= 30 ? "on_target" : "over_target",
            variance: (foodCostPercentage - 30).toFixed(2),
            totalRecipeCost,
            totalRevenue,
            recommendations: foodCostPercentage > 30 
              ? ["Review portion sizes", "Negotiate supplier costs", "Consider menu price adjustments"]
              : ["Maintain current practices", "Consider premium ingredients for quality improvement"],
          },
        };
      },
      "GET_FOOD_COST",
      "Food cost analysis completed"
    );
  }
}

const controller = new PerformanceController();

// GET /api/restaurant/kds/performance/ticket-times - Ticket time analytics
export const TICKET_TIMES = createIndustryAPI("restaurant", PERMISSIONS.ANALYTICS_VIEW, (req, context) =>
  controller.getTicketTimes(req, context)
);

// GET /api/restaurant/kds/performance/accuracy - Order accuracy rate
export const ACCURACY = createIndustryAPI("restaurant", PERMISSIONS.ANALYTICS_VIEW, (req, context) =>
  controller.getAccuracyRate(req, context)
);

// GET /api/restaurant/kds/performance/refires - Refire tracking
export const REFIRE = createIndustryAPI("restaurant", PERMISSIONS.ANALYTICS_VIEW, (req, context) =>
  controller.getRefires(req, context)
);

// GET /api/restaurant/kds/performance/food-cost - Food cost percentage
export const FOOD_COST = createIndustryAPI("restaurant", PERMISSIONS.ANALYTICS_VIEW, (req, context) =>
  controller.getFoodCost(req, context)
);
