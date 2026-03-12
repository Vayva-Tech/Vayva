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
        where: { storeId_addOnId: { storeId, addOnId: extensionId } },
      });

      if (!addOn || addOn.status !== "ACTIVE") {
        return NextResponse.json(
          {
            error: "No active add-on found for this extension",
            requestId: correlationId,
          },
          { status: 404, headers: standardHeaders(correlationId) },
        );
      }

      // Cancel auto-renew — add-on stays active until currentPeriodEnd
      const updated = await prisma.storeAddOn.update({
        where: { id: addOn.id },
        data: {
          autoRenew: false,
          cancelledAt: new Date(),
        },
      });

      logger.info("Add-on auto-renew cancelled", {
        storeId,
        extensionId,
        addOnId: addOn.id,
        expiresAt: updated.currentPeriodEnd,
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
            cancelledAt: updated.cancelledAt,
          },
          message: updated.currentPeriodEnd
            ? `Add-on will remain active until ${updated.currentPeriodEnd.toISOString().split("T")[0]}. It will not renew.`
            : "Add-on auto-renew has been cancelled.",
          requestId: correlationId,
        },
        { headers: standardHeaders(correlationId) },
      );
    } catch (error: unknown) {
      const errMsg = error instanceof Error ? error.message : String(error);
      const errStack = error instanceof Error ? error.stack : undefined;
      logger.error("Failed to cancel add-on", {
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
