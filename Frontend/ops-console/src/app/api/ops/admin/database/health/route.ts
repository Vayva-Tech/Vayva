import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { OpsAuthService } from "@/lib/ops-auth";

export const dynamic = "force-dynamic";

/**
 * GET /api/ops/admin/database/health
 * Database health monitoring endpoint for ops console dashboard
 */
export async function GET(request: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPS_SUPPORT");

    // Proxy to backend
    const response = await apiClient.get('/api/v1/admin/database/health');
    return NextResponse.json(response);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Database health check failed";
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
