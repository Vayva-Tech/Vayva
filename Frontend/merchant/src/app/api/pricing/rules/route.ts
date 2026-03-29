import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/pricing/rules - Get pricing rules
export async function GET(req: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const isActive = searchParams.get("isActive");
    const appliesTo = searchParams.get("appliesTo");
    const limit = searchParams.get("limit") || "20";
    const offset = searchParams.get("offset") || "0";

    const queryParams = new URLSearchParams({
      storeId,
      limit,
      offset,
    });
    
    if (isActive) queryParams.append('isActive', isActive);
    if (appliesTo) queryParams.append('appliesTo', appliesTo);

    const result = await apiJson<{
      success: boolean;
      data?: { rules?: any[]; total?: number };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/pricing/rules?${queryParams.toString()}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch pricing rules');
    }

    return NextResponse.json(result.data);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/pricing/rules",
        operation: "GET_PRICING_RULES",
      }
    );
    return NextResponse.json(
      { error: "Failed to fetch pricing rules" },
      { status: 500 }
    );
  }
}

// POST /api/pricing/rules - Create pricing rule
export async function POST(req: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(req);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    if (!storeId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { storeId: _clientStoreId, ...rest } = body ?? {};
    const payload = { ...rest, storeId };

    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/pricing/rules`, {
      method: 'POST',
      headers: {
        ...auth.headers,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!result.success) {
      throw new Error(result.error || 'Failed to create pricing rule');
    }

    return NextResponse.json(result.data);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/pricing/rules",
        operation: "CREATE_PRICING_RULE",
      }
    );
    return NextResponse.json(
      { error: "Failed to create pricing rule" },
      { status: 500 }
    );
  }
}
