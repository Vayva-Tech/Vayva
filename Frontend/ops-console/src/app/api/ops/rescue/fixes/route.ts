import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function GET(_req: NextRequest) {
  try {
    await OpsAuthService.requireSession();

    const response = await apiClient.get('/api/v1/admin/rescue/fixes');
    
    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }
}
