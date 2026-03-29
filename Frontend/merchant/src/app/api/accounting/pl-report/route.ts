import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

/**
 * GET /api/accounting/pl-report
 * Fetch Profit & Loss report
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

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
    }>(
      `${backendBase()}/api/accounting/pl-report?start=${encodeURIComponent(start ?? "")}&end=${encodeURIComponent(end ?? "")}`,
      { headers: auth.headers },
    );

    if (data.success === false) {
      throw new Error(data.error || "Failed to fetch P&L report");
    }

    return NextResponse.json(data);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/accounting/pl-report",
      operation: "GET_PL_REPORT",
    });
    return NextResponse.json(
      { error: "Failed to fetch P&L report" },
      { status: 500 },
    );
  }
}
