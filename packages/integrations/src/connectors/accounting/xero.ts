/**
 * Xero Connector
 * Integration with Xero Accounting API
 */

import type { ConnectorConfig, SyncResult } from '../../marketplace/types';

export interface XeroConfig extends ConnectorConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  tenantId?: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
}

export interface XeroContact {
  ContactID?: string;
  Name: string;
  EmailAddress?: string;
  Phones?: Array<{
    PhoneType: string;
    PhoneNumber: string;
  }>;
  Addresses?: Array<{
    AddressType: string;
    AddressLine1?: string;
    City?: string;
    Country?: string;
  }>;
}

export interface XeroInvoice {
  id?: string;
  contactId: string;
  contactName: string;
  amount: number;
  dueDate: Date;
  status: 'DRAFT' | 'SUBMITTED' | 'AUTHORISED' | 'PAID' | 'VOIDED';
  lineItems: Array<{
    description: string;
    quantity: number;
    unitAmount: number;
    accountCode?: string;
  }>;
  currencyCode?: string;
}

export class XeroConnector {
  private config: XeroConfig;
  private baseUrl = 'https://api.xero.com/api.xro/2.0';

  constructor(config: XeroConfig) {
    this.config = config;
  }

  /**
   * Refresh OAuth access token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch('https://identity.xero.com/connect/token', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
        },
        body: new URLSearchParams({
          grant_type: 'refresh_token',
          refresh_token: this.config.refreshToken ?? '',
        }),
      });

      if (!response.ok) return false;

      const data = (await response.json()) as {
        access_token: string;
        refresh_token: string;
        expires_in: number;
      };

      this.config.accessToken = data.access_token;
      this.config.refreshToken = data.refresh_token;
      this.config.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);

      return true;
    } catch (error) {
      console.error('Xero token refresh error:', error);
      return false;
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (this.config.tokenExpiry && new Date() > this.config.tokenExpiry) {
      await this.refreshToken();
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'xero-tenant-id': this.config.tenantId ?? '',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      throw new Error(`Xero API error: ${response.status} ${response.statusText}`);
    }

    return response.json() as Promise<T>;
  }

  /**
   * Sync contacts (customers) to Xero
   */
  async syncContacts(
    customers: Array<{
      id: string;
      name: string;
      email: string;
      phone?: string;
      address?: string;
    }>
  ): Promise<SyncResult> {
    const errors: string[] = [];
    let itemsSynced = 0;

    const contacts: XeroContact[] = customers.map((c) => ({
      Name: c.name,
      EmailAddress: c.email,
      Phones: c.phone
        ? [{ PhoneType: 'DEFAULT', PhoneNumber: c.phone }]
        : undefined,
      Addresses: c.address
        ? [{ AddressType: 'STREET', AddressLine1: c.address }]
        : undefined,
    }));

    try {
      await this.request('/Contacts', {
        method: 'POST',
        body: JSON.stringify({ Contacts: contacts }),
      });
      itemsSynced = contacts.length;
    } catch (error) {
      errors.push(`Failed to sync contacts batch: ${error}`);
    }

    return { success: errors.length === 0, itemsSynced, errors, lastSyncAt: new Date() };
  }

  /**
   * Sync invoices to Xero
   */
  async syncInvoices(invoices: XeroInvoice[]): Promise<SyncResult> {
    const errors: string[] = [];
    let itemsSynced = 0;

    for (const invoice of invoices) {
      try {
        await this.request('/Invoices', {
          method: 'POST',
          body: JSON.stringify({
            Invoices: [
              {
                Type: 'ACCREC',
                Contact: { ContactID: invoice.contactId },
                DueDate: invoice.dueDate.toISOString().split('T')[0],
                Status: invoice.status,
                CurrencyCode: invoice.currencyCode ?? 'USD',
                LineItems: invoice.lineItems.map((li) => ({
                  Description: li.description,
                  Quantity: li.quantity,
                  UnitAmount: li.unitAmount,
                  AccountCode: li.accountCode ?? '200',
                })),
              },
            ],
          }),
        });
        itemsSynced++;
      } catch (error) {
        errors.push(`Failed to sync invoice for ${invoice.contactName}: ${error}`);
      }
    }

    return { success: errors.length === 0, itemsSynced, errors, lastSyncAt: new Date() };
  }

  /**
   * Get Profit & Loss report
   */
  async getProfitAndLoss(fromDate: Date, toDate: Date): Promise<unknown> {
    return this.request(
      `/Reports/ProfitAndLoss?fromDate=${fromDate.toISOString().split('T')[0]}&toDate=${toDate.toISOString().split('T')[0]}`
    );
  }

  /**
   * Get Balance Sheet report
   */
  async getBalanceSheet(date: Date): Promise<unknown> {
    return this.request(
      `/Reports/BalanceSheet?date=${date.toISOString().split('T')[0]}`
    );
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/Organisation');
      return true;
    } catch {
      return false;
    }
  }
}

export default XeroConnector;
