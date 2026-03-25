import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.INSTRUCTORS_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let instructorIdForLog = "";
    try {
      const { id } = await params;
      instructorIdForLog = id;

      const instructor = await prisma.wellnessInstructor.findFirst({
        where: { id, storeId },
      });

      if (!instructor) {
        return NextResponse.json(
          { error: "Instructor not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const since = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000);

      const [sessions, appointments, reviews] = await Promise.all([
        prisma.wellnessSession.findMany({
          where: {
            storeId,
            instructorId: id,
            startTime: { gte: since },
          },
          include: {
            _count: { select: { attendance: true } },
          },
        }),
        prisma.wellnessAppointment.findMany({
          where: {
            storeId,
            instructorId: id,
            startTime: { gte: since },
            status: "completed",
          },
        }),
        prisma.wellnessReview.findMany({
          where: {
            storeId,
            instructorId: id,
            createdAt: { gte: since },
          },
        }),
      ]);

      const totalSessions = sessions.length;
      const totalSessionAttendance = sessions.reduce(
        (sum, session) => sum + session._count.attendance,
        0,
      );
      const avgSessionAttendance =
        totalSessions > 0 ? totalSessionAttendance / totalSessions : 0;

      const totalAppointments = appointments.length;
      const totalAppointmentRevenue = appointments.reduce(
        (sum, apt) => sum + apt.price,
        0,
      );

      const totalReviews = reviews.length;
      const avgRating =
        totalReviews > 0
          ? reviews.reduce((sum, review) => sum + review.rating, 0) /
            totalReviews
          : 0;
      const recommendationRate =
        totalReviews > 0
          ? (reviews.filter((r) => r.wouldRecommend).length / totalReviews) * 100
          : 0;

      const totalTeachingHours =
        sessions.reduce((sum, session) => {
          return (
            sum +
            (session.endTime.getTime() - session.startTime.getTime()) /
              (1000 * 60 * 60)
          );
        }, 0) +
        appointments.reduce((sum, apt) => {
          return (
            sum +
            (apt.endTime.getTime() - apt.startTime.getTime()) / (1000 * 60 * 60)
          );
        }, 0);

      const hourlyEarnings =
        totalTeachingHours > 0
          ? Math.round((totalAppointmentRevenue / totalTeachingHours) * 100) /
            100
          : 0;

      return NextResponse.json(
        {
          data: {
            instructorId: id,
            instructorName: `${instructor.firstName} ${instructor.lastName}`,
            performanceMetrics: {
              period: "last_90_days",
              sessions: {
                total: totalSessions,
                totalAttendance: totalSessionAttendance,
                averageAttendance: Math.round(avgSessionAttendance * 100) / 100,
                utilizationRate:
                  totalSessions > 0
                    ? Math.round((totalSessions / (90 * 2)) * 10000) / 100
                    : 0,
              },
              appointments: {
                total: totalAppointments,
                totalRevenue: Math.round(totalAppointmentRevenue * 100) / 100,
                averageRevenue:
                  totalAppointments > 0
                    ? Math.round(
                        (totalAppointmentRevenue / totalAppointments) * 100,
                      ) / 100
                    : 0,
              },
              reviews: {
                total: totalReviews,
                averageRating: Math.round(avgRating * 100) / 100,
                recommendationRate: Math.round(recommendationRate * 100) / 100,
              },
              overall: {
                totalTeachingHours: Math.round(totalTeachingHours * 100) / 100,
                hourlyEarnings,
                performanceScore: calculatePerformanceScore(
                  avgSessionAttendance,
                  totalReviews > 0 ? avgRating : 4,
                  recommendationRate,
                  totalSessions,
                ),
              },
            },
            strengths: identifyStrengths(
              avgSessionAttendance,
              avgRating,
              recommendationRate,
            ),
            improvementAreas: identifyImprovementAreas(
              avgSessionAttendance,
              avgRating,
              totalSessions,
            ),
          },
        },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[WELLNESS_INSTRUCTOR_PERFORMANCE_GET]", {
        error,
        instructorId: instructorIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch instructor performance" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

function calculatePerformanceScore(
  attendance: number,
  rating: number,
  recommendation: number,
  sessions: number,
): number {
  const attendanceScore = Math.min(100, (attendance / 20) * 100);
  const ratingScore = (rating / 5) * 100;
  const recommendationScore = recommendation;
  const consistencyScore = Math.min(100, (sessions / 26) * 100);

  return (
    Math.round(
      (attendanceScore * 0.3 +
        ratingScore * 0.3 +
        recommendationScore * 0.2 +
        consistencyScore * 0.2) *
        100,
    ) / 100
  );
}

function identifyStrengths(
  attendance: number,
  rating: number,
  recommendation: number,
): string[] {
  const strengths: string[] = [];

  if (attendance > 15)
    strengths.push("Excellent class attendance and engagement");
  if (rating > 4.5) strengths.push("Outstanding client satisfaction scores");
  if (recommendation > 90)
    strengths.push("High client recommendation rate");
  if (attendance > 10 && rating > 4)
    strengths.push("Consistently delivers quality instruction");

  return strengths.length > 0 ? strengths : ["Solid foundational performance"];
}

function identifyImprovementAreas(
  attendance: number,
  rating: number,
  sessions: number,
): string[] {
  const improvements: string[] = [];

  if (attendance < 8)
    improvements.push("Focus on improving class attendance and engagement");
  if (rating < 4)
    improvements.push("Work on client satisfaction and service quality");
  if (sessions < 20)
    improvements.push("Increase teaching frequency for better consistency");
  if (attendance < 12)
    improvements.push(
      "Consider adjusting class timing or content to boost participation",
    );

  return improvements.length > 0
    ? improvements
    : ["Continue current excellent performance"];
}
