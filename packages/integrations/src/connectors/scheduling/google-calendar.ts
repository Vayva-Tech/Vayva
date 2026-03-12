/**
 * Google Calendar Connector
 * Integration with Google Calendar API v3
 */

import type { ConnectorConfig, SyncResult } from '../../marketplace/types';

export interface GoogleCalendarConfig extends ConnectorConfig {
  clientId: string;
  clientSecret: string;
  redirectUri: string;
  accessToken?: string;
  refreshToken?: string;
  tokenExpiry?: Date;
}

export interface CalendarEvent {
  id?: string;
  summary: string;
  description?: string;
  location?: string;
  start: { dateTime: string; timeZone?: string } | { date: string };
  end: { dateTime: string; timeZone?: string } | { date: string };
  attendees?: Array<{ email: string; displayName?: string; responseStatus?: string }>;
  reminders?: {
    useDefault?: boolean;
    overrides?: Array<{ method: 'email' | 'popup'; minutes: number }>;
  };
  conferenceData?: {
    createRequest?: { requestId: string; conferenceSolutionKey: { type: string } };
  };
  status?: 'confirmed' | 'tentative' | 'cancelled';
  colorId?: string;
}

export interface CalendarList {
  id: string;
  summary: string;
  primary: boolean;
  accessRole: string;
  backgroundColor?: string;
}

export class GoogleCalendarConnector {
  private config: GoogleCalendarConfig;
  private baseUrl = 'https://www.googleapis.com/calendar/v3';

  constructor(config: GoogleCalendarConfig) {
    this.config = config;
  }

  /**
   * Refresh OAuth access token
   */
  async refreshToken(): Promise<boolean> {
    try {
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
          client_id: this.config.clientId,
          client_secret: this.config.clientSecret,
          refresh_token: this.config.refreshToken ?? '',
          grant_type: 'refresh_token',
        }),
      });

      if (!response.ok) return false;

      const data = (await response.json()) as {
        access_token: string;
        expires_in: number;
      };

      this.config.accessToken = data.access_token;
      this.config.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);

      return true;
    } catch (error) {
      console.error('Google Calendar token refresh error:', error);
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
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const error = (await response.json().catch(() => ({}))) as {
        error?: { message?: string };
      };
      throw new Error(
        `Google Calendar API error: ${error.error?.message ?? response.statusText}`
      );
    }

    return response.json() as Promise<T>;
  }

  /**
   * Get list of calendars
   */
  async getCalendars(): Promise<CalendarList[]> {
    const result = await this.request<{
      items: Array<{
        id: string;
        summary: string;
        primary?: boolean;
        accessRole: string;
        backgroundColor?: string;
      }>;
    }>('/users/me/calendarList');

    return result.items.map((c) => ({
      id: c.id,
      summary: c.summary,
      primary: c.primary ?? false,
      accessRole: c.accessRole,
      backgroundColor: c.backgroundColor,
    }));
  }

  /**
   * Create a calendar event (appointment/booking)
   */
  async createEvent(
    event: CalendarEvent,
    calendarId = 'primary'
  ): Promise<CalendarEvent & { id: string }> {
    const result = await this.request<CalendarEvent & { id: string }>(
      `/calendars/${encodeURIComponent(calendarId)}/events${event.conferenceData ? '?conferenceDataVersion=1' : ''}`,
      {
        method: 'POST',
        body: JSON.stringify(event),
      }
    );
    return result;
  }

  /**
   * Update a calendar event
   */
  async updateEvent(
    eventId: string,
    updates: Partial<CalendarEvent>,
    calendarId = 'primary'
  ): Promise<CalendarEvent> {
    return this.request<CalendarEvent>(
      `/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
      {
        method: 'PATCH',
        body: JSON.stringify(updates),
      }
    );
  }

  /**
   * Delete a calendar event
   */
  async deleteEvent(eventId: string, calendarId = 'primary'): Promise<boolean> {
    try {
      await fetch(
        `${this.baseUrl}/calendars/${encodeURIComponent(calendarId)}/events/${eventId}`,
        {
          method: 'DELETE',
          headers: { Authorization: `Bearer ${this.config.accessToken}` },
        }
      );
      return true;
    } catch {
      return false;
    }
  }

  /**
   * List events in a date range
   */
  async listEvents(
    from: Date,
    to: Date,
    calendarId = 'primary'
  ): Promise<CalendarEvent[]> {
    const result = await this.request<{ items: CalendarEvent[] }>(
      `/calendars/${encodeURIComponent(calendarId)}/events?` +
        new URLSearchParams({
          timeMin: from.toISOString(),
          timeMax: to.toISOString(),
          singleEvents: 'true',
          orderBy: 'startTime',
        }).toString()
    );
    return result.items;
  }

  /**
   * Check availability (free/busy)
   */
  async checkAvailability(
    emails: string[],
    from: Date,
    to: Date
  ): Promise<Record<string, Array<{ start: string; end: string }>>> {
    const result = await this.request<{
      calendars: Record<string, { busy: Array<{ start: string; end: string }> }>;
    }>('/freeBusy', {
      method: 'POST',
      body: JSON.stringify({
        timeMin: from.toISOString(),
        timeMax: to.toISOString(),
        items: emails.map((email) => ({ id: email })),
      }),
    });

    const availability: Record<string, Array<{ start: string; end: string }>> = {};
    for (const [email, data] of Object.entries(result.calendars)) {
      availability[email] = data.busy;
    }
    return availability;
  }

  /**
   * Sync appointments from Vayva to Google Calendar
   */
  async syncAppointments(
    appointments: Array<{
      id: string;
      title: string;
      description?: string;
      customerEmail: string;
      customerName: string;
      startTime: Date;
      endTime: Date;
      location?: string;
    }>,
    calendarId = 'primary'
  ): Promise<SyncResult> {
    const errors: string[] = [];
    let itemsSynced = 0;

    for (const appt of appointments) {
      try {
        await this.createEvent(
          {
            summary: appt.title,
            description: appt.description,
            location: appt.location,
            start: { dateTime: appt.startTime.toISOString(), timeZone: 'UTC' },
            end: { dateTime: appt.endTime.toISOString(), timeZone: 'UTC' },
            attendees: [{ email: appt.customerEmail, displayName: appt.customerName }],
            reminders: {
              useDefault: false,
              overrides: [
                { method: 'email', minutes: 24 * 60 },
                { method: 'popup', minutes: 30 },
              ],
            },
          },
          calendarId
        );
        itemsSynced++;
      } catch (error) {
        errors.push(`Failed to sync appointment ${appt.id}: ${error}`);
      }
    }

    return { success: errors.length === 0, itemsSynced, errors, lastSyncAt: new Date() };
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.getCalendars();
      return true;
    } catch {
      return false;
    }
  }
}

export default GoogleCalendarConnector;
