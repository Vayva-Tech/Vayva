import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/wallet - Get merchant wallet balance and details
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const result = await apiJson<{
      data: {
        balance: number;
        currency: string;
        pendingBalance?: number;
        availableBalance?: number;
      };
    }>(`${process.env.BACKEND_API_URL}/api/wallet`, {
      headers: auth.headers,
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/wallet",
      operation: "GET_WALLET",
    });
    return NextResponse.json(
      { error: "Failed to fetch wallet details" },
      { status: 500 },
    );
  }
}
