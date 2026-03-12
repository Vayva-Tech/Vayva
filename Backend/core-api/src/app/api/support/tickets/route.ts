import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma, SupportTicketType, SupportTicketPriority, SupportTicketStatus } from "@vayva/db";
import { logger } from "@/lib/logger";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const GET = withVayvaAPI(
  PERMISSIONS.SUPPORT_VIEW,
  async (req, { storeId }) => {
    try {
      const { searchParams } = new URL(req.url);
      const status = searchParams.get("status");
      const priority = searchParams.get("priority");

      const tickets = await prisma.supportTicket.findMany({
        where: {
          storeId,
          ...(status && { status: status as SupportTicketStatus }),
          ...(priority && { priority: priority as SupportTicketPriority }),
        },
        orderBy: { createdAt: "desc" },
        include: {
          customer: {
            select: { firstName: true, lastName: true, email: true },
          },
          ticketMessages: {
            orderBy: { createdAt: "desc" },
            take: 1,
          },
        },
      });

      return NextResponse.json(
        { tickets },
        {
          headers: {
            "Cache-Control": "no-store",
          },
        },
      );
    } catch (error: unknown) {
      logger.error("[SUPPORT_TICKETS_GET]", error, { storeId });
      return NextResponse.json(
        { error: "Internal Server Error" },
        { status: 500 },
      );
    }
  },
);

export const POST = withVayvaAPI(
  PERMISSIONS.SUPPORT_MANAGE,
  async (req, { storeId, user }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const type = getString(body.type);
      const subject = getString(body.subject);
      const description = getString(body.description);
      const priority = getString(body.priority);
      const metadata = isRecord(body.metadata) ? body.metadata : {};

      if (!subject || !description) {
        return NextResponse.json(
          { error: "subject and description are required" },
          { status: 400 },
        );
      }

      const ticket = await prisma.supportTicket.create({
        data: {
          storeId,
          type: (type?.toUpperCase() as unknown as SupportTicketType) || "GENERAL",
          subject,
          description,
          priority:
            typeof priority === "string"
              ? (priority.toUpperCase() as SupportTicketPriority)
              : ("MEDIUM" as SupportTicketPriority),
          metadata: metadata as Prisma.InputJsonValue,
          status: "open" as SupportTicketStatus,
          // Add initial message if description exists
          ticketMessages: description
            ? {
                create: {
                  sender: "merchant",
                  authorType: "MERCHANT",
                  authorName:
                    `${user.firstName || ""} ${user.lastName || ""}`.trim() ||
                    "Merchant",
                  message: description,
                },
              }
            : undefined,
        },
      });
      return NextResponse.json(ticket);
    } catch (error) {
      logger.error("[SUPPORT_TICKETS_POST]", error, {
        storeId,
        userId: user.id,
      });
      return NextResponse.json(
        { error: "Failed to create ticket" },
        { status: 500 },
      );
    }
  },
);
