import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SECURITY"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;

  try {
    // Proxy to backend Fastify API
    const response = await apiClient.delete(`/api/v1/compliance/sessions/${id}`);
    
    return NextResponse.json(response);
  } catch {
    return NextResponse.json(
      { error: "Failed to revoke session" },
      { status: 500 },
    );
  }
}
