import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await OpsAuthService.requireSession();

    const { id: disputeId } = await params;
    const body = await req.json();
    const { notes } = body;

    const response = await apiClient.post(`/api/v1/admin/disputes/${disputeId}/evidence`, { notes });
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to submit evidence" },
      { status: 500 }
    );
  }
}
