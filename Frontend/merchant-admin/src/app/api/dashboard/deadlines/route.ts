import { NextRequest } from "next/server";
import { withVayvaAPI } from "@/lib/api-middleware";
import { logger } from "@vayva/shared";

/**
 * GET /api/dashboard/deadlines
 * Fetch upcoming business deadlines
 */
export async function GET(request: NextRequest) {
  return withVayvaAPI(
    request,
    async (session: any) => {
      try {
        // In production, fetch from task management system or calculate based on business rules
        // const deadlines = await prisma.task.findMany({
        //   where: {
        //     storeId: session.storeId,
        //     dueDate: {
        //       gte: new Date(),
        //       lte: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // Next 30 days
        //     }
        //   },
        //   orderBy: { dueDate: 'asc' }
        // });
        
        // Mock data for now
        const mockDeadlines = {
          deadlines: [
            { task: 'Inventory restock reminder', date: 'Tomorrow', priority: 'high' },
            { task: 'Monthly financial report', date: 'In 3 days', priority: 'medium' },
            { task: 'Marketing campaign launch', date: 'Next week', priority: 'low' },
            { task: 'Customer feedback survey', date: 'Next Monday', priority: 'medium' }
          ]
        };

        return {
          status: 200,
          body: mockDeadlines,
        };
      } catch (error: unknown) {
        logger.error("[DASHBOARD_DEADLINES_ERROR] Failed to fetch deadlines", { 
          error: error instanceof Error ? error.message : String(error),
          storeId: session.storeId 
        });
        
        return {
          status: 500,
          body: { error: "Failed to fetch deadlines" },
        };
      }
    },
    { requireAuth: true }
  );
}