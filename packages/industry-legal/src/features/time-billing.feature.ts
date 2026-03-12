/**
 * Time & Billing Feature Module
 */

import { BillingInvoicingService } from '../services/billing-invoicing.service.js';

export class TimeBillingFeature {
  private service: BillingInvoicingService;
  private initialized: boolean = false;

  constructor() {
    this.service = new BillingInvoicingService();
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.service.initialize();
      this.initialized = true;
      console.log('[TimeBillingFeature] Initialized');
    }
  }

  async createTimeEntry(data: any) {
    return this.service.createTimeEntry(data);
  }

  async getMonthlyBillingSummary(storeId: string, year: number, month: number) {
    return this.service.getMonthlyBillingSummary(storeId, year, month);
  }

  async getWIP(storeId: string) {
    return this.service.getWIP(storeId);
  }

  async calculateRealizationRate(storeId: string, periodMonths?: number) {
    return this.service.calculateRealizationRate(storeId, periodMonths);
  }

  async calculateCollectionRate(storeId: string, periodMonths?: number) {
    return this.service.calculateCollectionRate(storeId, periodMonths);
  }

  async generateInvoice(data: any) {
    return this.service.generateInvoice(data);
  }

  async recordPayment(invoiceId: string, amount: number, paymentMethod: string) {
    return this.service.recordPayment(invoiceId, amount, paymentMethod);
  }

  async getAccountsReceivableAging(storeId: string) {
    return this.service.getAccountsReceivableAging(storeId);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async dispose(): Promise<void> {
    await this.service.dispose();
    this.initialized = false;
  }
}
