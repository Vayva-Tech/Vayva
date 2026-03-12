/**
 * Freshness Tracking Service
 * Monitors produce freshness, quality grades, and shelf life
 */

import { z } from 'zod';

export interface FreshnessRecord {
  id: string;
  productId: string;
  batchNumber: string;
  receivedDate: Date;
  expirationDate: Date;
  bestByDate: Date;
  freshnessScore: number; // 0-100
  qualityGrade: 'A' | 'B' | 'C' | 'D';
  status: 'fresh' | 'aging' | 'near-expiry' | 'expired';
  storageCondition: string;
  lastChecked: Date;
}

export interface FreshnessAlert {
  id: string;
  productId: string;
  productName: string;
  alertType: 'expiring-soon' | 'quality-drop' | 'expired';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  createdAt: Date;
}

export interface FreshnessConfig {
  checkInterval?: number; // ms
  expiryWarningDays?: number;
  autoDiscountEnabled?: boolean;
}

const FreshnessRecordSchema = z.object({
  id: z.string(),
  productId: z.string(),
  batchNumber: z.string(),
  receivedDate: z.date(),
  expirationDate: z.date(),
  bestByDate: z.date(),
  freshnessScore: z.number().min(0).max(100),
  qualityGrade: z.enum(['A', 'B', 'C', 'D']),
  status: z.enum(['fresh', 'aging', 'near-expiry', 'expired']),
  storageCondition: z.string(),
  lastChecked: z.date(),
});

export class FreshnessTrackingService {
  private records: Map<string, FreshnessRecord>;
  private alerts: Map<string, FreshnessAlert>;
  private config: FreshnessConfig;

  constructor(config: FreshnessConfig = {}) {
    this.config = {
      checkInterval: 3600000, // 1 hour
      expiryWarningDays: 3,
      autoDiscountEnabled: true,
      ...config,
    };
    this.records = new Map();
    this.alerts = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[FRESHNESS] Initializing service...');
    this.startMonitoring();
    console.log('[FRESHNESS] Service initialized');
  }

  /**
   * Add a freshness record for a product batch
   */
  async addFreshnessRecord(data: Partial<FreshnessRecord>): Promise<FreshnessRecord> {
    const record: FreshnessRecord = {
      ...data,
      id: data.id || `fresh_${Date.now()}`,
      freshnessScore: data.freshnessScore || 100,
      qualityGrade: data.qualityGrade || 'A',
      status: data.status || 'fresh',
      lastChecked: new Date(),
    } as FreshnessRecord;

    FreshnessRecordSchema.parse(record);
    this.records.set(record.id, record);
    return record;
  }

  /**
   * Update freshness score based on inspection
   */
  async updateFreshness(id: string, score: number, grade?: FreshnessRecord['qualityGrade']): Promise<FreshnessRecord | null> {
    const record = this.records.get(id);
    if (!record) return null;

    const now = new Date();
    const daysUntilExpiry = Math.ceil((record.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    let status: FreshnessRecord['status'] = 'fresh';
    if (daysUntilExpiry <= 0) status = 'expired';
    else if (daysUntilExpiry <= this.config.expiryWarningDays!) status = 'near-expiry';
    else if (score < 70) status = 'aging';

    const updated = {
      ...record,
      freshnessScore: Math.max(0, Math.min(100, score)),
      qualityGrade: grade || record.qualityGrade,
      status,
      lastChecked: now,
    };

    this.records.set(id, updated);

    // Generate alert if needed
    if (status === 'near-expiry' || status === 'expired' || score < 50) {
      this.generateAlert(updated);
    }

    return updated;
  }

  /**
   * Get products by freshness status
   */
  getProductsByStatus(status: FreshnessRecord['status']): FreshnessRecord[] {
    return Array.from(this.records.values()).filter(r => r.status === status);
  }

  /**
   * Get all alerts
   */
  getAlerts(filters?: { severity?: string; type?: string }): FreshnessAlert[] {
    let alerts = Array.from(this.alerts.values());
    
    if (filters) {
      if (filters.severity) {
        alerts = alerts.filter(a => a.severity === filters.severity);
      }
      if (filters.type) {
        alerts = alerts.filter(a => a.alertType === filters.type);
      }
    }

    return alerts.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
  }

  /**
   * Get freshness statistics
   */
  getStatistics(): {
    total: number;
    fresh: number;
    aging: number;
    nearExpiry: number;
    expired: number;
    averageScore: number;
    alertsCount: number;
  } {
    const records = Array.from(this.records.values());
    
    return {
      total: records.length,
      fresh: records.filter(r => r.status === 'fresh').length,
      aging: records.filter(r => r.status === 'aging').length,
      nearExpiry: records.filter(r => r.status === 'near-expiry').length,
      expired: records.filter(r => r.status === 'expired').length,
      averageScore: records.length > 0 
        ? records.reduce((sum, r) => sum + r.freshnessScore, 0) / records.length 
        : 0,
      alertsCount: this.alerts.size,
    };
  }

  private startMonitoring(): void {
    setInterval(() => {
      this.checkAllRecords();
    }, this.config.checkInterval);
  }

  private checkAllRecords(): void {
    const now = new Date();
    
    this.records.forEach((record, id) => {
      const daysUntilExpiry = Math.ceil((record.expirationDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      
      if (daysUntilExpiry <= 0 && record.status !== 'expired') {
        this.updateFreshness(id, 0, 'D');
      } else if (daysUntilExpiry <= this.config.expiryWarningDays! && record.status === 'fresh') {
        this.updateFreshness(id, Math.max(0, record.freshnessScore - 20));
      }
    });
  }

  private generateAlert(record: FreshnessRecord): void {
    const alert: FreshnessAlert = {
      id: `alert_${Date.now()}_${record.id}`,
      productId: record.productId,
      productName: `Product ${record.productId}`,
      alertType: record.status === 'expired' ? 'expired' : 'expiring-soon',
      severity: record.status === 'expired' ? 'critical' : 'high',
      message: `${record.status === 'expired' ? 'Expired' : 'Expiring soon'}: Batch ${record.batchNumber}`,
      createdAt: new Date(),
    };

    this.alerts.set(alert.id, alert);
  }
}
