import { Job, Worker } from "bullmq";
import { QUEUES } from "@vayva/shared";
import { logger } from "../lib/logger";

export const calendarSyncWorker = new Worker(
  QUEUES.CALENDAR_SYNC_SCHEDULER,
  async (job: Job) => {
    logger.info("Running Calendar Sync Job (Disabled: Model Missing)", {
      jobId: job.id,
    });
    // Intentionally disabled until bookingCalendarSync model is restored.
  },
  {
    connection: {
      host: process.env.REDIS_HOST,
      port: Number(process.env.REDIS_PORT),
      password: process.env.REDIS_PASSWORD,
    },
  },
);
