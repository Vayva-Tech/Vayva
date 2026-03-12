import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI, APIContext } from "@/lib/api-handler";
import { prisma } from "@vayva/db";
import { PERMISSIONS } from "@/lib/team/permissions";
import { logger, standardHeaders, NotFoundError } from "@vayva/shared";

export const dynamic = "force-dynamic";

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  if (typeof error === "string") return error;
  if (typeof error === "object" && error !== null && "message" in error) {
    const msg = (error as { message?: unknown }).message;
    if (typeof msg === "string") return msg;
  }
  return String(error);
}

/**
 * Rule 43.6: Serve files safely via an authenticated route.
 * evidence (private) - download only.
 */
export const GET = withVayvaAPI(
  PERMISSIONS.SUPPORT_VIEW,
  async (req: NextRequest, ctx: APIContext) => {
    const { id: disputeId, fileId } = await ctx.params;

    if (!disputeId || !fileId) {
      throw new NotFoundError("Dispute or File ID not found");
    }

    // 1. Verify dispute ownership and evidence existence
    const evidence = await prisma.disputeEvidence.findFirst({
      where: {
        id: fileId,
        disputeId,
        dispute: {
          storeId: ctx.storeId,
        },
      },
      include: {
        upload: true,
      },
    });

    if (!evidence || !evidence.upload) {
      throw new NotFoundError("Evidence not found");
    }

    // 2. Fetch the blob from storage behind auth
    const publicBaseUrl = process.env.MINIO_PUBLIC_BASE_URL;
    const blobUrl =
      evidence.url ||
      (publicBaseUrl
        ? `${publicBaseUrl.replace(/\/$/, "")}/${evidence.upload.key}`
        : null);

    if (!blobUrl) {
      throw new Error("Storage is not configured for evidence downloads");
    }

    try {
      const blobResponse = await fetch(blobUrl);
      if (!blobResponse.ok) {
        throw new Error("Failed to fetch file from storage");
      }

      const blob = await blobResponse.blob();
      const filename = evidence.upload.originalName || `evidence-${fileId}.pdf`;

      // Rule 43.1 D & 43.6: Safe headers
      return new NextResponse(blob, {
        status: 200,
        headers: {
          ...standardHeaders(ctx.correlationId),
          "Content-Disposition": `attachment; filename="${filename}"`,
          "Content-Type": evidence.upload.detectedMime || "application/pdf",
          "X-Content-Type-Options": "nosniff",
          "Cache-Control": "no-store",
        },
      });
    } catch (err: unknown) {
      logger.error("[EVIDENCE_DOWNLOAD_ERROR]", {
        error: getErrorMessage(err),
        requestId: ctx.correlationId,
        disputeId,
        fileId,
      });
      throw new Error("Failed to download evidence");
    }
  },
  { requiredPermission: PERMISSIONS.SUPPORT_VIEW },
);
