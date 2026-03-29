import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    await OpsAuthService.requireSession();

    // Proxy to backend Fastify API
    const response = await apiClient.get('/api/v1/analytics/ops/dashboard');
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch dashboard statistics" },
      { status: 500 }
    );
  }
}
