// @ts-nocheck
/**
 * Expiration Alerts Service
 * Monitors and alerts about products nearing expiration
 */

import { z } from 'zod';

export interface ExpirationAlert {
  id: string;
  productId: string;
  productName: string;
  batchNumber: string;
  expirationDate: Date;
  daysUntilExpiry: number;
  quantity: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedAction: string;
  createdAt: Date;
  acknowledged: boolean;
}

export interface AlertConfig {
  warningDays?: number;
  criticalDays?: number;
  autoDiscount?: boolean;
  notifyEnabled?: boolean;
}

const ExpirationAlertSchema = z.object({
  id: z.string(),
  productId: z.string(),
  productName: z.string(),
  batchNumber: z.string(),
  expirationDate: z.date(),
  daysUntilExpiry: z.number(),
  quantity: z.number(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  suggestedAction: z.string(),
  createdAt: z.date(),
  acknowledged: z.boolean(),
});

export class ExpirationAlertsService {
  private alerts: Map<string, ExpirationAlert>;
  private config: AlertConfig;

  constructor(config: AlertConfig = {}) {
    this.config = {
      warningDays: 7,
      criticalDays: 2,
      autoDiscount: true,
      notifyEnabled: true,
      ...config,
    };
    this.alerts = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[EXPIRATION_ALERTS] Initializing service...');
    console.log('[EXPIRATION_ALERTS] Service initialized');
  }

  /**
   * Check product for expiration and create alert if needed
   */
  checkExpiration(
    productId: string,
    productName: string,
    batchNumber: string,
    expirationDate: Date,
    quantity: number
  ): ExpirationAlert | null {
    const now = new Date();
    const daysUntilExpiry = Math.ceil((expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    if (daysUntilExpiry < 0) {
      // Already expired
      return this.createAlert(productId, productName, batchNumber, expirationDate, quantity, daysUntilExpiry, 'critical');
    }

    if (daysUntilExpiry <= this.config.criticalDays!) {
      return this.createAlert(productId, productName, batchNumber, expirationDate, quantity, daysUntilExpiry, 'critical');
    }

    if (daysUntilExpiry <= this.config.warningDays!) {
      return this.createAlert(productId, productName, batchNumber, expirationDate, quantity, daysUntilExpiry, 'high');
    }

    return null;
  }

  /**
   * Get all active alerts
   */
  getActiveAlerts(filters?: { severity?: string; acknowledged?: boolean }): ExpirationAlert[] {
    let alerts = Array.from(this.alerts.values()).filter(a => !a.acknowledged);
    
    if (filters) {
      if (filters.severity) {
        alerts = alerts.filter(a => a.severity === filters.severity);
      }
      if (filters.acknowledged !== undefined) {
        alerts = Array.from(this.alerts.values()).filter(a => a.acknowledged === filters.acknowledged);
      }
    }

    return alerts.sort((a, b) => a.daysUntilExpiry - b.daysUntilExpiry);
  }

  /**
   * Acknowledge an alert
   */
  acknowledgeAlert(alertId: string, actionTaken?: string): ExpirationAlert | null {
    const alert = this.alerts.get(alertId);
    if (!alert) return null;

    const updated = { 
      ...alert, 
      acknowledged: true,
      suggestedAction: actionTaken || alert.suggestedAction 
    };
    
    this.alerts.set(alertId, updated);
    return updated;
  }

  /**
   * Get alert statistics
   */
  getStatistics(): {
    total: number;
    critical: number;
    high: number;
    medium: number;
    low: number;
    acknowledged: number;
    expired: number;
  } {
    const alerts = Array.from(this.alerts.values());
    
    return {
      total: alerts.length,
      critical: alerts.filter(a => a.severity === 'critical').length,
      high: alerts.filter(a => a.severity === 'high').length,
      medium: alerts.filter(a => a.severity === 'medium').length,
      low: alerts.filter(a => a.severity === 'low').length,
      acknowledged: alerts.filter(a => a.acknowledged).length,
      expired: alerts.filter(a => a.daysUntilExpiry < 0).length,
    };
  }

  private createAlert(
    productId: string,
    productName: string,
    batchNumber: string,
    expirationDate: Date,
    quantity: number,
    daysUntilExpiry: number,
    severity: ExpirationAlert['severity']
  ): ExpirationAlert {
    const alert: ExpirationAlert = {
      id: `exp_alert_${Date.now()}`,
      productId,
      productName,
      batchNumber,
      expirationDate,
      daysUntilExpiry,
      quantity,
      severity,
      suggestedAction: this.getSuggestedAction(severity, daysUntilExpiry),
      createdAt: new Date(),
      acknowledged: false,
    };

    ExpirationAlertSchema.parse(alert);
    this.alerts.set(alert.id, alert);
    return alert;
  }

  private getSuggestedAction(severity: string, days: number): string {
    if (days < 0) return 'Remove from inventory immediately';
    if (severity === 'critical') return 'Apply maximum discount or donate';
    if (severity === 'high') return 'Apply 30-50% discount';
    return 'Monitor closely and plan promotion';
  }
}
