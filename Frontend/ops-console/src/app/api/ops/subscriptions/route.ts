import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function GET() {
  await OpsAuthService.requireSession();

  try {
    const response = await apiClient.get('/api/v1/admin/subscriptions');
    
    return NextResponse.json(response);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Failed to fetch subscription stats" },
      { status: 500 },
    );
  }
}
