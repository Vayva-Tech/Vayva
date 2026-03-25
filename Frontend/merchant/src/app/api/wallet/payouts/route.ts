import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      payouts: Array<{
        id: string;
        amount: number;
        status: string;
        createdAt: Date;
        bankAccount: string;
      }>;
    }>(`${process.env.BACKEND_API_URL}/api/wallet/payouts`, {
      headers: auth.headers,
    });

    return NextResponse.json(result, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/wallet/payouts",
      operation: "GET_PAYOUTS",
    });
    return NextResponse.json(
      { error: "Failed to fetch payouts" },
      { status: 500 },
    );
  }
}
