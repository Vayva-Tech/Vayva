/**
 * QuickBooks Connector
 * Integration with QuickBooks Online API
 */

import type { ConnectorConfig, SyncResult } from '../../marketplace/types';

export interface QuickBooksConfig extends ConnectorConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  realmId?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
}

export interface QuickBooksInvoice {
  id: string;
  customerName: string;
  customerEmail: string;
  amount: number;
  dueDate: Date;
  status: 'draft' | 'sent' | 'paid' | 'overdue';
  lineItems: Array<{
    description: string;
    quantity: number;
    rate: number;
    amount: number;
  }>;
}

export class QuickBooksConnector {
  private config: QuickBooksConfig;
  private baseUrl = 'https://quickbooks.api.intuit.com/v3/company';

  constructor(config: QuickBooksConfig) {
    this.config = config;
  }

  /**
   * Refresh access token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch('https://oauth.platform.intuit.com/oauth2/v1/tokens/bearer', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.config.refreshToken || '',
        }),
      });

      if (!response.ok) {
        return false;
      }

      const data = await response.json();
      this.config.accessToken = data.access_token;
      this.config.refreshToken = data.refresh_token;
      this.config.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);

      return true;
    } catch (error) {
      console.error('QuickBooks token refresh error:', error);
      return false;
    }
  }

  /**
   * Make authenticated API request
   */
  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (this.config.tokenExpiry && new Date() > this.config.tokenExpiry) {
      await this.refreshToken();
    }

    const url = `${this.baseUrl}/${this.config.realmId}${endpoint}`;
    
    const response = await fetch(url, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.config.accessToken}`,
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`QuickBooks API error: ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Sync customers to QuickBooks
   */
  async syncCustomers(customers: Array<{
    id: string;
    name: string;
    email: string;
    phone?: string;
    address?: string;
  }>): Promise<SyncResult> {
    const errors: string[] = [];
    let itemsSynced = 0;

    for (const customer of customers) {
      try {
        await this.request('/customer', {
          method: 'POST',
          body: JSON.stringify({
            DisplayName: customer.name,
            PrimaryEmailAddr: { Address: customer.email },
            PrimaryPhone: customer.phone ? { FreeFormNumber: customer.phone } : undefined,
            BillAddr: customer.address ? { Line1: customer.address } : undefined,
          }),
        });
        itemsSynced++;
      } catch (error) {
        errors.push(`Failed to sync customer ${customer.id}: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      itemsSynced,
      errors,
      lastSyncAt: new Date(),
    };
  }

  /**
   * Sync orders as invoices
   */
  async syncInvoices(invoices: QuickBooksInvoice[]): Promise<SyncResult> {
    const errors: string[] = [];
    let itemsSynced = 0;

    for (const invoice of invoices) {
      try {
        await this.request('/invoice', {
          method: 'POST',
          body: JSON.stringify({
            CustomerRef: {
              value: invoice.customerName,
            },
            Line: invoice.lineItems.map(item => ({
              DetailType: 'SalesItemLineDetail',
              Amount: item.amount,
              SalesItemLineDetail: {
                Qty: item.quantity,
                UnitPrice: item.rate,
              },
            })),
            DueDate: invoice.dueDate.toISOString().split('T')[0],
          }),
        });
        itemsSynced++;
      } catch (error) {
        errors.push(`Failed to sync invoice ${invoice.id}: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      itemsSynced,
      errors,
      lastSyncAt: new Date(),
    };
  }

  /**
   * Sync products/items
   */
  async syncProducts(products: Array<{
    id: string;
    name: string;
    description?: string;
    price: number;
    sku?: string;
    category?: string;
  }>): Promise<SyncResult> {
    const errors: string[] = [];
    let itemsSynced = 0;

    for (const product of products) {
      try {
        await this.request('/item', {
          method: 'POST',
          body: JSON.stringify({
            Name: product.name,
            Description: product.description,
            UnitPrice: product.price,
            Sku: product.sku,
            Type: 'NonInventory',
            IncomeAccountRef: {
              value: 'Sales of Product Income',
            },
          }),
        });
        itemsSynced++;
      } catch (error) {
        errors.push(`Failed to sync product ${product.id}: ${error}`);
      }
    }

    return {
      success: errors.length === 0,
      itemsSynced,
      errors,
      lastSyncAt: new Date(),
    };
  }

  /**
   * Get financial reports
   */
  async getReports(reportType: 'profit_loss' | 'balance_sheet' | 'cash_flow', 
    startDate: Date, 
    endDate: Date
  ): Promise<unknown> {
    const reportNames: Record<string, string> = {
      'profit_loss': 'ProfitAndLoss',
      'balance_sheet': 'BalanceSheet',
      'cash_flow': 'CashFlow',
    };

    return this.request(`/reports/${reportNames[reportType]}?start_date=${startDate.toISOString().split('T')[0]}&end_date=${endDate.toISOString().split('T')[0]}`);
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/companyinfo/' + this.config.realmId);
      return true;
    } catch {
      return false;
    }
  }
}

export default QuickBooksConnector;
