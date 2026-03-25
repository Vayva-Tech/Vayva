/**
 * Paystack Connector
 * Integration with Paystack payment API
 */

import { createHmac } from 'node:crypto';
import type { ConnectorConfig, SyncResult } from '../../marketplace/types';

export interface PaystackConfig extends ConnectorConfig {
  secretKey: string;
  publicKey: string;
  webhookSecret?: string;
}

export interface PaystackTransaction {
  id: string;
  reference: string;
  amount: number;
  currency: string;
  status: 'success' | 'failed' | 'pending' | 'abandoned';
  customer: {
    email: string;
    name?: string;
    phone?: string;
  };
  metadata?: Record<string, unknown>;
  paidAt?: Date;
  channel: 'card' | 'bank' | 'ussd' | 'qr' | 'mobile_money' | 'bank_transfer';
}

export class PaystackConnector {
  private config: PaystackConfig;
  private baseUrl = 'https://api.paystack.co';

  constructor(config: PaystackConfig) {
    this.config = config;
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.secretKey}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Paystack API error: ${error}`);
    }

    const data = await response.json();
    return data.data as T;
  }

  /**
   * Initialize transaction
   */
  async initializeTransaction(params: {
    email: string;
    amount: number;
    reference?: string;
    callbackUrl?: string;
    metadata?: Record<string, unknown>;
    channels?: string[];
  }): Promise<{
    authorization_url: string;
    access_code: string;
    reference: string;
  }> {
    return this.request('/transaction/initialize', {
      method: 'POST',
      body: JSON.stringify({
        email: params.email,
        amount: params.amount * 100, // Convert to kobo
        reference: params.reference,
        callback_url: params.callbackUrl,
        metadata: params.metadata,
        channels: params.channels,
      }),
    });
  }

  /**
   * Verify transaction
   */
  async verifyTransaction(reference: string): Promise<PaystackTransaction> {
    const result = await this.request<{
      id: number;
      reference: string;
      amount: number;
      currency: string;
      status: string;
      customer: { email: string };
      metadata: Record<string, unknown>;
      paid_at: string;
      channel: string;
    }>(`/transaction/verify/${reference}`);

    return {
      id: String(result.id),
      reference: result.reference,
      amount: result.amount / 100, // Convert from kobo
      currency: result.currency,
      status: result.status as PaystackTransaction['status'],
      customer: result.customer,
      metadata: result.metadata,
      paidAt: result.paid_at ? new Date(result.paid_at) : undefined,
      channel: result.channel as PaystackTransaction['channel'],
    };
  }

  /**
   * List transactions
   */
  async listTransactions(params?: {
    perPage?: number;
    page?: number;
    from?: Date;
    to?: Date;
  }): Promise<PaystackTransaction[]> {
    const query = new URLSearchParams();
    if (params?.perPage) query.set('perPage', String(params.perPage));
    if (params?.page) query.set('page', String(params.page));
    if (params?.from) query.set('from', params.from.toISOString());
    if (params?.to) query.set('to', params.to.toISOString());

    const results = await this.request<Array<{
      id: number;
      reference: string;
      amount: number;
      currency: string;
      status: string;
      customer: { email: string };
      channel: string;
    }>>(`/transaction?${query.toString()}`);

    return results.map(r => ({
      id: String(r.id),
      reference: r.reference,
      amount: r.amount / 100,
      currency: r.currency,
      status: r.status as PaystackTransaction['status'],
      customer: r.customer,
      channel: r.channel as PaystackTransaction['channel'],
    }));
  }

  /**
   * Create customer
   */
  async createCustomer(params: {
    email: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    metadata?: Record<string, unknown>;
  }): Promise<{ id: string; email: string }> {
    return this.request('/customer', {
      method: 'POST',
      body: JSON.stringify({
        email: params.email,
        first_name: params.firstName,
        last_name: params.lastName,
        phone: params.phone,
        metadata: params.metadata,
      }),
    });
  }

  /**
   * Create subscription plan
   */
  async createPlan(params: {
    name: string;
    amount: number;
    interval: 'daily' | 'weekly' | 'monthly' | 'annually';
    description?: string;
  }): Promise<{ id: string; name: string }> {
    return this.request('/plan', {
      method: 'POST',
      body: JSON.stringify({
        name: params.name,
        amount: params.amount * 100,
        interval: params.interval,
        description: params.description,
      }),
    });
  }

  /**
   * Create subscription
   */
  async createSubscription(params: {
    customer: string;
    plan: string;
    startDate?: Date;
  }): Promise<{ id: string; status: string }> {
    return this.request('/subscription', {
      method: 'POST',
      body: JSON.stringify({
        customer: params.customer,
        plan: params.plan,
        start_date: params.startDate?.toISOString(),
      }),
    });
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(body: string, signature: string): boolean {
    if (!this.config.webhookSecret) {
      return false;
    }

    const hash = createHmac('sha512', this.config.webhookSecret)
      .update(body)
      .digest('hex');

    return hash === signature;
  }

  /**
   * Sync transactions
   */
  async syncTransactions(fromDate?: Date): Promise<SyncResult> {
    try {
      const transactions = await this.listTransactions({
        from: fromDate,
        perPage: 100,
      });

      return {
        success: true,
        itemsSynced: transactions.length,
        errors: [],
        lastSyncAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        itemsSynced: 0,
        errors: [String(error)],
        lastSyncAt: new Date(),
      };
    }
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/balance');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get payment methods
   */
  async getPaymentMethods(): Promise<string[]> {
    return ['card', 'bank', 'ussd', 'qr', 'mobile_money', 'bank_transfer'];
  }
}

export default PaystackConnector;
