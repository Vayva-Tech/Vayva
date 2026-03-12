import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

// POST /api/realestate/leads/[id]/convert - Convert a lead to client
export const POST = withVayvaAPI(
  PERMISSIONS.DASHBOARD_EDIT,
  async (req: NextRequest, { storeId, params }: { storeId: string; params: Promise<{ id: string }> }) => {
    try {
      const { id } = await params;
      const body = await req.json();
      const {
        propertyId,
        contractType,
        agentId,
        notes
      } = body;

      // Get the lead
      const lead = await prisma.realEstateLead.findUnique({
        where: { id, merchantId: storeId },
        include: {
          scores: {
            orderBy: { calculatedAt: 'desc' },
            take: 1
          },
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 5
          }
        }
      });

      if (!lead) {
        return NextResponse.json(
          { success: false, error: "Lead not found" },
          { status: 404 }
        );
      }

      if (lead.status === 'converted') {
        return NextResponse.json(
          { success: false, error: "Lead is already converted" },
          { status: 400 }
        );
      }

      // Create conversion activity record
      await prisma.leadActivity.create({
        data: {
          leadId: id,
          activityType: 'note',
          subject: 'Lead Converted',
          description: `Lead successfully converted to client. ${notes || ''}`,
          outcome: 'converted',
          completedAt: new Date()
        }
      });

      // Update lead status
      const updatedLead = await prisma.realEstateLead.update({
        where: { id, merchantId: storeId },
        data: {
          status: 'converted',
          notes: notes ? `${lead.notes || ''}\n\nConversion Notes: ${notes}` : lead.notes,
          updatedAt: new Date()
        },
        include: {
          scores: true,
          activities: {
            orderBy: { createdAt: 'desc' },
            take: 10
          }
        }
      });

      // If propertyId provided, create a transaction/opportunity record
      let opportunity = null;
      if (propertyId) {
        // This would typically create a Deal or Transaction record
        // For now, we'll just log it
        logger.info("[LEAD_CONVERTED]", {
          leadId: id,
          propertyId,
          contractType,
          agentId,
          storeId
        });
      }

      // Calculate final lead score if not already done
      const currentScore = updatedLead.scores[0];
      if (currentScore && currentScore.score < 80) {
        // Update score to reflect conversion
        await prisma.leadScore.create({
          data: {
            leadId: id,
            score: 95,
            factors: {
              converted: true,
              previousEngagement: currentScore.factors
            }
          }
        });
      }

      return NextResponse.json({
        success: true,
        data: {
          lead: updatedLead,
          message: "Lead successfully converted to client"
        },
        opportunity
      });
    } catch (error: unknown) {
      logger.error("[LEAD_CONVERT_ERROR]", { 
        error: error instanceof Error ? error.message : String(error),
        storeId 
      });
      return NextResponse.json(
        { success: false, error: "Failed to convert lead" },
        { status: 500 }
      );
    }
  }
);
