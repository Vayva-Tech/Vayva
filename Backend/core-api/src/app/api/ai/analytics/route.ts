import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/prisma";

/**
 * GET /api/ai/analytics
 * Get comprehensive AI analytics and metrics
 */
export const GET = withVayvaAPI(
  PERMISSIONS.AI_VIEW,
  async (req: NextRequest, { storeId }) => {
    try {
      const now = new Date();
      const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      const _sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

      // Get conversation statistics
      const [totalConversations, activeConversations, recentConversations] = await Promise.all([
        prisma.aIConversation.count({
          where: { storeId }
        }),
        prisma.aIConversation.count({
          where: { 
            storeId,
            status: 'ACTIVE'
          }
        }),
        prisma.aIConversation.findMany({
          where: {
            storeId,
            createdAt: { gte: twentyFourHoursAgo }
          },
          select: {
            status: true,
            saleValue: true,
            responseTimeMs: true,
            platform: true,
            createdAt: true
          }
        })
      ]);

      // Calculate metrics
      const completedConversations = recentConversations.filter(c => c.status === 'COMPLETED');
      const salesConversations = completedConversations.filter(c => c.saleValue && c.saleValue > 0);
      
      const conversionRate = completedConversations.length > 0 
        ? (salesConversations.length / completedConversations.length) * 100 
        : 0;
      
      const totalSales = salesConversations.reduce((sum, conv) => sum + Number(conv.saleValue || 0), 0);
      
      const avgResponseTime = completedConversations.length > 0
        ? completedConversations.reduce((sum, conv) => sum + (conv.responseTimeMs || 0), 0) / completedConversations.length
        : 0;

      // Platform distribution
      const platformDistribution: Record<string, number> = {};
      recentConversations.forEach(conv => {
        const platform = conv.platform || 'unknown';
        platformDistribution[platform] = (platformDistribution[platform] || 0) + 1;
      });

      // Hourly activity (last 24 hours)
      const hourlyActivity: { hour: number; count: number }[] = [];
      for (let i = 0; i < 24; i++) {
        const hourStart = new Date(now);
        hourStart.setHours(now.getHours() - i, 0, 0, 0);
        const hourEnd = new Date(hourStart);
        hourEnd.setHours(hourStart.getHours() + 1);
        
        const count = recentConversations.filter(conv => 
          conv.createdAt >= hourStart && conv.createdAt < hourEnd
        ).length;
        
        hourlyActivity.push({
          hour: hourStart.getHours(),
          count
        });
      }

      const analytics = {
        totalConversations,
        activeConversations,
        conversionRate: Math.round(conversionRate * 10) / 10,
        totalSales,
        avgResponseTime: Math.round(avgResponseTime / 100) / 10, // Convert to seconds
        satisfactionScore: 94, // TODO: Implement real satisfaction scoring
        platformDistribution,
        hourlyActivity: hourlyActivity.reverse()
      };

      return NextResponse.json(analytics);
    } catch (error) {
      console.error('[AI_ANALYTICS] Error:', error);
      return NextResponse.json(
        { error: "Failed to fetch analytics" },
        { status: 500 }
      );
    }
  }
);