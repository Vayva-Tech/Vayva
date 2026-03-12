/**
 * Convert Lead API Route
 * POST /api/realestate/leads/[id]/convert - Convert lead to customer/sale
 */

import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@/lib/db";
import { logger } from "@/lib/logger";

// POST Convert Lead
export const POST = withVayvaAPI(
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
        conversionType, // "sale", "appointment", "listing"
        propertyId,
        saleAmount,
        closingDate,
        notes,
        nextSteps,
      } = body;

      // Verify lead exists
      const lead = await prisma.realEstateLead.findFirst({
        where: {
          id: leadId,
          merchantId: storeId,
        },
      });

      if (!lead) {
        return NextResponse.json(
          { error: "Lead not found" },
          { status: 404 }
        );
      }

      // Update lead status to converted
      const updatedLead = await prisma.realEstateLead.update({
        where: { id: leadId },
        data: {
          status: "converted",
          updatedAt: new Date(),
        },
      });

      // Create conversion activity
      await prisma.leadActivity.create({
        data: {
          leadId,
          activityType: "conversion",
          subject: `Lead converted to ${conversionType}`,
          description: notes || `Converted via ${conversionType}`,
          outcome: "successful",
          completedAt: new Date(),
        },
      });

      // Create conversion record
      const conversion = await prisma.leadConversion.create({
        data: {
          leadId,
          merchantId: storeId,
          conversionType,
          propertyId,
          saleAmount: saleAmount ? parseFloat(saleAmount.toString()) : undefined,
          closingDate: closingDate ? new Date(closingDate) : undefined,
          notes,
          convertedAt: new Date(),
          convertedBy: updatedLead.agentId || "system",
        },
      });

      // If it's a sale, create commission record
      if (conversionType === "sale" && saleAmount) {
        const commissionAmount = saleAmount * 0.03; // 3% standard commission
        await prisma.commission.create({
          data: {
            merchantId: storeId,
            agentId: updatedLead.agentId || "system",
            leadId,
            propertyId,
            saleAmount: parseFloat(saleAmount.toString()),
            commissionRate: 0.03,
            commissionAmount,
            status: "pending",
            earnedAt: new Date(),
          },
        });
      }

      // Update lead score to 100 for successful conversion
      await prisma.leadScore.create({
        data: {
          leadId,
          score: 100,
          factors: {
            conversion_success: 100,
            timeline_met: 90,
            budget_alignment: 85,
          },
        },
      });

      return NextResponse.json({
        success: true,
        message: "Lead successfully converted",
        data: {
          lead: updatedLead,
          conversion,
          nextSteps: nextSteps || [
            "Schedule follow-up meeting",
            "Prepare closing documents",
            "Coordinate with legal team",
            "Process commission payment"
          ]
        },
      });
    } catch (error: unknown) {
      logger.error("[LEAD_CONVERT_POST]", error, { storeId, leadId: params.id });
      return NextResponse.json(
        { error: error instanceof Error ? error.message : "Internal Error" },
        { status: 500 }
      );
    }
  }
);