// @ts-nocheck
import { urls } from "@vayva/shared";
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    // Call backend API to request PIN reset
        const result = await apiJson<{
            success: boolean;
            message?: string;
            resetUrl?: string;
        }>(
            `${process.env.BACKEND_API_URL}/api/wallet/pin/reset-request`,
      {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    "x-store-id": storeId,
                },
                body: JSON.stringify({ userId: user.id, email: user.email }),
            }
        );
        
        return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/wallet/pin/reset-request", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
