/**
 * Sentry Error Tracking for Workers
 * 
 * Centralized error reporting for background workers, cron jobs, and email campaigns.
 * Integrates with Sentry when SENTRY_DSN is configured.
 */

import { logger } from "@vayva/shared";

// Lazy-loaded Sentry instance
let _Sentry: any = null;

/**
 * Initialize Sentry if DSN is configured
 */
function getSentry(): any {
  if (!_Sentry) {
    const dsn = process.env.SENTRY_DSN;
    if (dsn) {
      try {
        // Dynamic require to avoid build issues
        _Sentry = require("@sentry/node");
        _Sentry.init({
          dsn,
          environment: process.env.NODE_ENV || "production",
          tracesSampleRate: 0.1, // 10% sampling for performance monitoring
          integrations: [],
        });
        logger.info("[SENTRY] Initialized for workers", {
          dsnConfigured: !!dsn,
        });
      } catch (error) {
        logger.warn("[SENTRY] Failed to initialize", {
          error: error instanceof Error ? error.message : String(error),
        });
      }
    }
  }
  return _Sentry;
}

/**
 * Capture exception in Sentry
 * 
 * @param error - Error to capture
 * @param context - Additional context metadata
 */
export function captureException(
  error: unknown,
  context?: Record<string, unknown>
): void {
  const sentry = getSentry();
  
  if (!sentry) {
    // Fallback to logger if Sentry not available
    logger.error("[WORKER_ERROR]", {
      error: error instanceof Error ? error.message : String(error),
      stack: error instanceof Error ? error.stack : undefined,
      context,
    });
    return;
  }

  try {
    const err = error instanceof Error ? error : new Error(String(error));
    
    sentry.captureException(err, {
      extra: {
        ...context,
        timestamp: new Date().toISOString(),
        nodeEnv: process.env.NODE_ENV,
      },
      tags: {
        worker: true,
        ...context?.tags,
      },
    });

    logger.info("[SENTRY] Exception captured", {
      errorName: err.name,
      errorMessage: err.message,
    });
  } catch (sentryError) {
    logger.error("[SENTRY] Failed to capture exception", {
      originalError: error instanceof Error ? error.message : String(error),
      sentryError: sentryError instanceof Error ? sentryError.message : String(sentryError),
    });
  }
}

/**
 * Add breadcrumb for debugging context
 * 
 * @param message - Breadcrumb message
 * @param data - Optional metadata
 */
export function addBreadcrumb(
  message: string,
  data?: Record<string, unknown>
): void {
  const sentry = getSentry();
  
  if (sentry) {
    try {
      sentry.addBreadcrumb({
        message,
        data,
        level: "info",
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Fail silently
    }
  }
}

/**
 * Set user context for error tracking
 * 
 * @param userId - User identifier
 * @param email - User email (optional)
 */
export function setUserContext(
  userId: string,
  email?: string
): void {
  const sentry = getSentry();
  
  if (sentry) {
    try {
      sentry.setUser({
        id: userId,
        email,
      });
    } catch {
      // Fail silently
    }
  }
}

/**
 * Clear user context after operation completes
 */
export function clearUserContext(): void {
  const sentry = getSentry();
  
  if (sentry) {
    try {
      sentry.setUser(null);
    } catch {
      // Fail silently
    }
  }
}

/**
 * Track transaction/performance for long-running operations
 * 
 * @param name - Transaction name
 * @param op - Operation type
 * @returns Transaction object or null
 */
export function startTransaction(
  name: string,
  op: string = "task"
): any {
  const sentry = getSentry();
  
  if (sentry) {
    try {
      return sentry.startTransaction({
        name,
        op,
        timestamp: new Date().toISOString(),
      });
    } catch {
      // Fail silently
    }
  }
  return null;
}

/**
 * Wrapper for async worker operations with automatic error tracking
 * 
 * @param operation - Async operation to execute
 * @param context - Operation context/metadata
 * @returns Promise resolving to operation result
 */
export async function withErrorTracking<T>(
  operation: () => Promise<T>,
  context: {
    operationName: string;
    workerType: string;
    merchantId?: string;
    [key: string]: unknown;
  }
): Promise<T> {
  const transaction = startTransaction(context.operationName, "worker");
  
  try {
    addBreadcrumb(`Starting ${context.operationName}`, context);
    
    const result = await operation();
    
    if (transaction) {
      transaction.setStatus("ok");
      transaction.finish();
    }
    
    return result;
  } catch (error) {
    if (transaction) {
      transaction.setStatus("internal_error");
      transaction.finish();
    }
    
    captureException(error, {
      ...context,
      tags: {
        operation: context.operationName,
        worker: context.workerType,
      },
    });
    
    throw error;
  }
}
