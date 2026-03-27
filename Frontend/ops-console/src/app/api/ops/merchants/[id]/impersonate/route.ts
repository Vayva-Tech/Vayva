import { NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { OpsAuthService } from "@/lib/ops-auth";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    if (!["OPS_OWNER", "OPS_ADMIN"].includes(user.role)) {
      return NextResponse.json(
        { error: "Insufficient permissions for impersonation" },
        { status: 403 },
      );
    }

    const resolvedParams = await params;
    const { id } = resolvedParams;

    const response = await apiClient.post(`/api/v1/admin/merchants/${id}/actions/impersonate`);

    await OpsAuthService.logEvent(user.id, "IMPERSONATE_STORE", {
      storeId: id,
    });

    return NextResponse.json(response);
  } catch (error) {
    console.error("[IMPERSONATE_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to generate impersonation link" },
      { status: 500 },
    );
  }
}
