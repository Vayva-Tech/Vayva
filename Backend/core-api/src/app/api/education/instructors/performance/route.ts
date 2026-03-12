import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { getInstructorPerformance } from "@vayva/industry-education/features";

/**
 * GET /api/education/instructors/performance
 * 
 * Get instructor performance metrics
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const instructorId = searchParams.get("instructorId") || undefined;
      const period = (searchParams.get("period") || "month") as 
        | "week"
        | "month"
        | "quarter"
        | "year";

      const performance = await getInstructorPerformance(prisma, storeId, {
        instructorId,
        period,
      });

      return NextResponse.json({
        success: true,
        data: performance,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("[EDUCATION_INSTRUCTOR_PERFORMANCE_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch instructor performance",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  },
);
