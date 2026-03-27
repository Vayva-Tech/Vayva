/**
 * Fashion Dashboard Stats API
 * GET /api/fashion/stats - Dashboard statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    // Get current period stats
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);

    // Calculate total revenue (from orders)
    const revenuePromise = prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
        status: { in: ["completed", "processing"] }
      },
      _sum: { totalAmount: true },
      _count: true
    });

    // Count active products
    const productsPromise = prisma.product.count({
      where: {
        status: "active"
      }
    });

    // Count customers
    const customersPromise = prisma.customer.count();

    // Get low stock items count
    const lowStockPromise = prisma.inventoryItem.count({
      where: {
        quantity: { lte: prisma.inventoryItem.fields.minLevel }
      }
    });

    // Calculate average order value
    const avgOrderValuePromise = prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfMonth }
      },
      _avg: { totalAmount: true }
    });

    const [revenueData, productCount, customerCount, lowStockCount, avgOrderData] = await Promise.all([
      revenuePromise,
      productsPromise,
      customersPromise,
      lowStockPromise,
      avgOrderValuePromise
    ]);

    const stats = {
      totalRevenue: revenueData._sum.totalAmount || 0,
      todayOrders: revenueData._count,
      activeProducts: productCount,
      totalCustomers: customerCount,
      lowStockAlerts: lowStockCount,
      averageOrderValue: avgOrderData._avg.totalAmount || 0
    };

    return NextResponse.json({ data: stats, success: true });
  } catch (error) {
    logger.error("Failed to fetch fashion stats", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics", success: false },
      { status: 500 }
    );
  }
}
