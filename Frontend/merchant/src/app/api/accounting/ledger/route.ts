import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

/**
 * GET /api/accounting/ledger
 * Fetch general ledger entries for date range
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
      entries: Array<{
        id: string;
        date: string;
        description: string;
        category: string;
        debit: number;
        credit: number;
        balance: number;
        reference: string;
        type: string;
      }>;
    }>(
      `${backendBase()}/api/accounting/ledger?start=${encodeURIComponent(start ?? "")}&end=${encodeURIComponent(end ?? "")}`,
      { headers: auth.headers },
    );

    if (data.success === false) {
      throw new Error(data.error || "Failed to fetch ledger");
    }

    return NextResponse.json(data);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/accounting/ledger",
      operation: "GET_LEDGER",
    });
    return NextResponse.json(
      { error: "Failed to fetch ledger" },
      { status: 500 },
    );
  }
}
