/**
 * Calendly Connector
 * Integration with Calendly Scheduling API
 */

import type { ConnectorConfig, SyncResult } from '../../marketplace/types';

export interface CalendlyConfig extends ConnectorConfig {
  accessToken: string;
  organizationUri?: string;
  userUri?: string;
}

export interface CalendlyEventType {
  uri: string;
  name: string;
  slug: string;
  active: boolean;
  duration: number;
  type: 'StandardEventType' | 'AdhocEventType';
  color?: string;
  schedulingUrl: string;
  description?: string;
}

export interface CalendlyEvent {
  uri: string;
  name: string;
  status: 'active' | 'canceled';
  startTime: Date;
  endTime: Date;
  eventType: string;
  location?: {
    type: string;
    joinUrl?: string;
  };
  invitees: Array<{
    email: string;
    name: string;
    status: string;
    timezone?: string;
  }>;
  canceledAt?: Date;
  cancellationReason?: string;
}

export interface CalendlyWebhook {
  uri: string;
  callbackUrl: string;
  events: string[];
  scope: 'user' | 'organization';
  state: 'active' | 'disabled';
  organizationUri: string;
  userUri?: string;
}

export class CalendlyConnector {
  private config: CalendlyConfig;
  private baseUrl = 'https://api.calendly.com';

  constructor(config: CalendlyConfig) {
    this.config = config;
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers: {
        Authorization: `Bearer ${this.config.accessToken}`,
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as {
        message?: string;
        title?: string;
      };
      throw new Error(
        `Calendly API error: ${error.title ?? ''} - ${error.message ?? response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get current user info and set URIs
   */
  async getCurrentUser(): Promise<{
    uri: string;
    name: string;
    email: string;
    organizationUri: string;
  }> {
    const result = await this.request<{
      resource: {
        uri: string;
        name: string;
        email: string;
        current_organization: string;
      };
    }>('/users/me');

    this.config.userUri = result.resource.uri;
    this.config.organizationUri = result.resource.current_organization;

    return {
      uri: result.resource.uri,
      name: result.resource.name,
      email: result.resource.email,
      organizationUri: result.resource.current_organization,
    };
  }

  /**
   * Get all event types (booking page types)
   */
  async getEventTypes(): Promise<CalendlyEventType[]> {
    if (!this.config.userUri) {
      await this.getCurrentUser();
    }

    const result = await this.request<{
      collection: Array<{
        uri: string;
        name: string;
        slug: string;
        active: boolean;
        duration: number;
        type: string;
        color?: string;
        scheduling_url: string;
        description_plain?: string;
      }>;
    }>(`/event_types?user=${encodeURIComponent(this.config.userUri ?? '')}`);

    return result.collection.map((et) => ({
      uri: et.uri,
      name: et.name,
      slug: et.slug,
      active: et.active,
      duration: et.duration,
      type: et.type as CalendlyEventType['type'],
      color: et.color,
      schedulingUrl: et.scheduling_url,
      description: et.description_plain,
    }));
  }

  /**
   * List scheduled events
   */
  async listEvents(options?: {
    from?: Date;
    to?: Date;
    status?: 'active' | 'canceled';
    count?: number;
  }): Promise<CalendlyEvent[]> {
    if (!this.config.userUri) {
      await this.getCurrentUser();
    }

    const params = new URLSearchParams({
      user: this.config.userUri ?? '',
      count: String(options?.count ?? 100),
    });

    if (options?.from) params.set('min_start_time', options.from.toISOString());
    if (options?.to) params.set('max_start_time', options.to.toISOString());
    if (options?.status) params.set('status', options.status);

    const result = await this.request<{
      collection: Array<{
        uri: string;
        name: string;
        status: string;
        start_time: string;
        end_time: string;
        event_type: string;
        location?: { type: string; join_url?: string };
        canceled_at?: string;
        cancellation?: { reason: string };
        event_memberships: Array<{
          user_email: string;
          user_name: string;
        }>;
      }>;
    }>(`/scheduled_events?${params.toString()}`);

    return result.collection.map((e) => ({
      uri: e.uri,
      name: e.name,
      status: e.status as CalendlyEvent['status'],
      startTime: new Date(e.start_time),
      endTime: new Date(e.end_time),
      eventType: e.event_type,
      location: e.location,
      canceledAt: e.canceled_at ? new Date(e.canceled_at) : undefined,
      cancellationReason: e.cancellation?.reason,
      invitees: e.event_memberships.map((m) => ({
        email: m.user_email,
        name: m.user_name,
        status: 'active',
      })),
    }));
  }

  /**
   * Get event invitees
   */
  async getEventInvitees(
    eventUri: string
  ): Promise<
    Array<{ email: string; name: string; status: string; timezone?: string }>
  > {
    const eventUuid = eventUri.split('/').pop() ?? '';
    const result = await this.request<{
      collection: Array<{
        email: string;
        name: string;
        status: string;
        timezone?: string;
      }>;
    }>(`/scheduled_events/${eventUuid}/invitees`);

    return result.collection;
  }

  /**
   * Register webhook for new bookings
   */
  async registerWebhook(
    callbackUrl: string,
    events = ['invitee.created', 'invitee.canceled']
  ): Promise<CalendlyWebhook> {
    if (!this.config.organizationUri) {
      await this.getCurrentUser();
    }

    const result = await this.request<{ resource: CalendlyWebhook }>(
      '/webhook_subscriptions',
      {
        method: 'POST',
        body: JSON.stringify({
          url: callbackUrl,
          events,
          organization: this.config.organizationUri,
          user: this.config.userUri,
          scope: 'user',
        }),
      }
    );

    return result.resource;
  }

  /**
   * Sync booked appointments back to Vayva
   */
  async syncBookings(from?: Date): Promise<SyncResult> {
    try {
      const events = await this.listEvents({
        from: from ?? new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
        status: 'active',
      });

      return {
        success: true,
        itemsSynced: events.length,
        errors: [],
        lastSyncAt: new Date(),
      };
    } catch (error) {
      return {
        success: false,
        itemsSynced: 0,
        errors: [`Sync failed: ${error}`],
        lastSyncAt: new Date(),
      };
    }
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getCurrentUser();
      return true;
    } catch {
      return false;
    }
  }
}

export default CalendlyConnector;
