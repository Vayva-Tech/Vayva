import { NextRequest } from "next/server";
import { BaseIndustryController, createIndustryAPI } from "@/lib/industry/base-controller";
import { PERMISSIONS } from "@/lib/team/permissions";
import { APIContext } from "@/lib/api-handler";
import { prisma } from "@vayva/db";

class TicketDetailController extends BaseIndustryController {
  constructor() {
    super("restaurant", "kds");
  }

  async getTicket(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const { searchParams } = new URL(req.url);
        const ticketId = searchParams.get("id");

        if (!ticketId) {
          throw new Error("Ticket ID is required");
        }

        const ticket = await prisma.kitchenTicket.findUnique({
          where: { id: ticketId, storeId: context.storeId },
          include: {
            station: true,
            items: {
              include: {
                modifiers: true,
              },
            },
          },
        });

        if (!ticket) {
          throw new Error("Ticket not found");
        }

        // Calculate timer
        const elapsedSeconds = Math.floor(
          (Date.now() - new Date(ticket.createdAt).getTime()) / 1000
        );

        return {
          success: true,
          data: {
            ...ticket,
            elapsedSeconds,
            urgency: this.calculateUrgency(elapsedSeconds, ticket.targetTime),
          },
        };
      },
      "GET_TICKET_DETAIL",
      "Ticket retrieved successfully"
    );
  }

  async updateTicket(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const { searchParams } = new URL(req.url);
        const ticketId = searchParams.get("id");
        const body = await this.parseBody(req);

        if (!ticketId) {
          throw new Error("Ticket ID is required");
        }

        // Validate ticket exists
        const existingTicket = await prisma.kitchenTicket.findUnique({
          where: { id: ticketId, storeId: context.storeId },
        });

        if (!existingTicket) {
          throw new Error("Ticket not found");
        }

        const updated = await prisma.kitchenTicket.updateMany({
          where: { id: ticketId, storeId: context.storeId },
          data: {
            ...body,
            updatedAt: new Date(),
          },
        });
        if (updated.count === 0) {
          throw new Error("Ticket not found");
        }

        const updatedTicket = await prisma.kitchenTicket.findUnique({
          where: { id: ticketId, storeId: context.storeId },
          include: {
            station: true,
            items: true,
          },
        });
        if (!updatedTicket) {
          throw new Error("Ticket not found");
        }

        // Send real-time update notification
        await this.notifyKDSUpdate(context.storeId, updatedTicket.stationId);

        return {
          success: true,
          data: updatedTicket,
        };
      },
      "UPDATE_TICKET",
      "Ticket updated successfully"
    );
  }

  async deleteTicket(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const { searchParams } = new URL(req.url);
        const ticketId = searchParams.get("id");

        if (!ticketId) {
          throw new Error("Ticket ID is required");
        }

        // Verify ticket exists and belongs to store
        const ticket = await prisma.kitchenTicket.findUnique({
          where: { id: ticketId, storeId: context.storeId },
        });

        if (!ticket) {
          throw new Error("Ticket not found");
        }

        const cancelled = await prisma.kitchenTicket.updateMany({
          where: { id: ticketId, storeId: context.storeId },
          data: {
            status: "cancelled",
            updatedAt: new Date(),
          },
        });
        if (cancelled.count === 0) {
          throw new Error("Ticket not found");
        }

        return {
          success: true,
          message: "Ticket deleted successfully",
        };
      },
      "DELETE_TICKET",
      "Ticket deleted successfully"
    );
  }

  private calculateUrgency(elapsedSeconds: number, targetTime: Date): "normal" | "warning" | "critical" {
    const remaining = new Date(targetTime).getTime() - Date.now();
    const totalSeconds = remaining / 1000;

    if (totalSeconds < 0) {
      return "critical";
    } else if (totalSeconds < 300) { // Less than 5 minutes
      return "warning";
    }
    return "normal";
  }

  private async notifyKDSUpdate(storeId: string, stationId?: string) {
    // Emit WebSocket event for real-time KDS updates
    try {
      const { getLiveDashboard } = await import('@vayva/realtime');
      const liveDashboard = getLiveDashboard();
      
      await liveDashboard.emitEvent(storeId, {
        type: 'kds:update',
        data: {
          eventType: 'ticket_updated',
          storeId,
          stationId: stationId || 'all',
          timestamp: Date.now(),
        },
      });
      
      console.warn(`[KDS_WS] Notified subscribers - Store: ${storeId}, Station: ${stationId || 'all'}`);
    } catch (error) {
      console.error('[KDS_WS] Failed to emit WebSocket event:', error);
    }
  }
}

const controller = new TicketDetailController();

// GET /api/restaurant/kds/tickets/[id] - Get ticket details
export const GET = createIndustryAPI("restaurant", PERMISSIONS.ORDERS_VIEW, (req, context) =>
  controller.getTicket(req, context)
);

// PUT /api/restaurant/kds/tickets/[id] - Update ticket
export const PUT = createIndustryAPI("restaurant", PERMISSIONS.ORDERS_EDIT, (req, context) =>
  controller.updateTicket(req, context)
);

// DELETE /api/restaurant/kds/tickets/[id] - Delete/cancel ticket
export const DELETE = createIndustryAPI("restaurant", PERMISSIONS.ORDERS_EDIT, (req, context) =>
  controller.deleteTicket(req, context)
);
