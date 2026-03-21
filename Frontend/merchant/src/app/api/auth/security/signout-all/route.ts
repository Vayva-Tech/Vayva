// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const userId = user.id;

    const result = await apiJson<{
      success: boolean;
      data?: { message?: string };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/auth/security/signout-all`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-user-id": userId,
        "x-store-id": storeId,
      },
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/auth/security/signout-all",
      operation: "SIGNOUT_ALL_SESSIONS",
    });
    return NextResponse.json(
      { error: "Failed to sign out all sessions" },
      { status: 500 }
    );
  }
}
