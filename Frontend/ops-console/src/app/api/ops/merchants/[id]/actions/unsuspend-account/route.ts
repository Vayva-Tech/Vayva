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
      return NextResponse.json({ error: "Insufficient permissions" }, { status: 403 });
    }

    const { id: storeId } = await params;
    const response = await apiClient.post(`/api/v1/admin/merchants/${storeId}/actions/unsuspend`);

    await OpsAuthService.logEvent(user.id, "MERCHANT_UNSUSPEND", { storeId });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[UNSUSPEND_ACCOUNT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to unsuspend merchant" },
      { status: 500 },
    );
  }
}
