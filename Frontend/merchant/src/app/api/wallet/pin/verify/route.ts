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

    const body: unknown = await request.json().catch(() => ({}));
    const pin =
      typeof body === "object" &&
      body !== null &&
      "pin" in body &&
      typeof (body as { pin?: unknown }).pin === "string"
        ? (body as { pin: string }).pin
        : "";

    if (!pin) {
      return NextResponse.json({ error: "PIN is required" }, { status: 400 });
    }

    const result = await apiJson<{
      success: boolean;
      status?: string;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/wallet/pin/verify`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify({ pin }),
    });

    if (result.error) {
      return NextResponse.json(result, { status: 401 });
    }

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/wallet/pin/verify",
      operation: "VERIFY_PIN",
    });
    return NextResponse.json(
      { error: "Failed to verify PIN" },
      { status: 500 },
    );
  }
}
