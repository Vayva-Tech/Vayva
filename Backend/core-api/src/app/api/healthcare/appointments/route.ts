/**
 * Healthcare Appointments API Routes
 * GET /api/healthcare/appointments - List appointments
 * POST /api/healthcare/appointments - Create appointment
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// HIPAA: Log appointment access
function logAppointmentAccess(userId: string, action: string, appointmentId: string | null, storeId: string) {
  logger.info(`APPOINTMENT_ACCESS: ${action}`, {
    userId,
    appointmentId,
    storeId,
    timestamp: new Date().toISOString(),
    action,
  });
}

// GET List Appointments
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (request, { storeId, user }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const status = searchParams.get("status"); // scheduled, completed, cancelled, no_show
      const providerId = searchParams.get("providerId");
      const patientId = searchParams.get("patientId");
      const dateFrom = searchParams.get("dateFrom");
      const dateTo = searchParams.get("dateTo");

      const appointments = await prisma.appointment.findMany({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(providerId ? { providerId } : {}),
          ...(patientId ? { patientId } : {}),
          ...(dateFrom || dateTo ? {
            scheduledAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            }
          } : {}),
        },
        include: {
          patient: {
            select: {
              id: true,
              mrn: true,
              firstName: true,
              lastName: true,
              dateOfBirth: true,
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
        orderBy: { scheduledAt: "asc" },
        take: limit,
        skip: offset,
      });

      logAppointmentAccess(user.id, "LIST_APPOINTMENTS", "MULTIPLE", storeId);

      const total = await prisma.appointment.count({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(providerId ? { providerId } : {}),
          ...(patientId ? { patientId } : {}),
          ...(dateFrom || dateTo ? {
            scheduledAt: {
              ...(dateFrom ? { gte: new Date(dateFrom) } : {}),
              ...(dateTo ? { lte: new Date(dateTo) } : {}),
            }
          } : {}),
        },
      });

      // Add calculated fields
      const appointmentsWithCalcs = appointments.map(appt => ({
        ...appt,
        patientName: `${appt.patient.firstName} ${appt.patient.lastName}`,
        providerName: appt.provider.name,
        isOverdue: appt.status === "scheduled" && appt.scheduledAt < new Date(),
        waitTimeMinutes: appt.checkInTime 
          ? Math.floor((appt.checkInTime.getTime() - appt.scheduledAt.getTime()) / 60000)
          : null
      }));

      return NextResponse.json({
        success: true,
        data: appointmentsWithCalcs,
        meta: { total, limit, offset },
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_APPOINTMENTS_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// POST Create Appointment
export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId, user }) => {
    try {
      const body = await request.json();
      const {
        patientId,
        providerId,
        type,
        scheduledAt,
        duration,
        reason,
        notes,
      } = body;

      // Validation
      if (!patientId || !providerId || !scheduledAt) {
        return NextResponse.json(
          { error: "Patient ID, provider ID, and scheduled time are required" },
          { status: 400 }
        );
      }

      // Verify patient exists
      const patient = await prisma.patient.findFirst({
        where: { id: patientId, merchantId: storeId },
      });

      if (!patient) {
        return NextResponse.json(
          { error: "Patient not found" },
          { status: 404 }
        );
      }

      // Verify provider exists and has permission
      const provider = await prisma.user.findFirst({
        where: { 
          id: providerId,
          storeMemberships: {
            some: { storeId, role: { in: ["PROVIDER", "ADMIN", "OWNER"] } }
          }
        },
      });

      if (!provider) {
        return NextResponse.json(
          { error: "Provider not found or unauthorized" },
          { status: 404 }
        );
      }

      // Check for scheduling conflicts
      const scheduledDateTime = new Date(scheduledAt);
      const endTime = new Date(scheduledDateTime.getTime() + (duration || 30) * 60000);

      const conflictingAppointments = await prisma.appointment.findMany({
        where: {
          providerId,
          status: { notIn: ["cancelled", "no_show"] },
          scheduledAt: { lt: endTime },
          OR: [
            { scheduledAt: { gte: scheduledDateTime } },
            { 
              scheduledAt: { lt: scheduledDateTime },
              duration: { gte: (endTime.getTime() - scheduledDateTime.getTime()) / 60000 }
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

      // Check patient consent
      if (!patient.consentGiven) {
        return NextResponse.json(
          { error: "Patient consent required before scheduling" },
          { status: 400 }
        );
      }

      // Create appointment
      const appointment = await prisma.appointment.create({
        data: {
          merchantId: storeId,
          patientId,
          providerId,
          type: type || "consultation",
          status: "scheduled",
          scheduledAt: scheduledDateTime,
          duration: duration || 30,
          reason,
          notes,
        },
      });

      logAppointmentAccess(user.id, "CREATE_APPOINTMENT", appointment.id, storeId);

      // Create audit log
      await prisma.healthcareAuditLog.create({
        data: {
          patientId,
          userId: user.id,
          action: "APPOINTMENT_SCHEDULED",
          details: {
            appointmentId: appointment.id,
            providerId,
            scheduledAt,
            duration,
            type,
          },
        },
      });

      // Update patient last visit
      await prisma.patient.update({
        where: { id: patientId },
        data: { lastVisit: scheduledDateTime },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...appointment,
          patientName: `${patient.firstName} ${patient.lastName}`,
          providerName: provider.name,
        },
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_APPOINTMENTS_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);