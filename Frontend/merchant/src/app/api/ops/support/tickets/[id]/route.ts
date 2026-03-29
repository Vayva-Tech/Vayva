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
  const secret = req.headers.get("x-internal-secret");
  return secret === INTERNAL_SECRET;
}

export const dynamic = "force-dynamic";

// GET /api/ops/support/tickets/[id] - Get single ticket
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  let ticketId = "";
  try {
    if (!verifyInternalAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    ticketId = id || "";
    if (!ticketId) {
      return NextResponse.json({ error: "Missing ticket id" }, { status: 400 });
    }

    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/ops/support/tickets/${ticketId}`, {
      headers: {
        "x-internal-secret": INTERNAL_SECRET || "",
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Ticket not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({ ticket: result.data });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/ops/support/tickets/[id]",
      operation: "GET_TICKET_DETAILS",
    });
    logger.error("[OPS_TICKET_GET] Failed to fetch ticket", {
      error: error instanceof Error ? error.message : String(error),
      ticketId,
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// PATCH /api/ops/support/tickets/[id] - Update ticket (proxied to core-api)
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id?: string }> },
) {
  try {
    if (!verifyInternalAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing ticket id" }, { status: 400 });
    }

    const body: unknown = await req.json();

    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      ticket?: unknown;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/ops/support/tickets/${id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": INTERNAL_SECRET || "",
      },
      body: JSON.stringify(body ?? {}),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to update ticket" },
        { status: 400 },
      );
    }

    const ticket = result.ticket ?? result.data;
    return NextResponse.json({ ticket });
  } catch (error) {
    logger.error("[OPS_TICKET_PATCH] Failed to update ticket", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
