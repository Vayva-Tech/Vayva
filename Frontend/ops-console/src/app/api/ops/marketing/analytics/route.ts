import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export async function GET(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPERATOR");

    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "7d";

    const response = await apiClient.get('/api/v1/admin/marketing/analytics', { period });
    
    return NextResponse.json(response);
  } catch (error: any) {
    if (error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    logger.error("[MARKETING_ANALYTICS_ERROR]", { error });
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
