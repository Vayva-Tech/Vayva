// @ts-nocheck
import { NextResponse, NextRequest } from "next/server";
import { PERMISSIONS } from "@/lib/team/permissions";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/analytics/overview - Get dashboard analytics summary
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const period = searchParams.get("period") || "30d";

    const result = await apiJson<{
      success: boolean;
      data?: { revenue?: number; orders?: number; customers?: number; conversionRate?: number };
      error?: string;
    }>(`${process.env.BACKEND_API_URL}/api/analytics/overview?period=${period}`, {
      headers: {
        "x-store-id": storeId,
      },
    });
    
    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/analytics/overview",
      operation: "GET_ANALYTICS_OVERVIEW",
    });
    return NextResponse.json(
      { error: "Failed to fetch analytics overview" },
      { status: 500 }
    );
  }
}
