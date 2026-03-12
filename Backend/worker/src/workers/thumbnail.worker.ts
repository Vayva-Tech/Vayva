import { Worker } from "bullmq";
import { QUEUES, logger } from "@vayva/shared";
import { generateThumbnail } from "../jobs/generateThumbnail";
import type { RedisConnection, ThumbnailJobData } from "../types";

export function registerThumbnailWorker(connection: RedisConnection): void {
  new Worker<ThumbnailJobData>(
    QUEUES.THUMBNAIL_GENERATION,
    async (job) => {
      const { storeId, url, deploymentId, templateProjectId } = job.data;
      try {
        await generateThumbnail({
          storeId,
          url,
          deploymentId,
          templateProjectId,
        });
      } catch (error: unknown) {
        const err = error instanceof Error ? error : new Error(String(error));
        logger.error("Thumbnail generation job failed", {
          storeId,
          url,
          error: err.message,
          jobId: job.id,
          app: "worker",
        });
        throw error;
      }
    },
    { connection },
  );

  logger.info("Registered thumbnail worker", {
    queue: QUEUES.THUMBNAIL_GENERATION,
    app: "worker",
  });
}
