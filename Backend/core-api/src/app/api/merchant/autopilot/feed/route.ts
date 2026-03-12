import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma, Prisma, type AutopilotStatus } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

const VALID_AUTOPILOT_STATUSES = new Set<string>([
  "PROPOSED",
  "APPROVED",
  "COMPLETED",
  "FAILED",
  "DISMISSED",
]);

type APIContext = {
  storeId?: string;
  correlationId?: string;
};

function getHeaders(correlationId: string | undefined) {
  return standardHeaders(correlationId ?? "");
}

function getErrorMessage(error: unknown): string {
  if (error instanceof Error) return error.message;
  return String(error);
}

async function handler(req: NextRequest, context: APIContext) {
  const storeId = context?.storeId;
  const correlationId = context?.correlationId;

  if (!storeId) {
    return NextResponse.json(
      { error: "Unauthorized", requestId: correlationId },
      { status: 401, headers: getHeaders(correlationId) },
    );
  }

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;
    const limit = Math.min(Number(url.searchParams.get("limit") || 20), 50);
    const offset = Number(url.searchParams.get("offset") || 0);

    const where: Prisma.AutopilotRunWhereInput = { storeId };
    if (status) {
      const upper = status.toUpperCase();
      if (VALID_AUTOPILOT_STATUSES.has(upper)) {
        where.status = upper as AutopilotStatus;
      }
    }

    const [runs, total, pendingCount] = await Promise.all([
      prisma.autopilotRun.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip: offset,
      }),
      prisma.autopilotRun.count({ where }),
      prisma.autopilotRun.count({
        where: { storeId, status: "PROPOSED" },
      }),
    ]);

    return NextResponse.json(
      {
        runs: runs.map((r) => ({
          id: r.id,
          ruleSlug: r.ruleSlug,
          category: r.category,
          status: r.status,
          title: r.title,
          summary: r.summary,
          reasoning: r.reasoning,
          createdAt: r.createdAt,
          approvedAt: r.approvedAt,
          dismissedAt: r.dismissedAt,
        })),
        total,
        pendingCount,
        requestId: correlationId,
      },
      { headers: getHeaders(correlationId) },
    );
  } catch (error: unknown) {
    logger.error("[AutopilotFeed] Failed", {
      error: getErrorMessage(error),
      storeId,
      requestId: correlationId,
    });
    return NextResponse.json(
      { error: "Internal server error", requestId: correlationId },
      { status: 500, headers: getHeaders(correlationId) },
    );
  }
}

export const GET = withVayvaAPI(PERMISSIONS.DASHBOARD_VIEW, handler);
