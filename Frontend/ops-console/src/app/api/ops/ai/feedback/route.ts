import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { OpsAuthService } from "@/lib/ops-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const limit = searchParams.get("limit") || "50";
  const rating = searchParams.get("rating");

  const params: Record<string, string> = { limit };
  if (rating && rating !== "ALL") {
    params.rating = rating;
  }

  const response = await apiClient.get('/api/v1/ai/feedback', params);
  return NextResponse.json(response);
}
