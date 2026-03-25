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

// POST /api/ops/support/tickets/[id]/reply - Add reply to ticket
export async function POST(
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

    const body: unknown = await req.json();

    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/ops/support/tickets/${ticketId}/reply`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-internal-secret": INTERNAL_SECRET || "",
        },
        body: JSON.stringify(body ?? {}),
      },
    );

    if (!result.success) {
      throw new Error(result.error || "Failed to submit reply");
    }

    return NextResponse.json({ message: result.data });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/ops/support/tickets/[id]/reply",
      operation: "SUBMIT_TICKET_REPLY",
    });
    logger.error("[OPS_TICKET_REPLY] Failed to submit reply", {
      error: error instanceof Error ? error.message : String(error),
      ticketId,
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
