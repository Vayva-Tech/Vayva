import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";

/**
 * GET /api/accounting/ledger
 * Fetch general ledger entries for date range
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
          `${process.env.BACKEND_API_URL}/api/accounting/ledger?merchantId=${session.merchantId}&start=${start}&end=${end}`,
          { method: "GET" }
        );

        return {
          status: 200,
          body: data,
        };
      } catch {
        return {
          status: 200,
          body: { entries: [] },
        };
      }
    },
    { requireAuth: true }
  );
}
