import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/permissions";
import { prisma } from "@vayva/data";

/**
 * GET /api/ai/conversations
 * Get recent AI conversations with analytics
 */
export const GET = withVayvaAPI(
  PERMISSIONS.AI_VIEW,
  async (req: NextRequest, { storeId }) => {
    try {
      // Get recent conversations (last 24 hours)
      const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      
      const conversations = await prisma.aIConversation.findMany({
        where: {
          storeId,
          createdAt: {
            gte: twentyFourHoursAgo
          }
        },
        orderBy: {
          createdAt: 'desc'
        },
        take: 50
      });

      // Transform for frontend
      const transformed = conversations.map(conv => ({
        id: conv.id,
        customerName: conv.customerName || 'Anonymous',
        platform: conv.platform || 'unknown',
        status: conv.status as 'active' | 'completed' | 'failed',
        duration: Math.floor((conv.updatedAt.getTime() - conv.createdAt.getTime()) / 1000),
        messages: conv.messageCount || 0,
        saleValue: conv.saleValue ? Number(conv.saleValue) : undefined,
        timestamp: conv.createdAt.toISOString()
      }));

      return NextResponse.json(transformed);
    } catch (error) {
      console.error('[AI_CONVERSATIONS] Error:', error);
      return NextResponse.json(
        { error: "Failed to fetch conversations" },
        { status: 500 }
      );
    }
  }
);