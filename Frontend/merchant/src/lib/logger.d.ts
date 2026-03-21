/**
 * Structured Error Logging Utility
 *
 * Provides environment-aware logging with support for error tracking services (Sentry).
 * Replaces console.error calls with structured, actionable logging.
 */
export type LogContext = Record<string, unknown> | Error | undefined;
export type ErrorLike = Error | unknown;
export declare enum LogLevel {
    DEBUG = "debug",
    INFO = "info",
    WARN = "warn",
    ERROR = "error",
    FATAL = "fatal"
}
export declare enum ErrorCategory {
    AUTH = "auth",
    DATABASE = "database",
    API = "api",
    VALIDATION = "validation",
    PAYMENT = "payment",
    WEBHOOK = "webhook",
    FILE_UPLOAD = "file_upload",
    SECURITY = "security",
    NETWORK = "network",
    UNKNOWN = "unknown"
}
import { logger } from "@vayva/shared";
export { logger };
