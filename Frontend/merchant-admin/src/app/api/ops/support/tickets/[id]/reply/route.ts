import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";

const INTERNAL_SECRET = process.env?.INTERNAL_API_SECRET;

function verifyInternalAuth(req: NextRequest): boolean {
  if (!INTERNAL_SECRET) {
    logger.error("[INTERNAL_AUTH] INTERNAL_API_SECRET not configured");
    return false;
  }
  const secret = req.headers?.get("x-internal-secret");
  return secret === INTERNAL_SECRET;
}

export const dynamic = "force-dynamic";

// POST /api/ops/support/tickets/[id]/reply - Add reply to ticket
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyInternalAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const { content, userId, userEmail, userName, attachments, isInternal } = body;

    if (!content) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    // Check ticket exists
    const ticket = await prisma.supportTicket?.findUnique({
      where: { id },
      select: { id: true, storeId: true, status: true },
    });

    if (!ticket) {
      return NextResponse.json(
        { error: "Ticket not found" },
        { status: 404 }
      );
    }

    // Create message
    const message = await prisma.supportMessage?.create({
      data: {
        ticketId: id,
        content,
        isFromCustomer: false,
        userId: userId || null,
        senderName: userName || "Ops Team",
        senderEmail: userEmail || "ops@vayva.ng",
        isInternalNote: isInternal || false,
      } as any,
      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        attachments: true,
      } as any,
    });

    // If attachments provided, create them
    if (attachments && attachments.length > 0) {
      await prisma.supportAttachment?.createMany({
        data: attachments.map((att: { url: string; name: string; type: string; size?: number }) => ({
          messageId: message.id,
          url: att.url,
          name: att.name,
          type: att.type,
          size: att.size || 0,
        })),
      });
    }

    // Update ticket lastActivityAt
    await prisma.supportTicket?.update({
      where: { id },
      data: {
        lastActivityAt: new Date(),
        // If ticket was pending customer response, change to awaiting response
        ...((ticket as any).status === "WAITING_CUSTOMER" && { status: "CREATED" }),
      } as any,
    });

    // Log to audit
    await prisma.auditLog?.create({
      data: {
        app: "merchant",
        action: isInternal ? "OPS_TICKET_INTERNAL_NOTE" : "OPS_TICKET_REPLY",
        actorUserId: userId || "system",
        actorEmail: userEmail || "ops@vayva.ng",
        targetType: "support_ticket" as any,
        targetId: id,
        targetStoreId: ticket.storeId,
        severity: "INFO",
        requestId: `ops-ticket-reply-${message.id}`,
        metadata: { messageId: message.id, isInternal },
      },
    });

    return NextResponse.json({ message }, { status: 201 });
  } catch (error) {
    logger.error("[OPS_TICKET_REPLY] Failed to add ticket reply", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
