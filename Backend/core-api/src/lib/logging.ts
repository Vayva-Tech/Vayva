/**
 * Logging Service Integration
 * 
 * Supports multiple logging backends:
 * - Axiom (axiom.co)
 * - Logtail (logtail.com)
 * - Console (development)
 * 
 * Environment variables:
 * - LOGGING_PROVIDER: axiom | logtail | console
 * - AXIOM_TOKEN: Your Axiom API token
 * - AXIOM_ORG_ID: Your Axiom organization ID
 * - AXIOM_DATASET: Your Axiom dataset name
 * - LOGTAIL_SOURCE_TOKEN: Your Logtail source token
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error';
type LoggingProvider = 'axiom' | 'logtail' | 'console';

interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  storeId?: number;
  userId?: string;
  requestId?: string;
}

class Logger {
  private provider: LoggingProvider;
  private axiomToken?: string;
  private axiomOrgId?: string;
  private axiomDataset?: string;
  private logtailToken?: string;

  constructor() {
    this.provider = (process.env.LOGGING_PROVIDER as LoggingProvider) || 'console';
    this.axiomToken = process.env.AXIOM_TOKEN;
    this.axiomOrgId = process.env.AXIOM_ORG_ID;
    this.axiomDataset = process.env.AXIOM_DATASET;
    this.logtailToken = process.env.LOGTAIL_SOURCE_TOKEN;
  }

  /**
   * Log a message at specified level
   */
  async log(level: LogLevel, message: string, context?: Record<string, unknown>): Promise<void> {
    const entry: LogEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      context,
    };

    switch (this.provider) {
      case 'axiom':
        await this.sendToAxiom(entry);
        break;
      case 'logtail':
        await this.sendToLogtail(entry);
        break;
      case 'console':
      default:
        this.logToConsole(entry);
        break;
    }
  }

  /**
   * Convenience methods for different log levels
   */
  async debug(message: string, context?: Record<string, unknown>) {
    await this.log('debug', message, context);
  }

  async info(message: string, context?: Record<string, unknown>) {
    await this.log('info', message, context);
  }

  async warn(message: string, context?: Record<string, unknown>) {
    await this.log('warn', message, context);
  }

  async error(message: string, error?: Error, context?: Record<string, unknown>) {
    const enrichedContext = {
      ...context,
      error: error ? {
        name: error.name,
        message: error.message,
        stack: error.stack,
      } : undefined,
    };
    await this.log('error', message, enrichedContext);
  }

  /**
   * Send logs to Axiom
   */
  private async sendToAxiom(entry: LogEntry): Promise<void> {
    if (!this.axiomToken || !this.axiomOrgId || !this.axiomDataset) {
      console.warn('Axiom not configured, falling back to console');
      this.logToConsole(entry);
      return;
    }

    try {
      const response = await fetch(
        `https://api.axiom.co/v1/datasets/${this.axiomDataset}/ingest`,
        {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${this.axiomToken}`,
            'X-Axiom-Dataset': this.axiomDataset!,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify([entry]),
        }
      );

      if (!response.ok) {
        throw new Error(`Axiom API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send to Axiom:', error);
      this.logToConsole(entry);
    }
  }

  /**
   * Send logs to Logtail
   */
  private async sendToLogtail(entry: LogEntry): Promise<void> {
    if (!this.logtailToken) {
      console.warn('Logtail not configured, falling back to console');
      this.logToConsole(entry);
      return;
    }

    try {
      const response = await fetch('https://in.logs.logtail.com/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${this.logtailToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: entry.message,
          level: entry.level,
          timestamp: entry.timestamp,
          ...entry.context,
        }),
      });

      if (!response.ok) {
        throw new Error(`Logtail API error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send to Logtail:', error);
      this.logToConsole(entry);
    }
  }

  /**
   * Log to console (development fallback)
   */
  private logToConsole(entry: LogEntry): void {
    const emoji = {
      debug: '🔍',
      info: 'ℹ️',
      warn: '⚠️',
      error: '❌',
    }[entry.level];

    const prefix = `[${entry.timestamp}] ${emoji} [${entry.level.toUpperCase()}]`;
    
    if (entry.level === 'error') {
      console.error(prefix, entry.message, entry.context);
    } else if (entry.level === 'warn') {
      console.warn(prefix, entry.message, entry.context);
    } else {
      console.warn(prefix, entry.message, entry.context);
    }
  }

  /**
   * Create a child logger with additional context
   */
  child(defaultContext: Record<string, unknown>): ChildLogger {
    return new ChildLogger(this, defaultContext);
  }
}

/**
 * Child logger that automatically includes default context
 */
class ChildLogger {
  constructor(
    private parent: Logger,
    private defaultContext: Record<string, unknown>
  ) {}

  async debug(message: string, context?: Record<string, unknown>) {
    await this.parent.debug(message, { ...this.defaultContext, ...context });
  }

  async info(message: string, context?: Record<string, unknown>) {
    await this.parent.info(message, { ...this.defaultContext, ...context });
  }

  async warn(message: string, context?: Record<string, unknown>) {
    await this.parent.warn(message, { ...this.defaultContext, ...context });
  }

  async error(message: string, error?: Error, context?: Record<string, unknown>) {
    await this.parent.error(message, error, { ...this.defaultContext, ...context });
  }
}

// Export singleton instance
export const logger = new Logger();

// Middleware for automatic request logging
export function createRequestLogger() {
  return async (req: Request, response: Response) => {
    const start = Date.now();
    const requestId = Math.random().toString(36).substring(2, 15);
    
    try {
      const url = new URL(req.url);
      
      await logger.info('HTTP Request', {
        requestId,
        method: req.method,
        path: url.pathname,
        query: Object.fromEntries(url.searchParams),
        userAgent: req.headers.get('user-agent'),
      });

      // Clone response to read body (be careful with this in production)
      const _clonedResponse = response.clone();
      
      const duration = Date.now() - start;
      
      await logger.info('HTTP Response', {
        requestId,
        status: response.status,
        duration: `${duration}ms`,
      });

      return response;
    } catch (error) {
      await logger.error('Request failed', error as Error, { requestId });
      throw error;
    }
  };
}

export { Logger };
