/**
 * SendGrid Connector
 * Integration with SendGrid Transactional Email API
 */

import type { ConnectorConfig, SyncResult } from '../../marketplace/types';

export interface SendGridConfig extends ConnectorConfig {
  apiKey: string;
  fromEmail: string;
  fromName: string;
}

export interface SendGridEmail {
  to: Array<{ email: string; name?: string }>;
  subject: string;
  htmlContent: string;
  textContent?: string;
  templateId?: string;
  templateData?: Record<string, unknown>;
  categories?: string[];
  customArgs?: Record<string, string>;
  replyTo?: { email: string; name?: string };
}

export interface SendGridStats {
  date: string;
  stats: Array<{
    type: string;
    name: string;
    metrics: {
      blocks: number;
      bounces: number;
      clicks: number;
      deferred: number;
      delivered: number;
      invalid_emails: number;
      opens: number;
      processed: number;
      requests: number;
      spam_reports: number;
      unique_clicks: number;
      unique_opens: number;
      unsubscribes: number;
    };
  }>;
}

export class SendGridConnector {
  private config: SendGridConfig;
  private baseUrl = 'https://api.sendgrid.com/v3';

  constructor(config: SendGridConfig) {
    this.config = config;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as {
        errors?: Array<{ message: string }>;
      };
      const msg = error.errors?.[0]?.message ?? response.statusText;
      throw new Error(`SendGrid API error: ${msg}`);
    }

    // 202 No Content responses
    if (response.status === 202) return {} as T;

    return response.json() as Promise<T>;
  }

  /**
   * Send a single email
   */
  async sendEmail(email: SendGridEmail): Promise<boolean> {
    try {
      await this.request('/mail/send', {
        method: 'POST',
        body: JSON.stringify({
          personalizations: [
            {
              to: email.to,
              dynamic_template_data: email.templateData,
            },
          ],
          from: { email: this.config.fromEmail, name: this.config.fromName },
          reply_to: email.replyTo,
          subject: email.templateId ? undefined : email.subject,
          content: email.templateId
            ? undefined
            : [
                { type: 'text/plain', value: email.textContent ?? '' },
                { type: 'text/html', value: email.htmlContent },
              ],
          template_id: email.templateId,
          categories: email.categories,
          custom_args: email.customArgs,
        }),
      });
      return true;
    } catch (error) {
      console.error('SendGrid send error:', error);
      return false;
    }
  }

  /**
   * Send order confirmation email
   */
  async sendOrderConfirmation(params: {
    customerEmail: string;
    customerName: string;
    orderId: string;
    orderTotal: number;
    currency: string;
    items: Array<{ name: string; quantity: number; price: number }>;
  }): Promise<boolean> {
    return this.sendEmail({
      to: [{ email: params.customerEmail, name: params.customerName }],
      subject: `Order Confirmation #${params.orderId}`,
      htmlContent: `
        <h1>Thank you for your order!</h1>
        <p>Order #${params.orderId}</p>
        <ul>
          ${params.items
            .map((i) => `<li>${i.name} x${i.quantity} - ${params.currency}${i.price}</li>`)
            .join('')}
        </ul>
        <p><strong>Total: ${params.currency}${params.orderTotal}</strong></p>
      `,
      categories: ['order-confirmation'],
      customArgs: { order_id: params.orderId },
    });
  }

  /**
   * Send shipping notification
   */
  async sendShippingNotification(params: {
    customerEmail: string;
    customerName: string;
    orderId: string;
    trackingNumber?: string;
    carrier?: string;
    estimatedDelivery?: Date;
  }): Promise<boolean> {
    return this.sendEmail({
      to: [{ email: params.customerEmail, name: params.customerName }],
      subject: `Your Order #${params.orderId} Has Shipped`,
      htmlContent: `
        <h1>Your order is on its way!</h1>
        <p>Order #${params.orderId}</p>
        ${params.trackingNumber ? `<p>Tracking: ${params.carrier ?? ''} ${params.trackingNumber}</p>` : ''}
        ${params.estimatedDelivery ? `<p>Estimated delivery: ${params.estimatedDelivery.toDateString()}</p>` : ''}
      `,
      categories: ['shipping-notification'],
      customArgs: { order_id: params.orderId },
    });
  }

  /**
   * Send batch emails
   */
  async sendBatch(
    emails: Array<{
      to: string;
      name?: string;
      subject: string;
      htmlContent: string;
    }>
  ): Promise<SyncResult> {
    const errors: string[] = [];
    let itemsSynced = 0;

    for (const email of emails) {
      const sent = await this.sendEmail({
        to: [{ email: email.to, name: email.name }],
        subject: email.subject,
        htmlContent: email.htmlContent,
      });

      if (sent) {
        itemsSynced++;
      } else {
        errors.push(`Failed to send to ${email.to}`);
      }
    }

    return { success: errors.length === 0, itemsSynced, errors, lastSyncAt: new Date() };
  }

  /**
   * Add contacts to marketing lists
   */
  async addContacts(
    contacts: Array<{ email: string; firstName?: string; lastName?: string }>,
    listIds?: string[]
  ): Promise<SyncResult> {
    try {
      await this.request('/marketing/contacts', {
        method: 'PUT',
        body: JSON.stringify({
          list_ids: listIds,
          contacts: contacts.map((c) => ({
            email: c.email,
            first_name: c.firstName,
            last_name: c.lastName,
          })),
        }),
      });

      return {
        success: true,
        itemsSynced: contacts.length,
        errors: [],
        lastSyncAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        itemsSynced: 0,
        errors: [`Failed to add contacts: ${error}`],
        lastSyncAt: new Date(),
      };
    }
  }

  /**
   * Get email statistics
   */
  async getStats(startDate: Date, endDate: Date): Promise<SendGridStats[]> {
    const start = startDate.toISOString().split('T')[0];
    const end = endDate.toISOString().split('T')[0];
    return this.request<SendGridStats[]>(
      `/stats?start_date=${start}&end_date=${end}&aggregated_by=day`
    );
  }

  /**
   * Get email templates
   */
  async getTemplates(): Promise<Array<{ id: string; name: string; generation: string }>> {
    const result = await this.request<{
      templates: Array<{ id: string; name: string; generation: string }>;
    }>('/templates?generations=dynamic&page_size=100');
    return result.templates;
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/user/profile');
      return true;
    } catch {
      return false;
    }
  }
}

export default SendGridConnector;
