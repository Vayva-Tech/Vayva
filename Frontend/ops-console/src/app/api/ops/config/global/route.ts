import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    await OpsAuthService.requireSession();

    const response = await apiClient.get('/api/v1/admin/config/global');
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch global configuration" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const body = await req.json();
    const { aiEnabled, evolutionApiEnabled, maintenanceMode } = body;

    const response = await apiClient.post('/api/v1/admin/config/global', {
      aiEnabled,
      evolutionApiEnabled,
      maintenanceMode,
    });
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update global configuration" },
      { status: 500 }
    );
  }
}
