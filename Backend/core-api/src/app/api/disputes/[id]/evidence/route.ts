import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { prisma } from "@vayva/db";
import { PERMISSIONS } from "@/lib/team/permissions";
import {
  standardHeaders,
  BadRequestError,
  NotFoundError,
  logger,
  BaseError
} from "@vayva/shared";

export const dynamic = "force-dynamic";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.SUPPORT_MANAGE,
  async (req, { storeId, params, user, correlationId }) => {
    const { id: disputeId } = await params;
    try {
      if (!disputeId) {
        throw new BadRequestError("Dispute ID required");
      }

      const dispute = await prisma.dispute.findFirst({
        where: { id: disputeId, storeId },
        select: { id: true, status: true },
      });

      if (!dispute) {
        throw new NotFoundError("Dispute not found");
      }

      if (
        ![
          "OPENED",
          "EVIDENCE_REQUIRED",
          "SUBMITTED",
          "EVIDENCE_SUBMITTED",
        ].includes(String(dispute.status))
      ) {
        throw new BadRequestError(
          "Dispute does not accept evidence in its current status",
        );
      }

      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const text = getString(body.text);
      const fileUrl = getString(body.fileUrl);

      if (!text?.trim() && !fileUrl) {
        throw new BadRequestError("Evidence text or file is required");
      }

      if (text?.trim()) {
        await prisma.disputeEvidence.create({
          data: {
            disputeId,
            type: "OTHER",
            textExcerpt: text.trim(),
            metadata: {
              mime: "text/plain",
              size: text.trim().length,
            },
          },
        });
      }

      // Note: files are now handled via the /api/uploads flow and linked in /api/uploads/finalize
      // This endpoint now primarily handles the textual part and finalizes the dispute state.

      await prisma.dispute.updateMany({
        where: { id: disputeId, storeId },
        data: {
          status: "EVIDENCE_SUBMITTED",
          updatedAt: new Date(),
          evidenceDueAt: null,
        },
      });

      // 42.8 & 45.5: Enqueue notification and log event
      await prisma.auditLog
        .create({
          data: {
            app: "merchant",
            action: "DISPUTE_EVIDENCE_SUBMITTED",
            targetType: "order", // Dispute is linked to order
            targetId: disputeId,
            targetStoreId: storeId,
            actorUserId: user.id,
            actorEmail: user.email,
            requestId: correlationId,
            metadata: {
              hasText: !!text?.trim(),
              hasFile: !!fileUrl,
            },
          },
        })
        .catch(() => {});

      await prisma.emailOutbox
        .create({
          data: {
            type: "DISPUTE_EVIDENCE_SUBMITTED",
            toEmail: "ops@vayva.app",
            subject: `Dispute Evidence Submitted - ${disputeId}`,
            dedupeKey: `dispute_evidence_${disputeId}_${Date.now()}`,
            payload: {
              disputeId,
              storeId,
              hasFile: !!fileUrl,
            },
            status: "PENDING",
          },
        })
        .catch(() => {});

      return NextResponse.json(
        { success: true, message: "Evidence submitted and status updated" },
        { headers: standardHeaders(correlationId) },
      );
    } catch (error: unknown) {
      if (error instanceof BaseError) throw error;
      logger.error("Failed to submit dispute evidence", {
        error: error instanceof Error ? error.message : "Unknown error",
        disputeId,
        requestId: correlationId,
      });
      throw error;
    }
  },
);
