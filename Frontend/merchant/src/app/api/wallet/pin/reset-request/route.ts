import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId =
      "id" in auth.user && typeof (auth.user as { id?: unknown }).id === "string"
        ? (auth.user as { id: string }).id
        : null;
    const email =
      "email" in auth.user && typeof (auth.user as { email?: unknown }).email === "string"
        ? (auth.user as { email: string }).email
        : null;

    const result = await apiJson<{
      success: boolean;
      message?: string;
      resetUrl?: string;
    }>(`${process.env.BACKEND_API_URL}/api/wallet/pin/reset-request`, {
      method: "POST",
      headers: { ...auth.headers },
      body: JSON.stringify({ userId, email }),
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/wallet/pin/reset-request",
      operation: "POST_WALLET_PIN_RESET_REQUEST",
    });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 },
    );
  }
}
