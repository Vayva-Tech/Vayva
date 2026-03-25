import { NextRequest, NextResponse } from "next/server";
import { buildBackendAuthHeaders } from "@/lib/backend-proxy";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

const backendBase = () => process.env.BACKEND_API_URL?.replace(/\/$/, "") ?? "";

/**
 * GET /api/accounting/expenses
 * Fetch expense entries
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
      expenses: Array<{
        id: string;
        date: string;
        description: string;
        category: string;
        amount: number;
        receiptUrl?: string;
        status: string;
      }>;
    }>(
      `${backendBase()}/api/accounting/expenses?start=${encodeURIComponent(start ?? "")}&end=${encodeURIComponent(end ?? "")}`,
      { headers: auth.headers },
    );

    if (data.success === false) {
      throw new Error(data.error || "Failed to fetch expenses");
    }

    return NextResponse.json(data);
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/accounting/expenses",
      operation: "GET_EXPENSES",
    });
    return NextResponse.json(
      { error: "Failed to fetch expenses" },
      { status: 500 },
    );
  }
}

/**
 * POST /api/accounting/expenses
 * Create a new expense
 */
export async function POST(request: NextRequest) {
  try {
    const auth = await buildBackendAuthHeaders(request);
    if (!auth) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const body: unknown = await request.json().catch(() => ({}));
    const result = await apiJson<{
      success: boolean;
      data?: unknown;
      error?: string;
    }>(`${backendBase()}/api/accounting/expenses`, {
      method: "POST",
      headers: auth.headers,
      body: JSON.stringify(body),
    });

    if (!result.success) {
      throw new Error(result.error || "Failed to create expense");
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    handleApiError(error, {
      endpoint: "/api/accounting/expenses",
      operation: "CREATE_EXPENSE",
    });
    return NextResponse.json(
      { error: "Failed to create expense" },
      { status: 500 },
    );
  }
}
