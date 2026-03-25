import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import { evaluateAutopilot } from "@/services/autopilot-engine";
import { getAiPackage } from "@/lib/ai/ai-packages";
import { AICreditService } from "@/lib/ai/credit-service";

const BATCH_SIZE = Math.min(
  100,
  Math.max(1, Number(process.env.AUTOPILOT_CRON_MAX_STORES || 40) || 40),
);

const MAX_BATCHES = Math.min(
  20,
  Math.max(1, Number(process.env.AUTOPILOT_CRON_MAX_BATCHES || 5) || 5),
);

/**
 * GET/POST /api/jobs/cron/autopilot-evaluate
 * Runs Autopilot evaluation for stores with active vayva.autopilot add-on.
 * Vercel Cron invokes GET with Authorization: Bearer CRON_SECRET.
 *
 * Pagination: processes BATCH_SIZE stores per batch, up to MAX_BATCHES batches
 * per invocation (cursor = last storeId). Optional ?cursor=<storeId> to continue.
 * Response includes nextCursor when more stores may remain.
 */
async function handleAutopilotCron(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const cronSecret = process.env.CRON_SECRET || "";
  // Match other crons (e.g. trial-reminders): require bearer only in production.
  if (
    process.env.NODE_ENV === "production" &&
    (!cronSecret || authHeader !== `Bearer ${cronSecret}`)
  ) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let cursor = req.nextUrl.searchParams.get("cursor") || null;

  try {
    const results: Array<{
      storeId: string;
      rulesEvaluated: number;
      runsCreated: number;
      errorCount: number;
    }> = [];

    let batchesRun = 0;
    let lastBatchLength = 0;

    while (batchesRun < MAX_BATCHES) {
      const addOns = await prisma.storeAddOn.findMany({
        where: {
          extensionId: "vayva.autopilot",
          status: "ACTIVE",
          ...(cursor ? { storeId: { gt: cursor } } : {}),
        },
        select: { storeId: true },
        orderBy: { storeId: "asc" },
        take: BATCH_SIZE,
      });

      if (addOns.length === 0) break;

      const storeIds = addOns.map((a) => a.storeId);
      lastBatchLength = storeIds.length;
      cursor = storeIds[storeIds.length - 1] ?? cursor;

      for (const storeId of storeIds) {
        // Enforce plan packaging + cap autopilot runs/month
        const sub = await prisma.merchantAiSubscription
          .findUnique({ where: { storeId }, select: { planKey: true } })
          .catch(() => null);
        const pkg = getAiPackage(sub?.planKey);
        if (pkg.includedAutopilotRunsPerMonth <= 0) {
          continue;
        }

        const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
        const runsThisMonth = await prisma.aiUsageEvent
          .count({
            where: {
              storeId,
              model: "VAYVA_AUTOPILOT_EVAL",
              createdAt: { gte: monthStart },
              success: true,
            },
          })
          .catch(() => 0);
        if (runsThisMonth >= pkg.includedAutopilotRunsPerMonth) {
          continue;
        }

        // Deduct message budget for this run
        const debit = Math.max(1, pkg.autopilotRunMessageCost);
        const debitResult = await AICreditService.deductCredits(storeId, debit, {
          requestId: `autopilot-cron-${storeId}-${Date.now()}`,
          skipInsufficientCheck: false,
        });
        if (!debitResult.success || debitResult.blocked) {
          continue;
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
              success: true,
              requestId: `autopilot-cron-ledger-${storeId}-${Date.now()}`,
            },
          })
          .catch(() => null);

        const r = await evaluateAutopilot(storeId);
        results.push({
          storeId,
          rulesEvaluated: r.rulesEvaluated,
          runsCreated: r.runsCreated,
          errorCount: r.errors.length,
        });
      }

      batchesRun += 1;
      if (addOns.length < BATCH_SIZE) break;
    }

    const totalRuns = results.reduce((s, x) => s + x.runsCreated, 0);

    let hasMore =
      lastBatchLength === BATCH_SIZE &&
      batchesRun >= MAX_BATCHES &&
      cursor !== null;
    if (hasMore && cursor) {
      const another = await prisma.storeAddOn.findFirst({
        where: {
          extensionId: "vayva.autopilot",
          status: "ACTIVE",
          storeId: { gt: cursor },
        },
        select: { id: true },
      });
      hasMore = Boolean(another);
    }

    logger.info("[AutopilotCron] Batch complete", {
      stores: results.length,
      batchesRun,
      totalRuns,
      hasMore,
    });

    return NextResponse.json({
      success: true,
      storesProcessed: results.length,
      batchesRun,
      totalRunsCreated: totalRuns,
      nextCursor: hasMore && cursor ? cursor : null,
      hasMore,
      results,
    });
  } catch (error: unknown) {
    const msg = error instanceof Error ? error.message : String(error);
    logger.error("[AutopilotCron] Failed", { error: msg });
    return NextResponse.json(
      { error: "Failed to run autopilot batch" },
      { status: 500 },
    );
  }
}

export const GET = handleAutopilotCron;
export const POST = handleAutopilotCron;
