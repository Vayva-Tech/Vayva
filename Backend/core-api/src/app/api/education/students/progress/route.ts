import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { getStudentProgress } from "@vayva/industry-education/features";

/**
 * GET /api/education/students/progress
 * 
 * Get student progress data for dashboard
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const studentId = searchParams.get("studentId") || undefined;
      const courseId = searchParams.get("courseId") || undefined;
      const atRiskOnly = searchParams.get("atRiskOnly") === "true";

      const progressData = await getStudentProgress(prisma, storeId, {
        studentId,
        courseId,
        atRiskOnly,
      });

      return NextResponse.json({
        success: true,
        data: progressData,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("[EDUCATION_STUDENT_PROGRESS_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch student progress data",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  },
);
