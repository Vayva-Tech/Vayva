import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function GET(request: Request) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status") || "PENDING";

  // Proxy to backend Fastify API
  const response = await apiClient.get('/api/v1/financial/payouts/ops', { status });

  return NextResponse.json(response);
}
