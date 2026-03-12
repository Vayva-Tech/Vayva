/**
 * Individual Lead API Routes
 * GET /api/realestate/leads/[id] - Get lead details
 * PUT /api/realestate/leads/[id] - Update lead
 * DELETE /api/realestate/leads/[id] - Delete lead
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// GET Lead by ID
export const GET = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_VIEW,
  async (request, { storeId, params }) => {
    try {
      const { id: leadId } = await params;
      
      if (!leadId) {
        return NextResponse.json(
          { error: "Lead ID required" },
          { status: 400 }
        );
      }

      const lead = await prisma.realEstateLead.findFirst({
        where: {
          id: leadId,
          merchantId: storeId,
        },
        include: {
          scores: {
            orderBy: { calculatedAt: "desc" },
            take: 5,
          },
          activities: {
            orderBy: { createdAt: "desc" },
            take: 10,
          },
        },
      });

      if (!lead) {
        return NextResponse.json(
          { error: "Lead not found" },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: lead,
      });
    } catch (error: unknown) {
      logger.error("[LEAD_GET]", error, { storeId, leadId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// PUT Update Lead
export const PUT = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (request, { storeId, params }) => {
    try {
      const { id: leadId } = await params;
      
      if (!leadId) {
        return NextResponse.json(
          { error: "Lead ID required" },
          { status: 400 }
        );
      }

      const body = await request.json();
      const {
        firstName,
        lastName,
        email,
        phone,
        type,
        status,
        source,
        budgetMin,
        budgetMax,
        preferredLocations,
        propertyTypes,
        bedrooms,
        bathrooms,
        timeline,
        preApproved,
        preApprovalAmount,
        notes,
        tags,
        agentId,
      } = body;

      // Verify lead exists
      const existingLead = await prisma.realEstateLead.findFirst({
        where: {
          id: leadId,
          merchantId: storeId,
        },
      });

      if (!existingLead) {
        return NextResponse.json(
          { error: "Lead not found" },
          { status: 404 }
        );
      }

      const updatedLead = await prisma.realEstateLead.update({
        where: { id: leadId },
        data: {
          ...(firstName !== undefined && { firstName }),
          ...(lastName !== undefined && { lastName }),
          ...(email !== undefined && { email }),
          ...(phone !== undefined && { phone }),
          ...(type !== undefined && { type }),
          ...(status !== undefined && { status }),
          ...(source !== undefined && { source }),
          ...(budgetMin !== undefined && { budgetMin }),
          ...(budgetMax !== undefined && { budgetMax }),
          ...(preferredLocations !== undefined && { preferredLocations }),
          ...(propertyTypes !== undefined && { propertyTypes }),
          ...(bedrooms !== undefined && { bedrooms }),
          ...(bathrooms !== undefined && { bathrooms }),
          ...(timeline !== undefined && { timeline }),
          ...(preApproved !== undefined && { preApproved }),
          ...(preApprovalAmount !== undefined && { preApprovalAmount }),
          ...(notes !== undefined && { notes }),
          ...(tags !== undefined && { tags }),
          ...(agentId !== undefined && { agentId }),
          updatedAt: new Date(),
        },
      });

      // Recalculate lead score if relevant fields changed
      if (status || budgetMin || budgetMax || timeline) {
        const scoreFactors = {
          engagement: status === "converted" ? 100 : status === "qualified" ? 80 : status === "contacted" ? 60 : 30,
          budget_match: budgetMin && budgetMax ? 75 : 50,
          timeline: timeline === "urgent" ? 90 : timeline === "soon" ? 70 : 40,
        };
        
        const totalScore = Object.values(scoreFactors).reduce((sum, val) => sum + val, 0) / Object.keys(scoreFactors).length;
        
        await prisma.leadScore.create({
          data: {
            leadId,
            score: Math.round(totalScore),
            factors: scoreFactors,
          },
        });
      }

      return NextResponse.json({
        success: true,
        data: updatedLead,
      });
    } catch (error: unknown) {
      logger.error("[LEAD_PUT]", error, { storeId, leadId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);

// DELETE Lead
export const DELETE = withVayvaAPI(
  PERMISSIONS.CUSTOMERS_MANAGE,
  async (request, { storeId, params }) => {
    try {
      const { id: leadId } = await params;
      
      if (!leadId) {
        return NextResponse.json(
          { error: "Lead ID required" },
          { status: 400 }
        );
      }

      // Verify lead exists
      const existingLead = await prisma.realEstateLead.findFirst({
        where: {
          id: leadId,
          merchantId: storeId,
        },
      });

      if (!existingLead) {
        return NextResponse.json(
          { error: "Lead not found" },
          { status: 404 }
        );
      }

      // Soft delete by updating status
      const updatedLead = await prisma.realEstateLead.update({
        where: { id: leadId },
        data: {
          status: "lost",
          updatedAt: new Date(),
        },
      });

      return NextResponse.json({
        success: true,
        message: "Lead marked as lost",
        data: updatedLead,
      });
    } catch (error: unknown) {
      logger.error("[LEAD_DELETE]", error, { storeId, leadId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);