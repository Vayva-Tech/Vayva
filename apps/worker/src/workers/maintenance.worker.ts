import { Worker } from "bullmq";
import { prisma } from "@vayva/db";
import { QUEUES, logger } from "@vayva/shared";
import { drainEmailOutbox } from "../jobs/drainEmailOutbox";
import { drainNotificationOutbox } from "../jobs/drainNotificationOutbox";
import type { RedisConnection, MaintenanceJobData } from "../types";

function computeCutoff(days: number): Date {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return cutoff;
}

export function registerMaintenanceWorker(connection: RedisConnection): void {
  new Worker<MaintenanceJobData>(
    QUEUES.MAINTENANCE_CLEANUP,
    async () => {
      const sessionCutoff = computeCutoff(30);
      const auditCutoff = computeCutoff(365);

      await prisma.userSession.deleteMany({
        where: { lastSeenAt: { lt: sessionCutoff } },
      });

      await prisma.auditLog.deleteMany({
        where: { createdAt: { lt: auditCutoff } },
      });

      await drainEmailOutbox().catch((err) =>
        logger.error("drainEmailOutbox failed", { error: err.message, app: "worker" }),
      );
      await drainNotificationOutbox().catch((err) =>
        logger.error("drainNotificationOutbox failed", { error: err.message, app: "worker" }),
      );

      return {
        ok: true,
        sessionCutoff: sessionCutoff.toISOString(),
        auditCutoff: auditCutoff.toISOString(),
      };
    },
    { 
      connection,
      concurrency: 1,
      lockDuration: 30000,
      stalledInterval: 30000,
      maxStalledCount: 2,
    },
  );

  logger.info("Registered maintenance worker", { queue: QUEUES.MAINTENANCE_CLEANUP, app: "worker" });
}
