import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

/**
 * POST /api/ops/payments/wallet-funding/[id]/reconcile
 * Manually reconcile wallet via backend Fastify API
 * Requires: ADMIN role (sensitive financial operation)
 * Body: { reason: string, amountKobo: number }
 */
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "ADMIN");

    const { id: storeId } = await params;
    const body = await req.json().catch(() => ({}));
    const { reason, amountKobo } = body;

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: "Reason is required (min 10 characters)" },
        { status: 400 },
      );
    }

    if (!amountKobo || typeof amountKobo !== "number" || amountKobo <= 0) {
      return NextResponse.json(
        { error: "Valid amountKobo (positive number) is required" },
        { status: 400 },
      );
    }

    // Proxy to backend Fastify API
    const response = await apiClient.post(
      `/api/v1/financial/wallet-funding/${storeId}/reconcile`,
      { reason, amountKobo }
    );

    return NextResponse.json(response);
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    if (errorMessage === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    if (errorMessage?.includes("Insufficient permissions")) {
      return NextResponse.json(
        { error: "Insufficient permissions - ADMIN required" },
        { status: 403 },
      );
    }
    logger.error("[WALLET_MANUAL_RECONCILE_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
