/**
 * Centralized error reporting utility.
 * Use this instead of console.error to ensure errors are captured by monitoring (e.g. Sentry).
 */
export function reportError(error: unknown, context?: Record<string, unknown>) {
  // In the future, this is where Sentry.captureException goes.
  // Sentry.captureException(error, { extra: context });

  // For now, robust logging to stdout
  console.error("[Runtime Error]", {
    timestamp: new Date().toISOString(),
    error:
      error instanceof Error
        ? {
            name: error.name,
            message: error.message,
            stack: error.stack,
          }
        : error,
    context,
  });
}
