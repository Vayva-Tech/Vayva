/**
 * Individual Appointment API Routes
 * GET /api/healthcare/appointments/[id] - Get appointment details
 * PUT /api/healthcare/appointments/[id] - Update appointment
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// HIPAA: Log appointment access
function logAppointmentAccess(userId: string, action: string, appointmentId: string, storeId: string) {
  logger.info(`APPOINTMENT_ACCESS: ${action}`, {
    userId,
    appointmentId,
    storeId,
    timestamp: new Date().toISOString(),
    action,
  });
}

// GET Appointment by ID
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (request, { storeId, params, user }) => {
    try {
      const { id: appointmentId } = await params;
      
      if (!appointmentId) {
        return NextResponse.json(
          { error: "Appointment ID required" },
          { status: 400 }
        );
      }

      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          merchantId: storeId,
        },
        include: {
          patient: {
            select: {
              id: true,
              mrn: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
              gender: true,
              phone: true,
              email: true,
              allergies: true,
              medications: true,
            }
          },
          provider: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        },
      });

      if (!appointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }

      logAppointmentAccess(user.id, "VIEW_APPOINTMENT", appointmentId, storeId);

      // Create audit log
      await prisma.healthcareAuditLog.create({
        data: {
          patientId: appointment.patientId,
          userId: user.id,
          action: "APPOINTMENT_VIEWED",
          details: { appointmentId },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...appointment,
          patientName: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
          providerName: appointment.provider.name,
          isPast: appointment.scheduledAt < new Date(),
          isToday: appointment.scheduledAt.toDateString() === new Date().toDateString(),
        },
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_APPOINTMENT_GET]", error, { storeId, appointmentId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// PUT Update Appointment
export const PUT = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId, params, user }) => {
    try {
      const { id: appointmentId } = await params;
      
      if (!appointmentId) {
        return NextResponse.json(
          { error: "Appointment ID required" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const {
        scheduledAt,
        duration,
        type,
        status,
        reason,
        notes,
      } = body;

      // Verify appointment exists
      const existingAppointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          merchantId: storeId,
        },
      });

      if (!existingAppointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }

      // Check for conflicts if rescheduling
      if (scheduledAt || duration) {
        const newScheduledAt = scheduledAt ? new Date(scheduledAt) : existingAppointment.scheduledAt;
        const newDuration = duration || existingAppointment.duration;
        const newEndTime = new Date(newScheduledAt.getTime() + newDuration * 60000);

        const conflictingAppointments = await prisma.appointment.findMany({
          where: {
            providerId: existingAppointment.providerId,
            id: { not: appointmentId },
            status: { notIn: ["cancelled", "no_show"] },
            scheduledAt: { lt: newEndTime },
            OR: [
              { scheduledAt: { gte: newScheduledAt } },
              { 
                scheduledAt: { lt: newScheduledAt },
                duration: { gte: (newEndTime.getTime() - newScheduledAt.getTime()) / 60000 }
              }
            ]
          },
        });

        if (conflictingAppointments.length > 0) {
          return NextResponse.json(
            { error: "Scheduling conflict detected" },
            { status: 409 }
          );
        }
      }

      const updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          ...(scheduledAt !== undefined && { scheduledAt: new Date(scheduledAt) }),
          ...(duration !== undefined && { duration }),
          ...(type !== undefined && { type }),
          ...(status !== undefined && { status }),
          ...(reason !== undefined && { reason }),
          ...(notes !== undefined && { notes }),
          updatedAt: new Date(),
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          },
          provider: {
            select: {
              id: true,
              name: true,
            }
          }
        }
      });

      logAppointmentAccess(user.id, "UPDATE_APPOINTMENT", appointmentId, storeId);

      // Create audit log
      await prisma.healthcareAuditLog.create({
        data: {
          patientId: updatedAppointment.patientId,
          userId: user.id,
          action: "APPOINTMENT_UPDATED",
          details: {
            appointmentId,
            changes: Object.keys(body).filter(key => key !== "id"),
            previousStatus: existingAppointment.status,
            newStatus: updatedAppointment.status,
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...updatedAppointment,
          patientName: `${updatedAppointment.patient.firstName} ${updatedAppointment.patient.lastName}`,
          providerName: updatedAppointment.provider.name,
        },
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_APPOINTMENT_PUT]", error, { storeId, appointmentId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);