/**
 * Performance Alerts
 * Alerting system for performance threshold violations
 */

import { PerformanceMetric, PerformanceThreshold } from './monitor';

export interface AlertRule {
  id: string;
  name: string;
  metricName: string;
  threshold: PerformanceThreshold;
  duration?: number; // Duration in ms that threshold must be exceeded
  cooldown?: number; // Cooldown in ms between alerts
}

export interface Alert {
  id: string;
  ruleId: string;
  ruleName: string;
  metric: PerformanceMetric;
  severity: 'warning' | 'critical';
  message: string;
  timestamp: Date;
  acknowledged?: boolean;
}

export type AlertHandler = (alert: Alert) => void | Promise<void>;

export class PerformanceAlertManager {
  private rules = new Map<string, AlertRule>();
  private alerts: Alert[] = [];
  private handlers: AlertHandler[] = [];
  private lastAlertTime = new Map<string, number>();
  private metricHistory = new Map<string, PerformanceMetric[]>();
  private maxHistorySize = 100;

  /**
   * Add an alert rule
   */
  addRule(rule: AlertRule): void {
    this.rules.set(rule.id, rule);
  }

  /**
   * Remove an alert rule
   */
  removeRule(ruleId: string): boolean {
    return this.rules.delete(ruleId);
  }

  /**
   * Process a metric and check for alert conditions
   */
  processMetric(metric: PerformanceMetric): Alert | null {
    // Add to history
    const history = this.metricHistory.get(metric.name) || [];
    history.push(metric);
    if (history.length > this.maxHistorySize) {
      history.shift();
    }
    this.metricHistory.set(metric.name, history);

    // Check rules
    for (const rule of this.rules.values()) {
      if (rule.metricName !== metric.name) continue;

      const alert = this.checkRule(rule, metric, history);
      if (alert) {
        this.triggerAlert(alert);
        return alert;
      }
    }

    return null;
  }

  /**
   * Check if a rule should trigger an alert
   */
  private checkRule(
    rule: AlertRule,
    metric: PerformanceMetric,
    history: PerformanceMetric[]
  ): Alert | null {
    // Check cooldown
    const lastAlert = this.lastAlertTime.get(rule.id);
    if (lastAlert && rule.cooldown) {
      if (Date.now() - lastAlert < rule.cooldown) {
        return null;
      }
    }

    // Determine severity
    let severity: 'warning' | 'critical' | null = null;
    if (metric.value >= rule.threshold.critical) {
      severity = 'critical';
    } else if (metric.value >= rule.threshold.warning) {
      severity = 'warning';
    }

    if (!severity) return null;

    // Check duration requirement
    if (rule.duration && rule.duration > 0) {
      const recentMetrics = history.filter(
        m => Date.now() - m.timestamp.getTime() <= rule.duration!
      );
      const violatingMetrics = recentMetrics.filter(m =>
        severity === 'critical'
          ? m.value >= rule.threshold.critical
          : m.value >= rule.threshold.warning
      );

      // Require at least 3 data points or 50% of window
      const minRequired = Math.max(3, Math.floor(recentMetrics.length / 2));
      if (violatingMetrics.length < minRequired) {
        return null;
      }
    }

    // Create alert
    const alert: Alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ruleId: rule.id,
      ruleName: rule.name,
      metric,
      severity,
      message: this.generateAlertMessage(rule, metric, severity),
      timestamp: new Date(),
    };

    this.lastAlertTime.set(rule.id, Date.now());
    return alert;
  }

  /**
   * Generate alert message
   */
  private generateAlertMessage(
    rule: AlertRule,
    metric: PerformanceMetric,
    severity: 'warning' | 'critical'
  ): string {
    const threshold =
      severity === 'critical' ? rule.threshold.critical : rule.threshold.warning;
    return (
      `[${severity.toUpperCase()}] ${rule.name}: ` +
      `${metric.name} is ${metric.value}${metric.unit} ` +
      `(threshold: ${threshold})`
    );
  }

  /**
   * Trigger an alert
   */
  private async triggerAlert(alert: Alert): Promise<void> {
    this.alerts.push(alert);

    // Notify handlers
    for (const handler of this.handlers) {
      try {
        await handler(alert);
      } catch (error) {
        console.error('Error in alert handler:', error);
      }
    }
  }

  /**
   * Subscribe to alerts
   */
  onAlert(handler: AlertHandler): () => void {
    this.handlers.push(handler);
    return () => {
      const index = this.handlers.indexOf(handler);
      if (index > -1) {
        this.handlers.splice(index, 1);
      }
    };
  }

  /**
   * Get all alerts
   */
  getAlerts(options?: {
    severity?: 'warning' | 'critical';
    acknowledged?: boolean;
    since?: Date;
  }): Alert[] {
    let alerts = [...this.alerts];

    if (options?.severity) {
      alerts = alerts.filter(a => a.severity === options.severity);
    }

    if (options?.acknowledged !== undefined) {
      alerts = alerts.filter(a => a.acknowledged === options.acknowledged);
    }

    if (options?.since) {
      alerts = alerts.filter(a => a.timestamp >= options.since!);
    }

    return alerts.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string): boolean {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledged = true;
      return true;
    }
    return false;
  }

  /**
   * Clear all alerts
   */
  clearAlerts(): void {
    this.alerts = [];
  }

  /**
   * Get active rules
   */
  getRules(): AlertRule[] {
    return Array.from(this.rules.values());
  }

  /**
   * Create default alert rules for common metrics
   */
  setupDefaultRules(): void {
    const defaultRules: AlertRule[] = [
      {
        id: 'api-p95-latency',
        name: 'API P95 Latency High',
        metricName: 'api-response-time',
        threshold: { warning: 200, critical: 500 },
        duration: 60000, // 1 minute
        cooldown: 300000, // 5 minutes
      },
      {
        id: 'db-query-time',
        name: 'Database Query Time High',
        metricName: 'db-query-time',
        threshold: { warning: 50, critical: 200 },
        duration: 30000, // 30 seconds
        cooldown: 300000,
      },
      {
        id: 'error-rate',
        name: 'Error Rate High',
        metricName: 'error-rate',
        threshold: { warning: 0.05, critical: 0.1 },
        duration: 60000,
        cooldown: 300000,
      },
      {
        id: 'memory-usage',
        name: 'Memory Usage High',
        metricName: 'memory-usage',
        threshold: { warning: 80, critical: 90 },
        duration: 120000, // 2 minutes
        cooldown: 600000, // 10 minutes
      },
    ];

    defaultRules.forEach(rule => this.addRule(rule));
  }
}

// Global alert manager instance
export const alertManager = new PerformanceAlertManager();

export default PerformanceAlertManager;
