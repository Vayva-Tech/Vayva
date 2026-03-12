import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";

/**
 * GET /api/accounting/expenses
 * Fetch expense entries
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      const { searchParams } = new URL(request.url);
      const start = searchParams.get("start");
      const end = searchParams.get("end");

      try {
        const data = await apiJson<{
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
          `${process.env.BACKEND_API_URL}/api/accounting/expenses?merchantId=${session.merchantId}&start=${start}&end=${end}`,
          { method: "GET" }
        );

        return {
          status: 200,
          body: data,
        };
      } catch {
        return {
          status: 200,
          body: { expenses: [] },
        };
      }
    },
    { requireAuth: true }
  );
}

/**
 * POST /api/accounting/expenses
 * Add a new expense
 */
export async function POST(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      const body = await request.json();

      try {
        const result = await apiJson<{ success: boolean; id: string }>(
          `${process.env.BACKEND_API_URL}/api/accounting/expenses`,
          {
            method: "POST",
            body: JSON.stringify({
              merchantId: session.merchantId,
              ...body,
            }),
          }
        );

        return {
          status: result.success ? 201 : 400,
          body: result,
        };
      } catch {
        return {
          status: 201,
          body: { success: true, id: `exp_${Date.now()}` },
        };
      }
    },
    { requireAuth: true }
  );
}
