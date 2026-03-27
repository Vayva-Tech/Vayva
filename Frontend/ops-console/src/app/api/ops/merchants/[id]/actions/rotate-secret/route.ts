import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { OpsAuthService } from "@/lib/ops-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await OpsAuthService.requireSession();
  if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
    return NextResponse.json(
      { error: "Insufficient permissions" },
      { status: 403 },
    );
  }

  try {
    const { id: storeId } = await params;

    const response = await apiClient.post(`/api/v1/admin/merchants/${storeId}/actions/rotate-secret`);

    await OpsAuthService.logEvent(user.id, "WEBHOOK_SECRET_ROTATED", {
      storeId,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[ROTATE_SECRET_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to rotate webhook secret" },
      { status: 500 },
    );
  }
}
