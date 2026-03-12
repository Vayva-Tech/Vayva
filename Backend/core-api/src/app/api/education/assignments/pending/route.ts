import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { getAssignments } from "@vayva/industry-education/features";

/**
 * GET /api/education/assignments/pending
 * 
 * Get assignments pending grading
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const courseId = searchParams.get("courseId") || undefined;
      const limit = parseInt(searchParams.get("limit") || "50");

      const assignments = await getAssignments(prisma, storeId, {
        courseId,
        pendingGrading: true,
      });

      return NextResponse.json({
        success: true,
        data: {
          totalPending: assignments.pendingGrading,
          overdueSubmissions: assignments.overdueSubmissions,
          gradingQueue: assignments.gradingQueue.slice(0, limit),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("[EDUCATION_ASSIGNMENTS_PENDING_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch pending assignments",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  },
);
