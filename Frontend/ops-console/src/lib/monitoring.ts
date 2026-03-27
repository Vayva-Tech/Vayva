/**
 * Enhanced Monitoring & Alerting System
 * Real-time monitoring with intelligent alerting
 */

import { Queue } from 'bullmq';

export interface AlertConfig {
  id: string;
  name: string;
  metric: string;
  threshold: number;
  operator: 'gt' | 'lt' | 'eq' | 'gte' | 'lte';
  severity: 'critical' | 'warning' | 'info';
  channels: ('email' | 'slack' | 'webhook')[];
  cooldownMinutes: number;
  enabled: boolean;
}

export interface MetricValue {
  name: string;
  value: number;
  timestamp: Date;
  tags?: Record<string, string>;
}

export class MonitoringService {
  private alertQueue: Queue;
  private lastAlertTime = new Map<string, Date>();

  constructor() {
    this.alertQueue = new Queue('alerts', {
      connection: {
        url: process.env.REDIS_URL || 'redis://localhost:6379',
      },
    });
  }

  /**
   * Check all configured alerts against current metrics
   */
  async checkAlerts(): Promise<void> {
    const alerts = await this.getEnabledAlerts();

    for (const alert of alerts) {
      const metricValue = await this.getCurrentMetric(alert.metric);
      
      if (!metricValue) continue;

      const triggered = this.evaluateCondition(
        metricValue.value,
        alert.operator,
        alert.threshold
      );

      if (triggered && !this.isInCooldown(alert.id, alert.cooldownMinutes)) {
        await this.triggerAlert(alert, metricValue);
      }
    }
  }

  /**
   * Evaluate alert condition
   */
  private evaluateCondition(
    actual: number,
    operator: AlertConfig['operator'],
    threshold: number
  ): boolean {
    switch (operator) {
      case 'gt': return actual > threshold;
      case 'lt': return actual < threshold;
      case 'eq': return actual === threshold;
      case 'gte': return actual >= threshold;
      case 'lte': return actual <= threshold;
    }
  }

  /**
   * Trigger an alert and send notifications
   */
  private async triggerAlert(
    alert: AlertConfig,
    metric: MetricValue
  ): Promise<void> {
    console.warn(`🚨 ALERT TRIGGERED: ${alert.name}`);
    console.warn(`   Metric: ${metric.name} = ${metric.value}`);
    console.warn(`   Threshold: ${alert.operator} ${alert.threshold}`);
    console.warn(`   Severity: ${alert.severity}`);

    // Update last alert time
    this.lastAlertTime.set(alert.id, new Date());

    // Add to alert queue for processing
    await this.alertQueue.add('send-alert', {
      alertId: alert.id,
      metricName: metric.name,
      metricValue: metric.value,
      threshold: alert.threshold,
      severity: alert.severity,
      channels: alert.channels,
      timestamp: new Date(),
    });
  }

  /**
   * Get current value for a metric
   */
  async getCurrentMetric(metricName: string): Promise<MetricValue | null> {
    switch (metricName) {
      case 'error_rate':
        return this.getErrorRate();
      case 'response_time_p95':
        return this.getResponseTimeP95();
      case 'health_score_average':
        return this.getAverageHealthScore();
      case 'nps_response_rate':
        return this.getNPSResponseRate();
      case 'playbook_failure_rate':
        return this.getPlaybookFailureRate();
      default:
        return null;
    }
  }

  /**
   * Calculate error rate (last 5 minutes)
   */
  private async getErrorRate(): Promise<MetricValue> {
    // Placeholder implementation - would call backend monitoring API
    return {
      name: 'error_rate',
      value: 0.5, // percentage
      timestamp: new Date(),
    };
  }

  /**
   * Get 95th percentile response time
   */
  private async getResponseTimeP95(): Promise<MetricValue> {
    // Placeholder - would query actual metrics
    return {
      name: 'response_time_p95',
      value: 450, // milliseconds
      timestamp: new Date(),
    };
  }

  /**
   * Get average health score across all stores
   */
  private async getAverageHealthScore(): Promise<MetricValue> {
    // Migrated from Prisma to backend API call
    // Would call: GET /api/v1/analytics/health-scores/average
    return {
      name: 'health_score_average',
      value: 0, // placeholder until backend endpoint exists
      timestamp: new Date(),
    };
  }

  /**
   * Get NPS response rate
   */
  private async getNPSResponseRate(): Promise<MetricValue> {
    // Migrated from Prisma to backend API call
    // Would call: GET /api/v1/analytics/nps/response-rate
    return {
      name: 'nps_response_rate',
      value: 0, // placeholder until backend endpoint exists
      timestamp: new Date(),
    };
  }

  /**
   * Get playbook failure rate
   */
  private async getPlaybookFailureRate(): Promise<MetricValue> {
    // Migrated from Prisma to backend API call
    // Would call: GET /api/v1/analytics/playbooks/failure-rate
    return {
      name: 'playbook_failure_rate',
      value: 0, // placeholder until backend endpoint exists
      timestamp: new Date(),
    };
  }

  /**
   * Get all enabled alerts
   */
  private async getEnabledAlerts(): Promise<AlertConfig[]> {
    // In production, this would query a database table
    // For now, return default alert configurations
    return [
      {
        id: 'alert-error-rate',
        name: 'High Error Rate',
        metric: 'error_rate',
        threshold: 5,
        operator: 'gt',
        severity: 'critical',
        channels: ['email', 'slack'],
        cooldownMinutes: 15,
        enabled: true,
      },
      {
        id: 'alert-response-time',
        name: 'Slow Response Time',
        metric: 'response_time_p95',
        threshold: 1000,
        operator: 'gt',
        severity: 'warning',
        channels: ['slack'],
        cooldownMinutes: 30,
        enabled: true,
      },
      {
        id: 'alert-health-score',
        name: 'Low Average Health Score',
        metric: 'health_score_average',
        threshold: 60,
        operator: 'lt',
        severity: 'warning',
        channels: ['email'],
        cooldownMinutes: 60,
        enabled: true,
      },
      {
        id: 'alert-playbook-failures',
        name: 'High Playbook Failure Rate',
        metric: 'playbook_failure_rate',
        threshold: 20,
        operator: 'gt',
        severity: 'critical',
        channels: ['email', 'slack'],
        cooldownMinutes: 15,
        enabled: true,
      },
    ];
  }

  /**
   * Check if alert is in cooldown period
   */
  private isInCooldown(alertId: string, cooldownMinutes: number): boolean {
    const lastAlert = this.lastAlertTime.get(alertId);
    if (!lastAlert) return false;

    const cooldownMs = cooldownMinutes * 60 * 1000;
    return Date.now() - lastAlert.getTime() < cooldownMs;
  }

  /**
   * Send alert notification through specified channels
   */
  async sendAlertNotification(
    alert: AlertConfig,
    metricValue: number,
    channels: AlertConfig['channels']
  ): Promise<void> {
    const promises = [];

    if (channels.includes('email')) {
      promises.push(this.sendEmailAlert(alert, metricValue));
    }

    if (channels.includes('slack')) {
      promises.push(this.sendSlackAlert(alert, metricValue));
    }

    if (channels.includes('webhook')) {
      promises.push(this.sendWebhookAlert(alert, metricValue));
    }

    await Promise.all(promises);
  }

  /**
   * Send email alert
   */
  private async sendEmailAlert(alert: AlertConfig, metricValue: number): Promise<void> {
    console.warn(`📧 Sending email alert: ${alert.name}`);
    // Implementation would use @vayva/emails or similar service
  }

  /**
   * Send Slack alert
   */
  private async sendSlackAlert(alert: AlertConfig, metricValue: number): Promise<void> {
    console.warn(`💬 Sending Slack alert: ${alert.name}`);
    
    if (!process.env.SLACK_WEBHOOK_URL) {
      console.warn('SLACK_WEBHOOK_URL not configured');
      return;
    }

    const color = alert.severity === 'critical' ? '#FF0000' : '#FFA500';
    
    await fetch(process.env.SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        attachments: [{
          color,
          title: `🚨 ${alert.name}`,
          fields: [
            { title: 'Metric', value: alert.metric, short: true },
            { title: 'Current Value', value: metricValue.toString(), short: true },
            { title: 'Threshold', value: `${alert.operator} ${alert.threshold}`, short: true },
            { title: 'Severity', value: alert.severity.toUpperCase(), short: true },
          ],
          ts: Math.floor(Date.now() / 1000),
        }],
      }),
    });
  }

  /**
   * Send webhook alert
   */
  private async sendWebhookAlert(alert: AlertConfig, metricValue: number): Promise<void> {
    console.warn(`🔗 Sending webhook alert: ${alert.name}`);
    // Implementation would call custom webhook URL
  }

  /**
   * Start continuous monitoring loop
   */
  startMonitoring(intervalMinutes: number = 5): void {
    console.warn(`👁️ Starting monitoring service (interval: ${intervalMinutes}m)`);
    
    setInterval(() => {
      this.checkAlerts().catch(console.error);
    }, intervalMinutes * 60 * 1000);
  }

  /**
   * Cleanup resources
   */
  async cleanup(): Promise<void> {
    await this.alertQueue.close();
  }
}

// Export singleton instance
export const monitoringService = new MonitoringService();
