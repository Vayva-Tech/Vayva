import { Worker } from "bullmq";
import { QUEUES, logger } from "@vayva/shared";
import type { RedisConnection, ChinaSyncJobData } from "../types";

export function registerChinaSyncWorker(connection: RedisConnection): void {
  new Worker<ChinaSyncJobData>(
    QUEUES.CHINA_CATALOG_SYNC,
    async () => {
      try {
        const { ChinaSyncService } = await import("@vayva/shared/china-sync-service");
        await ChinaSyncService.syncAllSuppliers();
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("[SYNC] Failed", { error: err.message, stack: err.stack, app: "worker" });
        throw error;
      }
    },
    { 
      connection,
      concurrency: 3,
      lockDuration: 30000,
      stalledInterval: 30000,
      maxStalledCount: 2,
    },
  );

  logger.info("Registered China catalog sync worker", { queue: QUEUES.CHINA_CATALOG_SYNC, app: "worker" });
}
