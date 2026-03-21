import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    // Call backend API to fetch withdrawal info
        const result = await apiJson<{
            balance: number;
            availableBalance: number;
            pendingWithdrawals: number;
            currency: string;
        }>(
            `${process.env.BACKEND_API_URL}/api/wallet/withdraw`,
      {
                headers: {
                    "x-store-id": storeId,
                },
            }
        );
        
        return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/wallet/withdraw", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
