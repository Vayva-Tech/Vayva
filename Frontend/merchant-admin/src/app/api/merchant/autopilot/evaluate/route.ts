import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { evaluateAutopilot } from "@/services/autopilot-engine";
import { checkRateLimit, checkRateLimitCustom, RateLimitError } from "@/lib/rate-limit";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handler(req: NextRequest, context: any) {
  const storeId = context?.storeId;
  const userId = context?.user?.id;
  const correlationId = context?.correlationId;

  if (!storeId) {
    return NextResponse.json(
      { error: "Unauthorized", requestId: correlationId },
      { status: 401, headers: standardHeaders(correlationId) }
    );
  }

  try {
    // Rate limit: 1 evaluation per hour per store
    await checkRateLimitCustom(storeId, "autopilot-evaluate", 1, 3600);

    // Check if autopilot add-on is active
    const addOn = await prisma.storeAddOn.findFirst({
      where: { storeId, extensionId: "vayva.autopilot" },
    });

    if (!addOn || addOn.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "Autopilot add-on is not active. Subscribe from the Billing page.", requestId: correlationId },
        { status: 403, headers: standardHeaders(correlationId) }
      );
    }

    const result = await evaluateAutopilot(storeId);

    logger.info("[AutopilotEvaluate] Completed", {
      storeId,
      ...result,
      requestId: correlationId,
    });

    return NextResponse.json(
      { ...result, requestId: correlationId },
      { status: 200, headers: standardHeaders(correlationId) }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
    if (error instanceof RateLimitError) {
      return NextResponse.json(
        { error: error.message, requestId: correlationId },
        { status: 429, headers: standardHeaders(correlationId) }
      );
    }
    logger.error("[AutopilotEvaluate] Failed", {
      error: error instanceof Error ? error.message : String(error),
      storeId,
      requestId: correlationId,
    });
    return NextResponse.json(
      { error: "Internal server error", requestId: correlationId },
      { status: 500, headers: standardHeaders(correlationId) }
    );
  }
}

export const POST = withVayvaAPI(PERMISSIONS.DASHBOARD_VIEW, handler);
