// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    const result = await apiJson<{
      mfaEnabled: boolean;
      sessions: Array<{
        id: string;
        device: string;
        location: string;
        lastActive: Date;
        isCurrent: boolean;
      }>;
    }>(`${process.env.BACKEND_API_URL}/api/account/security`, {
      headers: {
        "x-store-id": storeId,
      },
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/account/security",
      operation: "GET_SECURITY_SETTINGS",
    });
    return NextResponse.json(
      { error: "Failed to fetch security settings" },
      { status: 500 }
    );
  }
}
