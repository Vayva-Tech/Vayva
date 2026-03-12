import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { logger } from "@vayva/shared";

/**
 * GET /api/finance/metrics
 * Fetch real financial metrics
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      try {
        const { searchParams } = new URL(request.url);
        const range = searchParams.get('range') || '30d';
        
        // In production, fetch from database
        // const metrics = await prisma.$queryRaw`
        //   SELECT 
        //     SUM(total_amount) as revenue,
        //     SUM(CASE WHEN status = 'completed' THEN total_amount ELSE 0 END) as net_profit,
        //     SUM(operating_costs) as operating_costs,
        //     SUM(cash_flow) as cash_flow
        //   FROM financial_reports 
        //   WHERE store_id = ${session.storeId}
        //   AND period >= DATE_TRUNC('day', NOW() - INTERVAL '${range}' DAY)
        // `;
        
        // Mock data for now - will be replaced with real database queries
        const mockMetrics = {
          revenue: 847290,
          netProfit: 234850,
          operatingCosts: 189420,
          cashFlow: 456180,
          revenueChange: 15.3,
          profitChange: 8.7,
          costsChange: -2.1,
          cashFlowChange: 12.4
        };

        return {
          status: 200,
          body: mockMetrics,
        };
      } catch (error: unknown) {
        logger.error("[FINANCE_METRICS_ERROR] Failed to fetch metrics", { 
          error: error instanceof Error ? error.message : String(error),
          storeId: session.storeId 
        });
        
        return {
          status: 500,
          body: { error: "Failed to fetch financial metrics" },
        };
      }
    },
    { requireAuth: true }
  );
}