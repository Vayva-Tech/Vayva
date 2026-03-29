import { NextRequest, NextResponse } from "next/server";
import { logger } from "@vayva/shared";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    await OpsAuthService.requireSession();

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const severity = searchParams.get("severity");
    const surface = searchParams.get("surface");

    const response = await apiClient.get('/api/v1/admin/rescue/incidents', {
      ...(status && { status }),
      ...(severity && { severity }),
      ...(surface && { surface }),
    });

    return NextResponse.json(response);
  } catch (error: unknown) {
    logger.error("[RESCUE_INCIDENTS_GET]", { error });
    return NextResponse.json(
      { error: "Unauthorized", status: "FAILED" },
      { status: 401 },
    );
  }
}
