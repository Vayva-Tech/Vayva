import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const data = await apiJson(
      `${process.env.BACKEND_API_URL}/api/settings/delivery`,
      { headers: auth.headers },
    );

    return NextResponse.json(data, {
      headers: { "Cache-Control": "no-store" },
    });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/settings/delivery",
      operation: "GET_DELIVERY_SETTINGS",
    });
    return NextResponse.json(
      { error: "Failed to fetch delivery settings" },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth?.user?.storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const result = await apiJson(`${process.env.BACKEND_API_URL}/api/settings/delivery`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(body),
    });

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/settings/delivery",
      operation: "UPDATE_DELIVERY_SETTINGS",
    });
    return NextResponse.json(
      { error: "Failed to update delivery settings" },
      { status: 500 },
    );
  }
}

