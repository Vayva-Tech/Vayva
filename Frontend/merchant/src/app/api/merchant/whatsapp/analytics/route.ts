import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders, buildBackendUrl } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  let storeId: string | undefined;
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    storeId = auth.user.storeId;

    const result = await apiJson<{
      success: boolean;
      data?: { analytics?: unknown };
      error?: string;
    }>(buildBackendUrl("/merchant/whatsapp/analytics"), {
      headers: auth.headers,
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to fetch WhatsApp analytics");
    }

    return NextResponse.json({ analytics: result.data?.analytics });
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/merchant/whatsapp/analytics",
      operation: "GET_WHATSAPP_ANALYTICS",
      storeId,
    });
    return NextResponse.json(
      { error: "Failed to fetch WhatsApp analytics" },
      { status: 500 }
    );
  }
}
