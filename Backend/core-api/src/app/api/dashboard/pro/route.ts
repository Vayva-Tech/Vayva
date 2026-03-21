import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { AICreditService } from "@/lib/ai/credit-service";
import { AiUsageService } from "@/lib/ai/ai-usage.service";
import { logger } from "@/lib/logger";

/**
 * GET /api/dashboard/pro
 * Aggregates pro dashboard data: orders by status, tasks, inventory alerts,
 * top customers, and AI stats for the authenticated merchant.
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (_req, { storeId }) => {
    try {
      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      const [
        orderCounts,
        recentOrdersRaw,
        lowStockProducts,
        topCustomers,
        aiCredits,
        aiUsageStats,
      ] = await Promise.all([
        // Order counts grouped by status
        prisma.order.groupBy({
          by: ["status"],
          where: { storeId },
          _count: { id: true },
        }),

        // Recent orders (last 7 days)
        prisma.order.findMany({
          where: {
            storeId,
            createdAt: { gte: sevenDaysAgo },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
          select: {
            id: true,
            status: true,
            totalAmount: true,
            createdAt: true,
            customer: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
        }),

        // Inventory alerts: products with low stock
        prisma.product.findMany({
          where: {
            storeId,
            trackInventory: true,
            quantity: { lte: 5 },
          },
          orderBy: { quantity: "asc" },
          take: 10,
          select: {
            id: true,
            name: true,
            quantity: true,
            sku: true,
          },
        }),

        // Top customers by total spend in the last 30 days
        prisma.customer.findMany({
          where: { storeId },
          orderBy: { totalSpent: "desc" },
          take: 5,
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            totalSpent: true,
            totalOrders: true,
          },
        }),

        // AI credit summary
        AICreditService.getCreditSummary(storeId),

        // AI usage stats (last 14 days)
        AiUsageService.getUsageStats(storeId, 14),
      ]);

      // Build order status map
      const ordersByStatus: Record<string, number> = {};
      for (const row of orderCounts) {
        ordersByStatus[row.status] = row._count.id;
      }

      const totalOrders = Object.values(ordersByStatus).reduce(
        (sum, count) => sum + count,
        0,
      );

      // Revenue this month
      const revenueThisMonth = await prisma.order.aggregate({
        where: {
          storeId,
          status: { in: ["COMPLETED", "DELIVERED"] },
          createdAt: { gte: thirtyDaysAgo },
        },
        _sum: { totalAmount: true },
      });

      const recentOrders = recentOrdersRaw.map((order) => ({
        id: order.id,
        status: order.status,
        totalAmount: Number(order.totalAmount ?? 0),
        createdAt: order.createdAt.toISOString(),
        customerName: order.customer
          ? `${order.customer.firstName ?? ""} ${order.customer.lastName ?? ""}`.trim() ||
            order.customer.email ||
            "Unknown"
          : "Unknown",
      }));

      const inventoryAlerts = lowStockProducts.map((p) => ({
        id: p.id,
        name: p.name,
        quantity: p.quantity ?? 0,
        sku: p.sku ?? null,
      }));

      const topCustomerList = topCustomers.map((c) => ({
        id: c.id,
        name:
          `${c.firstName ?? ""} ${c.lastName ?? ""}`.trim() ||
          c.email ||
          "Unknown",
        email: c.email ?? null,
        totalSpent: Number(c.totalSpent ?? 0),
        totalOrders: c.totalOrders ?? 0,
      }));

      // Summarise AI usage
      const totalAiRequests = aiUsageStats.reduce(
        (sum, day) => sum + day.totalRequests,
        0,
      );
      const totalAiTokens = aiUsageStats.reduce(
        (sum, day) => sum + day.totalTokens,
        0,
      );

      return NextResponse.json(
        {
          success: true,
          data: {
            orders: {
              total: totalOrders,
              byStatus: ordersByStatus,
              recent: recentOrders,
            },
            revenue: {
              last30Days: Number(revenueThisMonth._sum.totalAmount ?? 0),
            },
            inventory: {
              lowStockAlerts: inventoryAlerts,
              lowStockCount: inventoryAlerts.length,
            },
            customers: {
              top: topCustomerList,
            },
            ai: {
              credits: {
                totalCreditsPurchased: aiCredits.totalCreditsPurchased,
                creditsRemaining: aiCredits.creditsRemaining,
                creditsUsed: aiCredits.creditsUsed,
                percentageUsed: aiCredits.percentageUsed,
                isLowCredit: aiCredits.isLowCredit,
                estimatedRequestsRemaining:
                  aiCredits.estimatedRequestsRemaining,
              },
              usage: {
                last14Days: aiUsageStats,
                totalRequests: totalAiRequests,
                totalTokens: totalAiTokens,
              },
            },
          },
        },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[DASHBOARD_PRO_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Failed to fetch pro dashboard data" },
        { status: 500 },
      );
    }
  },
);
