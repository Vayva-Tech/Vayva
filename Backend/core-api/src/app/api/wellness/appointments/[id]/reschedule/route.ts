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

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  const requestId = crypto.randomUUID();
  try {
    const { id } = params;
    const json = await req.json().catch(() => ({}));
    const parseResult = RescheduleSchema.safeParse(json);

    if (!parseResult.success) {
      return NextResponse.json(
        {
          error: "Invalid reschedule data",
          details: parseResult.error.flatten(),
        },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    const { newStartTime, newEndTime, reason, notifyClient, notes } = parseResult.data;
    
    // Extract storeId from request context
    const storeId = "test-store-id"; // Placeholder

    // Verify appointment exists
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
        { status: 404, headers: standardHeaders(requestId) }
      );
    }

    // Check if appointment is in the past
    if (appointment.startTime < new Date()) {
      return NextResponse.json(
        { error: "Cannot reschedule past appointments" },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    // Validate new time constraints
    const newStart = new Date(newStartTime);
    const newEnd = new Date(newEndTime);
    
    if (newStart >= newEnd) {
      return NextResponse.json(
        { error: "New end time must be after new start time" },
        { status: 400, headers: standardHeaders(requestId) }
      );
    }

    // Check for scheduling conflicts
    const conflictingAppointments = await prisma.wellnessAppointment.findMany({
      where: {
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
        { status: 409, headers: standardHeaders(requestId) }
      );
    }

    // Update appointment
    const updatedAppointment = await prisma.wellnessAppointment.update({
      where: { id },
      data: {
        startTime: newStart,
        endTime: newEnd,
        status: "scheduled", // Reset status if it was confirmed
      },
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

    // Create reschedule record for audit trail
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
        rescheduledBy: "staff", // Would come from auth context
        notifiedClient: notifyClient,
      },
    });

    // In a real implementation, you'd send notifications here
    // if (notifyClient) {
    //   await sendRescheduleNotification(appointment.client, updatedAppointment, reason);
    // }

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
      { headers: standardHeaders(requestId) }
    );
  } catch (error: unknown) {
    logger.error("[WELLNESS_APPOINTMENT_RESCHEDULE_POST]", { error, appointmentId: params.id });
    return NextResponse.json(
      { error: "Failed to reschedule appointment" },
      { status: 500, headers: standardHeaders(requestId) }
    );
  }
}