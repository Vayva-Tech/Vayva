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
        include: {
          sessions: {
            where: {
              storeId,
              startTime: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
              },
            },
            select: {
              id: true,
              classType: true,
              startTime: true,
              endTime: true,
              location: true,
              _count: { select: { attendance: true } },
            },
            orderBy: { startTime: "asc" },
            take: 20,
          },
          appointments: {
            where: {
              storeId,
              startTime: {
                gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
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
                },
              },
            },
            orderBy: { startTime: "asc" },
            take: 20,
          },
        },
      });

      if (!instructor) {
        return NextResponse.json(
          { error: "Instructor not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const totalSessions = instructor.sessions.length;
      const totalAttendance = instructor.sessions.reduce(
        (sum, session) => sum + session._count.attendance,
        0,
      );
      const avgAttendance =
        totalSessions > 0 ? totalAttendance / totalSessions : 0;

      const totalAppointments = instructor.appointments.length;
      const upcomingSessions = instructor.sessions.filter(
        (s) => s.startTime > new Date(),
      ).length;
      const upcomingAppointments = instructor.appointments.filter(
        (a) => a.startTime > new Date(),
      ).length;

      const instructorWithSchedule = {
        ...instructor,
        certifications: JSON.parse(instructor.certifications || "[]"),
        availability: JSON.parse(instructor.availability || "{}"),
        languages: JSON.parse(instructor.languages || '["English"]'),
        performance: {
          totalSessions,
          totalAttendance,
          averageAttendance: Math.round(avgAttendance * 100) / 100,
          totalAppointments,
          upcomingSessions,
          upcomingAppointments,
          utilizationRate:
            totalSessions > 0
              ? Math.round((totalSessions / (30 * 2)) * 10000) / 100
              : 0,
        },
        recentSchedule: {
          sessions: instructor.sessions.map((session) => ({
            ...session,
            clientCount: session._count.attendance,
          })),
          appointments: instructor.appointments.map((appointment) => ({
            ...appointment,
            clientName: `${appointment.client.firstName} ${appointment.client.lastName}`,
          })),
        },
      };

      return NextResponse.json(
        { data: instructorWithSchedule },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[WELLNESS_INSTRUCTOR_GET]", {
        error,
        instructorId: instructorIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch instructor" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
