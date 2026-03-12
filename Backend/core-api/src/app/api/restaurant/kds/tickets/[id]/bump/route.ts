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

        // Bump ticket (send to expo)
        const bumpedTicket = await prisma.kitchenTicket.update({
          where: { id: ticketId },
          data: {
            status: "ready",
            bumpTime: new Date(),
            priority: body.priority || "normal",
            updatedAt: new Date(),
          },
          include: { station: true },
        });

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
    // TODO: Send WebSocket notification to expo station
    console.log(`[EXPO_NOTIFY] Store: ${storeId}, From Station: ${fromStationId}`);
  }
}

const controller = new TicketBumpController();

// POST /api/restaurant/kds/tickets/[id]/bump - Bump ticket to expo
export const POST = createIndustryAPI("restaurant", PERMISSIONS.ORDERS_EDIT, (req, context) =>
  controller.bumpTicket(req, context)
);
