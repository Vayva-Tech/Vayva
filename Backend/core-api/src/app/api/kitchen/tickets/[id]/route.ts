import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, type APIContext } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const GET = withVayvaAPI(
  PERMISSIONS.KITCHEN_VIEW,
  async (_req: NextRequest, { storeId, params, correlationId }: APIContext) => {
    const requestId = correlationId;
    try {
      const { id } = await params;

      const ticket = await prisma.kitchenTicket.findFirst({
        where: { id, storeId },
        include: {
          order: {
            select: {
              id: true,
              tableNumber: true,
              priority: true,
              orderType: true,
              notes: true,
              customer: {
                select: {
                  id: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
          items: {
            include: {
              menuItem: {
                select: {
                  id: true,
                  name: true,
                  category: true,
                },
              },
              station: {
                select: {
                  id: true,
                  name: true,
                  type: true,
                },
              },
            },
          },
        },
      });

      if (!ticket) {
        return NextResponse.json(
          { error: "Ticket not found" },
          { status: 404, headers: standardHeaders(requestId) },
        );
      }

      return NextResponse.json(
        { data: ticket },
        { headers: standardHeaders(requestId) },
      );
    } catch (error: unknown) {
      const { id: ticketId } = await params;
      logger.error("[KITCHEN_TICKET_GET]", { error, ticketId });
      return NextResponse.json(
        { error: "Failed to fetch ticket" },
        { status: 500, headers: standardHeaders(requestId) },
      );
    }
  },
);
