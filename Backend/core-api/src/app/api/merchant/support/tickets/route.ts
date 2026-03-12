import { NextResponse } from "next/server";
import { prisma, Prisma, SupportTicketStatus } from "@vayva/db";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger } from "@/lib/logger";

export const GET = withVayvaAPI(
  PERMISSIONS.SUPPORT_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const limit = Math.min(
        Math.max(parseInt(searchParams.get("limit") || "50", 10), 1),
        100,
      );
      const status = searchParams.get("status")?.toLowerCase() || "all";

      const where: Prisma.SupportTicketWhereInput = { storeId };
      if (status !== "all") {
        if (status === "open") {
          where.status = {
            notIn: ["RESOLVED", "CLOSED"] as unknown as SupportTicketStatus[],
          };
        } else if (status === "closed" || status === "resolved") {
          where.status = { in: ["RESOLVED", "CLOSED"] as unknown as SupportTicketStatus[] };
        } else {
          where.status = status as SupportTicketStatus;
        }
      }

      const tickets = await prisma.supportTicket.findMany({
        where,
        orderBy: { lastMessageAt: "desc" },
        take: limit,
        select: {
          id: true,
          storeId: true,
          customerId: true,
          orderId: true,
          conversationId: true,
          type: true,
          category: true,
          status: true,
          priority: true,
          subject: true,
          summary: true,
          lastMessageAt: true,
          createdAt: true,
        },
      });

      const items = tickets.map((t) => ({
        ...t,
        status: (t.status || "").toString().toLowerCase(),
      }));

      return NextResponse.json(items, {
        headers: {
          "Cache-Control": "no-store",
        },
      });
    } catch (error: unknown) {
      logger.error("[SUPPORT_TICKETS_GET]", error, { storeId });
      return NextResponse.json({ error: "Internal Error" }, { status: 500 });
    }
  },
);
