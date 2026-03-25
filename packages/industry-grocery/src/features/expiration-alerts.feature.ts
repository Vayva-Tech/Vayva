/**
 * Expiration Alerts Feature
 * Manages expiration monitoring and alert workflows
 */

import { ExpirationAlertsService, type ExpirationAlert } from '../services/expiration-alerts.service.js';

export interface ExpirationAlertsConfig {
  warningDays?: number;
  criticalDays?: number;
}

export class ExpirationAlertsFeature {
  private service: ExpirationAlertsService;
  private config: ExpirationAlertsConfig;

  constructor(
    service: ExpirationAlertsService,
    config: ExpirationAlertsConfig = {}
  ) {
    this.service = service;
    this.config = {
      warningDays: 7,
      criticalDays: 2,
      ...config,
    };
  }

  async initialize(): Promise<void> {
    await this.service.initialize();
  }

  /**
   * Check expiration
   */
  checkExpiration(productId: string, productName: string, batchNumber: string, expirationDate: Date, quantity: number): ExpirationAlert | null {
    return this.service.checkExpiration(productId, productName, batchNumber, expirationDate, quantity);
  }

  /**
   * Get active alerts
   */
  getActiveAlerts(filters?: { severity?: string; acknowledged?: boolean }): ExpirationAlert[] {
    return this.service.getActiveAlerts(filters);
  }

  /**
   * Acknowledge alert
   */
  acknowledgeAlert(alertId: string, actionTaken?: string): ExpirationAlert | null {
    return this.service.acknowledgeAlert(alertId, actionTaken);
  }

  /**
   * Get statistics
   */
  getStatistics() {
    return this.service.getStatistics();
  }
}
