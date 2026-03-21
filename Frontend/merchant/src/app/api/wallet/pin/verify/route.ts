// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => ({}));
    const { pin } = body;
    if (!pin) {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 });
    }

    const result = await apiJson<{
      success: boolean;
      status?: string;
      error?: string;
    }>(
      `${process.env.BACKEND_API_URL}/api/wallet/pin/verify`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-store-id": storeId,
        },
        body: JSON.stringify({ pin }),
      }
    );
    
    if (result.error) {
      return NextResponse.json(result, { status: 401 });
    }
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/wallet/pin/verify",
        operation: "VERIFY_PIN",
      }
    );
    return NextResponse.json(
      { error: "Failed to verify PIN" },
      { status: 500 }
    );
  }
}
