import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { z } from "zod";

const RescheduleSchema = z.object({
  newStartTime: z.string().datetime(),
  newEndTime: z.string().datetime(),
  reason: z.string().min(1),
  notifyClient: z.boolean().default(true),
  notes: z.string().optional(),
});

export const POST = withVayvaAPI(
  PERMISSIONS.APPOINTMENTS_MANAGE,
  async (req: NextRequest, { storeId, params, user, correlationId }: APIContext) => {
    const requestId = correlationId;
    let appointmentIdForLog = "";
    try {
      const { id } = await params;
      appointmentIdForLog = id;
      const json = await req.json().catch(() => ({}));
      const parseResult = RescheduleSchema.safeParse(json);

      if (!parseResult.success) {
        return NextResponse.json(
          {
            error: "Invalid reschedule data",
            details: parseResult.error.flatten(),
          },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const { newStartTime, newEndTime, reason, notifyClient, notes } =
        parseResult.data;

      const appointment = await prisma.wellnessAppointment.findFirst({
        where: { id, storeId },
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          instructor: {
            select: {
              firstName: true,
              lastName: true,
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

      if (appointment.startTime < new Date()) {
        return NextResponse.json(
          { error: "Cannot reschedule past appointments" },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const newStart = new Date(newStartTime);
      const newEnd = new Date(newEndTime);

      if (newStart >= newEnd) {
        return NextResponse.json(
          { error: "New end time must be after new start time" },
          { status: 400, headers: standardHeaders(requestId) },
        );
      }

      const conflictingAppointments = await prisma.wellnessAppointment.findMany({
        where: {
          storeId,
          instructorId: appointment.instructorId,
          id: { not: id },
          status: { not: "cancelled" },
          OR: [
            {
              startTime: { lte: newStart },
              endTime: { gt: newStart },
            },
            {
              startTime: { lt: newEnd },
              endTime: { gte: newEnd },
            },
          ],
        },
      });

      if (conflictingAppointments.length > 0) {
        return NextResponse.json(
          { error: "New time slot conflicts with existing appointment" },
          { status: 409, headers: standardHeaders(requestId) },
        );
      }

      const updateResult = await prisma.wellnessAppointment.updateMany({
        where: { id, storeId },
        data: {
          startTime: newStart,
          endTime: newEnd,
          status: "scheduled",
        },
      });

      if (updateResult.count === 0) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      const updatedAppointment = await prisma.wellnessAppointment.findFirst({
        where: { id, storeId },
        include: {
          client: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
            },
          },
          instructor: {
            select: {
              firstName: true,
              lastName: true,
              specialty: true,
            },
          },
        },
      });

      if (!updatedAppointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      await prisma.wellnessAppointmentReschedule.create({
        data: {
          storeId,
          appointmentId: id,
          originalStartTime: appointment.startTime,
          originalEndTime: appointment.endTime,
          newStartTime: newStart,
          newEndTime: newEnd,
          reason,
          notes,
          rescheduledBy: user.id,
          notifiedClient: notifyClient,
        },
      });

      return NextResponse.json(
        {
          data: {
            appointment: updatedAppointment,
            reschedule: {
              originalTime: `${appointment.startTime.toLocaleString()} - ${appointment.endTime.toLocaleString()}`,
              newTime: `${newStart.toLocaleString()} - ${newEnd.toLocaleString()}`,
              reason,
              notifiedClient: notifyClient,
            },
          },
        },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      logger.error("[WELLNESS_APPOINTMENT_RESCHEDULE_POST]", {
        error,
        appointmentId: appointmentIdForLog,
        storeId,
        userId: user?.id,
      });
      return NextResponse.json(
        { error: "Failed to reschedule appointment" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
