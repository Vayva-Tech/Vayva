/**
 * Individual Queue Entry API Routes
 * GET /api/healthcare/queue/[id] - Get queue entry details
 * PUT /api/healthcare/queue/[id] - Update queue status
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// HIPAA: Log queue access
function logQueueAccess(userId: string, action: string, queueId: string, storeId: string) {
  logger.info(`QUEUE_ACCESS: ${action}`, {
    userId,
    queueId,
    storeId,
    timestamp: new Date().toISOString(),
    action,
  });
}

// GET Queue Entry by ID
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (request, { storeId, params, user }) => {
    try {
      const { id: queueId } = await params;
      
      if (!queueId) {
        return NextResponse.json(
          { error: "Queue ID required" },
          { status: 400 }
        );
      }

      const queueEntry = await prisma.patientQueue.findFirst({
        where: {
          id: queueId,
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
              lastVisit: true,
            }
          },
          appointment: {
            select: {
              id: true,
              type: true,
              scheduledAt: true,
              reason: true,
              notes: true,
              provider: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                }
              }
            }
          }
        },
      });

      if (!queueEntry) {
        return NextResponse.json(
          { error: "Queue entry not found" },
          { status: 404 }
        );
      }

      logQueueAccess(user.id, "VIEW_QUEUE_ENTRY", queueId, storeId);

      // Create audit log
      await prisma.healthcareAuditLog.create({
        data: {
          patientId: queueEntry.patientId,
          userId: user.id,
          action: "QUEUE_ENTRY_VIEWED",
          details: { queueId },
        },
      });

      // Calculate wait times
      const now = new Date();
      const waitTimeMinutes = Math.floor((now.getTime() - queueEntry.checkInTime.getTime()) / 60000);
      const actualWaitTime = queueEntry.actualWaitTime || 
        (queueEntry.completedTime 
          ? Math.floor((queueEntry.completedTime.getTime() - queueEntry.checkInTime.getTime()) / 60000)
          : null);

      return NextResponse.json({
        success: true,
        data: {
          ...queueEntry,
          patientName: `${queueEntry.patient.firstName} ${queueEntry.patient.lastName}`,
          providerName: queueEntry.appointment?.provider?.name || "Walk-in",
          appointmentType: queueEntry.appointment?.type || "walk_in",
          waitTimeMinutes,
          actualWaitTime,
          isLongWait: waitTimeMinutes > 60,
          hasAllergies: queueEntry.patient.allergies.length > 0,
          patientAlerts: [
            ...(queueEntry.patient.allergies.length > 0 ? ["ALLERGIES_PRESENT"] : []),
            ...(queueEntry.priority === "urgent" ? ["URGENT_PRIORITY"] : []),
          ],
          queuePosition: await calculateQueuePosition(queueEntry, storeId),
        },
      });
    } catch (error: unknown) {
      logger.error("[QUEUE_ENTRY_GET]", error, { storeId, queueId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// Helper function to calculate queue position
async function calculateQueuePosition(queueEntry: any, storeId: string) {
  if (queueEntry.status === "completed") return null;
  
  const aheadInQueue = await prisma.patientQueue.count({
    where: {
      merchantId: storeId,
      status: { not: "completed" },
      priority: { gte: queueEntry.priority },
      checkInTime: { lt: queueEntry.checkInTime },
    },
  });
  
  return aheadInQueue + 1;
}

// PUT Update Queue Status
export const PUT = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId, params, user }) => {
    try {
      const { id: queueId } = await params;
      
      if (!queueId) {
        return NextResponse.json(
          { error: "Queue ID required" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const {
        status,
        priority,
        roomNumber,
        notes,
      } = body;

      // Verify queue entry exists
      const existingEntry = await prisma.patientQueue.findFirst({
        where: {
          id: queueId,
          merchantId: storeId,
        },
      });

      if (!existingEntry) {
        return NextResponse.json(
          { error: "Queue entry not found" },
          { status: 404 }
        );
      }

      // Validate status transitions
      const validTransitions: Record<string, string[]> = {
        "waiting": ["in_room", "with_provider", "completed"],
        "in_room": ["with_provider", "completed"],
        "with_provider": ["completed"],
        "completed": []
      };

      if (status && !validTransitions[existingEntry.status]?.includes(status)) {
        return NextResponse.json(
          { error: `Invalid status transition from ${existingEntry.status} to ${status}` },
          { status: 400 }
        );
      }

      const now = new Date();
      const updateData: any = {
        ...(status !== undefined && { status }),
        ...(priority !== undefined && { priority }),
        ...(roomNumber !== undefined && { roomNumber }),
        updatedAt: now,
      };

      // Set timestamps for status changes
      if (status === "in_room") {
        updateData.calledTime = now;
      } else if (status === "with_provider") {
        updateData.seenTime = now;
        updateData.actualWaitTime = Math.floor((now.getTime() - existingEntry.checkInTime.getTime()) / 60000);
      } else if (status === "completed") {
        updateData.completedTime = now;
        if (!existingEntry.actualWaitTime) {
          updateData.actualWaitTime = Math.floor((now.getTime() - existingEntry.checkInTime.getTime()) / 60000);
        }
      }

      const updatedEntry = await prisma.patientQueue.update({
        where: { id: queueId },
        data: updateData,
        include: {
          patient: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
            }
          }
        }
      });

      logQueueAccess(user.id, "UPDATE_QUEUE_ENTRY", queueId, storeId);

      // Create audit log
      await prisma.healthcareAuditLog.create({
        data: {
          patientId: updatedEntry.patientId,
          userId: user.id,
          action: "QUEUE_STATUS_UPDATED",
          details: {
            queueId,
            previousStatus: existingEntry.status,
            newStatus: status,
            previousPriority: existingEntry.priority,
            newPriority: priority,
            roomNumber,
          },
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          ...updatedEntry,
          patientName: `${updatedEntry.patient.firstName} ${updatedEntry.patient.lastName}`,
          message: `Queue status updated to ${status}`
        },
      });
    } catch (error: unknown) {
      logger.error("[QUEUE_ENTRY_PUT]", error, { storeId, queueId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);