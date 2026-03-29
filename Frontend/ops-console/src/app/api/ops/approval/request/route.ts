import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    const body = await req.json();
    const {
      action,
      targetType,
      targetId,
      targetStoreId,
      metadata,
      requestedFrom,
      confirmationCode,
    } = body;

    const response = await apiClient.post('/api/v1/admin/approval/request', {
      action,
      targetType,
      targetId,
      targetStoreId,
      metadata,
      requestedFrom,
      confirmationCode,
    });

    return NextResponse.json(response);
  } catch (error: unknown) {
    logger.error("[APPROVAL_REQUEST_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}
