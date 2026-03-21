// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/wallet - Get merchant wallet balance and details
export async function GET(request: NextRequest) {
  try {
    const result = await apiJson<{
      data: { balance: number; currency: string; pendingBalance?: number; availableBalance?: number };
    }>(
      `${process.env.BACKEND_API_URL}/api/wallet`,
      {
        headers: {
          "x-store-id": storeId,
        },
      }
    );
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/wallet",
      operation: "GET_WALLET",
    });
    return NextResponse.json(
      { error: "Failed to fetch wallet details" },
      { status: 500 }
    );
  }
}
