import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { OpsAuthService } from "@/lib/ops-auth";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await OpsAuthService.requireSession();

  try {
    const { id } = await params;
    const body = await req.json();
    const { resolution } = body;

    const response = await apiClient.post(`/api/v1/compliance/risk/${id}/resolve`, {
      resolution,
    });

    await OpsAuthService.logEvent(user.id, "RISK_FLAG_RESOLVED", {
      flagId: id,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[RISK_RESOLVE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to resolve flag" },
      { status: 500 },
    );
  }
}
