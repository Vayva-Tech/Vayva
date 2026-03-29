import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function POST(
  request: NextRequest,
  props: { params: Promise<{ id: string }> },
) {
  const params = await props.params;
  try {
    const sessionData = await OpsAuthService.requireSession();
    const { user } = sessionData;

    try {
      OpsAuthService.requireRole(user, "OPS_ADMIN");
    } catch (e) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }

    const disputeId = params.id;
    const body = await request.json();
    const { reason } = body;

    const response = await apiClient.post(`/api/v1/admin/disputes/${disputeId}/reject`, { reason });
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to reject dispute" },
      { status: 500 }
    );
  }
}
