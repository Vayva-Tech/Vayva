/* eslint-disable */
/**
 * Structured Error Logging Utility
 *
 * Provides environment-aware logging with support for error tracking services (Sentry).
 * Replaces console.error calls with structured, actionable logging.
 */

export type LogContext = Record<string, unknown> | Error | undefined;
export type ErrorLike = Error | unknown;

export enum LogLevel {
  DEBUG = "debug",
  INFO = "info",
  WARN = "warn",
  ERROR = "error",
  FATAL = "fatal",
}
export enum ErrorCategory {
  AUTH = "auth",
  DATABASE = "database",
  API = "api",
  VALIDATION = "validation",
  PAYMENT = "payment",
  WEBHOOK = "webhook",
  FILE_UPLOAD = "file_upload",
  SECURITY = "security",
  NETWORK = "network",
  UNKNOWN = "unknown",
}
class Logger {
  private isDevelopment: boolean;
  private isProduction: boolean;

  constructor() {
    this.isDevelopment = process.env.NODE_ENV === "development";
    this.isProduction = process.env.NODE_ENV === "production";
  }
  /**
   * Log an error with structured data
   */
  error(
    message: string,
    categoryOrError: ErrorCategory | ErrorLike,
    errorOrContext?: ErrorLike,
    context?: LogContext,
  ) {
    let category = ErrorCategory.UNKNOWN;
    let error;
    let finalContext: LogContext;
    // Parse arguments based on types
    if (
      typeof categoryOrError === "string" &&
      Object.values(ErrorCategory).includes(categoryOrError as ErrorCategory)
    ) {
      category = categoryOrError as ErrorCategory;
      error = errorOrContext;
      finalContext = context;
    } else if (
      categoryOrError instanceof Error ||
      typeof categoryOrError === "object"
    ) {
      error = categoryOrError;
      finalContext = errorOrContext as LogContext;
    }
    const entry = this.createLogEntry(
      LogLevel.ERROR,
      category,
      message,
      error,
      finalContext,
    );
    // Console output in development
    if (this.isDevelopment) {
      console.error(`[${category.toUpperCase()}] ${message}`, {
        error,
        context: finalContext,
      });
    }
    // Send to error tracking service in production
    if (this.isProduction) {
      this.sendToErrorTracking(entry);
    }
    // Always log to application logs
    this.writeToLog(entry);
  }
  /**
   * Log a warning
   */
  warn(
    message: string,
    category: ErrorCategory | string = ErrorCategory.UNKNOWN,
    context?: LogContext,
  ) {
    const entry = this.createLogEntry(
      LogLevel.WARN,
      category,
      message,
      undefined,
      context,
    );
    if (this.isDevelopment) {
      console.warn(`[${category.toUpperCase()}] ${message}`, context);
    }
    this.writeToLog(entry);
  }
  /**
   * Log informational message
   */
  info(message: string, context?: LogContext) {
    const entry = this.createLogEntry(
      LogLevel.INFO,
      ErrorCategory.UNKNOWN,
      message,
      undefined,
      context,
    );
    if (this.isDevelopment) {
      console.info(message, context);
    }
    this.writeToLog(entry);
  }
  /**
   * Log debug message (development only)
   */
  debug(message: string, context?: LogContext) {
    if (!this.isDevelopment) return;
    const entry = this.createLogEntry(
      LogLevel.DEBUG,
      ErrorCategory.UNKNOWN,
      message,
      undefined,
      context,
    );
    console.debug(message, context);
    this.writeToLog(entry);
  }
  /**
   * Log fatal error (critical system failure)
   */
  fatal(
    message: string,
    category: ErrorCategory | string,
    error?: ErrorLike,
    context?: LogContext,
  ) {
    const entry = this.createLogEntry(
      LogLevel.FATAL,
      category,
      message,
      error,
      context,
    );
    console.error(`[FATAL] [${category.toUpperCase()}] ${message}`, {
      error,
      context,
    });
    if (this.isProduction) {
      this.sendToErrorTracking(entry);
    }
    this.writeToLog(entry);
  }
  /**
   * Create structured log entry
   */
  private createLogEntry(
    level: LogLevel,
    category: ErrorCategory | string,
    message: string,
    error?: ErrorLike,
    context?: LogContext,
  ) {
    return {
      level,
      category,
      message,
      error,
      context,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || "unknown",
    };
  }
  /**
   * Write to application logs
   */
  private writeToLog(entry: ReturnType<typeof this.createLogEntry>) {
    // Redact PII before logging/stringifying
    const safeEntry = this.redactPII(entry);
    // In production, enforce JSON for Datadog/CloudWatch
    if (this.isProduction) {
      console.log(JSON.stringify(safeEntry));
    }
  }
  private redactPII(data: unknown): unknown {
    if (!data) return data;
    if (typeof data === "string") return data;
    if (Array.isArray(data)) return data.map((item) => this.redactPII(item));
    if (typeof data === "object") {
      const sensitiveKeys = [
        "password",
        "token",
        "secret",
        "authorization",
        "cookie",
        "key",
        "pin",
        "cvv",
        "creditCard",
        "email",
        "phone",
        "firstName",
        "lastName",
        "address",
        "taxId",
        "nin",
        "bvn",
        "accountNumber",
      ];
      const redacted: Record<string, unknown> = {};
      for (const key of Object.keys(data)) {
        if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
          redacted[key] = "[REDACTED]";
        } else {
          redacted[key] = this.redactPII(
            (data as Record<string, unknown>)[key],
          );
        }
      }
      return redacted;
    }
    return data;
  }
  /**
   * Send to error tracking service (e.g., Sentry)
   */
  /**
   * Send to error tracking service (e.g., Sentry)
   */
  private async sendToErrorTracking(entry: {
    error?: ErrorLike;
    message: string;
    context?: LogContext;
    category: string;
    environment: string;
    level: string;
  }) {
    if (process.env.SENTRY_DSN) {
      try {
        // Dynamic import to avoid build issues if Sentry is not fully configured in all environments
        const Sentry = await import("@sentry/nextjs");
        Sentry.captureException(entry.error || new Error(entry.message), {
          extra: {
            context: entry.context,
            category: entry.category,
            environment: entry.environment,
            level: entry.level,
          },
        });
      } catch {
        // Fail silently if Sentry not available
      }
    }
  }
}
// Export singleton instance
/* eslint-disable */
import { logger } from "@vayva/shared";

// Re-export logger from @vayva/shared for convenience
export { logger };
