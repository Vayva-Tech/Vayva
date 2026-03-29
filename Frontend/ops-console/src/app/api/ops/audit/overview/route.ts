import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export async function GET(req: Request) {
  try {
    await OpsAuthService.requireSession();

    const response = await apiClient.get('/api/v1/admin/audit/overview');
    
    return NextResponse.json(response);
  } catch (error: unknown) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("[AUDIT_OVERVIEW_ERROR]", { error });
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
