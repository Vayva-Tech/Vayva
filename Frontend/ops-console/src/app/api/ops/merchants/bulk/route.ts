import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function POST(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { action, merchantIds, data } = body;

    // Proxy to backend
    const response = await apiClient.post('/api/v1/admin/merchants/bulk', { action, merchantIds, data });
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to perform bulk operation" },
      { status: 500 }
    );
  }
}
