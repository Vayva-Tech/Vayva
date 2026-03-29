import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function GET(_req: NextRequest) {
  try {
    await OpsAuthService.requireSession();

    const response = await apiClient.get('/api/v1/admin/config/feature-flags');
    
    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch feature flags" },
      { status: 500 },
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
    const { maintenanceMode, betaFeatures } = body;

    const response = await apiClient.post('/api/v1/admin/config/feature-flags', {
      maintenanceMode,
      betaFeatures,
    });
    
    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Failed to update feature flags" },
      { status: 500 },
    );
  }
}
