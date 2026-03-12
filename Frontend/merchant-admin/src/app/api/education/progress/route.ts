import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@vayva/shared";
import { prisma } from "@/lib/prisma";

// GET /api/education/progress?courseId=xxx - Get student progress for a course
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const courseId = searchParams.get("courseId");
      const studentId = searchParams.get("studentId");

      if (!courseId) {
        return NextResponse.json(
          { success: false, error: "courseId is required" },
          { status: 400 }
        );
      }

      // Verify course belongs to store
      const course = await (prisma as any).educationCourse.findFirst({
        where: {
          id: courseId,
          storeId,
        },
        include: {
          modules: {
            include: {
              lessons: {
                include: {
                  assignments: true,
                  quizzes: true,
                },
              },
            },
          },
        },
      });

      if (!course) {
        return NextResponse.json(
          { success: false, error: "Course not found" },
          { status: 404 }
        );
      }

      // Build progress query
      const progressWhere: Record<string, unknown> = { courseId };
      if (studentId) {
        progressWhere.studentId = studentId;
      }

      const progress = await (prisma as any).educationStudentProgress.findMany({
        where: progressWhere,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          lesson: {
            select: {
              id: true,
              title: true,
              moduleId: true,
            },
          },
        },
        orderBy: { updatedAt: "desc" },
      });

      // Calculate aggregate stats if studentId provided
      let stats = null;
      if (studentId) {
        const completedLessons = progress.filter((p: any) => p.status === "COMPLETED").length;
        const totalLessons = course.modules.reduce(
          (acc: number, m: any) => acc + m.lessons.length, 
          0
        );
        
        // Get assignment submissions
        const assignmentIds = course.modules.flatMap((m: any) =>
          m.lessons.flatMap((l: any) => l.assignments.map((a: any) => a.id))
        );
        
        const submissions = await (prisma as any).educationAssignmentSubmission.findMany({
          where: {
            assignmentId: { in: assignmentIds },
            studentId,
          },
          select: {
            score: true,
            maxScore: true,
            status: true,
          },
        });
        
        // Get quiz attempts
        const quizIds = course.modules.flatMap((m: any) =>
          m.lessons.flatMap((l: any) => l.quizzes.map((q: any) => q.id))
        );
        
        const attempts = await (prisma as any).educationQuizAttempt.findMany({
          where: {
            quizId: { in: quizIds },
            studentId,
          },
          select: {
            score: true,
            maxScore: true,
            passed: true,
          },
        });
        
        const avgAssignmentScore = submissions.length > 0
          ? submissions.reduce((acc: number, s: any) => acc + (s.score || 0), 0) / submissions.length
          : 0;
          
        const avgQuizScore = attempts.length > 0
          ? attempts.reduce((acc: number, a: any) => acc + (a.percentageScore || 0), 0) / attempts.length
          : 0;
        
        stats = {
          completedLessons,
          totalLessons,
          completionPercentage: Math.round((completedLessons / totalLessons) * 100),
          assignmentsSubmitted: submissions.length,
          assignmentsGraded: submissions.filter((s: any) => s.status === "GRADED").length,
          avgAssignmentScore: Math.round(avgAssignmentScore),
          quizzesTaken: attempts.length,
          quizzesPassed: attempts.filter((a: any) => a.passed).length,
          avgQuizScore: Math.round(avgQuizScore),
          overallProgress: Math.round(
            ((completedLessons + submissions.length + attempts.length) / 
             (totalLessons + assignmentIds.length + quizIds.length)) * 100
          ),
        };
      }

      return NextResponse.json({
        success: true,
        data: progress,
        stats,
      });
    } catch (error: unknown) {
      logger.error("[PROGRESS_GET_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch progress" },
        { status: 500 }
      );
    }
  }
);

// POST /api/education/progress - Update lesson progress
export const POST = withVayvaAPI(
  PERMISSIONS.STORE_VIEW,
  async (req: NextRequest, { storeId, user }: { storeId: string; user: { id: string } }) => {
    try {
      const body = await req.json();
      const { lessonId, status, watchTimeSeconds, completedAt } = body;

      if (!lessonId || !status) {
        return NextResponse.json(
          { success: false, error: "lessonId and status are required" },
          { status: 400 }
        );
      }

      // Verify lesson exists and belongs to store
      const lesson = await (prisma as any).educationLesson.findFirst({
        where: {
          id: lessonId,
          module: {
            course: { storeId },
          },
        },
        include: {
          module: {
            select: {
              courseId: true,
            },
          },
        },
      });

      if (!lesson) {
        return NextResponse.json(
          { success: false, error: "Lesson not found" },
          { status: 404 }
        );
      }

      // Upsert progress
      const progress = await (prisma as any).educationStudentProgress.upsert({
        where: {
          studentId_lessonId: {
            studentId: user.id,
            lessonId,
          },
        },
        create: {
          studentId: user.id,
          lessonId,
          courseId: lesson.module.courseId,
          status,
          watchTimeSeconds: watchTimeSeconds || 0,
          completedAt: status === "COMPLETED" ? (completedAt || new Date()) : null,
        },
        update: {
          status,
          ...(watchTimeSeconds !== undefined && {
            watchTimeSeconds: { increment: watchTimeSeconds },
          }),
          ...(status === "COMPLETED" && {
            completedAt: completedAt || new Date(),
          }),
        },
      });

      logger.info("[PROGRESS_UPDATED]", { 
        progressId: progress.id, 
        lessonId, 
        studentId: user.id,
        status,
        storeId 
      });

      return NextResponse.json({
        success: true,
        data: progress,
      });
    } catch (error: unknown) {
      logger.error("[PROGRESS_UPDATE_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to update progress" },
        { status: 500 }
      );
    }
  }
);

// GET /api/education/progress/stats - Get enrollment and completion stats
export const PATCH = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const courseId = searchParams.get("courseId");

      if (!courseId) {
        return NextResponse.json(
          { success: false, error: "courseId is required" },
          { status: 400 }
        );
      }

      // Get enrollment count
      const enrollmentCount = await (prisma as any).educationEnrollment.count({
        where: {
          courseId,
          course: { storeId },
        },
      });

      // Get lesson completion stats
      const lessons = await (prisma as any).educationLesson.findMany({
        where: {
          module: {
            courseId,
            course: { storeId },
          },
        },
        select: {
          id: true,
          title: true,
        },
      });

      const lessonStats = await Promise.all(
        lessons.map(async (lesson: any) => {
          const completedCount = await (prisma as any).educationStudentProgress.count({
            where: {
              lessonId: lesson.id,
              status: "COMPLETED",
            },
          });
          
          const inProgressCount = await (prisma as any).educationStudentProgress.count({
            where: {
              lessonId: lesson.id,
              status: "IN_PROGRESS",
            },
          });

          return {
            lessonId: lesson.id,
            lessonTitle: lesson.title,
            completed: completedCount,
            inProgress: inProgressCount,
            notStarted: Math.max(0, enrollmentCount - completedCount - inProgressCount),
            completionRate: enrollmentCount > 0 
              ? Math.round((completedCount / enrollmentCount) * 100) 
              : 0,
          };
        })
      );

      return NextResponse.json({
        success: true,
        data: {
          enrollmentCount,
          lessonStats,
        },
      });
    } catch (error: unknown) {
      logger.error("[PROGRESS_STATS_ERROR]", {
        error: error instanceof Error ? error.message : String(error),
        storeId,
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch progress stats" },
        { status: 500 }
      );
    }
  }
);
