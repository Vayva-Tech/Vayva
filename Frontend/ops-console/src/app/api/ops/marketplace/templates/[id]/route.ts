import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
  }

  const { id } = await params;
  const body = await request.json();

  try {
    const response = await apiClient.patch(`/api/v1/admin/marketplace/templates/${id}`, body);
    
    return NextResponse.json(response);
  } catch {
    return NextResponse.json({ error: "Update failed" }, { status: 500 });
  }
}
