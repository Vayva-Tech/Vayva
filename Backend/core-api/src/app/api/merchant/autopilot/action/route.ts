import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

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
    const updated = await prisma.autopilotRun.update({
      where: { id: runId },
      data:
        action === "approve"
          ? { status: "APPROVED", approvedAt: now }
          : { status: "DISMISSED", dismissedAt: now },
    });

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
