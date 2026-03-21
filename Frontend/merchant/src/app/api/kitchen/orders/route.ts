import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId') || '';
    
    const result = await apiJson<{
      success: boolean;
      data?: any[];
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/kitchen/orders?storeId=${storeId}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch kitchen orders');
    }

    return NextResponse.json(result.data, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/kitchen/orders",
        operation: "GET_KITCHEN_ORDERS",
      }
    );
    return NextResponse.json({ error: "Failed to fetch kitchen orders" }, { status: 500 });
  }
}
