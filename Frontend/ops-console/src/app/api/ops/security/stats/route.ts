import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";
import { logger } from "@vayva/shared";

/**
 * GET /api/ops/security/stats
 * Get security statistics (failed logins, active sessions, etc.)
 */
export async function GET(req: NextRequest) {
  const { user } = await OpsAuthService.requireSession();
  
  // Check permissions - Admin/Owner only
  if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  try {
    // Proxy to backend Fastify API
    const response = await apiClient.get('/api/v1/compliance/security/stats/ops');
    
    return NextResponse.json(response);
  } catch (error) {
    logger.error("[SECURITY_STATS_GET]", { error });
    return NextResponse.json(
      { error: "Failed to fetch security statistics" },
      { status: 500 }
    );
  }
}
