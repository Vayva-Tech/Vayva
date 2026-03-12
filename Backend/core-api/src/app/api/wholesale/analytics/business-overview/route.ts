import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.WHOLESALE_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const todayEnd = new Date(todayStart.getTime() + 24 * 60 * 60 * 1000);
      const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      
      // Get today's orders
      const todayOrders = await prisma.wholesaleOrder.findMany({
        where: {
          storeId,
          createdAt: { gte: todayStart, lt: todayEnd },
          status: { not: "cancelled" },
        },
        include: {
          items: { select: { totalPrice: true } }
        }
      });

      // Get MTD orders for revenue calculation
      const mtdOrders = await prisma.wholesaleOrder.findMany({
        where: {
          storeId,
          createdAt: { gte: monthStart },
          status: { not: "cancelled" },
        },
        include: {
          items: { select: { totalPrice: true } }
        }
      });

      // Calculate metrics
      const ordersToday = todayOrders.length;
      const revenueMTD = mtdOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const averageOrderValue = ordersToday > 0 
        ? todayOrders.reduce((sum, order) => sum + order.totalAmount, 0) / ordersToday
        : 0;

      // Get previous period data for trends
      const yesterdayStart = new Date(todayStart.getTime() - 24 * 60 * 60 * 1000);
      const yesterdayEnd = todayStart;
      const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const lastMonthEnd = monthStart;

      const [yesterdayOrders, lastMonthOrders] = await Promise.all([
        prisma.wholesaleOrder.findMany({
          where: {
            storeId,
            createdAt: { gte: yesterdayStart, lt: yesterdayEnd },
            status: { not: "cancelled" },
          },
          include: { items: { select: { totalPrice: true } } }
        }),
        prisma.wholesaleOrder.findMany({
          where: {
            storeId,
            createdAt: { gte: lastMonthStart, lt: lastMonthEnd },
            status: { not: "cancelled" },
          },
          include: { items: { select: { totalPrice: true } } }
        })
      ]);

      const ordersYesterday = yesterdayOrders.length;
      const revenueLastMonth = lastMonthOrders.reduce((sum, order) => sum + order.totalAmount, 0);
      const aovYesterday = ordersYesterday > 0 
        ? yesterdayOrders.reduce((sum, order) => sum + order.totalAmount, 0) / ordersYesterday
        : 0;

      // Calculate trends
      const ordersTrend = ordersYesterday > 0 
        ? (ordersToday - ordersYesterday) / ordersYesterday
        : 0;
      
      const revenueTrend = revenueLastMonth > 0 
        ? (revenueMTD - revenueLastMonth) / revenueLastMonth
        : 0;
      
      const aovTrend = aovYesterday > 0 
        ? (averageOrderValue - aovYesterday) / aovYesterday
        : 0;

      const businessOverview = {
        ordersToday,
        ordersTrend,
        revenueMTD,
        revenueTrend,
        averageOrderValue,
        aovTrend,
      };

      return NextResponse.json(
        { data: businessOverview },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[WHOLESALE_BUSINESS_OVERVIEW_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch business overview data" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);