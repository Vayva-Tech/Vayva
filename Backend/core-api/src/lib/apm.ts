/**
 * Application Performance Monitoring (APM) Integration
 * 
 * Supports:
 * - Datadog APM (datadoghq.com)
 * - New Relic APM (newrelic.com)
 * 
 * Environment variables:
 * - APM_PROVIDER: datadog | newrelic
 * - DD_API_KEY: Datadog API key
 * - DD_SITE: Datadog site (datadoghq.com, datadoghq.eu, etc.)
 * - NEW_RELIC_LICENSE_KEY: New Relic license key
 */

type APMProvider = 'datadog' | 'newrelic';

interface SpanContext {
  service: string;
  operation: string;
  resource?: string;
  tags?: Record<string, unknown>;
  error?: Error;
  duration?: number;
}

class APMMonitor {
  private provider: APMProvider;
  private ddApiKey?: string;
  private ddSite?: string;
  private nrLicenseKey?: string;
  private enabled: boolean;

  constructor() {
    this.provider = (process.env.APM_PROVIDER as APMProvider) || 'datadog';
    this.ddApiKey = process.env.DD_API_KEY;
    this.ddSite = process.env.DD_SITE || 'datadoghq.com';
    this.nrLicenseKey = process.env.NEW_RELIC_LICENSE_KEY;
    this.enabled = !!(this.ddApiKey || this.nrLicenseKey);
  }

  /**
   * Start a trace/span
   */
  startSpan(name: string, context?: Partial<SpanContext>): Span {
    if (!this.enabled) {
      return new NoopSpan();
    }

    const spanContext: SpanContext = {
      service: 'vayva-creative-agency',
      operation: name,
      ...context,
    };

    if (this.provider === 'datadog') {
      return new DatadogSpan(spanContext, this.ddApiKey!, this.ddSite!);
    } else if (this.provider === 'newrelic') {
      return new NewRelicSpan(spanContext, this.nrLicenseKey!);
    }

    return new NoopSpan();
  }

  /**
   * Track custom metric
   */
  async metric(name: string, value: number, tags?: Record<string, string>) {
    if (!this.enabled) {
      console.warn(`[METRIC] ${name}: ${value}`, tags);
      return;
    }

    if (this.provider === 'datadog') {
      await this.sendDatadogMetric(name, value, tags);
    } else if (this.provider === 'newrelic') {
      await this.sendNewRelicMetric(name, value, tags);
    }
  }

  /**
   * Send metric to Datadog
   */
  private async sendDatadogMetric(
    name: string,
    value: number,
    tags?: Record<string, string>
  ) {
    try {
      const series = [
        {
          metric: name,
          points: [[Math.floor(Date.now() / 1000), value]],
          type: 'gauge',
          tags: tags ? Object.entries(tags).map(([k, v]) => `${k}:${v}`) : [],
        },
      ];

      const response = await fetch(`https://api.${this.ddSite}/api/v1/series`, {
        method: 'POST',
        headers: {
          'DD-API-KEY': this.ddApiKey!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ series }),
      });

      if (!response.ok) {
        throw new Error(`Datadog metric error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send metric to Datadog:', error);
    }
  }

  /**
   * Send metric to New Relic
   */
  private async sendNewRelicMetric(
    name: string,
    value: number,
    tags?: Record<string, string>
  ) {
    try {
      const response = await fetch('https://metric-api.newrelic.com/metric/v1', {
        method: 'POST',
        headers: {
          'Api-Key': this.nrLicenseKey!,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify([
          {
            common: {
              attributes: {
                'service.name': 'vayva-creative-agency',
                ...tags,
              },
            },
            metrics: [
              {
                name,
                value,
                type: 'gauge',
              },
            ],
          },
        ]),
      });

      if (!response.ok) {
        throw new Error(`New Relic metric error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send metric to New Relic:', error);
    }
  }
}

/**
 * Span interface for tracing
 */
interface Span {
  setTag(key: string, value: string): void;
  setError(error: Error): void;
  finish(): void;
}

/**
 * Datadog APM Span
 */
class DatadogSpan implements Span {
  private context: SpanContext;
  private apiKey: string;
  private site: string;
  private startTime: number;
  private tags: Record<string, string> = {};
  private error?: Error;

  constructor(context: SpanContext, apiKey: string, site: string) {
    this.context = context;
    this.apiKey = apiKey;
    this.site = site;
    this.startTime = Date.now();

    // Send span start
    this.sendTrace();
  }

  setTag(key: string, value: string) {
    this.tags[key] = value;
  }

  setError(error: Error) {
    this.error = error;
  }

  async finish() {
    const duration = Date.now() - this.startTime;
    this.context.duration = duration;
    this.context.error = this.error;

    await this.sendTrace();
  }

  private async sendTrace() {
    try {
      const trace = [
        {
          trace_id: this.generateTraceId(),
          span_id: this.generateSpanId(),
          parent_id: null,
          name: this.context.operation,
          service: this.context.service,
          resource: this.context.resource || this.context.operation,
          start: this.startTime * 1000000, // nanoseconds
          duration: (this.context.duration || 0) * 1000000, // nanoseconds
          error: this.error ? 1 : 0,
          meta: {
            ...this.tags,
            'error.message': this.error?.message,
            'error.stack': this.error?.stack,
          },
        },
      ];

      const response = await fetch(`https://trace.agent.${this.site}/v0.4/traces`, {
        method: 'POST',
        headers: {
          'DD-API-KEY': this.apiKey,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(trace),
      });

      if (!response.ok) {
        throw new Error(`Datadog trace error: ${response.status}`);
      }
    } catch (error) {
      console.error('Failed to send trace to Datadog:', error);
    }
  }

  private generateTraceId(): string {
    return Math.random().toString(36).substring(2, 15) +
           Math.random().toString(36).substring(2, 15);
  }

  private generateSpanId(): string {
    return Math.random().toString(36).substring(2, 15);
  }
}

/**
 * New Relic APM Span
 */
class NewRelicSpan implements Span {
  private context: SpanContext;
  private licenseKey: string;
  private tags: Record<string, string> = {};
  private error?: Error;

  constructor(context: SpanContext, licenseKey: string) {
    this.context = context;
    this.licenseKey = licenseKey;
  }

  setTag(key: string, value: string) {
    this.tags[key] = value;
  }

  setError(error: Error) {
    this.error = error;
  }

  async finish() {
    // New Relic browser agent would handle this automatically
    // This is a simplified server-side implementation
    console.warn('[NEW RELIC SPAN]', {
      ...this.context,
      tags: this.tags,
      error: this.error,
    });
  }
}

/**
 * No-op span when APM is disabled
 */
class NoopSpan implements Span {
  setTag() {}
  setError() {}
  async finish() {}
}

// Export singleton instance
export const apm = new APMMonitor();

// Middleware for automatic request tracing
export function createAPMMiddleware() {
  return async (req: Request, next: () => Promise<Response>) => {
    const url = new URL(req.url);
    const span = apm.startSpan('http.request', {
      resource: `${req.method} ${url.pathname}`,
      tags: {
        'http.method': req.method,
        'http.url': url.pathname,
        'http.user_agent': req.headers.get('user-agent') || '',
      },
    });

    const start = Date.now();

    try {
      const response = await next();
      const duration = Date.now() - start;

      span.setTag('http.status_code', response.status.toString());
      await apm.metric('http.request.duration', duration, {
        method: req.method,
        path: url.pathname,
        status: response.status.toString(),
      });

      span.finish();
      return response;
    } catch (error) {
      span.setError(error as Error);
      span.finish();
      throw error;
    }
  };
}

export { APMMonitor };
