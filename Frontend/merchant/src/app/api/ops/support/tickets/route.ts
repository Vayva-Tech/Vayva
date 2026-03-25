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

// GET /api/ops/support/tickets - List all support tickets with filters
export async function GET(req: NextRequest) {
  try {
    if (!verifyInternalAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);

    const page = Number.parseInt(searchParams.get("page") || "1", 10);
    const limit = Number.parseInt(searchParams.get("limit") || "50", 10);
    const status = searchParams.getAll("status");
    const priority = searchParams.getAll("priority");
    const channel = searchParams.getAll("channel");
    const assigneeId = searchParams.get("assigneeId");

    const queryParams = new URLSearchParams({
      page: page.toString(),
      limit: limit.toString(),
    });

    status.forEach((s) => queryParams.append("status", s));
    priority.forEach((p) => queryParams.append("priority", p));
    channel.forEach((c) => queryParams.append("channel", c));
    if (assigneeId) queryParams.append("assigneeId", assigneeId);

    const result = await apiJson<{
      success: boolean;
      data?: unknown[];
      pagination?: { total?: number; hasMore?: boolean };
      error?: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/ops/support/tickets?${queryParams.toString()}`,
      {
        headers: {
          "x-internal-secret": INTERNAL_SECRET || "",
        },
      },
    );

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch support tickets");
    }

    return NextResponse.json({
      tickets: result.data || [],
      pagination: result.pagination,
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/ops/support/tickets",
      operation: "GET_SUPPORT_TICKETS",
    });
    logger.error("[OPS_TICKETS] Failed to fetch support tickets", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}

// POST /api/ops/support/tickets - Create ticket (proxied to core-api)
export async function POST(req: NextRequest) {
  try {
    if (!verifyInternalAuth(req)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body: unknown = await req.json();

    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      ticket?: unknown;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/ops/support/tickets`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-internal-secret": INTERNAL_SECRET || "",
      },
      body: JSON.stringify(body ?? {}),
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to create ticket" },
        { status: 400 },
      );
    }

    const ticket = result.ticket ?? result.data;
    return NextResponse.json({ ticket }, { status: 201 });
  } catch (error) {
    logger.error("[OPS_TICKETS_CREATE] Failed to create ticket", {
      error: error instanceof Error ? error.message : String(error),
    });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
