/**
 * Structured Error Logging Utility
 *
 * Provides environment-aware logging with support for error tracking services (Sentry).
 * Replaces console.error calls with structured, actionable logging.
 */
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

type LogContext = Record<string, unknown> | undefined;

type LogEntry = {
    level: LogLevel;
    category: ErrorCategory;
    message: string;
    error?: unknown;
    context?: LogContext;
    timestamp: string;
    environment: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
    return typeof value === "object" && value !== null;
}

function isErrorCategory(value: unknown): value is ErrorCategory {
    return typeof value === "string" && Object.values(ErrorCategory).includes(value as ErrorCategory);
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
    error(message: string, category: ErrorCategory, error?: unknown, context?: LogContext): void;
    error(message: string, error: unknown, context?: LogContext): void;
    error(message: string, categoryOrError: unknown, errorOrContext?: unknown, context?: LogContext): void {
        let category = ErrorCategory.UNKNOWN;
        let error: unknown;
        let finalContext: LogContext;
        // Parse arguments based on types
        if (isErrorCategory(categoryOrError)) {
            category = categoryOrError;
            error = errorOrContext;
            finalContext = context;
        }
        else if (categoryOrError instanceof Error || isRecord(categoryOrError)) {
            error = categoryOrError;
            finalContext = isRecord(errorOrContext) ? errorOrContext : undefined;
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
    warn(message: string, category: ErrorCategory = ErrorCategory.UNKNOWN, context?: LogContext): void {
        const entry = this.createLogEntry(LogLevel.WARN, category, message, undefined, context);
        if (this.isDevelopment) {
            console.warn(`[${category.toUpperCase()}] ${message}`, context);
        }
        this.writeToLog(entry);
    }
    /**
     * Log informational message
     */
    info(message: string, context?: LogContext): void {
        const entry = this.createLogEntry(LogLevel.INFO, ErrorCategory.UNKNOWN, message, undefined, context);
        if (this.isDevelopment) {
            console.info(message, context);
        }
        this.writeToLog(entry);
    }
    /**
     * Log debug message (development only)
     */
    debug(message: string, context?: LogContext): void {
        if (!this.isDevelopment)
            return;
        const entry = this.createLogEntry(LogLevel.DEBUG, ErrorCategory.UNKNOWN, message, undefined, context);
        console.debug(message, context);
        this.writeToLog(entry);
    }
    /**
     * Log fatal error (critical system failure)
     */
    fatal(message: string, category: ErrorCategory, error?: unknown, context?: LogContext): void {
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
    private createLogEntry(level: LogLevel, category: ErrorCategory, message: string, error?: unknown, context?: LogContext): LogEntry {
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
    private writeToLog(entry: LogEntry): void {
        // Redact PII before logging/stringifying
        const safeEntry = this.redactPII(entry);
        // In production, enforce JSON for Datadog/CloudWatch
        if (this.isProduction) {
            console.log(JSON.stringify(safeEntry));
        }
    }
    private redactPII(data: unknown): unknown {
        if (!data)
            return data;
        if (typeof data === "string")
            return data;
        if (Array.isArray(data))
            return data.map(item => this.redactPII(item));
        if (typeof data === "object") {
            const sensitiveKeys = ["password", "token", "secret", "authorization", "cookie", "key", "pin", "cvv", "creditCard"];
            const redacted: Record<string, unknown> = {};
            for (const key of Object.keys(data)) {
                if (sensitiveKeys.some(s => key.toLowerCase().includes(s))) {
                    redacted[key] = "[REDACTED]";
                }
                else {
                    redacted[key] = this.redactPII((data as Record<string, unknown>)[key]);
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
    private sendToErrorTracking(entry: LogEntry): void {
        if (process.env.SENTRY_DSN) {
            try {
                const requireFn = (0, eval)("require") as (id: string) => unknown;
                const sentryCandidates = ["@sentry/nextjs", "@sentry/node"];
                for (const pkg of sentryCandidates) {
                    try {
                        const Sentry = requireFn(pkg);
                        if (isRecord(Sentry) && typeof Sentry.captureException === "function") {
                            Sentry.captureException(entry.error || new Error(entry.message), {
                                extra: {
                                    context: entry.context,
                                    category: entry.category,
                                    environment: entry.environment,
                                    level: entry.level
                                }
                            });
                            break;
                        }
                    }
                    catch {
                    }
                }
            }
            catch {
                // Fail silently if Sentry not available
            }
        }
    }
}
// Export singleton instance
export const logger = new Logger();
// Convenience functions for common error categories
export const logAuthError = (message: string, error?: unknown, context?: LogContext) => {
    logger.error(message, ErrorCategory.AUTH, error, context);
};
export const logDatabaseError = (message: string, error?: unknown, context?: LogContext) => {
    logger.error(message, ErrorCategory.DATABASE, error, context);
};
export const logApiError = (message: string, error?: unknown, context?: LogContext) => {
    logger.error(message, ErrorCategory.API, error, context);
};
export const logValidationError = (message: string, error?: unknown, context?: LogContext) => {
    logger.error(message, ErrorCategory.VALIDATION, error, context);
};
export const logPaymentError = (message: string, error?: unknown, context?: LogContext) => {
    logger.error(message, ErrorCategory.PAYMENT, error, context);
};
export const logWebhookError = (message: string, error?: unknown, context?: LogContext) => {
    logger.error(message, ErrorCategory.WEBHOOK, error, context);
};
export const logFileUploadError = (message: string, error?: unknown, context?: LogContext) => {
    logger.error(message, ErrorCategory.FILE_UPLOAD, error, context);
};
export const logSecurityEvent = (message: string, context?: LogContext) => {
    logger.info(`[SECURITY] ${message}`, context);
};
export const logNetworkError = (message: string, error?: unknown, context?: LogContext) => {
    logger.error(message, ErrorCategory.NETWORK, error, context);
};
