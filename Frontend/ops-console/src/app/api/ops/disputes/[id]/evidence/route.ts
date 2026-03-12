import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { OpsAuthContext, withOpsAuth } from "@/lib/withOpsAuth";
import { logger } from "@vayva/shared";

/**
 * POST /api/ops/disputes/[id]/evidence
 * Submit evidence for a dispute
 */
export const POST = withOpsAuth(
  async (req: NextRequest, { user }: OpsAuthContext) => {
    try {
      if (!user) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
      }
      // Get dispute ID from URL
      const url = new URL(req.url);
      const pathParts = url.pathname.split("/");
      const disputeId = pathParts[pathParts.indexOf("disputes") + 1];

      const body = await req.json();
      const { notes } = body;

      if (!disputeId) {
        return NextResponse.json(
          { error: "Dispute ID is required" },
          { status: 400 }
        );
      }

      // Check if dispute exists
      const dispute = await prisma.dispute?.findUnique({
        where: { id: disputeId },
      });

      if (!dispute) {
        return NextResponse.json(
          { error: "Dispute not found" },
          { status: 404 }
        );
      }

      // Update dispute status to UNDER_REVIEW
      await prisma.dispute?.update({
        where: { id: disputeId },
        data: {
          status: "UNDER_REVIEW",
          updatedAt: new Date(),
        },
      });

      // Log the evidence submission
      await prisma.opsAuditEvent?.create({
        data: {
          eventType: "OPS_DISPUTE_EVIDENCE_SUBMITTED",
          opsUserId: user.id,
          metadata: {
            disputeId,
            submittedBy: user.email,
            notes: notes || null,
          },
        },
      });

      logger.info("[DISPUTE_EVIDENCE_SUBMITTED]", {
        userId: user.id,
        disputeId,
      });

      return NextResponse.json({
        success: true,
        message: "Evidence submitted successfully",
        dispute: {
          id: disputeId,
          status: "UNDER_REVIEW",
        },
      });
    } catch (error) {
      logger.error("[DISPUTE_EVIDENCE_ERROR]", { error });
      return NextResponse.json(
        { error: "Failed to submit evidence" },
        { status: 500 }
      );
    }
  },
  { requiredPermission: { category: "orders", action: "update" } }
);
