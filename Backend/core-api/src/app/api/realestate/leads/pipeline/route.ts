/**
 * Lead Pipeline API Route
 * GET /api/realestate/leads/pipeline - Get lead pipeline overview
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET Lead Pipeline
export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (request, { storeId }) => {
    try {
      const { searchParams } = new URL(request.url);
      const agentId = searchParams.get("agentId");
      const timeframe = searchParams.get("timeframe") || "30d"; // 7d, 30d, 90d

      // Calculate date range
      const now = new Date();
      let startDate = new Date();
      
      if (timeframe === "7d") startDate.setDate(now.getDate() - 7);
      else if (timeframe === "30d") startDate.setDate(now.getDate() - 30);
      else if (timeframe === "90d") startDate.setDate(now.getDate() - 90);

      // Get pipeline data grouped by status
      const pipelineData = await prisma.realEstateLead.groupBy({
        by: ["status"],
        where: {
          merchantId: storeId,
          ...(agentId ? { agentId } : {}),
          createdAt: {
            gte: startDate,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
      });

      // Get conversion rates
      const totalLeads = pipelineData.reduce((sum, item) => sum + item._count.id, 0);
      const convertedLeads = pipelineData.find(item => item.status === "converted")?._count.id || 0;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      // Get lead sources breakdown
      const sourceBreakdown = await prisma.realEstateLead.groupBy({
        by: ["source"],
        where: {
          merchantId: storeId,
          createdAt: {
            gte: startDate,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
      });

      // Get lead types breakdown
      const typeBreakdown = await prisma.realEstateLead.groupBy({
        by: ["type"],
        where: {
          merchantId: storeId,
          createdAt: {
            gte: startDate,
          },
        },
        _count: {
          id: true,
        },
      });

      // Get recent activities
      const recentActivities = await prisma.leadActivity.findMany({
        where: {
          lead: {
            merchantId: storeId,
            ...(agentId ? { agentId } : {}),
          },
          createdAt: {
            gte: startDate,
          },
        },
        include: {
          lead: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              status: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
        take: 20,
      });

      // Get top performing agents
      const agentPerformance = await prisma.realEstateLead.groupBy({
        by: ["agentId"],
        where: {
          merchantId: storeId,
          status: "converted",
          createdAt: {
            gte: startDate,
          },
        },
        _count: {
          id: true,
        },
        orderBy: {
          _count: {
            id: "desc",
          },
        },
        take: 5,
      });

      // Get average lead score trend
      const scoreTrend = await prisma.leadScore.findMany({
        where: {
          lead: {
            merchantId: storeId,
            ...(agentId ? { agentId } : {}),
          },
          calculatedAt: {
            gte: startDate,
          },
        },
        select: {
          score: true,
          calculatedAt: true,
        },
        orderBy: {
          calculatedAt: "asc",
        },
      });

      return NextResponse.json({
        success: true,
        data: {
          pipeline: pipelineData.map(item => ({
            status: item.status,
            count: item._count.id,
            percentage: totalLeads > 0 ? (item._count.id / totalLeads) * 100 : 0,
          })),
          metrics: {
            totalLeads,
            convertedLeads,
            conversionRate: conversionRate.toFixed(1),
            averageLeadScore: scoreTrend.length > 0 
              ? (scoreTrend.reduce((sum, s) => sum + s.score, 0) / scoreTrend.length).toFixed(1)
              : "0",
          },
          breakdowns: {
            bySource: sourceBreakdown,
            byType: typeBreakdown,
          },
          recentActivities,
          topAgents: agentPerformance,
          scoreTrend: scoreTrend.map(s => ({
            date: s.calculatedAt.toISOString().split("T")[0],
            score: s.score,
          })),
        },
        meta: {
          timeframe,
          startDate: startDate.toISOString(),
          endDate: now.toISOString(),
        },
      });
    } catch (error: unknown) {
      logger.error("[LEAD_PIPELINE_GET]", error, { storeId });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);