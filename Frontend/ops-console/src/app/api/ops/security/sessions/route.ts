import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export async function GET(_request: Request) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SECURITY"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  // Proxy to backend Fastify API
  const response = await apiClient.get('/api/v1/compliance/sessions/ops');
  
  return NextResponse.json(response);
}
