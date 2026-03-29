import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function GET() {
  try {
    await OpsAuthService.requireSession();

    const response = await apiClient.get('/api/v1/admin/health/detailed');
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      {
        status: "UNHEALTHY",
        error: error instanceof Error ? error.message : String(error),
        timestamp: new Date().toISOString(),
      },
      { status: 500 },
    );
  }
}
