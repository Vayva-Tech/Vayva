// @ts-nocheck
import { NextRequest, NextResponse } from "next/server";
import { apiJson } from "@/lib/api-client-shared";
import { handleApiError } from "@/lib/api-error-handler";

/**
 * GET /api/accounting/expenses
 * Fetch expense entries
 */
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const start = searchParams.get("start");
  const end = searchParams.get("end");

  try {
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
    }>(`${process.env.BACKEND_API_URL}/api/accounting/expenses?start=${start}&end=${end}`);

    if (data.success === false) {
      throw new Error(data.error || 'Failed to fetch expenses');
    }

    return NextResponse.json(data);
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/accounting/expenses',
        operation: 'GET_EXPENSES',
      }
    );
    return NextResponse.json(
      { error: 'Failed to fetch expenses' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/accounting/expenses
 * Create a new expense
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const result = await apiJson<{ success: boolean; data?: any; error?: string }>(
      `${process.env.BACKEND_API_URL}/api/accounting/expenses`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      }
    );

    if (!result.success) {
      throw new Error(result.error || 'Failed to create expense');
    }

    return NextResponse.json(result, { status: 201 });
  } catch (error) {
    handleApiError(
      error,
      {
        endpoint: '/api/accounting/expenses',
        operation: 'CREATE_EXPENSE',
      }
    );
    return NextResponse.json(
      { error: 'Failed to create expense' },
      { status: 500 }
    );
  }
}
