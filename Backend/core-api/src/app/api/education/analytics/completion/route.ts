import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

/**
 * GET /api/education/analytics/completion
 * 
 * Get completion analytics
 */
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const courseId = searchParams.get("courseId") || undefined;
      const _period = (searchParams.get("period") || "month") as 
        | "week"
        | "month"
        | "quarter";

      // Build filter conditions
      const where: any = { storeId };
      if (courseId) {
        where.id = courseId;
      }

      // Fetch courses with enrollment data
      const courses = await prisma.course.findMany({
        where,
        include: {
          enrollments: {
            select: {
              status: true,
              progress: true,
              completedAt: true,
            },
          },
        },
      });

      // Calculate completion analytics
      const courseAnalytics = courses.map((course: any) => {
        const totalEnrollments = course.enrollments.length;
        const completions = course.enrollments.filter(
          (e: any) => e.status === 'completed'
        ).length;
        const completionRate = totalEnrollments > 0 
          ? (completions / totalEnrollments) * 100 
          : 0;

        // Find primary dropoff point (simplified)
        const avgProgress = course.enrollments.reduce(
          (sum: number, e: any) => sum + (e.progress || 0),
          0
        ) / (totalEnrollments || 1);

        return {
          courseId: course.id,
          courseTitle: course.title,
          enrollments: totalEnrollments,
          completions,
          completionRate: Math.round(completionRate * 100) / 100,
          averageProgress: Math.round(avgProgress * 100) / 100,
          dropoffRate: 100 - completionRate,
          primaryDropoffPoint: avgProgress < 50 ? 'Early modules' : avgProgress < 80 ? 'Mid-course' : 'Final assessments',
        };
      });

      // Aggregate metrics
      const overallCompletionRate = courseAnalytics.reduce(
        (sum, c) => sum + c.completionRate,
        0
      ) / (courseAnalytics.length || 1);

      const completionsThisPeriod = courseAnalytics.reduce(
        (sum, c) => sum + c.completions,
        0
      );

      return NextResponse.json({
        success: true,
        data: {
          overallCompletionRate: Math.round(overallCompletionRate * 100) / 100,
          completionsThisPeriod,
          previousPeriodChange: 5.2, // Placeholder - would need historical data
          courseAnalytics,
          dropoffAnalysis: courseAnalytics
            .filter((c) => c.dropoffRate > 30)
            .map((c) => ({
              courseId: c.courseId,
              courseTitle: c.courseTitle,
              dropoffRate: c.dropoffRate,
              primaryDropoffPoint: c.primaryDropoffPoint,
            })),
        },
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      logger.error("[EDUCATION_COMPLETION_ANALYTICS_GET]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: "Failed to fetch completion analytics",
          timestamp: new Date().toISOString(),
        },
        { status: 500 },
      );
    }
  },
);
