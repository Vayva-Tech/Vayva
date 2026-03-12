import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const BumpSchema = z.object({
  ticketIds: z.array(z.string()).min(1, "At least one ticket ID is required"),
  notes: z.string().optional(),
});

export const POST = withVayvaAPI(
  PERMISSIONS.RESTAURANT_KDS_MANAGE,
  async (req, { storeId, db, user }) => {
    try {
      const body = await req.json();
      const validatedData = BumpSchema.parse(body);
      
      // Verify all tickets exist and belong to store
      const tickets = await db.kitchenTicket.findMany({
        where: {
          id: { in: validatedData.ticketIds },
          storeId,
        },
        select: {
          id: true,
          status: true,
          orderId: true,
          station: true,
        },
      });
      
      if (tickets.length !== validatedData.ticketIds.length) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_TICKETS",
              message: "Some tickets not found or don't belong to this store",
            },
          },
          { status: 400 }
        );
      }
      
      // Check that all tickets are in valid status for bumping
      const invalidStatusTickets = tickets.filter(t => 
        t.status !== "PENDING" && t.status !== "IN_PROGRESS"
      );
      
      if (invalidStatusTickets.length > 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "INVALID_TICKET_STATUS",
              message: "Cannot bump tickets that are already completed or cancelled",
            },
          },
          { status: 400 }
        );
      }
      
      // Bump (prioritize) the tickets
      const bumpedTickets = await db.kitchenTicket.updateMany({
        where: {
          id: { in: validatedData.ticketIds },
          storeId,
        },
        data: {
          priority: {
            increment: 1,
          },
          notes: validatedData.notes ? `${validatedData.notes} (Bumped)` : "Priority increased",
          updatedBy: user.id,
        },
      });
      
      // Get updated ticket details
      const updatedTickets = await db.kitchenTicket.findMany({
        where: {
          id: { in: validatedData.ticketIds },
          storeId,
        },
        include: {
          order: {
            select: {
              orderNumber: true,
              tableNumber: true,
              customerName: true,
            },
          },
        },
      });
      
      logger.info("[RESTAURANT_KDS_TICKETS_BUMPED]", {
        ticketIds: validatedData.ticketIds,
        count: validatedData.ticketIds.length,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: updatedTickets,
        message: `${validatedData.ticketIds.length} tickets bumped in priority`,
      });
    } catch (error: any) {
      if (error instanceof z.ZodError) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "VALIDATION_ERROR",
              message: "Invalid request data",
              details: error.errors,
            },
          },
          { status: 400 }
        );
      }
      
      logger.error("[RESTAURANT_KDS_BUMP_POST]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "KDS_BUMP_FAILED",
            message: "Failed to bump kitchen tickets",
          },
        },
        { status: 500 }
      );
    }
  }
);