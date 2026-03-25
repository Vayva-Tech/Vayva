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

    const data: unknown = await request.json();

    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/menu-items`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(data),
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to create menu item");
    }

    return NextResponse.json(result.data);
  } catch (error: unknown) {
    handleApiError(error, {
      endpoint: "/api/menu-items",
      operation: "CREATE_MENU_ITEM",
    });
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
