import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { getCourseStats } from "@vayva/industry-education/features";

/**
 * GET /api/education/courses/stats
 * 
 * Get course statistics for dashboard
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const courseId = searchParams.get("courseId") || undefined;
      const categoryId = searchParams.get("categoryId") || undefined;
      const status = searchParams.get("status") as 'draft' | 'published' | 'archived' | undefined;

      const stats = await getCourseStats(prisma, storeId, {
        courseId,
        categoryId,
        status,
      });

      return NextResponse.json({
        success: true,
        data: stats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("[EDUCATION_COURSE_STATS_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch course statistics",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  },
);
