/**
 * Mailchimp Connector
 * Integration with Mailchimp Email Marketing API
 */

import type { ConnectorConfig, SyncResult } from '../../marketplace/types';

export interface MailchimpConfig extends ConnectorConfig {
  apiKey: string;
  server: string; // e.g., 'us1', 'us6'
  audienceId?: string;
}

export interface MailchimpMember {
  email: string;
  firstName?: string;
  lastName?: string;
  status: 'subscribed' | 'unsubscribed' | 'pending' | 'cleaned';
  tags?: string[];
  mergeFields?: Record<string, string | number | boolean>;
}

export interface MailchimpCampaign {
  id: string;
  type: string;
  status: string;
  subjectLine: string;
  fromName: string;
  replyTo: string;
  recipients: { listId: string; segmentText: string };
  stats: {
    opens: number;
    clicks: number;
    unsubscribes: number;
    bounces: number;
  };
}

export interface MailchimpAudience {
  id: string;
  name: string;
  memberCount: number;
  subscriberCount: number;
}

export class MailchimpConnector {
  private config: MailchimpConfig;
  private baseUrl: string;

  constructor(config: MailchimpConfig) {
    this.config = config;
    this.baseUrl = `https://${config.server}.api.mailchimp.com/3.0`;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `apikey ${this.config.apiKey}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as { detail?: string; title?: string };
      throw new Error(
        `Mailchimp API error: ${error.title ?? ''} - ${error.detail ?? response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get all audience lists
   */
  async getAudiences(): Promise<MailchimpAudience[]> {
    const result = await this.request<{
      lists: Array<{
        id: string;
        name: string;
        stats: { member_count: number; unsubscribe_count: number };
      }>;
    }>('/lists');

    return result.lists.map((l) => ({
      id: l.id,
      name: l.name,
      memberCount: l.stats.member_count,
      subscriberCount: l.stats.member_count - l.stats.unsubscribe_count,
    }));
  }

  /**
   * Sync customers as subscribers to an audience list
   */
  async syncSubscribers(
    customers: Array<{
      id: string;
      name: string;
      email: string;
      tags?: string[];
    }>,
    audienceId?: string
  ): Promise<SyncResult> {
    const listId = audienceId ?? this.config.audienceId;
    if (!listId) {
      return {
        success: false,
        itemsSynced: 0,
        errors: ['No audience ID configured'],
        lastSyncAt: new Date(),
      };
    }

    const errors: string[] = [];
    let itemsSynced = 0;

    // Use batch operations for efficiency
    const operations = customers.map((customer) => {
      const [firstName, ...lastParts] = customer.name.split(' ');
      return {
        method: 'PUT',
        path: `/lists/${listId}/members/${this.emailHash(customer.email)}`,
        body: JSON.stringify({
          email_address: customer.email,
          status_if_new: 'subscribed',
          status: 'subscribed',
          merge_fields: {
            FNAME: firstName ?? '',
            LNAME: lastParts.join(' '),
          },
          tags: customer.tags ?? [],
        }),
      };
    });

    try {
      await this.request('/batches', {
        method: 'POST',
        body: JSON.stringify({ operations }),
      });
      itemsSynced = customers.length;
    } catch (error) {
      errors.push(`Batch sync failed: ${error}`);
    }

    return { success: errors.length === 0, itemsSynced, errors, lastSyncAt: new Date() };
  }

  /**
   * Add a single subscriber
   */
  async addSubscriber(member: MailchimpMember, audienceId?: string): Promise<boolean> {
    const listId = audienceId ?? this.config.audienceId;
    if (!listId) return false;

    try {
      const [firstName, ...lastParts] = (member.firstName
        ? `${member.firstName} ${member.lastName ?? ''}`
        : ''
      ).trim().split(' ');

      await this.request(`/lists/${listId}/members`, {
        method: 'POST',
        body: JSON.stringify({
          email_address: member.email,
          status: member.status,
          merge_fields: {
            FNAME: firstName ?? member.firstName ?? '',
            LNAME: (lastParts.join(' ') || member.lastName) ?? '',
            ...member.mergeFields,
          },
          tags: member.tags,
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Unsubscribe a member
   */
  async unsubscribe(email: string, audienceId?: string): Promise<boolean> {
    const listId = audienceId ?? this.config.audienceId;
    if (!listId) return false;

    try {
      await this.request(`/lists/${listId}/members/${this.emailHash(email)}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'unsubscribed' }),
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get campaign statistics
   */
  async getCampaigns(): Promise<MailchimpCampaign[]> {
    const result = await this.request<{
      campaigns: Array<{
        id: string;
        type: string;
        status: string;
        settings: { subject_line: string; from_name: string; reply_to: string };
        recipients: { list_id: string; segment_text: string };
        report_summary: {
          opens: number;
          clicks: number;
          unsubscribes: number;
          bounces: number;
        };
      }>;
    }>('/campaigns?count=50&status=sent');

    return result.campaigns.map((c) => ({
      id: c.id,
      type: c.type,
      status: c.status,
      subjectLine: c.settings.subject_line,
      fromName: c.settings.from_name,
      replyTo: c.settings.reply_to,
      recipients: {
        listId: c.recipients.list_id,
        segmentText: c.recipients.segment_text,
      },
      stats: {
        opens: c.report_summary?.opens ?? 0,
        clicks: c.report_summary?.clicks ?? 0,
        unsubscribes: c.report_summary?.unsubscribes ?? 0,
        bounces: c.report_summary?.bounces ?? 0,
      },
    }));
  }

  /**
   * Tag subscribers with purchase event
   */
  async tagByPurchase(
    email: string,
    productName: string,
    audienceId?: string
  ): Promise<boolean> {
    const listId = audienceId ?? this.config.audienceId;
    if (!listId) return false;

    try {
      await this.request(`/lists/${listId}/members/${this.emailHash(email)}/tags`, {
        method: 'POST',
        body: JSON.stringify({
          tags: [{ name: `purchased:${productName}`, status: 'active' }],
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * MD5 hash of lowercased email (Mailchimp subscriber hash)
   */
  private emailHash(email: string): string {
    const crypto = require('crypto') as typeof import('crypto');
    return crypto.createHash('md5').update(email.toLowerCase()).digest('hex');
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/ping');
      return true;
    } catch {
      return false;
    }
  }
}

export default MailchimpConnector;
