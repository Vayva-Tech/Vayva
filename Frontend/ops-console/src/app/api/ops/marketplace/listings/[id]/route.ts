import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { user } = await OpsAuthService.requireSession();

  try {
    const { id } = await params;
    const body = await req.json();
    const { action, note } = body;

    const response = await apiClient.patch(`/api/v1/admin/marketplace/listings/${id}`, { action, note });
    
    return NextResponse.json(response);
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to update listing" },
      { status: 500 },
    );
  }
}
