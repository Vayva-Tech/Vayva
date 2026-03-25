import { NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

export const POST = withVayvaAPI(
  PERMISSIONS.INTEGRATIONS_MANAGE,
  async (req, { storeId, correlationId }) => {
    try {
      const parsedBody: unknown = await req.json().catch(() => ({}));
      const body = isRecord(parsedBody) ? parsedBody : {};
      const extensionId = getString(body.extensionId);

      if (!extensionId || typeof extensionId !== "string") {
        return NextResponse.json(
          { error: "extensionId is required", requestId: correlationId },
          { status: 400, headers: standardHeaders(correlationId) },
        );
      }

      const addOn = await prisma.storeAddOn.findUnique({
        where: {
          storeId_extensionId: { storeId, extensionId },
        },
      });

      if (!addOn) {
        return NextResponse.json(
          {
            error: "No add-on found for this extension",
            requestId: correlationId,
          },
          { status: 404, headers: standardHeaders(correlationId) },
        );
      }

      // Re-enable auto-renew
      const updated = await prisma.storeAddOn.update({
        where: { id: addOn.id },
        data: {
          autoRenew: true,
          cancelledAt: null,
        },
      });

      logger.info("Add-on auto-renew re-enabled", {
        storeId,
        extensionId,
        addOnId: addOn.id,
        requestId: correlationId,
      });

      return NextResponse.json(
        {
          addOn: {
            id: updated.id,
            extensionId: updated.extensionId,
            status: updated.status,
            autoRenew: updated.autoRenew,
            currentPeriodEnd: updated.currentPeriodEnd,
          },
          message: "Add-on will auto-renew at the end of the current period.",
          requestId: correlationId,
        },
        { headers: standardHeaders(correlationId) },
      );
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const errStack = error instanceof Error ? error.stack : undefined;
      logger.error("Failed to renew add-on", {
        error: errMsg,
        stack: errStack,
        requestId: correlationId,
        storeId,
      });
      return NextResponse.json(
        { error: "Internal server error", requestId: correlationId },
        { status: 500, headers: standardHeaders(correlationId) },
      );
    }
  },
);
