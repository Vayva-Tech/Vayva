/**
 * Update Property Showing API Route
 * PUT /api/realestate/showings/[id] - Update showing details
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// PUT Update Showing
export const PUT = withVayvaAPI(
  PERMISSIONS.ORDERS_MANAGE,
  async (request, { storeId, params }) => {
    try {
      const { id: showingId } = await params;
      
      if (!showingId) {
        return NextResponse.json(
          { error: "Showing ID required" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const {
        scheduledAt,
        duration,
        type,
        clients,
        notes,
        instructions,
        status,
      } = body;

      // Verify showing exists and belongs to store
      const existingShowing = await prisma.propertyShowing.findFirst({
        where: {
          id: showingId,
          merchantId: storeId,
        },
      });

      if (!existingShowing) {
        return NextResponse.json(
          { error: "Showing not found" },
          { status: 404 }
        );
      }

      // If rescheduling, check for conflicts
      if (scheduledAt || duration) {
        const newScheduledAt = scheduledAt ? new Date(scheduledAt) : existingShowing.scheduledAt;
        const newDuration = duration || existingShowing.duration;
        const newEndTime = new Date(newScheduledAt.getTime() + newDuration * 60000);

        const conflictingShowings = await prisma.propertyShowing.findMany({
          where: {
            propertyId: existingShowing.propertyId,
            id: { not: showingId },
            status: { notIn: ["cancelled", "no_show"] },
          },
        });

        const hasConflict = conflictingShowings.some(showing => {
          const showingStart = showing.scheduledAt;
          const showingEnd = showing.endTime;
          return (
            (newScheduledAt >= showingStart && newScheduledAt < showingEnd) ||
            (newEndTime > showingStart && newEndTime <= showingEnd) ||
            (newScheduledAt <= showingStart && newEndTime >= showingEnd)
          );
        });

        if (hasConflict) {
          return NextResponse.json(
            { error: "Scheduling conflict detected" },
            { status: 409 }
          );
        }
      }

      const updatedShowing = await prisma.propertyShowing.update({
        where: { id: showingId },
        data: {
          ...(scheduledAt !== undefined && { scheduledAt: new Date(scheduledAt) }),
          ...(duration !== undefined && { duration }),
          ...(type !== undefined && { type }),
          ...(clients !== undefined && { 
            clients: JSON.stringify(clients),
            clientCount: Array.isArray(clients) ? clients.length : 1
          }),
          ...(notes !== undefined && { notes }),
          ...(instructions !== undefined && { instructions }),
          ...(status !== undefined && { status }),
          endTime: scheduledAt || duration ? 
            new Date(new Date(scheduledAt || existingShowing.scheduledAt).getTime() + (duration || existingShowing.duration) * 60000) :
            existingShowing.endTime,
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        data: updatedShowing,
      });
    } catch (error: unknown) {
      logger.error("[SHOWING_PUT]", error, { storeId, showingId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);