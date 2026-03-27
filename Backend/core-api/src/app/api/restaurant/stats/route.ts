/**
 * Restaurant Dashboard Stats API
 * GET /api/restaurant/stats - Dashboard statistics
 */

import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { logger } from "@/lib/logger";

export async function GET(request: NextRequest) {
  try {
    const currentDate = new Date();
    const startOfDay = new Date(currentDate.setHours(0, 0, 0, 0));
    const endOfDay = new Date(currentDate.setHours(23, 59, 59, 999));

    // Today's revenue
    const revenuePromise = prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfDay, lte: endOfDay },
        status: { in: ["completed", "processing"] }
      },
      _sum: { totalAmount: true },
      _count: true
    });

    // Active orders count
    const activeOrdersPromise = prisma.order.count({
      where: {
        status: { in: ["pending", "preparing", "ready"] }
      }
    });

    // Today's reservations
    const reservationsPromise = prisma.reservation.count({
      where: {
        dateTime: { gte: startOfDay, lte: endOfDay },
        status: "confirmed"
      }
    });

    // Average ticket size
    const avgTicketPromise = prisma.order.aggregate({
      where: {
        createdAt: { gte: startOfDay }
      },
      _avg: { totalAmount: true }
    });

    // Customer count today
    const customerCountPromise = prisma.customer.count({
      where: {
        orders: {
          some: {
            createdAt: { gte: startOfDay }
          }
        }
      }
    });

    const [revenueData, activeOrders, reservations, avgTicket, customers] = await Promise.all([
      revenuePromise,
      activeOrdersPromise,
      reservationsPromise,
      avgTicketPromise,
      customerCountPromise
    ]);

    const stats = {
      totalRevenue: revenueData._sum.totalAmount || 0,
      todayOrders: revenueData._count,
      pendingReservations: reservations,
      averageTicket: avgTicket._avg.totalAmount || 0,
      foodCostPercentage: 28, // Would calculate from inventory usage
      laborCostPercentage: 32, // Would calculate from payroll
      tableTurnoverRate: 2.5, // Would calculate from reservation data
      customerCount: customers
    };

    return NextResponse.json({ data: stats, success: true });
  } catch (error) {
    logger.error("Failed to fetch restaurant stats", error);
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics", success: false },
      { status: 500 }
    );
  }
}
