import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const ALLOWED_TYPES = ["digital", "service", "course", "event", "subscription", "physical"];

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);
    const type = searchParams.get("type");
    if (!type || !ALLOWED_TYPES.includes(type)) {
      return NextResponse.json({ error: "Invalid or missing resource type" }, { status: 400 });
    }

    const queryParams = new URLSearchParams({ type });

    const response = await apiJson(
      `${process.env.BACKEND_API_URL}/api/v1/resources/list?${queryParams}`,
      { headers: auth.headers }
    );

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(error, { endpoint: "/resources/list", operation: "GET" });
    return NextResponse.json(
      { error: "Failed to complete operation" },
      { status: 500 }
    );
  }
}
