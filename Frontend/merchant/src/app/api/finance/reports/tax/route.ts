import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/finance/reports/tax - Generate Tax Summary report
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);

    // Parse date range (default to current quarter)
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3);
    const startDateParam = searchParams.get("startDate");
    const endDateParam = searchParams.get("endDate");

    const startDate = startDateParam
      ? new Date(startDateParam)
      : new Date(now.getFullYear(), quarter * 3, 1);
    const endDate = endDateParam
      ? new Date(endDateParam)
      : new Date(now.getFullYear(), (quarter + 1) * 3, 0, 23, 59, 59);

    // Validate dates
    if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date format" },
        { status: 400 }
      );
    }

    if (startDate > endDate) {
      return NextResponse.json(
        { success: false, error: "Start date must be before end date" },
        { status: 400 }
      );
    }

    // Call backend API
    const result = await apiJson(
      `${process?.env?.BACKEND_API_URL}/api/finance/reports/tax?startDate=${startDate.toISOString()}&endDate=${endDate.toISOString()}`,
      {
        headers: auth.headers,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/finance/reports/tax',
      operation: 'GET_TAX_REPORT',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
