/* eslint-disable */
/**
 * Structured Error Logging Utility
 *
 * Provides environment-aware logging with support for error tracking services (Sentry).
 * Replaces console.error calls with structured, actionable logging.
 */
export var LogLevel;
(function (LogLevel) {
    LogLevel["DEBUG"] = "debug";
    LogLevel["INFO"] = "info";
    LogLevel["WARN"] = "warn";
    LogLevel["ERROR"] = "error";
    LogLevel["FATAL"] = "fatal";
})(LogLevel || (LogLevel = {}));
export var ErrorCategory;
(function (ErrorCategory) {
    ErrorCategory["AUTH"] = "auth";
    ErrorCategory["DATABASE"] = "database";
    ErrorCategory["API"] = "api";
    ErrorCategory["VALIDATION"] = "validation";
    ErrorCategory["PAYMENT"] = "payment";
    ErrorCategory["WEBHOOK"] = "webhook";
    ErrorCategory["FILE_UPLOAD"] = "file_upload";
    ErrorCategory["SECURITY"] = "security";
    ErrorCategory["NETWORK"] = "network";
    ErrorCategory["UNKNOWN"] = "unknown";
})(ErrorCategory || (ErrorCategory = {}));
class Logger {
    constructor() {
        this.isDevelopment = process.env.NODE_ENV === "development";
        this.isProduction = process.env.NODE_ENV === "production";
    }
    /**
     * Log an error with structured data
     */
    error(message, categoryOrError, errorOrContext, context) {
        let category = ErrorCategory.UNKNOWN;
        let error;
        let finalContext;
        // Parse arguments based on types
        if (typeof categoryOrError === "string" &&
            Object.values(ErrorCategory).includes(categoryOrError)) {
            category = categoryOrError;
            error = errorOrContext;
            finalContext = context;
        }
        else if (categoryOrError instanceof Error ||
            typeof categoryOrError === "object") {
            error = categoryOrError;
            finalContext = errorOrContext;
        }
        const entry = this.createLogEntry(LogLevel.ERROR, category, message, error, finalContext);
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
    warn(message, category = ErrorCategory.UNKNOWN, context) {
        const entry = this.createLogEntry(LogLevel.WARN, category, message, undefined, context);
        if (this.isDevelopment) {
            console.warn(`[${category.toUpperCase()}] ${message}`, context);
        }
        this.writeToLog(entry);
    }
    /**
     * Log informational message
     */
    info(message, context) {
        const entry = this.createLogEntry(LogLevel.INFO, ErrorCategory.UNKNOWN, message, undefined, context);
        if (this.isDevelopment) {
            console.info(message, context);
        }
        this.writeToLog(entry);
    }
    /**
     * Log debug message (development only)
     */
    debug(message, context) {
        if (!this.isDevelopment)
            return;
        const entry = this.createLogEntry(LogLevel.DEBUG, ErrorCategory.UNKNOWN, message, undefined, context);
        console.debug(message, context);
        this.writeToLog(entry);
    }
    /**
     * Log fatal error (critical system failure)
     */
    fatal(message, category, error, context) {
        const entry = this.createLogEntry(LogLevel.FATAL, category, message, error, context);
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
    createLogEntry(level, category, message, error, context) {
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
    writeToLog(entry) {
        // Redact PII before logging/stringifying
        const safeEntry = this.redactPII(entry);
        // In production, enforce JSON for Datadog/CloudWatch
        if (this.isProduction) {
        }
    }
    redactPII(data) {
        if (!data)
            return data;
        if (typeof data === "string")
            return data;
        if (Array.isArray(data))
            return data.map((item) => this.redactPII(item));
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
            const redacted = {};
            for (const key of Object.keys(data)) {
                if (sensitiveKeys.some((s) => key.toLowerCase().includes(s))) {
                    redacted[key] = "[REDACTED]";
                }
                else {
                    redacted[key] = this.redactPII(data[key]);
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
    async sendToErrorTracking(entry) {
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
            }
            catch {
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
