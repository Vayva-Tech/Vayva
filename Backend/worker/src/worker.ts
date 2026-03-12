import * as dotenv from "dotenv";
dotenv.config();

import "./env";
import { Queue } from "bullmq";
import { logger, QUEUES } from "@vayva/shared";
import { getRedis } from "@vayva/redis";

import { registerMaintenanceWorker } from "./workers/maintenance.worker";
import { registerWhatsAppInboundWorker } from "./workers/whatsapp-inbound.worker";
import { registerWhatsAppOutboundWorker } from "./workers/whatsapp-outbound.worker";
import { registerAgentActionsWorker } from "./workers/agent-actions.worker";
import { registerDeliveryWorker } from "./workers/delivery.worker";
import { registerPaymentsWorker } from "./workers/payments.worker";
import { registerReconciliationWorker } from "./workers/reconciliation.worker";
import { registerThumbnailWorker } from "./workers/thumbnail.worker";
import { registerChinaSyncWorker } from "./workers/china-sync.worker";

async function start(): Promise<void> {
  logger.info("Starting workers...", { app: "worker" });

  const connection = await getRedis();

  // Schedule nightly maintenance (gated)
  if (process.env.WORKER_ENABLE_MAINTENANCE_CLEANUP === "true") {
    const maintenanceQueue = new Queue(QUEUES.MAINTENANCE_CLEANUP, {
      connection,
    });
    await maintenanceQueue.add(
      "nightly",
      {},
      {
        repeat: { pattern: "0 2 * * *" },
        removeOnComplete: true,
        removeOnFail: false,
      },
    );
  }

  // Register all workers
  registerMaintenanceWorker(connection);
  registerWhatsAppInboundWorker(connection);
  registerWhatsAppOutboundWorker(connection);
  registerAgentActionsWorker(connection);
  registerDeliveryWorker(connection);
  registerPaymentsWorker(connection);
  registerReconciliationWorker(connection);
  registerThumbnailWorker(connection);
  registerChinaSyncWorker(connection);

  logger.info("All workers registered successfully", { app: "worker" });
}

start().catch((err: unknown) => {
  const error = err instanceof Error ? err : new Error(String(err));
  logger.error("Worker failed to start", {
    error: error.message,
    stack: error.stack,
    app: "worker",
  });
  process.exit(1);
});
