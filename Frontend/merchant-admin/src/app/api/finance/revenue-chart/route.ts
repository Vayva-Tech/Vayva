import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { logger } from "@vayva/shared";

/**
 * GET /api/finance/revenue-chart
 * Fetch revenue chart data for visualization
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      try {
        const { searchParams } = new URL(request.url);
        const months = parseInt(searchParams.get('months') || '12');
        
        // In production, calculate from actual revenue data
        // const chartData = await prisma.$queryRaw`
        //   SELECT 
        //     EXTRACT(MONTH FROM created_at) as month,
        //     SUM(total_amount) as revenue
        //   FROM orders 
        //   WHERE store_id = ${session.storeId}
        //   AND created_at >= DATE_TRUNC('month', NOW() - INTERVAL '${months} months')
        //   GROUP BY EXTRACT(MONTH FROM created_at)
        //   ORDER BY month
        // `;
        
        // Mock data for now - realistic revenue trend
        const mockChartData = {
          data: [65, 78, 62, 85, 72, 90, 68, 82, 75, 88, 70, 92]
        };

        return {
          status: 200,
          body: mockChartData,
        };
      } catch (error: unknown) {
        logger.error("[FINANCE_CHART_ERROR] Failed to fetch chart data", { 
          error: error instanceof Error ? error.message : String(error),
          storeId: session.storeId 
        });
        
        return {
          status: 500,
          body: { error: "Failed to fetch chart data" },
        };
      }
    },
    { requireAuth: true }
  );
}