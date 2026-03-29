import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export const dynamic = "force-dynamic";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { user } = await OpsAuthService.requireSession();
    (OpsAuthService as any).requireRole(user, "ADMIN");

    const { id: storeId } = await params;
    const body = await req.json();

    const response = await apiClient.post(`/api/v1/admin/merchants/${storeId}/wallet/lock`, body);
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update wallet lock status" },
      { status: 500 }
    );
  }
}
