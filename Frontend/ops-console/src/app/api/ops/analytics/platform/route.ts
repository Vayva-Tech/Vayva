import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function GET() {
  await OpsAuthService.requireSession();

  try {
    const response = await apiClient.get('/api/v1/analytics/ops/platform');
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch platform analytics" },
      { status: 500 }
    );
  }
}
