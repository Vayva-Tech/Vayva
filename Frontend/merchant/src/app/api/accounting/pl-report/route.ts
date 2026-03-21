// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/accounting/pl-report
 * Fetch Profit & Loss report
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  try {
    const data = await apiJson<{
      success?: boolean;
      error?: string;
      report: {
        period: string;
        revenue: number;
        cogs: number;
        grossProfit: number;
        operatingExpenses: number;
        netIncome: number;
        byCategory: Record<string, { income: number; expense: number }>;
      };
    }>(`${process.env.BACKEND_API_URL}/api/accounting/pl-report?start=${start}&end=${end}`);

    if (data.success === false) {
      throw new Error(data.error || 'Failed to fetch P&L report');
    }

    return NextResponse.json(data);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/accounting/pl-report',
        operation: 'GET_PL_REPORT',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch P&L report' },
      { status: 500 }
    );
  }
}
