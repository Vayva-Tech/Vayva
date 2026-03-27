import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { OpsAuthService } from "@/lib/ops-auth";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();

    if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions. Admin role required." },
        { status: 403 },
      );
    }

    const { id: storeId } = await params;
    const { reason } = await req.json();

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: "Reason must be at least 10 characters" },
        { status: 400 },
      );
    }

    const response = await apiClient.post(`/api/v1/admin/merchants/${storeId}/actions/suspend`, {
      reason,
    });

    await OpsAuthService.logEvent(user.id, "MERCHANT_SUSPEND", {
      storeId,
      reason,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[SUSPEND_ACCOUNT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to suspend merchant" },
      { status: 500 },
    );
  }
}
