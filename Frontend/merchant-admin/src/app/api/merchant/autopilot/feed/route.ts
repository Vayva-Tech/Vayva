import { NextRequest, NextResponse } from "next/server";
import { withVayvaAPI } from "@/lib/api-handler";
import { PERMISSIONS } from "@/lib/team/permissions";
import { prisma } from "@vayva/db";
import { logger, standardHeaders } from "@vayva/shared";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function handler(req: NextRequest, context: any) {
  const storeId = context?.storeId;
  const correlationId = context?.correlationId;

  if (!storeId) {
    return NextResponse.json(
      { error: "Unauthorized", requestId: correlationId },
      { status: 401, headers: standardHeaders(correlationId) }
    );
  }

  try {
    const url = new URL(req.url);
    const status = url.searchParams.get("status") || undefined;
    const limit = Math.min(Number(url.searchParams.get("limit") || 20), 50);
    const offset = Number(url.searchParams.get("offset") || 0);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const where: Record<string, any> = { storeId };
    if (status) {
      where.status = status.toUpperCase();
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
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        runs: runs.map((r: any) => ({
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
      { headers: standardHeaders(correlationId) }
    );
    } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    logger.error("[AutopilotFeed] Failed", {
      error: errorMessage,
      storeId,
      requestId: correlationId,
    });
    return NextResponse.json(
      { error: "Internal server error", requestId: correlationId },
      { status: 500, headers: standardHeaders(correlationId) }
    );
  }
}

export const GET = withVayvaAPI(PERMISSIONS.DASHBOARD_VIEW, handler);
