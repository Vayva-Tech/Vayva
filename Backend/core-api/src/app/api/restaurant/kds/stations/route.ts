import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.RESTAURANT_KDS_VIEW,
  async (req, { storeId, db }) => {
    try {
      // Get all kitchen stations for this store
      const stations = await db.kitchenStation.findMany({
        where: { storeId },
        orderBy: { name: "asc" },
        include: {
          _count: {
            select: {
              tickets: {
                where: {
                  status: { not: "COMPLETED" },
                },
              },
            },
          },
        },
      });
      
      // Get station performance metrics
      const performanceMetrics = await db.$queryRaw`
        SELECT 
          ks.id,
          ks.name,
          COUNT(kt.id) as total_tickets,
          COUNT(CASE WHEN kt.status = 'COMPLETED' THEN 1 END) as completed_tickets,
          AVG(kt.actual_time) as avg_completion_time,
          MAX(kt.created_at) as last_ticket_time
        FROM "KitchenStation" ks
        LEFT JOIN "KitchenTicket" kt ON ks.id = kt."stationId"
        WHERE ks."storeId" = ${storeId}
        GROUP BY ks.id, ks.name
      `;
      
      return NextResponse.json({
        success: true,
        data: stations,
        metrics: performanceMetrics,
      });
    } catch (error: any) {
      logger.error("[RESTAURANT_KDS_STATIONS_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "KDS_STATIONS_FETCH_FAILED",
            message: "Failed to fetch kitchen stations",
          },
        },
        { status: 500 }
      );
    }
  }
);

export const POST = withVayvaAPI(
  PERMISSIONS.RESTAURANT_KDS_MANAGE,
  async (req, { storeId, db, user }) => {
    try {
      const body = await req.json();
      
      const station = await db.kitchenStation.create({
        data: {
          ...body,
          storeId,
          createdBy: user.id,
        },
      });
      
      logger.info("[RESTAURANT_KDS_STATION_CREATED]", {
        stationId: station.id,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: station,
      });
    } catch (error: any) {
      logger.error("[RESTAURANT_KDS_STATIONS_POST]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "KDS_STATION_CREATE_FAILED",
            message: "Failed to create kitchen station",
          },
        },
        { status: 500 }
      );
    }
  }
);