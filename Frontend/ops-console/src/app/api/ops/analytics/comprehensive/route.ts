import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export const GET = async (req: NextRequest) => {
  try {
    await OpsAuthService.requireSession();

    // Proxy to backend Fastify API
    const response = await apiClient.get('/api/v1/analytics/ops/comprehensive');
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch comprehensive analytics" },
      { status: 500 }
    );
  }
};
