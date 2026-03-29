import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function GET(req: NextRequest) {
  try {
    await OpsAuthService.requireSession();

    const { searchParams } = new URL(req.url);
    const metric = searchParams.get("metric") || "gmv";
    const period = searchParams.get("period") || "30d";
    const granularity = searchParams.get("granularity") || "day";

    const response = await apiClient.get('/api/v1/analytics/ops/timeseries', {
      metric,
      period,
      granularity
    });
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch time series analytics" },
      { status: 500 }
    );
  }
}
