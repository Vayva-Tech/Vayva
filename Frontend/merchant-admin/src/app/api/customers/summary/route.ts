import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { logger } from "@vayva/shared";

/**
 * GET /api/customers/summary
 * Fetch customer summary statistics
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      try {
        // In production, calculate from database
        // const summary = await prisma.$queryRaw`
        //   SELECT 
        //     COUNT(*) as total,
        //     COUNT(CASE WHEN status != 'inactive' THEN 1 END) as active,
        //     COUNT(CASE WHEN status = 'vip' THEN 1 END) as vip,
        //     AVG(total_spent) as average_order_value
        //   FROM customers 
        //   WHERE store_id = ${session.storeId}
        // `;
        
        // Mock data for now
        const mockSummary = {
          total: 892,
          active: 756,
          vip: 47,
          averageOrderValue: 2450
        };

        return {
          status: 200,
          body: mockSummary,
        };
      } catch (error: unknown) {
        logger.error("[CUSTOMERS_SUMMARY_ERROR] Failed to fetch summary", { 
          error: error instanceof Error ? error.message : String(error),
          storeId: session.storeId 
        });
        
        return {
          status: 500,
          body: { error: "Failed to fetch customer summary" },
        };
      }
    },
    { requireAuth: true }
  );
}