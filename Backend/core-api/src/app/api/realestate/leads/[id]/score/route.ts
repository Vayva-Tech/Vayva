/**
 * Lead Scoring API Route
 * POST /api/realestate/leads/[id]/score - Score a lead
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// POST Score Lead
export const POST = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (request, { storeId, params }) => {
    try {
      const { id } = params;

      // Get lead with activities
      const lead = await prisma.realEstateLead.findFirst({
        where: {
          id,
          merchantId: storeId,
        },
        include: {
          activities: true,
        },
      });

      if (!lead) {
        return NextResponse.json(
          { error: "Lead not found" },
          { status: 404 }
        );
      }

      // Calculate score (simplified - would integrate with @vayva/industry-realestate)
      const score = calculateLeadScore(lead, lead.activities);

      // Save score to database
      const savedScore = await prisma.leadScore.create({
        data: {
          leadId: id,
          overallScore: score.overallScore,
          temperature: score.temperature,
          priority: score.priority,
          conversionProbability: score.conversionProbability,
          factors: JSON.stringify(score.factors),
          aiInsights: score.aiInsights,
          aiRecommendations: score.aiRecommendations || [],
          estimatedValue: score.estimatedValue,
          estimatedCloseDate: score.estimatedCloseDate,
        },
      });

      return NextResponse.json({
        success: true,
        data: savedScore,
      });
    } catch (error: unknown) {
      logger.error("[LEAD_SCORE_POST]", error, { storeId, leadId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// Simplified scoring function
function calculateLeadScore(lead: any, activities: any[]) {
  let score = 50;
  
  // Pre-approval bonus
  if (lead.preApproved) score += 20;
  
  // Activity bonus
  score += Math.min(activities.length * 5, 20);
  
  // Budget specified bonus
  if (lead.budgetMin || lead.budgetMax) score += 10;

  const temperature = score >= 75 ? "hot" : score >= 50 ? "warm" : score >= 25 ? "cold" : "frozen";
  const priority = score >= 85 ? "urgent" : score >= 70 ? "high" : score >= 40 ? "medium" : "low";

  return {
    overallScore: score,
    temperature,
    priority,
    conversionProbability: score / 100,
    factors: [],
    aiInsights: null,
    aiRecommendations: null,
    estimatedValue: lead.budgetMax || lead.preApprovalAmount,
    estimatedCloseDate: null,
  };
}
