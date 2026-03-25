import { NextRequest, NextResponse } from "next/server";
import { buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function POST(request: NextRequest) {
  try {
    const body: unknown = await request.json();
    if (!body || typeof body !== "object" || Array.isArray(body)) {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const { token, items, reason, notes, preferredMethod } = body as Record<string, unknown>;
    if (typeof token !== "string" || token.length === 0) {
      return NextResponse.json({ error: "Missing token" }, { status: 400 });
    }

    const validateResult = await apiJson<{
      success: boolean;
      data?: { orderId?: string; customerPhone?: string };
      error?: string;
    }>(
      `${buildBackendUrl("/api/public/returns/validate-token")}?token=${encodeURIComponent(token)}`
    );

    if (!validateResult.success || !validateResult.data) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const { orderId, customerPhone } = validateResult.data;

    const createResult = await apiJson<{
      success: boolean;
      data?: { id?: string };
      error?: string;
    }>(buildBackendUrl("/api/public/returns/request"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        orderId,
        customerPhone,
        items,
        reason,
        notes,
        preferredMethod,
      }),
    });

    if (!createResult.success) {
      throw new Error(createResult.error || "Failed to create return request");
    }

    return NextResponse.json({ success: true, id: createResult.data?.id });
  } catch (error: unknown) {
    handleApiError(error, { endpoint: "/api/public/returns/request", operation: "POST" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
