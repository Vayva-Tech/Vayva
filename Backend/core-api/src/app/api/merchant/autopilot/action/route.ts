import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";
import { fireAutopilotApprovedWebhook } from "@/lib/autopilot-webhooks";

function getHeaders(correlationId: string | undefined) {
  return standardHeaders(correlationId ?? "");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
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
    const parsedBody: unknown = await req.json().catch(() => ({}));
    const body = isRecord(parsedBody) ? parsedBody : {};
    const runId = getString(body.runId);
    const action = getString(body.action);

    if (!runId || !action || !["approve", "dismiss"].includes(action)) {
      return NextResponse.json(
        {
          error: "runId and action (approve|dismiss) are required",
          requestId: correlationId,
        },
        { status: 400, headers: getHeaders(correlationId) },
      );
    }

    const run = await prisma.autopilotRun.findFirst({
      where: { id: runId, storeId },
    });

    if (!run) {
      return NextResponse.json(
        { error: "Autopilot run not found", requestId: correlationId },
        { status: 404, headers: getHeaders(correlationId) },
      );
    }

    if (run.status !== "PROPOSED") {
      return NextResponse.json(
        {
          error: `Cannot ${action} a run with status ${run.status}`,
          requestId: correlationId,
        },
        { status: 409, headers: getHeaders(correlationId) },
      );
    }

    const now = new Date();

    let updateResult: { count: number };
    let automationWebhookDispatched: boolean | undefined;

    if (action === "dismiss") {
      updateResult = await prisma.autopilotRun.updateMany({
        where: { id: runId, storeId },
        data: { status: "DISMISSED", dismissedAt: now },
      });
    } else {
      const store = await prisma.store.findUnique({
        where: { id: storeId },
        select: { settings: true },
      });

      const webhookSent = fireAutopilotApprovedWebhook(
        storeId,
        store?.settings,
        {
          runId: run.id,
          ruleSlug: run.ruleSlug,
          category: run.category,
          title: run.title,
          summary: run.summary,
          reasoning: run.reasoning,
          input: run.input,
        },
      );

      automationWebhookDispatched = webhookSent;

      updateResult = await prisma.autopilotRun.updateMany({
        where: { id: runId, storeId },
        data: {
          status: "APPROVED",
          approvedAt: now,
          output: {
            automationWebhookDispatched: webhookSent,
          } as Prisma.InputJsonValue,
          ...(webhookSent ? { executedAt: now } : {}),
        },
      });
    }

    if (updateResult.count === 0) {
      return NextResponse.json(
        { error: "Autopilot run not found", requestId: correlationId },
        { status: 404, headers: getHeaders(correlationId) },
      );
    }

    const updated = await prisma.autopilotRun.findFirst({
      where: { id: runId, storeId },
    });

    if (!updated) {
      return NextResponse.json(
        { error: "Autopilot run not found", requestId: correlationId },
        { status: 404, headers: getHeaders(correlationId) },
      );
    }

    logger.info(`[AutopilotAction] Run ${action}d`, {
      storeId,
      runId,
      ruleSlug: run.ruleSlug,
      requestId: correlationId,
    });

    return NextResponse.json(
      {
        run: {
          id: updated.id,
          status: updated.status,
          approvedAt: updated.approvedAt,
          dismissedAt: updated.dismissedAt,
          executedAt: updated.executedAt,
          ...(automationWebhookDispatched !== undefined && {
            automationWebhookDispatched,
          }),
        },
        requestId: correlationId,
      },
      { headers: getHeaders(correlationId) },
    );
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    const _errStack = error instanceof Error ? error.stack : undefined;
    logger.error("[AutopilotAction] Failed", {
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
