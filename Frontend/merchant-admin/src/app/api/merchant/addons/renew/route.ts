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

    if (!addOn) {
      return NextResponse.json(
        { error: "No add-on found for this extension", requestId: correlationId },
        { status: 404, headers: standardHeaders(correlationId) }
      );
    }

    // Re-enable auto-renew
    const updated = await prisma.storeAddOn?.update({
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
          status: (updated as any).status,
          autoRenew: updated.autoRenew,
          currentPeriodEnd: updated.currentPeriodEnd,
        },
        message: "Add-on will auto-renew at the end of the current period.",
        requestId: correlationId,
      },
      { headers: standardHeaders(correlationId) }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
    logger.error("Failed to renew add-on", {
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
