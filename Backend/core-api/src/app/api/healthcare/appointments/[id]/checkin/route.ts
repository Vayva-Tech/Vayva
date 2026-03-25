/**
 * Appointment Check-in API Route
 * POST /api/healthcare/appointments/[id]/checkin - Patient check-in
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// HIPAA: Log check-in event
function logCheckIn(userId: string, appointmentId: string, patientId: string, storeId: string) {
  logger.info("PATIENT_CHECK_IN", {
    userId,
    appointmentId,
    patientId,
    storeId,
    timestamp: new Date().toISOString(),
  });
}

// POST Patient Check-in
export const POST = withVayvaAPI(
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
        checkInMethod, // "kiosk", "reception", "mobile", "self_service"
        symptoms,
        temperature,
        bloodPressure,
        _notes,
      } = body;

      // Verify appointment exists
      const appointment = await prisma.appointment.findFirst({
        where: {
          id: appointmentId,
          merchantId: storeId,
        },
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              allergies: true,
              medications: true,
            }
          }
        }
      });

      if (!appointment) {
        return NextResponse.json(
          { error: "Appointment not found" },
          { status: 404 }
        );
      }

      // Check if already checked in
      if (appointment.checkInTime) {
        return NextResponse.json(
          { error: "Patient already checked in" },
          { status: 409 }
        );
      }

      // Check if appointment is today
      const today = new Date();
      const apptDate = new Date(appointment.scheduledAt);
      
      if (apptDate.toDateString() !== today.toDateString()) {
        return NextResponse.json(
          { error: "Check-in only allowed on appointment day" },
          { status: 400 }
        );
      }

      // Update appointment with check-in
      const updatedAppointment = await prisma.appointment.update({
        where: { id: appointmentId },
        data: {
          checkInTime: new Date(),
          status: "checked_in",
        },
      });

      // Add patient to queue
      const queueEntry = await prisma.patientQueue.create({
        data: {
          merchantId: storeId,
          patientId: appointment.patientId,
          appointmentId,
          status: "waiting",
          priority: "normal",
          checkInTime: new Date(),
          estimatedWaitTime: 15, // Default 15 minutes
        },
      });

      logCheckIn(user.id, appointmentId, appointment.patientId, storeId);

      // Create audit log
      await prisma.healthcareAuditLog.create({
        data: {
          patientId: appointment.patientId,
          userId: user.id,
          action: "PATIENT_CHECKED_IN",
          details: {
            appointmentId,
            checkInMethod,
            symptoms,
            temperature,
            bloodPressure,
          },
        },
      });

      // If vital signs provided, create preliminary record
      if (temperature || bloodPressure) {
        // In a real implementation, this would create a vital signs record
        // For now, we'll just log it
        logger.info("Vital signs recorded", {
          appointmentId,
          temperature,
          bloodPressure,
          recordedBy: user.id,
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          appointment: {
            id: updatedAppointment.id,
            status: updatedAppointment.status,
            checkInTime: updatedAppointment.checkInTime,
          },
          queue: {
            id: queueEntry.id,
            status: queueEntry.status,
            priority: queueEntry.priority,
            estimatedWaitTime: queueEntry.estimatedWaitTime,
            checkInTime: queueEntry.checkInTime,
          },
          patient: {
            id: appointment.patient.id,
            name: `${appointment.patient.firstName} ${appointment.patient.lastName}`,
            allergies: appointment.patient.allergies,
            alert: appointment.patient.allergies.length > 0 ? "ALLERGIES_PRESENT" : null,
          },
          message: "Patient successfully checked in"
        },
      });
    } catch (error: unknown) {
      logger.error("[APPOINTMENT_CHECKIN_POST]", error, { storeId, appointmentId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);