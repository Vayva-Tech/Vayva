import { prisma } from "@vayva/db";

export class JobWrapper {
  static async execute(
    jobName: string,
    storeId: string | null,
    fn: () => Promise<void>,
    options: { maxAttempts?: number; attempt?: number } = {},
  ): Promise<void> {
    const { maxAttempts = 10, attempt = 1 } = options;
    const correlationId = `${jobName}-${Date.now()}`;
    const startedAt = new Date();

    // Create job run
    const jobRun = await prisma.jobRun.create({
      data: {
        jobName,
        storeId,
        correlationId,
        attempt,
        status: "RUNNING",
      },
    });

    try {
      await fn();

      // Mark as completed
      const completedAt = new Date();
      await prisma.jobRun.update({
        where: { id: jobRun.id },
        data: {
          status: "COMPLETED",
          completedAt,
          duration: completedAt.getTime() - startedAt.getTime(),
        },
      });
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      const errorType = JobWrapper.classifyError(err);
      const completedAt = new Date();

      await prisma.jobRun.update({
        where: { id: jobRun.id },
        data: {
          status: "FAILED",
          errorType,
          errorMessage: err.message,
          completedAt,
          duration: completedAt.getTime() - startedAt.getTime(),
        },
      });

      // If max attempts exhausted, send to DLQ
      if (attempt >= maxAttempts) {
        await prisma.deadLetterQueue.create({
          data: {
            storeId,
            jobType: jobName,
            payload: {},
            lastError: err.message,
            status: "DEAD",
          },
        });
      }

      throw error;
    }
  }

  static classifyError(error: unknown): "transient" | "permanent" {
    const err = error as Record<string, unknown>;
    const response = err?.response as Record<string, unknown> | undefined;
    const status = typeof response?.status === "number" ? response.status : 0;
    // Network timeouts, 429, 5xx = transient
    if (err?.code === "ETIMEDOUT" || err?.code === "ECONNRESET")
      return "transient";
    if (status === 429 || status >= 500)
      return "transient";

    // Invalid credentials, 4xx = permanent
    if (status >= 400 && status < 500)
      return "permanent";

    return "transient";
  }

  static calculateBackoff(attempt: number): number {
    // Exponential backoff with jitter: 1m, 2m, 5m, 10m, 30m, 1h, 2h
    const baseDelays = [60, 120, 300, 600, 1800, 3600, 7200]; // seconds
    const delay = baseDelays[Math.min(attempt - 1, baseDelays.length - 1)];
    const jitter = Math.random() * 0.3 * delay; // +/- 30% jitter
    return (delay + jitter) * 1000; // milliseconds
  }
}
