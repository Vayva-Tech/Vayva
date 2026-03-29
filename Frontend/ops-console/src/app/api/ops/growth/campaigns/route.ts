import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const status = searchParams.get("status");

  const response = await apiClient.get('/api/v1/admin/growth/campaigns', { status });
  
  return NextResponse.json({ data: response });
}

export async function POST(request: Request) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));

  const response = await apiClient.post('/api/v1/admin/growth/campaigns', {
    name: body.name || "Untitled Campaign",
    type: body.type || "EMAIL",
    channel: body.channel || "EMAIL",
    storeId: body.storeId,
    messageBody: body.messageBody || "",
  });
  
  return NextResponse.json({ data: response });
}
