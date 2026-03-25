import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/finance/reports/balance-sheet - Generate Balance Sheet report
export async function GET(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const storeId = auth.user.storeId;
    const { searchParams } = new URL(request.url);

    // Parse as-of date (default to today)
    const asOfDateParam = searchParams.get("asOfDate");
    const asOfDate = asOfDateParam
      ? new Date(asOfDateParam)
      : new Date();

    // Validate date
    if (isNaN(asOfDate.getTime())) {
      return NextResponse.json(
        { success: false, error: "Invalid date format" },
        { status: 400 }
      );
    }

    // Call backend API
    const result = await apiJson(
      `${process?.env?.BACKEND_API_URL}/api/finance/reports/balance-sheet?asOfDate=${asOfDate.toISOString()}`,
      {
        headers: auth.headers,
      }
    );

    return NextResponse.json(result);
  } catch (error) {
    handleApiError(error, {
      endpoint: '/api/finance/reports/balance-sheet',
      operation: 'GET_BALANCE_SHEET',
    });
    return NextResponse.json(
      { error: 'Failed to complete operation' },
      { status: 500 }
    );
  }
}
