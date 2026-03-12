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

        // Update ticket
        const updatedTicket = await prisma.kitchenTicket.update({
          where: { id: ticketId },
          data: {
            ...body,
            updatedAt: new Date(),
          },
          include: {
            station: true,
            items: true,
          },
        });

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

        // Soft delete by updating status
        await prisma.kitchenTicket.update({
          where: { id: ticketId },
          data: {
            status: "cancelled",
            updatedAt: new Date(),
          },
        });

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
    // TODO: Implement WebSocket notification for real-time updates
    // This will be integrated with @vayva/realtime package
    console.log(`[KDS_UPDATE] Store: ${storeId}, Station: ${stationId || "all"}`);
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
