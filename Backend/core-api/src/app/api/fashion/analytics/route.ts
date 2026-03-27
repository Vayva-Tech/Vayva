/**
 * Fashion Analytics API
 * GET /api/fashion/analytics - Sales & performance analytics
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const currentDate = new Date();
    const startOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const startOfLastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1);

    // Calculate revenue growth
    const currentMonthRevenue = await prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfMonth },
        status: "completed"
      },
      _sum: { totalAmount: true }
    });

    const lastMonthRevenue = await prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfLastMonth, lt: startOfMonth },
        status: "completed"
      },
      _sum: { totalAmount: true }
    });

    const currentRevenue = currentMonthRevenue._sum.totalAmount || 0;
    const lastRevenue = lastMonthRevenue._sum.totalAmount || 0;
    const revenueGrowth = lastRevenue > 0 ? ((currentRevenue - lastRevenue) / lastRevenue) * 100 : 0;

    // Get popular products
    const popularProducts = await prisma.orderItem.groupBy({
      by: ["productId"],
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: "desc" } },
      take: 10,
      include: {
        product: {
          select: {
            name: true,
            category: true,
            basePrice: true
          }
        }
      }
    });

    // Customer retention rate
    const repeatCustomers = await prisma.customer.count({
      where: {
        orders: {
          some: {}
        }
      }
    });

    const totalCustomers = await prisma.customer.count();
    const retentionRate = totalCustomers > 0 ? (repeatCustomers / totalCustomers) * 100 : 0;

    const analytics = {
      revenueGrowth: parseFloat(revenueGrowth.toFixed(2)),
      popularProducts: popularProducts.map(p => ({
        name: p.product?.name || "Unknown",
        category: p.product?.category || "Unknown",
        sales: p._sum.quantity || 0,
        price: p.product?.basePrice || 0
      })),
      customerRetention: parseFloat(retentionRate.toFixed(2)),
      averageOrderValue: currentRevenue / (await prisma.order.count({
        where: { createdAt: { gte: startOfMonth } }
      })) || 0
    };

    return NextResponse.json({ data: analytics, success: true });
  } catch (error) {
    logger.error("Failed to fetch fashion analytics", error);
    return NextResponse.json(
      { error: "Failed to fetch analytics", success: false },
      { status: 500 }
    );
  }
}
