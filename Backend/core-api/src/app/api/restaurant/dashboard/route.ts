// ============================================================================
// GET /api/restaurant/dashboard - Restaurant/Kitchen Dashboard Data
// ============================================================================
// Returns KDS orders, menu performance, table status, and kitchen metrics
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";
import prisma from "@/lib/prisma";

// GET /api/restaurant/dashboard
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      // Fetch all data in parallel
      const [
        kdsOrders,
        menuItems,
        tables,
      ] = await Promise.all([
        // Get active KDS orders
        prisma.kDSOrder.findMany({
          where: {
            storeId,
            status: { in: ["pending", "preparing", "ready"] },
          },
          orderBy: { createdAt: "asc" },
        }),
        
        // Get menu items performance
        prisma.menuItem.findMany({
          where: {
            storeId,
            available: true,
          },
          orderBy: { createdAt: "desc" },
          take: 20,
        }),
        
        // Get table status
        prisma.restaurantTable.findMany({
          where: {
            storeId,
          },
          orderBy: { tableNumber: "asc" },
        }),
      ]);
      
      // Calculate metrics
      const pendingOrders = kdsOrders.filter(o => o.status === "pending");
      const preparingOrders = kdsOrders.filter(o => o.status === "preparing");
      const readyOrders = kdsOrders.filter(o => o.status === "ready");
      
      // Calculate average prep time for completed orders today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const completedToday = kdsOrders.filter(o => 
        o.completedAt && new Date(o.completedAt) >= today
      );
      
      const avgPrepTime = completedToday.length > 0
        ? completedToday.reduce((sum, order) => sum + (order.prepTimeMinutes || 0), 0) / completedToday.length
        : 0;
      
      // Get unavailable items
      const unavailableItems = menuItems.filter(item => !item.available);
      
      // Prepare dashboard data
      const dashboardData = {
        config: {
          industry: "food",
          title: "Kitchen Control",
          primaryObjectLabel: "Menu Item",
        },
        metrics: {
          ordersToday: kdsOrders.length,
          averagePrepTime: Math.round(avgPrepTime),
          tableTurnoverRate: 0, // Would need historical table data
          revenue: 0, // Would need order totals
        },
        kdsBoard: {
          pending: pendingOrders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            orderType: order.orderType,
            tableNumber: order.tableNumber,
            items: order.items,
            createdAt: order.createdAt,
            priority: "normal",
          })),
          preparing: preparingOrders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            orderType: order.orderType,
            tableNumber: order.tableNumber,
            items: order.items,
            createdAt: order.createdAt,
            prepTimeMinutes: order.prepTimeMinutes,
            priority: "normal",
          })),
          ready: readyOrders.map(order => ({
            id: order.id,
            orderNumber: order.orderNumber,
            orderType: order.orderType,
            tableNumber: order.tableNumber,
            items: order.items,
            createdAt: order.createdAt,
            prepTimeMinutes: order.prepTimeMinutes,
            priority: "normal",
          })),
        },
        menuPerformance: {
          bestSellers: menuItems.slice(0, 5).map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            price: Number(item.price),
          })),
          soldOut: unavailableItems.map(item => ({
            id: item.id,
            name: item.name,
            category: item.category,
            reason: "sold_out",
          })),
        },
        tables: {
          total: tables.length,
          occupied: tables.filter(t => t.status === "occupied").length,
          available: tables.filter(t => t.status === "available").length,
          details: tables.map(t => ({
            id: t.id,
            tableNumber: t.tableNumber,
            capacity: t.capacity,
            status: t.status,
            currentOrderId: t.currentOrderId,
          })),
        },
        alerts: [],
        suggestedActions: [],
      };
      
      return NextResponse.json(
        { 
          success: true, 
          data: dashboardData 
        },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Restaurant dashboard error:", error);
      return NextResponse.json(
        { 
          error: "Failed to fetch restaurant dashboard data",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
