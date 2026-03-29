import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/payments/paystack-webhooks/[id]/reprocess
 * Reprocess a webhook event via backend Fastify API
 * Requires: OPERATOR role or higher
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPERATOR");

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { reason = "Manual reprocessing by operator" } = body;

    // Proxy to backend Fastify API
    const response = await apiClient.post(
      `/api/v1/financial/webhooks/${id}/reprocess`,
      { reason }
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (error instanceof Error && error.message?.includes("Insufficient permissions")) {
      return NextResponse.json(
        { error: "Insufficient permissions" },
        { status: 403 },
      );
    }
    logger.error("[PAYSTACK_WEBHOOK_REPROCESS_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
