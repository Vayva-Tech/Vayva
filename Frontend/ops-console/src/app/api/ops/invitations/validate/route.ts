import { NextRequest, NextResponse } from "next/server";
import { apiClient } from "@/lib/api-client";

/**
 * GET /api/ops/invitations/validate?token=...
 * Validate an invitation token without authenticating
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const token = searchParams.get("token");

    if (!token) {
      return NextResponse.json(
        { error: "Token is required" },
        { status: 400 }
      );
    }

    const response = await apiClient.get(`/api/v1/admin/invitations/validate?token=${token}`);
    
    return NextResponse.json(response);
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : "Failed to validate invitation";
    return NextResponse.json(
      { error: errorMsg },
      { status: 500 }
    );
  }
}
