import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { z } from "zod";

const analyticsQuerySchema = z.object({
  courseId: z.string().optional(),
  studentId: z.string().optional(),
  enrollmentId: z.string().optional(),
  weekNumber: z.number().optional(),
});

export const GET = withVayvaAPI(
  PERMISSIONS.ANALYTICS_VIEW,
  async (req: NextRequest, { storeId }: APIContext) => {
    try {
      const { searchParams } = new URL(req.url);
      const courseId = searchParams.get("courseId") || undefined;
      const studentId = searchParams.get("studentId") || undefined;
      const enrollmentId = searchParams.get("enrollmentId") || undefined;

      const where = {
        storeId,
        ...(courseId && { courseId }),
        ...(studentId && { studentId }),
        ...(enrollmentId && { enrollmentId }),
      };

      const [analytics, totals] = await Promise.all([
        prisma.progressAnalytics.findMany({
          where,
          orderBy: [
            { studentId: "asc" },
            { weekNumber: "asc" },
          ],
        }),
        prisma.progressAnalytics.aggregate({
          where,
          _avg: {
            averageScore: true,
            attendanceRate: true,
          },
          _sum: {
            lessonsCompleted: true,
            assignmentsSubmitted: true,
            timeSpent: true,
          },
        }),
      ]);

      return NextResponse.json({
        data: analytics,
        summary: {
          avgScore: totals._avg.averageScore || 0,
          avgAttendance: totals._avg.attendanceRate || 0,
          totalLessonsCompleted: totals._sum.lessonsCompleted || 0,
          totalAssignmentsSubmitted: totals._sum.assignmentsSubmitted || 0,
          totalTimeSpent: totals._sum.timeSpent || 0,
        },
      });
    } catch (error) {
      logger.error("[PROGRESS_ANALYTICS_GET]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to fetch progress analytics" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.ANALYTICS_CREATE,
  async (req: NextRequest, { storeId }: APIContext) => {
    try {
      const body = await req.json();
      const validated = analyticsQuerySchema.parse(body);

      const analytics = await prisma.progressAnalytics.create({
        data: {
          storeId,
          courseId: validated.courseId || "",
          studentId: validated.studentId || "",
          enrollmentId: validated.enrollmentId || "",
          weekNumber: validated.weekNumber || 1,
        },
      });

      return NextResponse.json({ data: analytics }, { status: 201 });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: "Validation error", details: error.errors },
          { status: 400 },
        );
      }
      logger.error("[PROGRESS_ANALYTICS_POST]", { error: String(error), storeId });
      return NextResponse.json(
        { error: "Failed to create analytics record" },
        { status: 500 },
      );
    }
  },
);
