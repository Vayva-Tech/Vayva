import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

// GET /api/finance/reports/balance-sheet - Generate Balance Sheet report
export async function GET(request: NextRequest) {
  try {
    const storeId = request.headers.get("x-store-id") || "";
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
        headers: {
          "x-store-id": storeId,
        },
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
