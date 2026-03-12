import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { nightlifeService } from "@vayva/industry-nightlife/services";

// GET /api/nightlife/dashboard - Get complete nightlife dashboard data
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId, correlationId }: APIContext) => {
    const requestId = correlationId;
    
    try {
      // Fetch all dashboard data in parallel using services
      const [
        metrics,
        tables,
        vipGuests,
        bottleOrders,
        promoters,
        doorActivity,
        securityIncidents,
        reservations,
      ] = await Promise.all([
        nightlifeService.getMetrics(),
        nightlifeService.getTables(),
        nightlifeService.getVIPList(),
        nightlifeService.getBottleOrders(),
        nightlifeService.getPromoterSales(),
        nightlifeService.getDoorActivity(),
        nightlifeService.getSecurityIncidents(),
        nightlifeService.getReservations(),
      ]);

      // Format response
      const dashboardData = {
        metrics,
        tables,
        vipGuests,
        bottleOrders,
        promoters,
        doorActivity,
        securityIncidents,
        reservations,
        bottleInventory: [
          { name: 'Ace of Spades', quantity: 3, status: 'low' as const },
          { name: 'Clase Azul', quantity: 5, status: 'low' as const },
          { name: 'Don Julio 1942', quantity: 12, status: 'ok' as const },
          { name: 'Grey Goose', quantity: 18, status: 'ok' as const },
        ],
      };

      return NextResponse.json(
        { 
          success: true,
          data: dashboardData,
          timestamp: new Date().toISOString(),
        },
        { headers: standardHeaders(requestId) }
      );
    } catch (error: unknown) {
      logger.error("[NIGHTLIFE_DASHBOARD_GET]", { error, storeId });
      return NextResponse.json(
        { error: "Failed to fetch nightlife dashboard" },
        { status: 500, headers: standardHeaders(requestId) }
      );
    }
  }
);
