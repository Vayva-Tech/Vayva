// @ts-nocheck
import { logger } from "@/lib/logger";
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

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

// GET /api/ops/support/tickets/[id] - Get single ticket
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyInternalAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Fetch ticket details via backend API
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/ops/support/tickets/${id}`, {
      headers: {
        'x-internal-secret': INTERNAL_SECRET || '',
      },
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error || 'Ticket not found' }, { status: result.data ? 200 : 404 });
    }

    return NextResponse.json({ ticket: result.data });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: `/api/ops/support/tickets/${params.id}`,
        operation: 'GET_TICKET_DETAILS',
      }
    );
    logger.error("[OPS_TICKET_GET] Failed to fetch ticket", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

// PATCH /api/ops/support/tickets/[id] - Update ticket
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!verifyInternalAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    const body = await req.json();
    const {
      status,
      priority,
      assignedTo,
      isEscalated,
      escalationReason,
      resolvedAt,
      tags,
      internalNotes,
    } = body;

    const updateData: Record<string, unknown> = {};

    if (status) (updateData as any).status = status;
    if (priority) updateData.priority = priority;
    if (assignedTo) updateData.assignedTo = assignedTo;
    if (isEscalated !== undefined) {
      updateData.isEscalated = isEscalated;
      if (isEscalated) updateData.escalatedAt = new Date();
    }
    if (escalationReason) updateData.escalationReason = escalationReason;
    if (resolvedAt) updateData.resolvedAt = new Date(resolvedAt);
    if (tags) updateData.tags = tags;
    if (internalNotes) updateData.internalNotes = internalNotes;

    const ticket = await prisma.supportTicket?.update({
      where: { id },
      data: updateData,
      include: {
        store: {
          select: {
            id: true,
            name: true,
            slug: true,
          },
        },
        assignedUser: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
      } as any,
    });

    // Log to audit
    await prisma.auditLog?.create({
      data: {
        app: "merchant",
        action: "OPS_TICKET_UPDATED",
        actorUserId: body.updatedBy || "system",
        actorEmail: body.updatedByEmail || "ops@vayva.ng",
        targetType: "support_ticket" as any,
        targetId: ticket.id,
        targetStoreId: ticket.storeId,
        severity: "INFO",
        requestId: `ops-ticket-update-${ticket.id}`,
        metadata: { changes: Object.keys(updateData) },
      },
    });

    return NextResponse.json({ ticket });
  } catch (error) {
    logger.error("[OPS_TICKET_PATCH] Failed to update ticket", { error: error instanceof Error ? error.message : String(error) });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
