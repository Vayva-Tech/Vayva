// ============================================================================
// GET /api/retail/dashboard - Retail Dashboard Data
// ============================================================================
// Returns complete retail dashboard data with metrics, alerts, and actions
// ============================================================================

import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";
import prisma from "@/lib/prisma";

// GET /api/retail/dashboard
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      // Get time horizon from query params
      const searchParams = req.nextUrl.searchParams;
      const timeHorizon = searchParams.get("timeHorizon") || "today";
      
      // Calculate date range
      const now = new Date();
      let startDate = new Date(now);
      
      switch (timeHorizon) {
        case "today":
          startDate.setHours(0, 0, 0, 0);
          break;
        case "week":
          startDate.setDate(now.getDate() - 7);
          break;
        case "month":
          startDate.setMonth(now.getMonth() - 1);
          break;
      }
      
      // Fetch metrics in parallel
      const [
        products,
        orders,
        inventoryAlerts,
      ] = await Promise.all([
        // Get top selling products
        prisma.retailProduct.findMany({
          where: {
            storeId,
            status: "active",
            createdAt: { gte: startDate },
          },
          orderBy: { soldCount: "desc" },
          take: 5,
          select: {
            id: true,
            name: true,
            sku: true,
            price: true,
            stock: true,
            soldCount: true,
            category: true,
          },
        }),
        
        // Get order metrics
        prisma.retailOrder.groupBy({
          by: ["status"],
          where: {
            storeId,
            createdAt: { gte: startDate },
          },
          _count: true,
        }),
        
        // Get inventory alerts
        prisma.retailInventoryAlert.findMany({
          where: {
            storeId,
            severity: { in: ["critical", "out_of_stock"] },
          },
          orderBy: { createdAt: "desc" },
          take: 10,
        }),
      ]);
      
      // Calculate revenue
      const totalRevenue = orders.reduce((sum, order) => {
        return sum + (order._count || 0);
      }, 0);
      
      // Get pending fulfillment count
      const pendingOrders = orders.find(o => o.status === "pending");
      const delayedOrders = orders.find(o => o.status === "delayed");
      
      // Prepare response
      const dashboardData = {
        config: {
          industry: "retail",
          title: "Retail Operations",
          primaryObjectLabel: "Product",
        },
        metrics: {
          revenue: totalRevenue,
          orders: orders.reduce((sum, o) => sum + (o._count || 0), 0),
          customers: 0, // Would need customer relation
          conversionRate: 0, // Would need analytics data
        },
        primaryObjectHealth: {
          topSellingProducts: products.map(p => ({
            id: p.id,
            name: p.name,
            soldCount: p.soldCount,
            revenue: Number(p.price) * p.soldCount,
          })),
          lowStockProducts: products.filter(p => p.stock < 10).map(p => ({
            id: p.id,
            name: p.name,
            stock: p.stock,
            threshold: 10,
          })),
          deadStockProducts: [], // Would need sales history analysis
        },
        liveOperations: {
          pendingFulfillment: pendingOrders?._count || 0,
          delayedShipments: delayedOrders?._count || 0,
          returnsInitiated: 0, // Would need returns data
        },
        alerts: inventoryAlerts.map(alert => ({
          id: alert.id,
          productId: alert.productId,
          severity: alert.severity,
          currentStock: alert.currentStock,
          threshold: alert.threshold,
        })),
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
      console.error("Retail dashboard error:", error);
      return NextResponse.json(
        { 
          error: "Failed to fetch retail dashboard data",
          details: error instanceof Error ? error.message : "Unknown error",
        },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
