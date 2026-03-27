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
    (OpsAuthService as any).requireRole(user, "OPS_SUPPORT");

    const { id: storeId } = await params;
    const body = await req.json();
    const { reason, message } = body;

    if (!reason || reason.length < 10) {
      return NextResponse.json(
        { error: "Reason must be at least 10 characters" },
        { status: 400 },
      );
    }

    if (!message || message.length < 5) {
      return NextResponse.json(
        { error: "Message must be at least 5 characters" },
        { status: 400 },
      );
    }

    const response = await apiClient.post(`/api/v1/admin/merchants/${storeId}/actions/warning`, {
      reason,
      message,
    });

    await OpsAuthService.logEvent(user.id, "WARNING_ISSUED", { storeId });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[ISSUE_WARNING_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to issue warning" },
      { status: 500 },
    );
  }
}
