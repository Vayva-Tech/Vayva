/**
 * Merchant Activity Stream API
 */

import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "OPERATOR");

    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    // Proxy to backend
    const response = await apiClient.get('/api/v1/admin/merchants/activity', { limit });
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch merchant activity" },
      { status: 500 }
    );
  }
}
