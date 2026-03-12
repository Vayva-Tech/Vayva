/**
 * Alerting Service Integration
 * 
 * Supports multiple alerting providers:
 * - PagerDuty (pagerduty.com)
 * - Opsgenie (opsgenie.com)
 * - Slack webhooks (for simpler setups)
 * 
 * Environment variables:
 * - ALERTING_PROVIDER: pagerduty | opsgenie | slack
 * - PAGERDUTY_ROUTING_KEY: Your PagerDuty Events API v2 routing key
 * - OPSGENIE_API_KEY: Your Opsgenie API key
 * - SLACK_WEBHOOK_URL: Your Slack incoming webhook URL
 */

type AlertSeverity = 'critical' | 'error' | 'warning' | 'info';
type AlertingProvider = 'pagerduty' | 'opsgenie' | 'slack';

interface AlertPayload {
  title: string;
  description?: string;
  severity: AlertSeverity;
  source: string;
  timestamp: string;
  metadata?: Record<string, any>;
  dedupKey?: string;
}

class AlertingService {
  private provider: AlertingProvider;
  private pagerdutyKey?: string;
  private opsgenieKey?: string;
  private slackWebhookUrl?: string;

  constructor() {
    this.provider = (process.env.ALERTING_PROVIDER as AlertingProvider) || 'slack';
    this.pagerdutyKey = process.env.PAGERDUTY_ROUTING_KEY;
    this.opsgenieKey = process.env.OPSGENIE_API_KEY;
    this.slackWebhookUrl = process.env.SLACK_WEBHOOK_URL;
  }

  /**
   * Send an alert to configured provider
   */
  async sendAlert(payload: AlertPayload): Promise<{ success: boolean; error?: string }> {
    switch (this.provider) {
      case 'pagerduty':
        return this.sendToPagerDuty(payload);
      case 'opsgenie':
        return this.sendToOpsgenie(payload);
      case 'slack':
      default:
        return this.sendToSlack(payload);
    }
  }

  /**
   * Convenience methods for different severities
   */
  async critical(title: string, description?: string, metadata?: Record<string, any>) {
    return this.sendAlert({
      title,
      description,
      severity: 'critical',
      source: 'vayva-creative-agency',
      timestamp: new Date().toISOString(),
      metadata,
      dedupKey: this.generateDedupKey(title),
    });
  }

  async error(title: string, description?: string, metadata?: Record<string, any>) {
    return this.sendAlert({
      title,
      description,
      severity: 'error',
      source: 'vayva-creative-agency',
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  async warning(title: string, description?: string, metadata?: Record<string, any>) {
    return this.sendAlert({
      title,
      description,
      severity: 'warning',
      source: 'vayva-creative-agency',
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  async info(title: string, description?: string, metadata?: Record<string, any>) {
    return this.sendAlert({
      title,
      description,
      severity: 'info',
      source: 'vayva-creative-agency',
      timestamp: new Date().toISOString(),
      metadata,
    });
  }

  /**
   * Send to PagerDuty Events API v2
   */
  private async sendToPagerDuty(payload: AlertPayload): Promise<{ success: boolean; error?: string }> {
    if (!this.pagerdutyKey) {
      console.warn('PagerDuty not configured, falling back to console');
      this.logToConsole(payload);
      return { success: false, error: 'PagerDuty not configured' };
    }

    try {
      const response = await fetch('https://events.pagerduty.com/v2/enqueue', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          routing_key: this.pagerdutyKey,
          event_action: 'trigger',
          dedup_key: payload.dedupKey,
          payload: {
            summary: payload.title,
            source: payload.source,
            severity: this.mapSeverity(payload.severity),
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

      console.log('Alert sent to PagerDuty');
      return { success: true };
    } catch (error) {
      console.error('Failed to send alert to PagerDuty:', error);
      this.logToConsole(payload);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Send to Opsgenie API
   */
  private async sendToOpsgenie(payload: AlertPayload): Promise<{ success: boolean; error?: string }> {
    if (!this.opsgenieKey) {
      console.warn('Opsgenie not configured, falling back to console');
      this.logToConsole(payload);
      return { success: false, error: 'Opsgenie not configured' };
    }

    try {
      const response = await fetch('https://api.opsgenie.com/v2/alerts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `GenieKey ${this.opsgenieKey}`,
        },
        body: JSON.stringify({
          message: payload.title,
          description: payload.description,
          alias: payload.dedupKey,
          priority: this.mapSeverityToPriority(payload.severity),
          source: payload.source,
          createdAt: payload.timestamp,
          details: payload.metadata,
        }),
      });

      if (!response.ok) {
        throw new Error(`Opsgenie API error: ${response.status}`);
      }

      console.log('Alert sent to Opsgenie');
      return { success: true };
    } catch (error) {
      console.error('Failed to send alert to Opsgenie:', error);
      this.logToConsole(payload);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Send to Slack webhook
   */
  private async sendToSlack(payload: AlertPayload): Promise<{ success: boolean; error?: string }> {
    if (!this.slackWebhookUrl) {
      console.warn('Slack webhook not configured, falling back to console');
      this.logToConsole(payload);
      return { success: false, error: 'Slack not configured' };
    }

    try {
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

      const response = await fetch(this.slackWebhookUrl, {
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
              ],
            },
          ],
        }),
      });

      if (!response.ok) {
        throw new Error(`Slack webhook error: ${response.status}`);
      }

      console.log('Alert sent to Slack');
      return { success: true };
    } catch (error) {
      console.error('Failed to send alert to Slack:', error);
      this.logToConsole(payload);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  /**
   * Log alert to console (fallback)
   */
  private logToConsole(payload: AlertPayload) {
    const emoji = {
      critical: '🚨',
      error: '❌',
      warning: '⚠️',
      info: 'ℹ️',
    }[payload.severity];

    console.error(`${emoji} [ALERT] ${payload.severity.toUpperCase()}: ${payload.title}`);
    if (payload.description) {
      console.error('Description:', payload.description);
    }
    if (payload.metadata) {
      console.error('Metadata:', payload.metadata);
    }
  }

  /**
   * Map severity to PagerDuty format
   */
  private mapSeverity(severity: AlertSeverity): string {
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
  private mapSeverityToPriority(severity: AlertSeverity): string {
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
}

// Export singleton instance
export const alerting = new AlertingService();

// Middleware for automatic error alerting
export function createErrorAlerter(options?: { threshold?: number }) {
  const threshold = options?.threshold || 5; // Alert after 5 errors in 1 minute
  let errorCount = 0;
  let lastReset = Date.now();

  return async (error: Error, context?: Record<string, any>) => {
    const now = Date.now();
    
    // Reset counter every minute
    if (now - lastReset > 60000) {
      errorCount = 0;
      lastReset = now;
    }

    errorCount++;

    // Only alert if threshold reached
    if (errorCount >= threshold) {
      await alerting.critical(
        'High Error Rate Detected',
        `${errorCount} errors detected in the last minute`,
        {
          latestError: error.message,
          stack: error.stack,
          ...context,
        }
      );
      
      // Reset after alerting
      errorCount = 0;
    }
  };
}

export { AlertingService };
