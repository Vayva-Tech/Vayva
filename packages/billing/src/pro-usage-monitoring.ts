import { prisma } from '@vayva/db';
import { logger } from '../logger';
import type { UsageMetric } from '@/lib/access-control/tier-limits';
import { pricingPolicyAgent } from './pricing-policy-agent';

/**
 * Enhanced Usage Monitoring Service for Pro Users
 * 
 * Provides real-time usage tracking, predictive analytics, and automated alerts
 * for Pro tier users to prevent overages and optimize costs.
 */

export interface ProUsageStats {
  current: number;
  limit: number;
  percentage: number;
  dailyAverage: number;
  projectedMonthly: number;
  projectedOverage: number;
  projectedCost: number;
  trend: 'increasing' | 'decreasing' | 'stable';
  alerts: UsageAlert[];
}

export interface UsageAlert {
  level: 'info' | 'warning' | 'critical';
  message: string;
  triggeredAt: Date;
  metric: UsageMetric;
  threshold: number;
}

export interface UsagePrediction {
  metric: UsageMetric;
  daysUntilLimit: number;
  recommendedAction: 'monitor' | 'purchase_addon' | 'upgrade_plan';
  confidence: number; // 0-1 scale
}

/**
 * Enhanced Usage Monitoring Service
 */
export class ProUsageMonitoringService {
  private static readonly ALERT_THRESHOLDS = {
    WARNING: 0.8,  // 80% - Warning level
    CRITICAL: 0.95 // 95% - Critical level
  };

  /**
   * Get comprehensive usage statistics for Pro users
   */
  static async getProUsageStats(userId: string): Promise<Record<UsageMetric, ProUsageStats>> {
    try {
      // Get subscription info
      const subscription = await prisma.merchantAiSubscription.findUnique({
        where: { storeId: userId },
        include: { plan: true }
      });

      if (!subscription) {
        throw new Error('No subscription found');
      }

      // Get recent usage data (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const usageEvents = await prisma.aiUsageEvent.findMany({
        where: {
          storeId: userId,
          timestamp: { gte: thirtyDaysAgo }
        },
        orderBy: { timestamp: 'asc' }
      });

      // Aggregate usage by metric
      const usageByMetric: Record<UsageMetric, number[]> = {
        'AI_TOKENS': [],
        'WHATSAPP_MESSAGES': [],
        'WHATSAPP_MEDIA': [],
        'STORAGE_GB': [],
        'API_CALLS': [],
        'BANDWIDTH_GB': []
      };

      usageEvents.forEach(event => {
        // Map AI usage events to metrics
        usageByMetric['AI_TOKENS'].push(event.inputTokens + event.outputTokens);
        usageByMetric['WHATSAPP_MESSAGES'].push(1); // Each event is one message
        // Add other mappings as needed
      });

      // Calculate stats for each metric
      const stats: Record<UsageMetric, ProUsageStats> = {} as any;

      for (const [metric, usageData] of Object.entries(usageByMetric)) {
        const metricKey = metric as UsageMetric;
        const limit = pricingPolicyAgent.getUsageQuota(subscription.planKey as any, metricKey);
        const current = usageData.reduce((sum, val) => sum + val, 0);
        const percentage = limit > 0 ? Math.min(100, (current / limit) * 100) : 0;
        
        // Calculate daily average
        const dailyAverage = usageData.length > 0 ? current / 30 : 0;
        
        // Project monthly usage
        const daysRemaining = 30 - new Date().getDate();
        const projectedMonthly = current + (dailyAverage * daysRemaining);
        const projectedOverage = Math.max(0, projectedMonthly - limit);
        const projectedCost = pricingPolicyAgent.calculateOverageCost(metricKey, projectedOverage);
        
        // Determine trend
        const trend = this.calculateTrend(usageData);
        
        // Generate alerts
        const alerts = this.generateUsageAlerts(metricKey, current, limit, percentage);
        
        stats[metricKey] = {
          current,
          limit,
          percentage,
          dailyAverage,
          projectedMonthly,
          projectedOverage,
          projectedCost,
          trend,
          alerts
        };
      }

      return stats;
    } catch (error) {
      logger.error('[ProUsageMonitoring] Failed to get usage stats', error);
      throw error;
    }
  }

  /**
   * Generate usage predictions for proactive management
   */
  static async getUsagePredictions(userId: string): Promise<UsagePrediction[]> {
    try {
      const stats = await this.getProUsageStats(userId);
      const predictions: UsagePrediction[] = [];

      for (const [metric, stat] of Object.entries(stats)) {
        const metricKey = metric as UsageMetric;
        
        if (stat.dailyAverage <= 0) continue;

        // Days until reaching limit at current rate
        const daysUntilLimit = stat.limit > stat.current 
          ? Math.ceil((stat.limit - stat.current) / stat.dailyAverage)
          : 0;

        // Confidence based on data consistency
        const confidence = this.calculateConfidence(stat.trend, stat.dailyAverage);

        // Recommendation logic
        let recommendedAction: UsagePrediction['recommendedAction'] = 'monitor';
        
        if (stat.percentage > 90) {
          recommendedAction = 'upgrade_plan';
        } else if (stat.projectedOverage > 0 && stat.projectedCost > 1000) { // ₦10 threshold
          recommendedAction = 'purchase_addon';
        }

        predictions.push({
          metric: metricKey,
          daysUntilLimit,
          recommendedAction,
          confidence
        });
      }

      return predictions.sort((a, b) => a.daysUntilLimit - b.daysUntilLimit);
    } catch (error) {
      logger.error('[ProUsageMonitoring] Failed to get predictions', error);
      throw error;
    }
  }

  /**
   * Send automated alerts based on usage thresholds
   */
  static async sendUsageAlerts(userId: string): Promise<void> {
    try {
      const stats = await this.getProUsageStats(userId);
      const predictions = await this.getUsagePredictions(userId);
      
      // Check for critical alerts
      const criticalAlerts = Object.values(stats).flatMap(stat => 
        stat.alerts.filter(alert => alert.level === 'critical')
      );

      if (criticalAlerts.length > 0) {
        await this.sendCriticalAlertNotification(userId, criticalAlerts);
      }

      // Check for early warning predictions
      const urgentPredictions = predictions.filter(p => 
        p.daysUntilLimit <= 3 && p.recommendedAction !== 'monitor'
      );

      if (urgentPredictions.length > 0) {
        await this.sendEarlyWarningNotification(userId, urgentPredictions);
      }

      logger.info('[ProUsageMonitoring] Alerts processed', {
        userId,
        criticalAlerts: criticalAlerts.length,
        urgentPredictions: urgentPredictions.length
      });
    } catch (error) {
      logger.error('[ProUsageMonitoring] Failed to send alerts', error);
    }
  }

  /**
   * Calculate usage trend based on recent data
   */
  private static calculateTrend(usageData: number[]): 'increasing' | 'decreasing' | 'stable' {
    if (usageData.length < 7) return 'stable';

    // Compare first half vs second half
    const midpoint = Math.floor(usageData.length / 2);
    const firstHalf = usageData.slice(0, midpoint);
    const secondHalf = usageData.slice(midpoint);
    
    const firstAvg = firstHalf.reduce((sum, val) => sum + val, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, val) => sum + val, 0) / secondHalf.length;
    
    const change = (secondAvg - firstAvg) / firstAvg;
    
    if (Math.abs(change) < 0.1) return 'stable';
    return change > 0 ? 'increasing' : 'decreasing';
  }

  /**
   * Generate usage alerts based on thresholds
   */
  private static generateUsageAlerts(
    metric: UsageMetric,
    current: number,
    limit: number,
    percentage: number
  ): UsageAlert[] {
    const alerts: UsageAlert[] = [];
    const now = new Date();

    if (percentage >= this.ALERT_THRESHOLDS.CRITICAL * 100) {
      alerts.push({
        level: 'critical',
        message: `Critical: ${metric} usage at ${percentage.toFixed(1)}% of limit (${current}/${limit})`,
        triggeredAt: now,
        metric,
        threshold: this.ALERT_THRESHOLDS.CRITICAL * 100
      });
    } else if (percentage >= this.ALERT_THRESHOLDS.WARNING * 100) {
      alerts.push({
        level: 'warning',
        message: `Warning: ${metric} usage at ${percentage.toFixed(1)}% of limit`,
        triggeredAt: now,
        metric,
        threshold: this.ALERT_THRESHOLDS.WARNING * 100
      });
    }

    return alerts;
  }

  /**
   * Calculate confidence level for predictions
   */
  private static calculateConfidence(
    trend: 'increasing' | 'decreasing' | 'stable',
    dailyAverage: number
  ): number {
    // Base confidence on trend stability and data volume
    let confidence = 0.7; // Base confidence
    
    if (trend === 'stable') confidence += 0.1;
    if (dailyAverage > 10) confidence += 0.1; // More data = higher confidence
    if (dailyAverage > 50) confidence += 0.1;
    
    return Math.min(1, confidence);
  }

  /**
   * Send critical alert notification
   */
  private static async sendCriticalAlertNotification(
    userId: string,
    alerts: UsageAlert[]
  ): Promise<void> {
    // In a real implementation, this would send:
    // - Email notifications
    // - SMS alerts
    // - In-app notifications
    // - Slack/Discord notifications
    
    logger.warn('[ProUsageMonitoring] Critical usage alerts', {
      userId,
      alerts: alerts.map(a => ({
        metric: a.metric,
        percentage: a.threshold,
        message: a.message
      }))
    });
  }

  /**
   * Send early warning notification
   */
  private static async sendEarlyWarningNotification(
    userId: string,
    predictions: UsagePrediction[]
  ): Promise<void> {
    logger.info('[ProUsageMonitoring] Early warning predictions', {
      userId,
      predictions: predictions.map(p => ({
        metric: p.metric,
        days: p.daysUntilLimit,
        action: p.recommendedAction
      }))
    });
  }
}

// Export singleton instance
export const proUsageMonitoring = new ProUsageMonitoringService();