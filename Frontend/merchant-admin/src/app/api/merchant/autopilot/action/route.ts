import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handler(req: NextRequest, context: any) {
  const storeId = context?.storeId;
  const correlationId = context?.correlationId;

  try {
    const body = await req.json().catch(() => ({}));
    const { runId, action } = body;

    if (!runId || !action || !["approve", "dismiss"].includes(action)) {
      return NextResponse.json(
        { error: "runId and action (approve|dismiss) are required", requestId: correlationId },
        { status: 400, headers: standardHeaders(correlationId) }
      );
    }

    const run = await prisma.autopilotRun.findFirst({
      where: { id: runId, storeId },
    });

    if (!run) {
      return NextResponse.json(
        { error: "Autopilot run not found", requestId: correlationId },
        { status: 404, headers: standardHeaders(correlationId) }
      );
    }

    if (run.status !== "PROPOSED") {
      return NextResponse.json(
        { error: `Cannot ${action} a run with status ${run.status}`, requestId: correlationId },
        { status: 409, headers: standardHeaders(correlationId) }
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
      { headers: standardHeaders(correlationId) }
    );
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: unknown) {
    logger.error("[AutopilotAction] Failed", {
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
