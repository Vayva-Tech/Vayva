/**
 * Worker Job Reliability System
 * 
 * Implements dead letter queue, retry tracking, and alerting for failed jobs
 */

import { Job } from "bullmq";
import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";

interface FailedJob {
  jobId: string;
  jobName: string;
  queueName: string;
  reason: string;
  stack?: string;
  data: Record<string, unknown>;
  attemptsMade: number;
  failedAt: Date;
}

/**
 * Track a failed job for analysis and retry
 */
export async function trackFailedJob(job: Job, error: Error): Promise<void> {
  const failedJob: FailedJob = {
    jobId: job.id || "unknown",
    jobName: job.name,
    queueName: job.queueName,
    reason: error.message,
    stack: error.stack,
    data: job.data,
    attemptsMade: job.attemptsMade,
    failedAt: new Date(),
  };

  // Store in failed jobs table
  try {
    await prisma.failedJob.create({
      data: {
        jobId: failedJob.jobId,
        jobName: failedJob.jobName,
        queueName: failedJob.queueName,
        reason: failedJob.reason,
        stack: failedJob.stack,
        data: JSON.stringify(failedJob.data),
        attemptsMade: failedJob.attemptsMade,
        status: "FAILED",
      },
    });
  } catch (err) {
    logger.warn("Failed to store failed job", { jobId: failedJob.jobId, error: err });
  }

  // Alert if critical
  if (isCriticalJob(job.name) || job.attemptsMade >= 3) {
    await alertFailedJob(failedJob);
  }

  logger.error("Job failed", {
    jobId: failedJob.jobId,
    jobName: failedJob.jobName,
    error: failedJob.reason,
  });
}

/**
 * Check if a job is critical and needs immediate attention
 */
function isCriticalJob(jobName: string): boolean {
  const criticalJobs = [
    "processPayment",
    "payout",
    "sendEmail",
    "processRefund",
    "databaseBackup",
  ];
  return criticalJobs.includes(jobName);
}

/**
 * Send alert about failed job to ops team
 */
async function alertFailedJob(failedJob: FailedJob): Promise<void> {
  // Create notification for ops dashboard
  await prisma.notificationOutbox.create({
    data: {
      type: "JOB_FAILED_ALERT",
      channel: "EMAIL",
      to: "ops@vayva.ng",
      payload: JSON.stringify({
        subject: `Critical Job Failed: ${failedJob.jobName}`,
        body: `Job ${failedJob.jobName} (ID: ${failedJob.jobId}) has failed ${failedJob.attemptsMade} times.\n\nError: ${failedJob.reason}`,
      }),
      storeId: "system",
      status: "QUEUED",
    },
  });
}

/**
 * Retry a failed job manually
 */
export async function retryFailedJob(failedJobId: string): Promise<boolean> {
  try {
    const failedJob = await prisma.failedJob.findUnique({
      where: { id: failedJobId },
    });

    if (!failedJob || failedJob.status !== "FAILED") {
      return false;
    }

    // Re-queue the job with same data
    const { Queue } = await import("bullmq");
    const queue = new Queue(failedJob.queueName);

    await queue.add(failedJob.jobName, JSON.parse(failedJob.data), {
      attempts: 5,
      backoff: { type: "exponential", delay: 5000 },
    });

    // Update status
    await prisma.failedJob.update({
      where: { id: failedJobId },
      data: { status: "RETRIED", retriedAt: new Date() },
    });

    return true;
  } catch (error) {
    logger.error("Failed to retry job", { failedJobId, error });
    return false;
  }
}

/**
 * Cleanup old failed jobs
 */
export async function cleanupOldFailedJobs(days: number = 30): Promise<number> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  try {
    const result = await prisma.failedJob.deleteMany({
      where: {
        status: { in: ["RESOLVED", "RETRIED"] },
        updatedAt: { lt: cutoff },
      },
    });
    return result.count;
  } catch {
    return 0;
  }
}

/**
 * Get failed jobs summary for ops dashboard
 */
export async function getFailedJobsSummary(limit: number = 50): Promise<{
  totalFailed: number;
  byQueue: Record<string, number>;
  byJobType: Record<string, number>;
  recentCritical: Array<{
    id: string;
    jobName: string;
    reason: string;
    failedAt: Date;
  }>;
}> {
  const failedJobs = await prisma.failedJob.findMany({
    where: { status: "FAILED" },
    orderBy: { failedAt: "desc" },
    take: limit,
  });

  const byQueue: Record<string, number> = {};
  const byJobType: Record<string, number> = {};

  for (const job of failedJobs) {
    byQueue[job.queueName] = (byQueue[job.queueName] || 0) + 1;
    byJobType[job.jobName] = (byJobType[job.jobName] || 0) + 1;
  }

  const totalFailed = await prisma.failedJob.count({ where: { status: "FAILED" } });

  return {
    totalFailed,
    byQueue,
    byJobType,
    recentCritical: failedJobs.slice(0, 5).map((j) => ({
      id: j.id,
      jobName: j.jobName,
      reason: j.reason.slice(0, 100) || 'Unknown',
      failedAt: j.failedAt,
    })),
  };
}

/**
 * Schedule backup job for critical data
 */
export async function scheduleBackupJob<T>(
  originalJobData: T,
  jobName: string,
  queueName: string,
  delayMs: number
): Promise<void> {
  const { Queue } = await import("bullmq");
  const backupQueue = new Queue("backup-jobs");

  await backupQueue.add(
    `${jobName}_backup`,
    {
      originalData: originalJobData,
      originalJobName: jobName,
      originalQueue: queueName,
      scheduledAt: new Date().toISOString(),
    },
    {
      delay: delayMs,
      attempts: 3,
      backoff: { type: "fixed", delay: 10000 },
    }
  );
}

/**
 * Job wrapper with automatic reliability features
 */
export function withReliability<T>(
  jobName: string,
  handler: (data: T) => Promise<void>,
  options: { backupAfter?: number; critical?: boolean } = {}
): (job: Job<T>) => Promise<void> {
  return async (job: Job<T>) => {
    try {
      await handler(job.data);

      // Clean up any previous failure records on success
      try {
        await prisma.failedJob.deleteMany({
          where: {
            jobId: job.id,
            jobName,
          },
        });
      } catch {
        // Ignore cleanup errors
      }

      // Schedule backup if configured
      if (options.backupAfter) {
        await scheduleBackupJob(job.data, jobName, job.queueName, options.backupAfter);
      }
    } catch (error) {
      await trackFailedJob(job, error as Error);

      // Re-throw for BullMQ retry handling
      throw error;
    }
  };
}

/**
 * Health check for job queues
 */
export async function checkQueueHealth(): Promise<{
  healthy: boolean;
  issues: string[];
  stats: Record<string, { waiting: number; active: number; failed: number }>;
}> {
  const issues: string[] = [];
  const stats: Record<string, { waiting: number; active: number; failed: number }> = {};

  const queues = ["main", "email", "backup-jobs", "analytics"];

  for (const queueName of queues) {
    try {
      const { Queue } = await import("bullmq");
      const queue = new Queue(queueName);

      const [waiting, active, failed] = await Promise.all([
        queue.getWaitingCount(),
        queue.getActiveCount(),
        queue.getFailedCount(),
      ]);

      stats[queueName] = { waiting, active, failed };

      if (failed > 10) {
        issues.push(`${queueName} has ${failed} failed jobs`);
      }

      if (waiting > 100) {
        issues.push(`${queueName} has ${waiting} waiting jobs (possible backlog)`);
      }

      await queue.close();
    } catch (error) {
      issues.push(`Failed to check ${queueName}: ${(error as Error).message}`);
    }
  }

  return {
    healthy: issues.length === 0,
    issues,
    stats,
  };
}
