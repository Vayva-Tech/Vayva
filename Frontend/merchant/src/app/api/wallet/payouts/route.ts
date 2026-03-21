// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const result = await apiJson<{
      payouts: Array<{
        id: string;
        amount: number;
        status: string;
        createdAt: Date;
        bankAccount: string;
      }>;
    }>(
      `${process.env.BACKEND_API_URL}/api/wallet/payouts`,
      {
        headers: {
          "x-store-id": storeId,
        },
      }
    );
    
    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/wallet/payouts",
        operation: "GET_PAYOUTS",
      }
    );
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 }
    );
  }
}
