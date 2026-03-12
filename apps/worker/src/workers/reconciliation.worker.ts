import { Worker } from "bullmq";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import type { RedisConnection, ReconciliationJobData } from "../types";

const QUEUE_NAME = "reconciliation";

export function registerReconciliationWorker(connection: RedisConnection): void {
  new Worker<ReconciliationJobData>(
    QUEUE_NAME,
    async (job) => {
      const { storeId } = job.data;

      const [wallet, ledgerSummary] = await Promise.all([
        prisma.wallet.findUnique({ where: { storeId } }),
        prisma.ledgerEntry.aggregate({
          where: { storeId, account: "WALLET" },
          _sum: { amount: true },
        }),
      ]);

      if (!wallet) return;

      const ledgerSumKobo = BigInt(Math.round(Number(ledgerSummary._sum.amount || 0) * 100));
      const difference = wallet.availableKobo - ledgerSumKobo;

      if (difference !== 0n) {
        logger.error(`[RECON] BUG: Store ${storeId} has discrepancy!`, {
          storeId,
          walletBalance: wallet.availableKobo.toString(),
          ledgerSum: ledgerSumKobo.toString(),
          difference: difference.toString(),
          app: "worker",
        });

        await prisma.auditLog.create({
          data: {
            app: "worker",
            action: "FINANCIAL_DISCREPANCY_FOUND",
            targetType: "store",
            targetId: storeId,
            targetStoreId: storeId,
            severity: "HIGH",
            requestId: `recon-${storeId}-${Date.now()}`,
            metadata: {
              walletBalance: wallet.availableKobo.toString(),
              ledgerSum: ledgerSumKobo.toString(),
              difference: difference.toString(),
            },
          },
        });
      }
    },
    { 
      connection,
      concurrency: 2,
      lockDuration: 60000,
      stalledInterval: 60000,
      maxStalledCount: 2,
    },
  );

  logger.info("Registered reconciliation worker", { queue: QUEUE_NAME, app: "worker" });
}
