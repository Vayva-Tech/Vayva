import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";
import { OpsAuthService } from "@/lib/ops-auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  await OpsAuthService.requireSession();

  try {
    const { id: storeId } = await params;

    const response = await apiClient.get(`/api/v1/admin/merchants/${storeId}/audit`);
    return NextResponse.json(response);
  } catch (error) {
    console.error("[MERCHANT_AUDIT_ERROR]", error);
    return NextResponse.json(
      { error: "Failed to fetch audit logs" },
      { status: 500 },
    );
  }
}
