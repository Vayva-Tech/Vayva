import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.RESTAURANT_KDS_VIEW,
  async (req, { storeId, db }) => {
    try {
      // Get timing statistics for kitchen operations
      const timingStats = await db.$queryRaw`
        SELECT 
          kt.station,
          COUNT(kt.id) as ticket_count,
          AVG(kt.estimated_time) as avg_estimated_time,
          AVG(kt.actual_time) as avg_actual_time,
          AVG(kt.actual_time - kt.estimated_time) as avg_time_variance,
          COUNT(CASE WHEN kt.actual_time > kt.estimated_time THEN 1 END) as late_count,
          ROUND(
            COUNT(CASE WHEN kt.actual_time <= kt.estimated_time THEN 1 END) * 100.0 / COUNT(kt.id), 
            2
          ) as on_time_percentage
        FROM "KitchenTicket" kt
        WHERE kt."storeId" = ${storeId}
          AND kt.status = 'COMPLETED'
          AND kt.actual_time IS NOT NULL
          AND kt.estimated_time IS NOT NULL
        GROUP BY kt.station
        ORDER BY ticket_count DESC
      `;
      
      // Get hourly timing trends
      const hourlyTrends = await db.$queryRaw`
        SELECT 
          EXTRACT(HOUR FROM kt."createdAt") as hour_of_day,
          COUNT(kt.id) as tickets_processed,
          AVG(kt.actual_time) as avg_processing_time,
          MIN(kt.actual_time) as min_time,
          MAX(kt.actual_time) as max_time
        FROM "KitchenTicket" kt
        WHERE kt."storeId" = ${storeId}
          AND kt.status = 'COMPLETED'
          AND kt.actual_time IS NOT NULL
          AND kt."createdAt" >= NOW() - INTERVAL '7 days'
        GROUP BY EXTRACT(HOUR FROM kt."createdAt")
        ORDER BY hour_of_day
      `;
      
      // Get rush hour analysis
      const rushHours = await db.$queryRaw`
        SELECT 
          CASE 
            WHEN EXTRACT(HOUR FROM kt."createdAt") BETWEEN 11 AND 14 THEN 'Lunch Rush'
            WHEN EXTRACT(HOUR FROM kt."createdAt") BETWEEN 17 AND 21 THEN 'Dinner Rush'
            ELSE 'Off-Peak'
          END as period,
          COUNT(kt.id) as ticket_count,
          AVG(kt.actual_time) as avg_time,
          COUNT(DISTINCT DATE(kt."createdAt")) as days_sampled
        FROM "KitchenTicket" kt
        WHERE kt."storeId" = ${storeId}
          AND kt.status = 'COMPLETED'
          AND kt."createdAt" >= NOW() - INTERVAL '30 days'
        GROUP BY 
          CASE 
            WHEN EXTRACT(HOUR FROM kt."createdAt") BETWEEN 11 AND 14 THEN 'Lunch Rush'
            WHEN EXTRACT(HOUR FROM kt."createdAt") BETWEEN 17 AND 21 THEN 'Dinner Rush'
            ELSE 'Off-Peak'
          END
        ORDER BY ticket_count DESC
      `;
      
      return NextResponse.json({
        success: true,
        data: {
          stationTiming: timingStats,
          hourlyTrends,
          rushHourAnalysis: rushHours,
        },
      });
    } catch (error: any) {
      logger.error("[RESTAURANT_KDS_TIMING_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "KDS_TIMING_FETCH_FAILED",
            message: "Failed to fetch kitchen timing data",
          },
        },
        { status: 500 }
      );
    }
  }
);