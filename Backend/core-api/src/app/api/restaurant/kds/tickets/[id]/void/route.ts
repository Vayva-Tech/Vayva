import { NextRequest } from "next/server";
import { BaseIndustryController, createIndustryAPI } from "@/lib/industry/base-controller";
import { PERMISSIONS } from "@/lib/team/permissions";
import { APIContext } from "@/lib/api-handler";
import { prisma } from "@vayva/db";

class TicketVoidController extends BaseIndustryController {
  constructor() {
    super("restaurant", "kds");
  }

  async voidTicket(req: NextRequest, context: APIContext) {
    return this.handleOperation(
      context,
      async () => {
        const { searchParams } = new URL(req.url);
        const ticketId = searchParams.get("id");
        const body = await this.parseBody(req);

        if (!ticketId) {
          throw new Error("Ticket ID is required");
        }

        const { reason, notes } = body;

        if (!reason) {
          throw new Error("Void reason is required");
        }

        const ticket = await prisma.kitchenTicket.findUnique({
          where: { id: ticketId, storeId: context.storeId },
        });

        if (!ticket) {
          throw new Error("Ticket not found");
        }

        // Void the ticket
        const voidedTicket = await prisma.kitchenTicket.update({
          where: { id: ticketId },
          data: {
            status: "cancelled",
            priority: "voided",
            updatedAt: new Date(),
          },
          include: {
            station: true,
            items: true,
          },
        });

        // Log void reason for analytics
        await this.logVoidReason(context.storeId, ticketId, reason, notes);

        return {
          success: true,
          data: voidedTicket,
          message: "Ticket voided successfully",
        };
      },
      "VOID_TICKET",
      "Ticket voided successfully"
    );
  }

  private async logVoidReason(
    storeId: string, 
    ticketId: string, 
    reason: string, 
    notes?: string
  ) {
    // TODO: Create audit log entry for void tracking
    console.log(`[VOID_LOG] Store: ${storeId}, Ticket: ${ticketId}, Reason: ${reason}`);
  }
}

const controller = new TicketVoidController();

// POST /api/restaurant/kds/tickets/[id]/void - Void ticket with reason
export const POST = createIndustryAPI("restaurant", PERMISSIONS.ORDERS_EDIT, (req, context) =>
  controller.voidTicket(req, context)
);
