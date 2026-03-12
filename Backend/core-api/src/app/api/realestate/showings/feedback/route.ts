/**
 * Showing Feedback API Route
 * GET /api/realestate/showings/feedback - Get showing feedback
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET Showing Feedback
export const GET = withVayvaAPI(
  PERMISSIONS.ORDERS_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const limit = parseInt(searchParams.get("limit") || "50");
      const offset = parseInt(searchParams.get("offset") || "0");
      const showingId = searchParams.get("showingId");
      const propertyId = searchParams.get("propertyId");
      const agentId = searchParams.get("agentId");

      const feedbacks = await prisma.showingFeedback.findMany({
        where: {
          showing: {
            merchantId: storeId,
            ...(showingId ? { id: showingId } : {}),
            ...(propertyId ? { propertyId } : {}),
            ...(agentId ? { agentId } : {}),
          },
        },
        include: {
          showing: {
            include: {
              property: {
                select: {
                  id: true,
                  title: true,
                  address: true,
                },
              },
            },
          },
        },
        orderBy: { submittedAt: "desc" },
        take: limit,
        skip: offset,
      });

      const total = await prisma.showingFeedback.count({
        where: {
          showing: {
            merchantId: storeId,
            ...(showingId ? { id: showingId } : {}),
            ...(propertyId ? { propertyId } : {}),
            ...(agentId ? { agentId } : {}),
          },
        },
      });

      // Calculate feedback statistics
      const feedbackStats = {
        totalFeedback: total,
        averageRating: feedbacks.length > 0 
          ? feedbacks.reduce((sum, fb) => sum + (fb.rating || 0), 0) / feedbacks.filter(fb => fb.rating).length
          : 0,
        sentimentBreakdown: {
          positive: feedbacks.filter(fb => fb.sentiment === "positive").length,
          neutral: feedbacks.filter(fb => fb.sentiment === "neutral").length,
          negative: feedbacks.filter(fb => fb.sentiment === "negative").length,
        },
        interestLevels: {
          high: feedbacks.filter(fb => fb.interestLevel === "high").length,
          medium: feedbacks.filter(fb => fb.interestLevel === "medium").length,
          low: feedbacks.filter(fb => fb.interestLevel === "low").length,
        },
        followUpRequested: feedbacks.filter(fb => fb.followUpRequested).length,
      };

      return NextResponse.json({
        success: true,
        data: feedbacks,
        meta: { 
          total, 
          limit, 
          offset,
          stats: feedbackStats
        },
      });
    } catch (error: unknown) {
      logger.error("[SHOWING_FEEDBACK_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);