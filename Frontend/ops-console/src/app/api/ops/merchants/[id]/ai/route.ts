import { NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await OpsAuthService.requireSession();

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const response = await apiClient.get(`/api/v1/admin/merchants/${id}/ai`);
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to fetch AI profile" },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!["OPS_OWNER", "OPS_ADMIN", "OPS_SUPPORT"].includes(user.role)) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;
    const body = await request.json();

    const response = await apiClient.patch(`/api/v1/admin/merchants/${id}/ai`, body);
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update AI profile" },
      { status: 500 }
    );
  }
}
