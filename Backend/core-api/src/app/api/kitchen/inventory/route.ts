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
      const period = searchParams.get('period') || 'week';
      
      // Calculate date range
      const now = new Date();
      let startDate: Date;
      
      switch (period) {
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
          startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      }

      // Get inventory data
      const inventoryData = await prisma.kitchenInventory.findMany({
        where: {
          storeId,
          updatedAt: { gte: startDate },
        },
        include: {
          station: {
            select: {
              id: true,
              name: true,
              type: true,
            },
          },
        },
        orderBy: { name: "asc" },
      });

      // Calculate inventory metrics
      const totalItems = inventoryData.length;
      const lowStockItems = inventoryData.filter(item => item.lowStockAlert).length;
      const outOfStockItems = inventoryData.filter(item => item.quantity <= 0).length;
      
      const inventoryMetrics = {
        summary: {
          totalItems,
          inStock: totalItems - outOfStockItems,
          lowStock: lowStockItems,
          outOfStock: outOfStockItems,
          stockRate: totalItems > 0 ? Math.round(((totalItems - outOfStockItems) / totalItems) * 100) : 0,
        },
        byStation: inventoryData.reduce((acc, item) => {
          const stationId = item.stationId;
          if (!acc[stationId]) {
            acc[stationId] = {
              station: item.station,
              items: [],
              lowStockCount: 0,
              outOfStockCount: 0,
            };
          }
          acc[stationId].items.push(item);
          if (item.lowStockAlert) acc[stationId].lowStockCount++;
          if (item.quantity <= 0) acc[stationId].outOfStockCount++;
          return acc;
        }, {} as Record<string, any>),
        criticalItems: inventoryData
          .filter(item => item.quantity <= 0 || item.lowStockAlert)
          .sort((a, b) => {
            if (a.quantity <= 0 && b.quantity > 0) return -1;
            if (b.quantity <= 0 && a.quantity > 0) return 1;
            return a.name.localeCompare(b.name);
          })
          .slice(0, 20),
        allItems: inventoryData,
      };

      return NextResponse.json(
        { data: inventoryMetrics },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[KITCHEN_INVENTORY_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch inventory data" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);