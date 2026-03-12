/**
 * Sentry Integration for Vayva Platform
 * 
 * Comprehensive error tracking and performance monitoring that integrates
 * with the existing reliability infrastructure.
 * 
 * Features:
 * - Automatic error capture with context
 * - Performance transaction tracking
 * - PII redaction and sanitization
 * - Breadcrumbs for debugging
 * - Release health monitoring
 * 
 * @example
 * ```typescript
 * // Initialize in app bootstrap
 * import { SentryManager } from "@vayva/reliability";
 * 
 * SentryManager.init({
 *   dsn: process.env.SENTRY_DSN,
 *   environment: process.env.NODE_ENV,
 *   tracesSampleRate: 0.1,
 * });
 * 
 * // Wrap API handlers
 * export const GET = SentryManager.withSentry(async (req) => {
 *   // Your handler code
 * });
 * 
 * // Capture errors manually
 * try {
 *   await riskyOperation();
 * } catch (error) {
 *   SentryManager.captureException(error, { 
 *     tags: { operation: "risky" },
 *     context: { userId: req.user.id }
 *   });
 * }
 * ```
 */

import { logger } from "@vayva/shared";

// Sentry types (will be dynamically imported)
type SentryClient = {
  init: (options: SentryOptions) => void;
  captureException: (error: unknown, hint?: unknown) => string;
  captureMessage: (message: string, level?: string) => string;
  setUser: (user: { id?: string; email?: string; username?: string } | null) => void;
  setTag: (key: string, value: string) => void;
  setContext: (name: string, context: Record<string, unknown>) => void;
  addBreadcrumb: (breadcrumb: Breadcrumb) => void;
  startTransaction: (context: TransactionContext) => Transaction;
  configureScope: (callback: (scope: Scope) => void) => void;
  flush: (timeout?: number) => Promise<boolean>;
  close: (timeout?: number) => Promise<boolean>;
};

type SentryOptions = {
  dsn?: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
  profilesSampleRate?: number;
  beforeSend?: (event: SentryEvent) => SentryEvent | null;
  beforeBreadcrumb?: (breadcrumb: Breadcrumb) => Breadcrumb | null;
  integrations?: unknown[];
  [key: string]: unknown;
};

type SentryEvent = {
  event_id?: string;
  message?: string;
  timestamp?: number;
  level?: string;
  platform?: string;
  sdk?: { name: string; version: string };
  exception?: { values: Array<{ type: string; value: string; stacktrace?: unknown }> };
  user?: Record<string, unknown>;
  tags?: Record<string, string>;
  extra?: Record<string, unknown>;
  breadcrumbs?: Breadcrumb[];
  [key: string]: unknown;
};

type Breadcrumb = {
  type?: string;
  level?: string;
  event_id?: string;
  category?: string;
  message?: string;
  data?: Record<string, unknown>;
  timestamp?: number;
};

type TransactionContext = {
  name: string;
  op?: string;
  data?: Record<string, unknown>;
};

type Transaction = {
  finish: () => void;
  startChild: (context: { op: string; description?: string }) => Span;
  setData: (key: string, value: unknown) => void;
  setTag: (key: string, value: string) => void;
  setStatus: (status: string) => void;
};

type Span = {
  finish: () => void;
  setData: (key: string, value: unknown) => void;
  setTag: (key: string, value: string) => void;
};

type Scope = {
  setUser: (user: { id?: string; email?: string; username?: string } | null) => void;
  setTag: (key: string, value: string) => void;
  setContext: (name: string, context: Record<string, unknown>) => void;
  addBreadcrumb: (breadcrumb: Breadcrumb) => void;
};

// Sensitive fields to redact
const SENSITIVE_FIELDS = [
  "password",
  "token",
  "secret",
  "apiKey",
  "api_key",
  "authorization",
  "cookie",
  "session",
  "credit_card",
  "card_number",
  "cvv",
  "pin",
  "ssn",
  "bvn",
  "nin",
  "phone",
  "email",
];

// PII patterns to detect
const PII_PATTERNS = [
  { pattern: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/, type: "email" },
  { pattern: /\b(?:\+?234|0)[7-9][01]\d{8}\b/, type: "phone_ng" },
  { pattern: /\b\d{11}\b/, type: "bvn_or_nin" },
  { pattern: /\b\d{16}\b/, type: "card_number" },
];

interface SentryConfig {
  dsn?: string;
  environment?: string;
  release?: string;
  tracesSampleRate?: number;
  profilesSampleRate?: number;
  enablePerformance?: boolean;
  enableProfiling?: boolean;
  redactPII?: boolean;
  allowedDomains?: string[];
}

interface CaptureContext {
  tags?: Record<string, string>;
  context?: Record<string, unknown>;
  user?: { id?: string; email?: string; username?: string };
  level?: "fatal" | "error" | "warning" | "info" | "debug";
}

/**
 * Sentry Manager - Centralized error tracking and performance monitoring
 */
export class SentryManager {
  private static instance: SentryManager;
  private sentry: SentryClient | null = null;
  private config: SentryConfig = {};
  private isInitialized = false;
  private breadcrumbs: Breadcrumb[] = [];
  private readonly MAX_BREADCRUMBS = 100;

  private constructor() {}

  static getInstance(): SentryManager {
    if (!SentryManager.instance) {
      SentryManager.instance = new SentryManager();
    }
    return SentryManager.instance;
  }

  /**
   * Initialize Sentry with configuration
   */
  async init(config: SentryConfig): Promise<void> {
    if (this.isInitialized) {
      logger.warn("[SentryManager] Already initialized");
      return;
    }

    if (!config.dsn) {
      logger.warn("[SentryManager] No DSN provided, skipping initialization");
      return;
    }

    this.config = {
      tracesSampleRate: 0.1,
      profilesSampleRate: 0.01,
      enablePerformance: true,
      enableProfiling: false,
      redactPII: true,
      ...config,
    };

    try {
      // Dynamically import Sentry to avoid bundling issues
      const sentryModule = await this.loadSentry();
      if (!sentryModule) {
        logger.warn("[SentryManager] Sentry package not found");
        return;
      }

      this.sentry = sentryModule;

      const options: SentryOptions = {
        dsn: this.config.dsn,
        environment: this.config.environment || process.env.NODE_ENV || "development",
        release: this.config.release || process.env.npm_package_version,
        tracesSampleRate: this.config.tracesSampleRate,
        beforeSend: this.config.redactPII ? this.sanitizeEvent.bind(this) : undefined,
        beforeBreadcrumb: this.config.redactPII ? this.sanitizeBreadcrumb.bind(this) : undefined,
      };

      if (this.config.enableProfiling && this.config.profilesSampleRate) {
        options.profilesSampleRate = this.config.profilesSampleRate;
      }

      this.sentry.init(options);
      this.isInitialized = true;

      logger.info("[SentryManager] Initialized successfully", {
        environment: options.environment,
        release: options.release,
      });

      // Add global error handlers
      this.setupGlobalHandlers();
    } catch (error) {
      logger.error("[SentryManager] Failed to initialize", { error });
    }
  }

  /**
   * Load Sentry dynamically based on environment
   */
  private async loadSentry(): Promise<SentryClient | null> {
    const candidates = ["@sentry/nextjs", "@sentry/node", "@sentry/browser"];

    for (const pkg of candidates) {
      try {
        // Use dynamic import for ESM compatibility
        const mod = await import(pkg);
        return mod as SentryClient;
      } catch {
        continue;
      }
    }

    return null;
  }

  /**
   * Sanitize event to remove PII
   */
  private sanitizeEvent(event: SentryEvent): SentryEvent | null {
    // Deep clone and sanitize
    const sanitized = this.deepSanitize(event);
    return sanitized;
  }

  /**
   * Sanitize breadcrumb
   */
  private sanitizeBreadcrumb(breadcrumb: Breadcrumb): Breadcrumb | null {
    if (breadcrumb.data) {
      breadcrumb.data = this.sanitizeObject(breadcrumb.data);
    }
    if (breadcrumb.message) {
      breadcrumb.message = this.sanitizeString(breadcrumb.message);
    }
    return breadcrumb;
  }

  /**
   * Deep sanitize object
   */
  private deepSanitize<T>(obj: T): T {
    if (obj === null || obj === undefined) {
      return obj;
    }

    if (typeof obj === "string") {
      return this.sanitizeString(obj) as unknown as T;
    }

    if (Array.isArray(obj)) {
      return obj.map((item) => this.deepSanitize(item)) as unknown as T;
    }

    if (typeof obj === "object") {
      const sanitized: Record<string, unknown> = {};
      for (const [key, value] of Object.entries(obj)) {
        if (this.isSensitiveField(key)) {
          sanitized[key] = "[REDACTED]";
        } else {
          sanitized[key] = this.deepSanitize(value);
        }
      }
      return sanitized as T;
    }

    return obj;
  }

  /**
   * Sanitize object
   */
  private sanitizeObject(obj: Record<string, unknown>): Record<string, unknown> {
    return this.deepSanitize(obj) as Record<string, unknown>;
  }

  /**
   * Sanitize string for PII
   */
  private sanitizeString(str: string): string {
    let sanitized = str;
    for (const { pattern, type } of PII_PATTERNS) {
      sanitized = sanitized.replace(pattern, `[${type.toUpperCase()}_REDACTED]`);
    }
    return sanitized;
  }

  /**
   * Check if field is sensitive
   */
  private isSensitiveField(key: string): boolean {
    const lowerKey = key.toLowerCase();
    return SENSITIVE_FIELDS.some((field) => lowerKey.includes(field.toLowerCase()));
  }

  /**
   * Setup global error handlers
   */
  private setupGlobalHandlers(): void {
    if (typeof process !== "undefined") {
      // Node.js environment
      process.on("unhandledRejection", (reason) => {
        this.captureException(reason instanceof Error ? reason : new Error(String(reason)), {
          level: "error",
          tags: { type: "unhandled_rejection" },
        });
      });

      process.on("uncaughtException", (error) => {
        this.captureException(error, {
          level: "fatal",
          tags: { type: "uncaught_exception" },
        });
      });
    }
  }

  /**
   * Capture exception with context
   */
  captureException(error: unknown, captureContext?: CaptureContext): string | null {
    if (!this.isInitialized || !this.sentry) {
      // Fallback to console
      console.error("[SentryManager] Error captured (Sentry not initialized):", error);
      return null;
    }

    try {
      // Build hint with context
      const hint: Record<string, unknown> = {};

      if (captureContext?.tags) {
        hint.tags = captureContext.tags;
      }

      if (captureContext?.context) {
        hint.extra = captureContext.context;
      }

      if (captureContext?.user) {
        hint.user = this.sanitizeUser(captureContext.user);
      }

      if (captureContext?.level) {
        hint.level = captureContext.level;
      }

      const eventId = this.sentry.captureException(error, hint);

      // Add breadcrumb
      this.addBreadcrumb({
        category: "error",
        message: error instanceof Error ? error.message : String(error),
        level: captureContext?.level || "error",
        data: { eventId },
      });

      return eventId;
    } catch (captureError) {
      logger.error("[SentryManager] Failed to capture exception", { captureError });
      return null;
    }
  }

  /**
   * Capture message
   */
  captureMessage(message: string, level: CaptureContext["level"] = "info", context?: CaptureContext): string | null {
    if (!this.isInitialized || !this.sentry) {
      console.log(`[SentryManager] ${level}: ${message}`);
      return null;
    }

    try {
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          this.sentry?.setTag(key, value);
        });
      }

      if (context?.user) {
        this.sentry.setUser(this.sanitizeUser(context.user));
      }

      return this.sentry.captureMessage(message, level);
    } catch (error) {
      logger.error("[SentryManager] Failed to capture message", { error });
      return null;
    }
  }

  /**
   * Set user context
   */
  setUser(user: { id?: string; email?: string; username?: string } | null): void {
    if (!this.isInitialized || !this.sentry) return;

    this.sentry.setUser(user ? this.sanitizeUser(user) : null);
  }

  /**
   * Sanitize user data
   */
  private sanitizeUser(user: { id?: string; email?: string; username?: string }): { id?: string; email?: string; username?: string } {
    if (!this.config.redactPII) return user;

    return {
      id: user.id,
      // Hash email for privacy
      email: user.email ? this.hashString(user.email) : undefined,
      username: user.username,
    };
  }

  /**
   * Hash string for privacy
   */
  private hashString(str: string): string {
    // Simple hash for demonstration - in production use proper hashing
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return `hash_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Set tag
   */
  setTag(key: string, value: string): void {
    if (!this.isInitialized || !this.sentry) return;
    this.sentry.setTag(key, value);
  }

  /**
   * Set context
   */
  setContext(name: string, context: Record<string, unknown>): void {
    if (!this.isInitialized || !this.sentry) return;
    this.sentry.setContext(name, this.sanitizeObject(context));
  }

  /**
   * Add breadcrumb
   */
  addBreadcrumb(breadcrumb: Omit<Breadcrumb, "timestamp">): void {
    const fullBreadcrumb: Breadcrumb = {
      ...breadcrumb,
      timestamp: Date.now(),
    };

    this.breadcrumbs.push(fullBreadcrumb);

    // Keep only last N breadcrumbs
    if (this.breadcrumbs.length > this.MAX_BREADCRUMBS) {
      this.breadcrumbs.shift();
    }

    if (this.isInitialized && this.sentry) {
      this.sentry.addBreadcrumb(fullBreadcrumb);
    }
  }

  /**
   * Start performance transaction
   */
  startTransaction(name: string, op?: string, data?: Record<string, unknown>): Transaction | null {
    if (!this.isInitialized || !this.sentry || !this.config.enablePerformance) {
      return null;
    }

    return this.sentry.startTransaction({
      name,
      op,
      data: data ? this.sanitizeObject(data) : undefined,
    });
  }

  /**
   * Wrap function with Sentry context
   */
  withScope<T>(callback: () => T, context?: CaptureContext): T {
    if (!this.isInitialized || !this.sentry) {
      return callback();
    }

    this.sentry.configureScope((scope) => {
      if (context?.user) {
        scope.setUser(this.sanitizeUser(context.user));
      }
      if (context?.tags) {
        Object.entries(context.tags).forEach(([key, value]) => {
          scope.setTag(key, value);
        });
      }
      if (context?.context) {
        scope.setContext("custom", this.sanitizeObject(context.context));
      }
    });

    try {
      return callback();
    } finally {
      // Reset scope
      this.sentry.configureScope((scope) => {
        scope.setUser(null);
      });
    }
  }

  /**
   * Wrap API handler with Sentry
   */
  withSentry<T extends (...args: unknown[]) => unknown>(
    handler: T,
    options?: { tags?: Record<string, string>; transaction?: boolean }
  ): T {
    return (async (...args: unknown[]) => {
      const req = args[0] as Request;
      const url = new URL(req.url);
      
      let transaction: Transaction | null = null;
      
      if (options?.transaction !== false && this.config.enablePerformance) {
        transaction = this.startTransaction(
          `${req.method} ${url.pathname}`,
          "http.server",
          { url: url.toString(), method: req.method }
        );
      }

      // Set request context
      const headers: Record<string, string> = {};
      req.headers.forEach((value, key) => {
        headers[key] = value;
      });
      
      this.setContext("request", {
        url: url.toString(),
        method: req.method,
        headers: this.sanitizeHeaders(headers),
      });

      if (options?.tags) {
        Object.entries(options.tags).forEach(([key, value]) => {
          this.setTag(key, value);
        });
      }

      try {
        const result = await handler(...args);
        
        if (transaction) {
          transaction.setStatus("ok");
          transaction.finish();
        }

        return result;
      } catch (error) {
        this.captureException(error, {
          tags: { 
            route: url.pathname,
            method: req.method,
            ...options?.tags,
          },
        });

        if (transaction) {
          transaction.setStatus("error");
          transaction.finish();
        }

        throw error;
      }
    }) as T;
  }

  /**
   * Sanitize headers
   */
  private sanitizeHeaders(headers: Record<string, string>): Record<string, string> {
    const sanitized: Record<string, string> = {};
    for (const [key, value] of Object.entries(headers)) {
      if (this.isSensitiveField(key)) {
        sanitized[key] = "[REDACTED]";
      } else {
        sanitized[key] = value;
      }
    }
    return sanitized;
  }

  /**
   * Flush pending events
   */
  async flush(timeout = 2000): Promise<boolean> {
    if (!this.isInitialized || !this.sentry) return true;
    return this.sentry.flush(timeout);
  }

  /**
   * Close Sentry connection
   */
  async close(timeout = 2000): Promise<boolean> {
    if (!this.isInitialized || !this.sentry) return true;
    const result = await this.sentry.close(timeout);
    this.isInitialized = false;
    return result;
  }

  /**
   * Check if initialized
   */
  get initialized(): boolean {
    return this.isInitialized;
  }

  /**
   * Get breadcrumbs
   */
  getBreadcrumbs(): Breadcrumb[] {
    return [...this.breadcrumbs];
  }
}

// Export singleton instance
export const sentryManager = SentryManager.getInstance();

// Convenience exports
export const initSentry = (config: SentryConfig) => sentryManager.init(config);
export const captureException = (error: unknown, context?: CaptureContext) => 
  sentryManager.captureException(error, context);
export const captureMessage = (message: string, level?: CaptureContext["level"], context?: CaptureContext) => 
  sentryManager.captureMessage(message, level, context);
export const setUser = (user: { id?: string; email?: string; username?: string } | null) => 
  sentryManager.setUser(user);
export const setTag = (key: string, value: string) => sentryManager.setTag(key, value);
export const setContext = (name: string, context: Record<string, unknown>) => 
  sentryManager.setContext(name, context);
export const addBreadcrumb = (breadcrumb: Omit<Breadcrumb, "timestamp">) => 
  sentryManager.addBreadcrumb(breadcrumb);
export const withSentry = <T extends (...args: unknown[]) => unknown>(handler: T, options?: { tags?: Record<string, string> }) => 
  sentryManager.withSentry(handler, options);
export const startTransaction = (name: string, op?: string, data?: Record<string, unknown>) => 
  sentryManager.startTransaction(name, op, data);

// Export interfaces for external use
export type { SentryConfig, CaptureContext };
