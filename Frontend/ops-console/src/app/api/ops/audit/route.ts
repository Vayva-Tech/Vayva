import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

type AuditEventWithUser = any;

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    await OpsAuthService.requireSession();

    const searchParams = req.nextUrl.searchParams;
    const page = parseInt(searchParams.get("page") || "1");
    const limit = parseInt(searchParams.get("limit") || "20");

    const response = await apiClient.get('/api/v1/admin/audit', {
      page,
      limit,
    });

    return NextResponse.json(response);
  } catch (error: unknown) {
    logger.error("[AUDIT_LOGS_ERROR]", { error });
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 },
    );
  }
}
