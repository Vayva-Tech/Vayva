import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { orderId } = await req.json();
    const { id: storeId } = await params;

    const response = await apiClient.post(`/api/v1/admin/merchants/${storeId}/actions/replay-webhook`, { orderId });
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to replay webhook" },
      { status: 500 }
    );
  }
}
