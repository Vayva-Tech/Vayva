import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

export async function GET(req: NextRequest) {
  await OpsAuthService.requireSession();

  try {
    const { searchParams } = new URL(req.url);
    const period = searchParams.get("period") || "week";

    const response = await apiClient.get('/api/v1/admin/onboarding', { period });
    
    return NextResponse.json(response);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    logger.error("[ONBOARDING_STATS_ERROR]", { error });
    return NextResponse.json(
      { error: "Failed to fetch onboarding stats" },
      { status: 500 },
    );
  }
}
