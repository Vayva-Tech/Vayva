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

      const availability = JSON.parse(instructor.availability || "{}");

      const today = new Date();
      const next30Days = new Date(today.getTime() + 30 * 24 * 60 * 60 * 1000);

      const [upcomingSessions, upcomingAppointments] = await Promise.all([
        prisma.wellnessSession.findMany({
          where: {
            storeId,
            instructorId: id,
            startTime: {
              gte: today,
              lte: next30Days,
            },
          },
          select: {
            id: true,
            classType: true,
            startTime: true,
            endTime: true,
            location: true,
            capacity: true,
            _count: { select: { attendance: true } },
          },
          orderBy: { startTime: "asc" },
        }),
        prisma.wellnessAppointment.findMany({
          where: {
            storeId,
            instructorId: id,
            startTime: {
              gte: today,
              lte: next30Days,
            },
          },
          select: {
            id: true,
            serviceType: true,
            startTime: true,
            endTime: true,
            client: {
              select: {
                firstName: true,
                lastName: true,
                email: true,
              },
            },
          },
          orderBy: { startTime: "asc" },
        }),
      ]);

      const availableDays = Object.entries(availability)
        .filter(([, timeSlots]) => Array.isArray(timeSlots) && timeSlots.length > 0)
        .map(([day]) => day.charAt(0).toUpperCase() + day.slice(1));

      const totalAvailableSlots = Object.values(availability).reduce(
        (sum, slots: unknown) =>
          Array.isArray(slots) ? sum + slots.length : sum,
        0,
      );

      const mockConflicts = [
        {
          date: new Date(today.getTime() + 5 * 24 * 60 * 60 * 1000),
          conflict: "Double booked yoga class",
        },
        {
          date: new Date(today.getTime() + 12 * 24 * 60 * 60 * 1000),
          conflict: "Overlapping personal training",
        },
      ];

      const mockFreePeriods = [
        {
          date: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000),
          suggestion: "Add morning meditation class",
        },
        {
          date: new Date(today.getTime() + 15 * 24 * 60 * 60 * 1000),
          suggestion: "Available for corporate wellness session",
        },
      ];

      return NextResponse.json(
        {
          data: {
            instructorId: id,
            instructorName: `${instructor.firstName} ${instructor.lastName}`,
            availability: {
              weeklyPattern: availableDays,
              totalWeeklySlots: totalAvailableSlots,
              raw: availability,
            },
            upcomingSchedule: {
              next30Days: {
                sessions: upcomingSessions.length,
                appointments: upcomingAppointments.length,
                totalBookedHours:
                  upcomingSessions.reduce(
                    (sum, s) =>
                      sum +
                      (s.endTime.getTime() - s.startTime.getTime()) /
                        (1000 * 60 * 60),
                    0,
                  ) +
                  upcomingAppointments.reduce(
                    (sum, a) =>
                      sum +
                      (a.endTime.getTime() - a.startTime.getTime()) /
                        (1000 * 60 * 60),
                    0,
                  ),
              },
              detailedSessions: upcomingSessions.map((session) => ({
                ...session,
                bookedSpots: session._count.attendance,
                availableSpots: session.capacity - session._count.attendance,
              })),
              detailedAppointments: upcomingAppointments.map((appointment) => ({
                ...appointment,
                clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
              })),
            },
            scheduleAnalysis: {
              conflicts: mockConflicts,
              optimizationSuggestions: mockFreePeriods,
              utilizationRate:
                totalAvailableSlots > 0
                  ? Math.round(
                      ((upcomingSessions.length + upcomingAppointments.length) /
                        totalAvailableSlots) *
                        10000,
                    ) / 100
                  : 0,
            },
            recommendations: generateScheduleRecommendations(
              availableDays,
              totalAvailableSlots,
              upcomingSessions.length + upcomingAppointments.length,
            ),
          },
        },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[WELLNESS_INSTRUCTOR_SCHEDULE_GET]", {
        error,
        instructorId: instructorIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch instructor schedule" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);

function generateScheduleRecommendations(
  availableDays: string[],
  totalSlots: number,
  bookedItems: number,
): string[] {
  const recommendations: string[] = [];

  if (availableDays.length === 0) {
    recommendations.push(
      "No availability specified - please update your weekly schedule",
    );
  } else if (availableDays.length <= 3) {
    recommendations.push(
      `Limited availability (${availableDays.join(", ")}) - consider expanding to increase earning potential`,
    );
  }

  if (totalSlots === 0) {
    recommendations.push(
      "No time slots configured - add your preferred teaching times",
    );
  }

  const utilizationRate =
    totalSlots > 0 ? (bookedItems / totalSlots) * 100 : 0;

  if (utilizationRate < 30) {
    recommendations.push(
      `Low schedule utilization (${Math.round(utilizationRate)}%) - consider adding more classes or availability`,
    );
  } else if (utilizationRate > 90) {
    recommendations.push(
      `High schedule utilization (${Math.round(utilizationRate)}%) - excellent booking rate!`,
    );
  }

  if (availableDays.includes("Saturday") || availableDays.includes("Sunday")) {
    recommendations.push(
      "Weekend availability is valuable for client convenience",
    );
  }

  if (!availableDays.includes("Monday") || !availableDays.includes("Friday")) {
    recommendations.push(
      "Consider adding weekday availability for working professionals",
    );
  }

  return recommendations.length > 0
    ? recommendations
    : ["Schedule looks well-balanced - keep up the good work!"];
}
