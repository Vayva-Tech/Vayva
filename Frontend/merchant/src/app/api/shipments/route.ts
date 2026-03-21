import { NextRequest, NextResponse } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/shipments - Get all shipments for the merchant
export async function GET(request: NextRequest) {
  const storeId = request.headers.get("x-store-id") || "";
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "50");
    const offset = parseInt(searchParams.get("offset") || "0");

    // Call backend API to fetch shipments
    const result = await apiJson<{
      success: boolean;
      data?: Array<{ id: string; trackingNumber: string; status: string; carrier?: string }>;
      meta?: { total: number; limit: number; offset: number };
    }>(
      `${process.env.BACKEND_API_URL}/api/shipments?status=${status || ''}&limit=${limit}&offset=${offset}`,
      {
        headers: {
          "x-store-id": storeId,
        },
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/shipments',
      operation: 'GET_SHIPMENTS',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
