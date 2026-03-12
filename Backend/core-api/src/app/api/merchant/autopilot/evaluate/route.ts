import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { evaluateAutopilot } from "@/services/autopilot-engine";

function getHeaders(correlationId: string | undefined) {
  return standardHeaders(correlationId ?? "");
}

async function handler(
  req: NextRequest,
  context: { storeId?: string; correlationId?: string },
) {
  const storeId = context?.storeId;
  const correlationId = context?.correlationId;

  if (!storeId) {
    return NextResponse.json(
      { error: "Unauthorized", requestId: correlationId },
      { status: 401, headers: getHeaders(correlationId) },
    );
  }

  try {
    // Check if autopilot add-on is active
    const addOn = await prisma.storeAddOn.findUnique({
      where: {
        storeId_addOnId: { storeId, addOnId: "vayva.autopilot" },
      },
    });

    if (!addOn || addOn.status !== "ACTIVE") {
      return NextResponse.json(
        {
          error:
            "Autopilot add-on is not active. Subscribe from the Billing page.",
          requestId: correlationId,
        },
        { status: 403, headers: getHeaders(correlationId) },
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
      { status: 200, headers: getHeaders(correlationId) },
    );
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const _errStack = error instanceof Error ? error.stack : undefined;
    logger.error("[AutopilotEvaluate] Failed", {
      error: errMsg,
      storeId,
      requestId: correlationId,
    });
    return NextResponse.json(
      { error: "Internal server error", requestId: correlationId },
      { status: 500, headers: getHeaders(correlationId) },
    );
  }
}

export const POST = withVayvaAPI(PERMISSIONS.DASHBOARD_VIEW, handler);
