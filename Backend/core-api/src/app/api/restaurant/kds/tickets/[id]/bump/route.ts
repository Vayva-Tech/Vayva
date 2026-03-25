import { NextRequest } from "next/server";
import { BaseIndustryController, createIndustryAPI } from "@/lib/industry/base-controller";
import { PERMISSIONS } from "@/lib/team/permissions";
import { APIContext } from "@/lib/api-handler";
import { prisma } from "@vayva/db";

class TicketBumpController extends BaseIndustryController {
  constructor() {
    super("restaurant", "kds");
  }

  async bumpTicket(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const { searchParams } = new URL(req.url);
        const ticketId = searchParams.get("id");
        const body = await this.parseBody(req);

        if (!ticketId) {
          throw new Error("Ticket ID is required");
        }

        const ticket = await prisma.kitchenTicket.findUnique({
          where: { id: ticketId, storeId: context.storeId },
          include: { station: true },
        });

        if (!ticket) {
          throw new Error("Ticket not found");
        }

        // Bump ticket (send to expo) — compound scope on write (defense in depth)
        const updated = await prisma.kitchenTicket.updateMany({
          where: { id: ticketId, storeId: context.storeId },
          data: {
            status: "ready",
            bumpTime: new Date(),
            priority: body.priority || "normal",
            updatedAt: new Date(),
          },
        });
        if (updated.count === 0) {
          throw new Error("Ticket not found");
        }

        const bumpedTicket = await prisma.kitchenTicket.findUnique({
          where: { id: ticketId, storeId: context.storeId },
          include: { station: true },
        });
        if (!bumpedTicket) {
          throw new Error("Ticket not found");
        }

        // Send notification to expo station
        await this.notifyExpoStation(context.storeId, ticket.stationId);

        return {
          success: true,
          data: bumpedTicket,
          message: "Ticket bumped to expo",
        };
      },
      "BUMP_TICKET",
      "Ticket bumped successfully"
    );
  }

  private async notifyExpoStation(storeId: string, fromStationId: string) {
    // Send WebSocket notification to expo station
    try {
      const { getLiveDashboard } = await import('@vayva/realtime');
      const liveDashboard = getLiveDashboard();
      
      await liveDashboard.emitEvent(storeId, {
        type: 'kds:update',
        data: {
          eventType: 'ticket_bumped_to_expo',
          storeId,
          fromStationId,
          targetStation: 'expo',
          timestamp: Date.now(),
        },
      });
      
      console.warn(`[EXPO_WS] Notified expo station - Store: ${storeId}, From: ${fromStationId}`);
    } catch (error) {
      console.error('[EXPO_WS] Failed to notify expo station:', error);
    }
  }
}

const controller = new TicketBumpController();

// POST /api/restaurant/kds/tickets/[id]/bump - Bump ticket to expo
export const POST = createIndustryAPI("restaurant", PERMISSIONS.ORDERS_EDIT, (req, context) =>
  controller.bumpTicket(req, context)
);
