import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

export const POST = withVayvaAPI(PERMISSIONS.INTEGRATIONS_MANAGE, async (req: NextRequest, { storeId, correlationId }: { storeId: string; correlationId: string }) => {
  try {
    const body = await req.json().catch(() => ({}));
    const { extensionId } = body;

    if (!extensionId || typeof extensionId !== "string") {
      return NextResponse.json(
        { error: "extensionId is required", requestId: correlationId },
        { status: 400, headers: standardHeaders(correlationId) }
      );
    }

    const addOn = await prisma.storeAddOn?.findFirst({
      where: { storeId, extensionId },
    });

    if (!addOn || addOn.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "No active add-on found for this extension", requestId: correlationId },
        { status: 404, headers: standardHeaders(correlationId) }
      );
    }

    // Cancel auto-renew — add-on stays active until currentPeriodEnd
    const updated = await prisma.storeAddOn?.update({
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
          status: (updated as any).status,
          autoRenew: updated.autoRenew,
          currentPeriodEnd: updated.currentPeriodEnd,
          cancelledAt: updated.cancelledAt,
        },
        message: `Add-on will remain active until ${updated?.currentPeriodEnd?.toISOString().split("T")[0]}. It will not renew.`,
        requestId: correlationId,
      },
      { headers: standardHeaders(correlationId) }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
    logger.error("Failed to cancel add-on", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      requestId: correlationId,
      storeId,
    });
    return NextResponse.json(
      { error: "Internal server error", requestId: correlationId },
      { status: 500, headers: standardHeaders(correlationId) }
    );
  }
});
