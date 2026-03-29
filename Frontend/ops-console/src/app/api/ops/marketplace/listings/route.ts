import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  const { user } = await OpsAuthService.requireSession();
  (OpsAuthService as any).requireRole(user, "OPS_SUPPORT");

  try {
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "PENDING_REVIEW";

    const response = await apiClient.get('/api/v1/admin/marketplace/listings', { status });
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch listings" },
      { status: 500 },
    );
  }
}
