/**
 * Flutterwave Connector
 * Integration with Flutterwave Payment API
 */

import { createHmac } from 'node:crypto';
import type { ConnectorConfig, SyncResult } from '../../marketplace/types';

export interface FlutterwaveConfig extends ConnectorConfig {
  publicKey: string;
  secretKey: string;
  encryptionKey?: string;
  environment: 'sandbox' | 'production';
}

export interface FlutterwavePayment {
  txRef: string;
  amount: number;
  currency: string;
  customerEmail: string;
  customerName: string;
  customerPhone?: string;
  redirectUrl: string;
  paymentOptions?: string;
  meta?: Record<string, unknown>;
}

export interface FlutterwaveTransaction {
  id: number;
  tx_ref: string;
  flw_ref: string;
  amount: number;
  currency: string;
  status: 'successful' | 'failed' | 'pending';
  customer: {
    id: number;
    email: string;
    name: string;
    phone_number?: string;
  };
  created_at: string;
}

export interface FlutterwaveWebhookPayload {
  event: string;
  data: FlutterwaveTransaction;
}

export class FlutterwaveConnector {
  private config: FlutterwaveConfig;
  private baseUrl: string;

  constructor(config: FlutterwaveConfig) {
    this.config = config;
    this.baseUrl =
      config.environment === 'production'
        ? 'https://api.flutterwave.com/v3'
        : 'https://api.flutterwave.com/v3'; // same base URL, different keys
  }

  private async request<T>(
    endpoint: string,
    options?: RequestInit
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.config.secretKey}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(
        `Flutterwave API error: ${error.message ?? response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Initiate a payment
   */
  async initiatePayment(
    payment: FlutterwavePayment
  ): Promise<{ link: string; status: string }> {
    const result = await this.request<{ data: { link: string }; status: string }>(
      '/payments',
      {
        method: 'POST',
        body: JSON.stringify({
          tx_ref: payment.txRef,
          amount: payment.amount,
          currency: payment.currency,
          redirect_url: payment.redirectUrl,
          payment_options: payment.paymentOptions ?? 'card,banktransfer,ussd,mobilemoney',
          customer: {
            email: payment.customerEmail,
            name: payment.customerName,
            phonenumber: payment.customerPhone,
          },
          meta: payment.meta,
        }),
      }
    );

    return { link: result.data.link, status: result.status };
  }

  /**
   * Verify a transaction
   */
  async verifyTransaction(
    transactionId: number
  ): Promise<FlutterwaveTransaction> {
    const result = await this.request<{ data: FlutterwaveTransaction }>(
      `/transactions/${transactionId}/verify`
    );
    return result.data;
  }

  /**
   * Verify transaction by tx_ref
   */
  async verifyByRef(txRef: string): Promise<FlutterwaveTransaction | null> {
    try {
      const result = await this.request<{
        data: FlutterwaveTransaction[];
        status: string;
      }>(`/transactions?tx_ref=${encodeURIComponent(txRef)}`);
      return result.data[0] ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Get transaction history
   */
  async getTransactions(
    from?: Date,
    to?: Date
  ): Promise<FlutterwaveTransaction[]> {
    let endpoint = '/transactions';
    const params = new URLSearchParams();
    if (from) params.set('from', from.toISOString().split('T')[0]);
    if (to) params.set('to', to.toISOString().split('T')[0]);
    if (params.toString()) endpoint += `?${params.toString()}`;

    const result = await this.request<{ data: FlutterwaveTransaction[] }>(endpoint);
    return result.data;
  }

  /**
   * Initiate a refund
   */
  async refundTransaction(
    transactionId: number,
    amount?: number
  ): Promise<SyncResult> {
    try {
      await this.request(`/transactions/${transactionId}/refund`, {
        method: 'POST',
        body: JSON.stringify(amount ? { amount } : {}),
      });
      return { success: true, itemsSynced: 1, errors: [], lastSyncAt: new Date() };
    } catch (error) {
      return {
        success: false,
        itemsSynced: 0,
        errors: [`Refund failed: ${error}`],
        lastSyncAt: new Date(),
      };
    }
  }

  /**
   * Verify webhook signature
   */
  verifyWebhookSignature(payload: string, signature: string): boolean {
    const hash = createHmac('sha256', this.config.secretKey)
      .update(payload)
      .digest('hex');
    return hash === signature;
  }

  /**
   * Get account balance
   */
  async getBalance(currency = 'NGN'): Promise<{ currency: string; available_balance: number }> {
    const result = await this.request<{
      data: { currency: string; available_balance: number };
    }>(`/balances/${currency}`);
    return result.data;
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/balances');
      return true;
    } catch {
      return false;
    }
  }
}

export default FlutterwaveConnector;
