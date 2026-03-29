import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
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

// GET /api/ops/support/tickets/stats - Get ticket statistics
export async function GET(req: NextRequest) {
  try {
    if (!verifyInternalAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const fromDate = searchParams.get("from");
    const toDate = searchParams.get("to");

    const queryParams = new URLSearchParams();
    if (fromDate) queryParams.append("from", fromDate);
    if (toDate) queryParams.append("to", toDate);

    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/ops/support/tickets/stats?${queryParams.toString()}`,
      {
        headers: {
          "x-internal-secret": INTERNAL_SECRET || "",
        },
      },
    );

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch ticket statistics");
    }

    return NextResponse.json(result.data);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/ops/support/tickets/stats",
      operation: "GET_TICKET_STATS",
    });
    logger.error("[OPS_TICKETS_STATS] Failed to fetch ticket statistics", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
