import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { apiJson } from "@/lib/api-client-shared";

/**
 * GET /api/accounting/pl-report
 * Fetch Profit & Loss report
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
          `${process.env.BACKEND_API_URL}/api/accounting/pl-report?merchantId=${session.merchantId}&start=${start}&end=${end}`,
          { method: "GET" }
        );

        return {
          status: 200,
          body: data,
        };
      } catch {
        return {
          status: 200,
          body: {
            report: {
              period: `${start} - ${end}`,
              revenue: 0,
              cogs: 0,
              grossProfit: 0,
              operatingExpenses: 0,
              netIncome: 0,
              byCategory: {},
            },
          },
        };
      }
    },
    { requireAuth: true }
  );
}
