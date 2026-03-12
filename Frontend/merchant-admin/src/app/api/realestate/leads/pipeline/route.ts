import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// GET /api/realestate/leads/pipeline - Get lead pipeline statistics
export const GET = withVayvaAPI(
  PERMISSIONS.DASHBOARD_VIEW,
  async (req: NextRequest, { storeId }: { storeId: string }) => {
    try {
      const { searchParams } = new URL(req.url);
      const agentId = searchParams.get("agentId");
      const type = searchParams.get("type"); // buyer, seller, both

      const where: any = { merchantId: storeId };
      
      if (agentId) where.agentId = agentId;
      if (type) where.type = type;

      // Get leads grouped by status
      const leadsByStatus = await prisma.realEstateLead.groupBy({
        by: ['status'],
        where,
        _count: true,
        _sum: {
          budgetMax: true
        }
      });

      // Get detailed breakdown for each stage
      const pipelineStages = [
        'new',
        'contacted',
        'qualified',
        'showing_scheduled',
        'offer_made',
        'under_contract',
        'converted'
      ];

      const detailedPipeline = await Promise.all(
        pipelineStages.map(async (stage) => {
          const stageLeads = await prisma.realEstateLead.findMany({
            where: {
              ...where,
              status: stage
            },
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              phone: true,
              type: true,
              budgetMin: true,
              budgetMax: true,
              preferredLocations: true,
              propertyTypes: true,
              bedrooms: true,
              bathrooms: true,
              timeline: true,
              preApproved: true,
              createdAt: true,
              scores: {
                orderBy: { calculatedAt: 'desc' },
                take: 1
              },
              activities: {
                orderBy: { createdAt: 'desc' },
                take: 1
              }
            },
            orderBy: { createdAt: 'desc' },
            take: 50
          });

          return {
            stage,
            count: stageLeads.length,
            leads: stageLeads,
            totalBudget: stageLeads.reduce((sum, lead) => sum + (lead.budgetMax || 0), 0),
            avgBudget: stageLeads.length > 0 
              ? stageLeads.reduce((sum, lead) => sum + (lead.budgetMax || 0), 0) / stageLeads.length 
              : 0
          };
        })
      );

      // Calculate conversion metrics
      const totalLeads = leadsByStatus.reduce((sum, stage) => sum + stage._count, 0);
      const convertedLeads = leadsByStatus.find(s => s.status === 'converted')?._count || 0;
      const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

      // Get recent activity stats
      const last7Days = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const newLeadsLast7Days = await prisma.realEstateLead.count({
        where: {
          ...where,
          createdAt: { gte: last7Days }
        }
      });

      const contactedLast7Days = await prisma.leadActivity.count({
        where: {
          lead: { merchantId: storeId },
          activityType: { in: ['call', 'email'] },
          completedAt: { gte: last7Days }
        }
      });

      // Build response
      const pipelineData = leadsByStatus.reduce((acc, stage) => {
        acc[stage.status] = {
          count: stage._count,
          percentage: totalLeads > 0 ? (stage._count / totalLeads) * 100 : 0
        };
        return acc;
      }, {} as Record<string, { count: number; percentage: number }>);

      return NextResponse.json({
        success: true,
        data: {
          summary: {
            totalLeads,
            convertedLeads,
            conversionRate,
            newLeadsLast7Days,
            contactedLast7Days
          },
          byStatus: pipelineData,
          detailedPipeline,
          stages: pipelineStages
        }
      });
    } catch (error: unknown) {
      logger.error("[LEAD_PIPELINE_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to fetch lead pipeline" },
        { status: 500 }
      );
    }
  }
);
