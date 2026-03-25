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
    const storeId = auth.user.storeId;
    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/wallet/payout-accounts`,
      {
        headers: auth.headers,
      }
    );
    return NextResponse.json(result, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    handleApiError(error, { endpoint: "/api/wallet/payout-accounts", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const body = await request.json().catch(() => ({}));
    const { bankName, bankCode, accountNumber, accountName, isDefault } = body;

    if (!bankName || !bankCode || !accountNumber || !accountName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result = await apiJson(
      `${process.env.BACKEND_API_URL}/api/wallet/payout-accounts`,
      {
        method: "POST",
        headers: { ...auth.headers },
        body: JSON.stringify({ bankName, bankCode, accountNumber, accountName, isDefault }),
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, { endpoint: "/api/wallet/payout-accounts", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
