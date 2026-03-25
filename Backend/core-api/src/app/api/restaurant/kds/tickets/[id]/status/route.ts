import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { z } from "zod";
import { logger } from "@/lib/logger";

const UpdateStatusSchema = z.object({
  status: z.enum(["IN_PROGRESS", "READY", "COMPLETED", "CANCELLED"]),
  notes: z.string().optional(),
  actualTime: z.number().optional(), // Actual preparation time in minutes
});

export const PUT = withVayvaAPI(
  PERMISSIONS.RESTAURANT_KDS_MANAGE,
  async (req, { storeId, db, params, user }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const validatedData = UpdateStatusSchema.parse(body);
      
      // Check if ticket exists and belongs to store
      const ticket = await db.kitchenTicket.findUnique({
        where: { id, storeId },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              status: true,
            },
          },
        },
      });
      
      if (!ticket) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "TICKET_NOT_FOUND",
              message: "Kitchen ticket not found",
            },
          },
          { status: 404 }
        );
      }
      
      const statusWrite = await db.kitchenTicket.updateMany({
        where: { id, storeId },
        data: {
          status: validatedData.status,
          notes: validatedData.notes,
          actualTime: validatedData.actualTime,
          updatedAt: new Date(),
          updatedBy: user.id,
        },
      });
      if (statusWrite.count === 0) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "TICKET_NOT_FOUND",
              message: "Kitchen ticket not found",
            },
          },
          { status: 404 },
        );
      }

      const updatedTicket = await db.kitchenTicket.findUnique({
        where: { id, storeId },
        include: {
          order: {
            select: {
              id: true,
              orderNumber: true,
              tableNumber: true,
              customerName: true,
              status: true,
            },
          },
        },
      });
      if (!updatedTicket) {
        return NextResponse.json(
          {
            success: false,
            error: {
              code: "TICKET_NOT_FOUND",
              message: "Kitchen ticket not found",
            },
          },
          { status: 404 },
        );
      }
      
      // If ticket is completed, check if all tickets for this order are completed
      if (validatedData.status === "COMPLETED") {
        const orderTickets = await db.kitchenTicket.findMany({
          where: {
            orderId: ticket.orderId,
            storeId,
          },
          select: {
            status: true,
          },
        });
        
        const allCompleted = orderTickets.every(t => t.status === "COMPLETED" || t.status === "CANCELLED");
        
        if (allCompleted) {
          await db.order.updateMany({
            where: { id: ticket.orderId, storeId },
            data: {
              status: "PREPARED",
              updatedAt: new Date(),
            },
          });
          
          logger.info("[ORDER_STATUS_UPDATED_TO_PREPARED]", {
            orderId: ticket.orderId,
            storeId,
          });
        }
      }
      
      logger.info("[RESTAURANT_KDS_TICKET_STATUS_UPDATED]", {
        ticketId: id,
        orderId: ticket.orderId,
        oldStatus: ticket.status,
        newStatus: validatedData.status,
        storeId,
        userId: user.id,
      });
      
      return NextResponse.json({
        success: true,
        data: updatedTicket,
        message: `Ticket status updated to ${validatedData.status}`,
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
      
      logger.error("[RESTAURANT_KDS_TICKET_STATUS_PUT]", error, { storeId });
      return NextResponse.json(
        {
          success: false,
          error: {
            code: "TICKET_STATUS_UPDATE_FAILED",
            message: "Failed to update ticket status",
          },
        },
        { status: 500 }
      );
    }
  }
);