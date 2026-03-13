/**
 * Agent Performance API Route
 * GET /api/realestate/agents/[id]/performance - Get agent performance metrics
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET Agent Performance
export const GET = withVayvaAPI(
  PERMISSIONS.TEAM_VIEW,
  async (request, { storeId, params }) => {
    try {
      const { id: agentId } = await params;
      
      if (!agentId) {
        return NextResponse.json(
          { error: "Agent ID required" },
          { status: 400 }
        );
      }

      const { searchParams } = new URL(request.url);
      const timeframe = searchParams.get("timeframe") || "90d"; // 30d, 90d, 1y

      // Calculate date range
      const now = new Date();
      const startDate = new Date();
      
      if (timeframe === "30d") startDate.setDate(now.getDate() - 30);
      else if (timeframe === "90d") startDate.setDate(now.getDate() - 90);
      else if (timeframe === "1y") startDate.setFullYear(now.getFullYear() - 1);

      // Get lead statistics
      const leadStats = await prisma.realEstateLead.groupBy({
        by: ["status"],
        where: {
          merchantId: storeId,
          agentId,
          createdAt: {
            gte: startDate,
          },
        },
        _count: { id: true }
      });

      // Get conversion data
      const conversions = await prisma.leadConversion.findMany({
        where: {
          merchantId: storeId,
          convertedBy: agentId,
          convertedAt: {
            gte: startDate,
          },
        },
        select: {
          conversionType: true,
          saleAmount: true,
          convertedAt: true,
        }
      });

      // Get commission data
      const commissions = await prisma.commission.findMany({
        where: {
          merchantId: storeId,
          agentId,
          earnedAt: {
            gte: startDate,
          },
        },
        select: {
          commissionAmount: true,
          status: true,
          earnedAt: true,
        }
      });

      // Get showing data
      const showings = await prisma.propertyShowing.findMany({
        where: {
          merchantId: storeId,
          agentId,
          createdAt: {
            gte: startDate,
          },
        },
        select: {
          status: true,
          scheduledAt: true,
          feedback: {
            select: {
              rating: true,
              interestLevel: true,
            }
          }
        }
      });

      // Calculate performance metrics
      const totalLeads = leadStats.reduce((sum, stat) => sum + stat._count.id, 0);
      const convertedLeads = leadStats.find(s => s.status === "converted")?._count.id || 0;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;
      
      const totalSales = conversions.filter(c => c.conversionType === "sale").length;
      const totalSalesValue = conversions
        .filter(c => c.conversionType === "sale" && c.saleAmount)
        .reduce((sum, c) => sum + c.saleAmount!, 0);
      
      const avgSaleValue = totalSales > 0 ? totalSalesValue / totalSales : 0;
      
      const earnedCommissions = commissions
        .filter(c => c.status === "paid")
        .reduce((sum, c) => sum + c.commissionAmount, 0);
      
      const pendingCommissions = commissions
        .filter(c => c.status === "pending")
        .reduce((sum, c) => sum + c.commissionAmount, 0);

      // Calculate showing effectiveness
      const completedShowings = showings.filter(s => s.status === "completed").length;
      const showingFeedback = showings
        .filter(s => s.feedback)
        .map(s => s.feedback!);
      
      const avgShowingRating = showingFeedback.length > 0 
        ? showingFeedback.reduce((sum, f) => sum + (f.rating || 0), 0) / showingFeedback.filter(f => f.rating).length
        : 0;
      
      const highInterestShowings = showingFeedback.filter(f => f.interestLevel === "high").length;

      // Get monthly trend data
      const monthlyPerformance = await prisma.leadConversion.groupBy({
        by: [`${prisma.leadConversion.fields.convertedAt.getMonth()}`, `${prisma.leadConversion.fields.convertedAt.getFullYear()}`],
        where: {
          merchantId: storeId,
          convertedBy: agentId,
          convertedAt: {
            gte: startDate,
          },
        },
        _count: { id: true },
        _sum: { saleAmount: true }
      });

      return NextResponse.json({
        success: true,
        data: {
          agentId,
          timeframe,
          metrics: {
            leadGeneration: {
              totalLeads,
              newLeads: leadStats.find(s => s.status === "new")?._count.id || 0,
              qualifiedLeads: leadStats.find(s => s.status === "qualified")?._count.id || 0,
            },
            conversion: {
              convertedLeads,
              conversionRate: conversionRate.toFixed(1),
              totalSales,
              totalSalesValue,
              avgSaleValue: avgSaleValue.toFixed(2),
            },
            commissions: {
              earned: earnedCommissions,
              pending: pendingCommissions,
              total: earnedCommissions + pendingCommissions,
            },
            showings: {
              total: showings.length,
              completed: completedShowings,
              avgRating: avgShowingRating.toFixed(1),
              highInterestRate: completedShowings > 0 
                ? ((highInterestShowings / completedShowings) * 100).toFixed(1)
                : "0",
            }
          },
          trends: monthlyPerformance.map(item => ({
            month: `${item[1]}/${item[0]}`, // year/month format
            conversions: item._count.id,
            salesValue: item._sum.saleAmount || 0
          })),
          rankings: {
            conversionRate: conversionRate, // TODO: Compare against team average
            salesVolume: totalSalesValue, // TODO: Compare against team average
            clientSatisfaction: avgShowingRating, // TODO: Compare against team average
          }
        },
      });
    } catch (error: unknown) {
      logger.error("[AGENT_PERFORMANCE_GET]", error, { storeId, agentId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);