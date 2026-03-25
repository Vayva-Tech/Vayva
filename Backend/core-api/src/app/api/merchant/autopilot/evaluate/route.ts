import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { evaluateAutopilot } from "@/services/autopilot-engine";
import { getAiPackage } from "@/lib/ai/ai-packages";
import { AICreditService } from "@/lib/ai/credit-service";

function getHeaders(correlationId: string | undefined) {
  return standardHeaders(correlationId ?? "");
}

function startOfMonth(d = new Date()): Date {
  return new Date(d.getFullYear(), d.getMonth(), 1);
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
        storeId_extensionId: {
          storeId,
          extensionId: "vayva.autopilot",
        },
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

    // Enforce Autopilot packaging limits (plan + monthly run caps + message cost)
    const sub = await prisma.merchantAiSubscription.findUnique({
      where: { storeId },
      select: { planKey: true, status: true },
    });
    const pkg = getAiPackage(sub?.planKey);
    if (pkg.includedAutopilotRunsPerMonth <= 0) {
      return NextResponse.json(
        {
          error: "Autopilot is available on Pro and above.",
          requestId: correlationId,
        },
        { status: 403, headers: getHeaders(correlationId) },
      );
    }

    const monthStart = startOfMonth();
    const runsThisMonth = await prisma.aiUsageEvent.count({
      where: {
        storeId,
        model: "VAYVA_AUTOPILOT_EVAL",
        createdAt: { gte: monthStart },
        success: true,
      },
    });
    if (runsThisMonth >= pkg.includedAutopilotRunsPerMonth) {
      return NextResponse.json(
        {
          error: "Autopilot run limit reached for this month.",
          requestId: correlationId,
          usage: {
            runsThisMonth,
            runsLimit: pkg.includedAutopilotRunsPerMonth,
          },
        },
        { status: 402, headers: getHeaders(correlationId) },
      );
    }

    // Deduct message quota up-front (1 run = N messages)
    const debit = Math.max(1, pkg.autopilotRunMessageCost);
    const debitResult = await AICreditService.deductCredits(storeId, debit, {
      requestId: `autopilot-eval-${correlationId || Date.now()}`,
      skipInsufficientCheck: false,
    });
    if (!debitResult.success || debitResult.blocked) {
      return NextResponse.json(
        {
          error:
            "Monthly AI message limit reached. Buy an extra message pack to continue.",
          requestId: correlationId,
        },
        { status: 402, headers: getHeaders(correlationId) },
      );
    }

    await prisma.aiUsageEvent
      .create({
        data: {
          storeId,
          channel: "INAPP",
          model: "VAYVA_AUTOPILOT_EVAL",
          inputTokens: 0,
          outputTokens: 0,
          toolCallsCount: 0,
          costEstimateKobo: BigInt(0),
          creditsUsed: debit,
          success: true,
          requestId: `autopilot-eval-ledger-${correlationId || Date.now()}`,
        },
      })
      .catch(() => null);

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
