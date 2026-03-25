import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.APPOINTMENTS_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    let appointmentIdForLog = "";
    try {
      const { id } = await params;
      appointmentIdForLog = id;

      const appointment = await prisma.wellnessAppointment.findFirst({
        where: { id, storeId },
        include: {
          client: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              dateOfBirth: true,
            },
          },
          instructor: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              specialty: true,
              bio: true,
            },
          },
        },
      });

      if (!appointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const durationMinutes = Math.round(
        (appointment.endTime.getTime() - appointment.startTime.getTime()) /
          (1000 * 60),
      );
      const timeUntilStart = Math.ceil(
        (appointment.startTime.getTime() - Date.now()) / (1000 * 60),
      );
      const isUpcoming = timeUntilStart > 0;
      const isInPast = appointment.endTime < new Date();

      const appointmentWithDetails = {
        ...appointment,
        clientPreferences: JSON.parse(appointment.clientPreferences || "{}"),
        reminders: JSON.parse(appointment.reminders || "[]"),
        client: {
          ...appointment.client,
          age: appointment.client.dateOfBirth
            ? Math.floor(
                (Date.now() - appointment.client.dateOfBirth.getTime()) /
                  (1000 * 60 * 60 * 24 * 365),
              )
            : null,
        },
        metrics: {
          durationMinutes,
          timeUntilStart,
          isUpcoming,
          isInPast,
          isToday:
            appointment.startTime.toDateString() === new Date().toDateString(),
          isLateCancellation:
            appointment.status === "cancelled" && timeUntilStart < 1440,
        },
        timing: {
          date: appointment.startTime.toDateString(),
          time: `${appointment.startTime.toLocaleTimeString()} - ${appointment.endTime.toLocaleTimeString()}`,
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        },
      };

      return NextResponse.json(
        { data: appointmentWithDetails },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[WELLNESS_APPOINTMENT_GET]", {
        error,
        appointmentId: appointmentIdForLog,
      });
      return NextResponse.json(
        { error: "Failed to fetch appointment" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
