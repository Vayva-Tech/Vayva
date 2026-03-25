/**
 * Unified Logger Configuration
 * Production-ready structured logging with multiple transports
 */

import winston from 'winston';
import 'winston-transport';

// ============================================================================
// Types & Interfaces
// ============================================================================
type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export enum ErrorCategory {
  AUTH = 'auth',
  DATABASE = 'database',
  API = 'api',
  VALIDATION = 'validation',
  PAYMENT = 'payment',
  WEBHOOK = 'webhook',
  FILE_UPLOAD = 'file_upload',
  SECURITY = 'security',
  NETWORK = 'network',
  UNKNOWN = 'unknown',
}

interface LogFields {
  timestamp: string;
  level: LogLevel;
  category: string;
  message: string;
  service?: string;
  environment?: string;
  requestId?: string;
  userId?: string;
  merchantId?: string;
  error?: Error;
  stack?: string;
  duration?: number;
  [key: string]: unknown;
}

// ============================================================================
// Custom Transport for CloudWatch Logs
// ============================================================================
class CloudWatchTransport extends winston.Transport {
  private logGroupName: string;
  private logStreamName: string;
  private sequenceToken?: string;

  constructor(options: { logGroupName: string; logStreamName: string }) {
    super();
    this.logGroupName = options.logGroupName;
    this.logStreamName = options.logStreamName;
  }

  async log(info: LogFields, callback: () => void) {
    setImmediate(() => {
      this.emit('logged', info);
    });

    // In production, forward structured logs to your observability stack (e.g. Grafana, Datadog, self-hosted).
    // For now, we'll just output structured JSON
    if (process.env.NODE_ENV === 'production') {
      console.log(JSON.stringify(info));
    }

    callback();
  }
}

// ============================================================================
// Logger Configuration Factory
// ============================================================================
export function createLogger(serviceName: string, category: ErrorCategory = ErrorCategory.UNKNOWN) {
  const isDevelopment = process.env.NODE_ENV === 'development';
  const isProduction = process.env.NODE_ENV === 'production';

  // Determine log level
  const logLevel = process.env.LOG_LEVEL || (isDevelopment ? 'debug' : 'info');

  // Create Winston logger
  const logger = winston.createLogger({
    level: logLevel,
    defaultMeta: {
      service: serviceName,
      environment: process.env.NODE_ENV,
      category: category,
    },
    format: winston.format.combine(
      winston.format.timestamp({ format: 'ISO8601' }),
      winston.format.errors({ stack: true }),
      isDevelopment 
        ? winston.format.colorize()
        : winston.format.json(),
    ),
    transports: [
      // Console transport for all environments
      new winston.transports.Console({
        format: winston.format.combine(
          winston.format.printf(({ timestamp, level, message, ...meta }) => {
            const metaString = Object.keys(meta).length > 0 
              ? ` ${JSON.stringify(meta)}` 
              : '';
            return `${timestamp} [${level}] ${message}${metaString}`;
          })
        ),
      }),
      
      // CloudWatch transport for production
      ...(isProduction && process.env.CLOUDWATCH_LOG_GROUP_NAME 
        ? [new CloudWatchTransport({
            logGroupName: process.env.CLOUDWATCH_LOG_GROUP_NAME,
            logStreamName: process.env.HOSTNAME || 'default',
          })]
        : []),
    ],
  });

  return {
    debug: (msg: string, fields?: Record<string, unknown>) => 
      logger.debug(msg, { ...fields, category }),
    
    info: (msg: string, fields?: Record<string, unknown>) => 
      logger.info(msg, { ...fields, category }),
    
    warn: (msg: string, fields?: Record<string, unknown>) => 
      logger.warn(msg, { ...fields, category }),
    
    error: (msg: string, fields?: Record<string, unknown>) => 
      logger.error(msg, { ...fields, category }),
    
    // Convenience methods for common scenarios
    request: (method: string, path: string, status: number, duration: number) =>
      logger.info(`${method} ${path}`, { 
        type: 'request', 
        method, 
        path, 
        status, 
        duration 
      }),
    
    database: (query: string, duration: number) =>
      logger.debug(`Database query`, { 
        type: 'database', 
        query, 
        duration 
      }),
    
    security: (event: string, details?: Record<string, unknown>) =>
      logger.info(`Security event: ${event}`, { 
        type: 'security', 
        event, 
        ...details 
      }),
  };
}

// ============================================================================
// Default Logger (for backward compatibility)
// ============================================================================
export const logger = createLogger('vayva-default');

// ============================================================================
// Category-specific loggers
// ============================================================================
export const authLogger = createLogger('auth-service', ErrorCategory.AUTH);
export const databaseLogger = createLogger('database-service', ErrorCategory.DATABASE);
export const apiLogger = createLogger('api-service', ErrorCategory.API);
export const paymentLogger = createLogger('payment-service', ErrorCategory.PAYMENT);
export const securityLogger = createLogger('security-service', ErrorCategory.SECURITY);

// ============================================================================
// Request Logging Middleware
// ============================================================================
export function createRequestLogger(loggerInstance: ReturnType<typeof createLogger>) {
  return (req: unknown, res: { on: (event: string, cb: () => void) => void; statusCode?: number }, next: () => void) => {
    const start = Date.now();
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      const method = (req as { method?: string }).method || 'UNKNOWN';
      const path = (req as { url?: string }).url || 'UNKNOWN';
      const status = res.statusCode || 500;
      
      loggerInstance.request(method, path, status, duration);
    });
    
    next();
  };
}

// ============================================================================
// Error Logging Helper
// ============================================================================
export function logError(
  error: Error,
  context: {
    message?: string;
    category?: ErrorCategory;
    service?: string;
    metadata?: Record<string, unknown>;
  } = {}
) {
  const errorLogger = createLogger(
    context.service || 'error-handler',
    context.category || ErrorCategory.UNKNOWN
  );
  
  errorLogger.error(context.message || error.message, {
    error: {
      name: error.name,
      message: error.message,
      stack: error.stack,
    },
    ...context.metadata,
  });
}
