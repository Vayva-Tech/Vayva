import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPS_SUPPORT");

    const response = await apiClient.get('/api/v1/admin/financials/revenue');
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch revenue analytics" },
      { status: 500 }
    );
  }
}
