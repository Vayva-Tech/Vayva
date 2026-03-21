/**
 * Type augmentation for logger to support legacy usage patterns
 * This allows the existing codebase to continue using logger with multiple arguments
 * while we gradually migrate to the @vayva/shared logger signature
 */

declare module "@/lib/logger" {
  export const logger: {
    error: (message: string, ...args: any[]) => void;
    warn: (message: string, ...args: any[]) => void;
    info: (message: string, ...args: any[]) => void;
    debug: (message: string, ...args: any[]) => void;
  };

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

  export class Logger {
    error(message: string, ...args: any[]): void;
    warn(message: string, ...args: any[]): void;
    info(message: string, ...args: any[]): void;
    debug(message: string, ...args: any[]): void;
    fatal(message: string, ...args: any[]): void;
  }
}
