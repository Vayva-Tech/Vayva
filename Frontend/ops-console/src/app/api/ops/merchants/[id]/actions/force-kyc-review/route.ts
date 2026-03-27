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
    (OpsAuthService as any).requireRole(user, "SUPERVISOR");

    const { id: storeId } = await params;
    const { reason } = await req.json();

    if (!reason || reason.trim().length < 10) {
      return NextResponse.json(
        { error: "Reason must be at least 10 characters" },
        { status: 400 },
      );
    }

    const response = await apiClient.post(`/api/v1/admin/merchants/${storeId}/actions/kyc-review`, {
      reason,
    });

    await OpsAuthService.logEvent(user.id, "KYC_REVIEW_FORCED", { storeId, reason });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[FORCE_KYC_REVIEW_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to force KYC review" },
      { status: 500 },
    );
  }
}
