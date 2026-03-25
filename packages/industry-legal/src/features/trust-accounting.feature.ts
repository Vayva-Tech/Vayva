/**
 * Trust Accounting Feature Module
 */

import { TrustAccountingService } from '../services/trust-accounting.service.js';

export class TrustAccountingFeature {
  private service: TrustAccountingService;
  private initialized: boolean = false;

  constructor() {
    this.service = new TrustAccountingService();
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.service.initialize();
      this.initialized = true;
      console.log('[TrustAccountingFeature] Initialized');
    }
  }

  async getTrustAccounts(storeId: string) {
    return this.service.getTrustAccounts(storeId);
  }

  async getTrustAccountBalance(accountId: string) {
    return this.service.getTrustAccountBalance(accountId);
  }

  async recordTrustReceipt(data: any) {
    return this.service.recordTrustReceipt(data);
  }

  async recordTrustDisbursement(data: any) {
    return this.service.recordTrustDisbursement(data);
  }

  async generateThreeWayReconciliation(accountId: string) {
    return this.service.generateThreeWayReconciliation(accountId);
  }

  async getNegativeBalanceAlerts(storeId: string) {
    return this.service.getNegativeBalanceAlerts(storeId);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async dispose(): Promise<void> {
    await this.service.dispose();
    this.initialized = false;
  }
}
