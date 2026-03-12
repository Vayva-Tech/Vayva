/**
 * Patient Queue API Routes
 * GET /api/healthcare/queue - Get current queue
 * POST /api/healthcare/queue - Add patient to queue
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// HIPAA: Log queue access
function logQueueAccess(userId: string, action: string, patientId: string | null, storeId: string) {
  logger.info(`QUEUE_ACCESS: ${action}`, {
    userId,
    patientId,
    storeId,
    timestamp: new Date().toISOString(),
    action,
  });
}

// GET Current Queue
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (request, { storeId, user }) => {
    try {
      const { searchParams } = new URL(request.url);
      const status = searchParams.get("status"); // waiting, in_room, with_provider, completed
      const priority = searchParams.get("priority"); // low, normal, high, urgent

      const queueEntries = await prisma.patientQueue.findMany({
        where: {
          merchantId: storeId,
          ...(status ? { status } : {}),
          ...(priority ? { priority } : {}),
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
              allergies: true,
            }
          },
          appointment: {
            select: {
              id: true,
              type: true,
              scheduledAt: true,
              reason: true,
              provider: {
                select: {
                  id: true,
                  name: true,
                }
              }
            }
          }
        },
        orderBy: [
          { priority: "desc" }, // urgent > high > normal > low
          { checkInTime: "asc" }, // FIFO within same priority
        ],
      });

      logQueueAccess(user.id, "VIEW_QUEUE", "MULTIPLE", storeId);

      // Calculate wait times
      const now = new Date();
      const queueWithTimes = queueEntries.map(entry => {
        const waitTimeMinutes = Math.floor((now.getTime() - entry.checkInTime.getTime()) / 60000);
        
        return {
          ...entry,
          patientName: `${entry.patient.firstName} ${entry.patient.lastName}`,
          providerName: entry.appointment?.provider?.name || "Walk-in",
          appointmentType: entry.appointment?.type || "walk_in",
          waitTimeMinutes,
          isLongWait: waitTimeMinutes > 60, // Flag for long waits
          hasAllergies: entry.patient.allergies.length > 0,
          urgencyLevel: entry.priority === "urgent" ? "critical" : 
                        entry.priority === "high" ? "high" : "normal",
        };
      });

      // Summary statistics
      const stats = {
        totalPatients: queueEntries.length,
        byStatus: {
          waiting: queueEntries.filter(q => q.status === "waiting").length,
          in_room: queueEntries.filter(q => q.status === "in_room").length,
          with_provider: queueEntries.filter(q => q.status === "with_provider").length,
          completed: queueEntries.filter(q => q.status === "completed").length,
        },
        byPriority: {
          urgent: queueEntries.filter(q => q.priority === "urgent").length,
          high: queueEntries.filter(q => q.priority === "high").length,
          normal: queueEntries.filter(q => q.priority === "normal").length,
          low: queueEntries.filter(q => q.priority === "low").length,
        },
        averageWaitTime: queueEntries.length > 0 
          ? Math.round(queueEntries.reduce((sum, q) => 
              sum + Math.floor((now.getTime() - q.checkInTime.getTime()) / 60000), 0) / queueEntries.length)
          : 0,
      };

      return NextResponse.json({
        success: true,
        data: queueWithTimes,
        meta: {
          stats,
          currentTime: now.toISOString(),
        },
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_QUEUE_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// POST Add Patient to Queue
export const POST = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId, user }) => {
    try {
      const body = await request.json();
      const {
        patientId,
        appointmentId,
        priority,
        reason,
        notes,
      } = body;

      // Validation
      if (!patientId) {
        return NextResponse.json(
          { error: "Patient ID is required" },
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

      // Check if patient is already in queue
      const existingQueueEntry = await prisma.patientQueue.findFirst({
        where: {
          patientId,
          merchantId: storeId,
          status: { not: "completed" },
        },
      });

      if (existingQueueEntry) {
        return NextResponse.json(
          { error: "Patient already in queue" },
          { status: 409 }
        );
      }

      // Verify appointment if provided
      let appointment = null;
      if (appointmentId) {
        appointment = await prisma.appointment.findFirst({
          where: {
            id: appointmentId,
            patientId,
            merchantId: storeId,
          },
        });

        if (!appointment) {
          return NextResponse.json(
            { error: "Appointment not found or doesn't belong to patient" },
            { status: 404 }
          );
        }
      }

      // Determine priority
      const determinedPriority = priority || 
        (appointment?.type === "emergency" ? "urgent" : "normal");

      // Add to queue
      const queueEntry = await prisma.patientQueue.create({
        data: {
          merchantId: storeId,
          patientId,
          appointmentId: appointment?.id || null,
          status: "waiting",
          priority: determinedPriority,
          checkInTime: new Date(),
          estimatedWaitTime: determinedPriority === "urgent" ? 5 :
                           determinedPriority === "high" ? 10 :
                           determinedPriority === "normal" ? 20 : 30,
        },
      });

      logQueueAccess(user.id, "ADD_TO_QUEUE", patientId, storeId);

      // Create audit log
      await prisma.healthcareAuditLog.create({
        data: {
          patientId,
          userId: user.id,
          action: "PATIENT_QUEUED",
          details: {
            queueEntryId: queueEntry.id,
            priority: determinedPriority,
            reason,
            appointmentId: appointment?.id || null,
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          queueEntry: {
            ...queueEntry,
            patientName: `${patient.firstName} ${patient.lastName}`,
            mrn: patient.mrn,
            priority: determinedPriority,
            hasAllergies: patient.allergies.length > 0,
          },
          message: "Patient successfully added to queue"
        },
      });
    } catch (error: unknown) {
      logger.error("[HEALTHCARE_QUEUE_POST]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);