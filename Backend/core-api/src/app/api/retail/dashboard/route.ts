import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { standardHeaders } from "@vayva/shared";
import {
  RetailApiService,
  RETAIL_DASHBOARD_CONFIG
} from "@vayva/industry-retail";

// GET /api/retail/dashboard - Get retail dashboard data
export const GET = withVayvaAPI(
  PERMISSIONS.RETAIL_DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      const retailApi = new RetailApiService();
      
      // Get aggregate dashboard data
      const aggregate = await retailApi.getDashboardAggregate(storeId);
      
      // Get channel sales breakdown
      const channelSales = await retailApi.getChannelSales(storeId, '30d');
      
      // Get store performance
      const stores = await retailApi.getStores(storeId);
      
      // Get inventory alerts
      const inventoryAlerts = await retailApi.getInventoryAlerts(storeId);
      
      // Get loyalty stats
      const loyaltyStats = await retailApi.getLoyaltyStats(storeId);
      
      return NextResponse.json(
        {
          success: true,
          data: {
            config: RETAIL_DASHBOARD_CONFIG,
            metrics: aggregate,
            channels: channelSales,
            stores,
            inventory: {
              alerts: inventoryAlerts,
            },
            loyalty: loyaltyStats,
          },
        },
        { status: 200, headers: standardHeaders(requestId) },
      );
    } catch (error) {
      console.error("Retail dashboard error:", error);
      return NextResponse.json(
        { 
          error: "Failed to fetch retail dashboard data",
          details: error instanceof Error ? error.message : 'Unknown error'
        },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
