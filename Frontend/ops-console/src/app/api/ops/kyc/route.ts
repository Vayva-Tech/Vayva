import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export async function GET() {
  try {
    await OpsAuthService.requireSession();

    // Proxy to backend Fastify API
    const response = await apiClient.get('/api/v1/compliance/kyc/ops');
    
    return NextResponse.json(response);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[KYC_QUEUE_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to fetch KYC queue" },
      { status: 500 },
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();

    const { id, action, notes, rejectionReason } = await req.json();

    if (!id || !["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid request" }, { status: 400 });
    }

    // Proxy to backend Fastify API
    const responseBody = await apiClient.post('/api/v1/compliance/kyc/ops/action', {
      id,
      action,
      notes,
      rejectionReason
    });

    return NextResponse.json(responseBody);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[KYC_ACTION_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to process KYC action" },
      { status: 500 },
    );
  }
}
