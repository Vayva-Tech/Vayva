import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
    // Call backend API to check withdrawal eligibility
        const result = await apiJson<{
            kycStatus: string;
            availableBalance: number;
            minWithdrawal: number;
            blockedReasons: string[];
            isEligible: boolean;
        }>(
            `${process.env.BACKEND_API_URL}/api/wallet/withdraw/eligibility`,
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
    handleApiError(error, { endpoint: "/api/wallet/withdraw/eligibility", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
