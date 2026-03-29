import { NextRequest, NextResponse } from "next/server";
import { OpsAuthService } from "@/lib/ops-auth";
import { apiClient } from "@/lib/api-client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    await OpsAuthService.requireSession();
    const { id } = await params;

    const response = await apiClient.get(`/api/v1/admin/rescue/incidents/${id}`);
    
    return NextResponse.json(response);
  } catch (error: unknown) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 },
    );
  }
}
