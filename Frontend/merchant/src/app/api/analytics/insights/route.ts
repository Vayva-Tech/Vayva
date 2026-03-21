import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const storeId = searchParams.get('storeId') || '';
    
    const result = await apiJson<{
      success: boolean;
      data?: any;
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/analytics/insights?storeId=${storeId}`);

    if (!result.success) {
      throw new Error(result.error || 'Failed to fetch insights');
    }

    return NextResponse.json({ insights: result.data }, {
      headers: {
        "Cache-Control": "no-store",
      },
    });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: "/api/analytics/insights",
        operation: "GET_ANALYTICS_INSIGHTS",
      }
    );
    return NextResponse.json({ error: "Failed to fetch insights" }, { status: 500 });
  }
}
