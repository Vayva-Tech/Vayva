/**
 * Enhanced Alerting Service Configuration
 * Multi-provider alerting with intelligent routing and deduplication
 */

import { logger } from '@vayva/shared';

// ============================================================================
// Types & Configuration
// ============================================================================
export type AlertSeverity = 'critical' | 'error' | 'warning' | 'info';
export type AlertingProvider = 'pagerduty' | 'opsgenie' | 'slack' | 'webhook';

export interface AlertPayload {
  title: string;
  description?: string;
  severity: AlertSeverity;
  source: string;
  timestamp: string;
  metadata?: Record<string, unknown>;
  dedupKey?: string;
  groupingKey?: string;
}

export interface AlertChannel {
  type: 'email' | 'slack' | 'webhook' | 'pagerduty' | 'opsgenie';
  config: Record<string, string>;
  severityFilter?: AlertSeverity[];
}

export interface AlertConfig {
  providers: AlertingProvider[];
  channels: AlertChannel[];
  defaultSeverity: AlertSeverity;
  enableDeduplication: boolean;
  cooldownPeriodMs: number;
}

// ============================================================================
// Enhanced Alerting Service
// ============================================================================
export class AlertingService {
  private config: AlertConfig;
  private lastAlertTime = new Map<string, number>();
  private alertCounts = new Map<string, number>();
  private resetInterval: NodeJS.Timeout;

  constructor(config?: Partial<AlertConfig>) {
    this.config = {
      providers: (process.env.ALERTING_PROVIDERS?.split(',') as AlertingProvider[]) || ['slack'],
      channels: [],
      defaultSeverity: 'error',
      enableDeduplication: true,
      cooldownPeriodMs: parseInt(process.env.ALERT_COOLDOWN_MS || '900000'), // 15 minutes
      ...config,
    };

    // Reset alert counts every hour
    this.resetInterval = setInterval(() => {
      this.alertCounts.clear();
    }, 3600000);
  }

  /**
   * Send alert through configured providers
   */
  async sendAlert(payload: AlertPayload): Promise<{ success: boolean; error?: string }> {
    try {
      // Check if in cooldown period
      if (this.config.enableDeduplication && payload.dedupKey) {
        const lastAlert = this.lastAlertTime.get(payload.dedupKey);
        if (lastAlert && Date.now() - lastAlert < this.config.cooldownPeriodMs) {
          logger.debug('Alert suppressed due to cooldown', { 
            dedupKey: payload.dedupKey,
            title: payload.title,
          });
          return { success: true, error: 'Suppressed by cooldown' };
        }
      }

      // Track alert frequency
      const countKey = `${payload.severity}:${payload.title}`;
      const currentCount = (this.alertCounts.get(countKey) || 0) + 1;
      this.alertCounts.set(countKey, currentCount);

      // Escalate severity if too many alerts
      if (currentCount >= 10 && payload.severity !== 'critical') {
        payload.severity = 'critical';
        logger.warn('Escalating alert to critical due to frequency', { count: currentCount });
      }

      // Send to all configured providers
      const results = await Promise.allSettled([
        ...(this.config.providers.includes('pagerduty') ? [this.sendToPagerDuty(payload)] : []),
        ...(this.config.providers.includes('opsgenie') ? [this.sendToOpsgenie(payload)] : []),
        ...(this.config.providers.includes('slack') ? [this.sendToSlack(payload)] : []),
      ]);

      const failures = results.filter(r => r.status === 'rejected');
      
      // Update last alert time
      if (payload.dedupKey) {
        this.lastAlertTime.set(payload.dedupKey, Date.now());
      }

      if (failures.length > 0) {
        logger.error('Some alert providers failed', { failures });
        return { 
          success: false, 
          error: `${failures.length} provider(s) failed` 
        };
      }

      logger.info('Alert sent successfully', { 
        title: payload.title, 
        severity: payload.severity,
        providers: this.config.providers,
      });

      return { success: true };
    } catch (error) {
      logger.error('Failed to send alert', { error, payload });
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Convenience methods for different severities
   */
  async critical(title: string, description?: string, metadata?: Record<string, unknown>) {
    return this.sendAlert({
      title,
      description,
      severity: 'critical',
      source: 'vayva-platform',
      timestamp: new Date().toISOString(),
      metadata,
      dedupKey: this.generateDedupKey(title),
    });
  }

  async error(title: string, description?: string, metadata?: Record<string, unknown>) {
    return this.sendAlert({
      title,
      description,
      severity: 'error',
      source: 'vayva-platform',
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  async warning(title: string, description?: string, metadata?: Record<string, unknown>) {
    return this.sendAlert({
      title,
      description,
      severity: 'warning',
      source: 'vayva-platform',
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  async info(title: string, description?: string, metadata?: Record<string, unknown>) {
    return this.sendAlert({
      title,
      description,
      severity: 'info',
      source: 'vayva-platform',
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  /**
   * Send to PagerDuty Events API v2
   */
  private async sendToPagerDuty(payload: AlertPayload): Promise<void> {
    const routingKey = process.env.PAGERDUTY_ROUTING_KEY;
    
    if (!routingKey) {
      logger.warn('PagerDuty not configured, skipping');
      return;
    }

    const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        routing_key: routingKey,
        event_action: 'trigger',
        dedup_key: payload.dedupKey,
        payload: {
          summary: payload.title,
          source: payload.source,
          severity: this.mapPagerDutySeverity(payload.severity),
          timestamp: payload.timestamp,
          details: {
            description: payload.description,
            ...payload.metadata,
          },
        },
      }),
    });

    if (!response.ok) {
      throw new Error(`PagerDuty API error: ${response.status}`);
    }
  }

  /**
   * Send to Opsgenie API
   */
  private async sendToOpsgenie(payload: AlertPayload): Promise<void> {
    const apiKey = process.env.OPSGENIE_API_KEY;
    
    if (!apiKey) {
      logger.warn('Opsgenie not configured, skipping');
      return;
    }

    const response = await fetch('https://api.opsgenie.com/v2/alerts', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `GenieKey ${apiKey}`,
      },
      body: JSON.stringify({
        message: payload.title,
        description: payload.description,
        alias: payload.dedupKey,
        priority: this.mapOpsgeniePriority(payload.severity),
        source: payload.source,
        createdAt: payload.timestamp,
        details: payload.metadata,
      }),
    });

    if (!response.ok) {
      throw new Error(`Opsgenie API error: ${response.status}`);
    }
  }

  /**
   * Send to Slack webhook
   */
  private async sendToSlack(payload: AlertPayload): Promise<void> {
    const webhookUrl = process.env.SLACK_WEBHOOK_URL;
    
    if (!webhookUrl) {
      logger.warn('Slack webhook not configured, skipping');
      return;
    }

    const color = {
      critical: '#FF0000',
      error: '#FF6600',
      warning: '#FFA500',
      info: '#36A64F',
    }[payload.severity];

    const emoji = {
      critical: '🚨',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    }[payload.severity];

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        attachments: [
          {
            color,
            blocks: [
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: `*${emoji} ${payload.title}*`,
                },
              },
              {
                type: 'section',
                text: {
                  type: 'mrkdwn',
                  text: payload.description || '',
                },
              },
              {
                type: 'context',
                elements: [
                  {
                    type: 'mrkdwn',
                    text: `Source: ${payload.source} | Severity: ${payload.severity} | Time: ${new Date(payload.timestamp).toLocaleString()}`,
                  },
                ],
              },
              ...(payload.metadata
                ? [{
                    type: 'section',
                    fields: Object.entries(payload.metadata).slice(0, 10).map(([key, value]) => ({
                      type: 'mrkdwn',
                      text: `*${key}:*\n\`${value}\``,
                    })),
                  }]
                : []),
            ],
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`Slack webhook error: ${response.status}`);
    }
  }

  /**
   * Map severity to PagerDuty format
   */
  private mapPagerDutySeverity(severity: AlertSeverity): string {
    const mapping: Record<AlertSeverity, string> = {
      critical: 'critical',
      error: 'error',
      warning: 'warning',
      info: 'info',
    };
    return mapping[severity];
  }

  /**
   * Map severity to Opsgenie priority
   */
  private mapOpsgeniePriority(severity: AlertSeverity): string {
    const mapping: Record<AlertSeverity, string> = {
      critical: 'P1',
      error: 'P2',
      warning: 'P3',
      info: 'P4',
    };
    return mapping[severity];
  }

  /**
   * Generate deduplication key
   */
  private generateDedupKey(title: string): string {
    return `vayva:${title.replace(/\s+/g, '-').toLowerCase()}`;
  }

  /**
   * Cleanup resources
   */
  cleanup() {
    clearInterval(this.resetInterval);
  }
}

// ============================================================================
// Export singleton instance
// ============================================================================
export const alerting = new AlertingService();

// ============================================================================
// Automatic Error Alerting Middleware
// ============================================================================
export function createErrorAlerter(options?: { threshold?: number; windowMs?: number }) {
  const threshold = options?.threshold || 5;
  const windowMs = options?.windowMs || 60000;
  let errorCount = 0;
  let lastReset = Date.now();

  return async (error: Error, context?: Record<string, unknown>) => {
    const now = Date.now();
    
    // Reset counter after window expires
    if (now - lastReset > windowMs) {
      errorCount = 0;
      lastReset = now;
    }

    errorCount++;

    // Alert if threshold reached
    if (errorCount >= threshold) {
      await alerting.critical(
        'High Error Rate Detected',
        `${errorCount} errors in the last ${windowMs / 1000}s`,
        {
          latestError: error.message,
          stack: error.stack,
          ...context,
        }
      );
      
      errorCount = 0; // Reset after alerting
    }
  };
}
