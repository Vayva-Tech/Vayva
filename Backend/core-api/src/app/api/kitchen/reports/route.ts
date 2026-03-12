import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.KITCHEN_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { searchParams } = new URL(req.url);
      const period = searchParams.get('period') || 'day'; // hour, day, week, month
      
      // Calculate date range
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
        case 'hour':
          startDate = new Date(now.getTime() - 60 * 60 * 1000);
          break;
        case 'day':
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          break;
        case 'week':
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          break;
        case 'month':
          startDate = new Date(now.getFullYear(), now.getMonth(), 1);
          break;
        default:
          startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      }

      // Get real-time kitchen dashboard data
      const [orders, stations, menuItems] = await Promise.all([
        prisma.kitchenOrder.findMany({
          where: {
            storeId,
            createdAt: { gte: startDate },
          },
          include: {
            items: {
              select: {
                id: true,
                status: true,
                stationId: true,
              },
            },
          },
        }),
        prisma.kitchenStation.findMany({
          where: { storeId, active: true },
          include: {
            _count: {
              select: {
                assignedOrders: {
                  where: { status: { not: "completed" } },
                },
              },
            },
          },
        }),
        prisma.kitchenMenuItem.findMany({
          where: { storeId, active: true },
          take: 10,
          orderBy: { popularity: "desc" },
        }),
      ]);

      // Calculate dashboard metrics
      const totalOrders = orders.length;
      const pendingOrders = orders.filter(o => o.status === "pending").length;
      const preparingOrders = orders.filter(o => o.status === "preparing").length;
      const readyOrders = orders.filter(o => o.status === "ready").length;
      
      // Calculate item statuses across all orders
      const allItems = orders.flatMap(o => o.items);
      const pendingItems = allItems.filter(i => i.status === "pending").length;
      const preparingItems = allItems.filter(i => i.status === "preparing").length;
      const completedItems = allItems.filter(i => i.status === "completed").length;
      const totalItems = allItems.length;

      const dashboardData = {
        overview: {
          totalOrders,
          pendingOrders,
          preparingOrders,
          readyOrders,
          orderCompletionRate: totalOrders > 0 
            ? Math.round(((pendingOrders + preparingOrders + readyOrders) / totalOrders) * 100)
            : 0,
        },
        items: {
          totalItems,
          pendingItems,
          preparingItems,
          completedItems,
          itemCompletionRate: totalItems > 0 
            ? Math.round((completedItems / totalItems) * 100)
            : 0,
        },
        stations: stations.map(station => ({
          id: station.id,
          name: station.name,
          type: station.type,
          activeOrders: station._count.assignedOrders,
          capacity: station.capacity,
          utilization: station.capacity > 0 
            ? Math.round((station._count.assignedOrders / station.capacity) * 100)
            : 0,
        })),
        popularItems: menuItems.map(item => ({
          id: item.id,
          name: item.name,
          category: item.category,
          popularity: item.popularity,
        })),
        recentOrders: orders
          .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
          .slice(0, 10)
          .map(order => ({
            id: order.id,
            tableNumber: order.tableNumber,
            priority: order.priority,
            status: order.status,
            itemCount: order.items.length,
            createdAt: order.createdAt,
          })),
      };

      return NextResponse.json(
        { data: dashboardData },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[KITCHEN_DASHBOARD_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch kitchen dashboard" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);