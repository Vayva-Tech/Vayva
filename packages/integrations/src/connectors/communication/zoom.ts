/**
 * Zoom Connector
 * Integration with Zoom Video Conferencing API
 */

import type { ConnectorConfig, SyncResult } from '../../marketplace/types';

export interface ZoomConfig extends ConnectorConfig {
  accountId: string;
  clientId: string;
  clientSecret: string;
  accessToken?: string;
  tokenExpiry?: Date;
}

export interface ZoomMeeting {
  id?: number;
  uuid?: string;
  topic: string;
  type: 1 | 2 | 3 | 8; // 1=instant, 2=scheduled, 3=recurring_no_fixed_time, 8=recurring_fixed_time
  startTime?: Date;
  duration?: number; // minutes
  timezone?: string;
  agenda?: string;
  joinUrl?: string;
  startUrl?: string;
  password?: string;
  settings?: {
    hostVideo?: boolean;
    participantVideo?: boolean;
    joinBeforeHost?: boolean;
    waitingRoom?: boolean;
    autoRecording?: 'none' | 'local' | 'cloud';
    muteUponEntry?: boolean;
  };
}

export interface ZoomParticipant {
  id: string;
  userId?: string;
  name: string;
  userEmail?: string;
  joinTime: Date;
  leaveTime?: Date;
  duration: number; // seconds
}

export class ZoomConnector {
  private config: ZoomConfig;
  private baseUrl = 'https://api.zoom.us/v2';

  constructor(config: ZoomConfig) {
    this.config = config;
  }

  /**
   * Get OAuth access token using Server-to-Server OAuth
   */
  async getAccessToken(): Promise<boolean> {
    try {
      const response = await fetch(
        `https://zoom.us/oauth/token?grant_type=account_credentials&account_id=${this.config.accountId}`,
        {
          method: 'POST',
          headers: {
            Authorization: `Basic ${Buffer.from(`${this.config.clientId}:${this.config.clientSecret}`).toString('base64')}`,
            'Content-Type': 'application/x-www-form-urlencoded',
          },
        }
      );

      if (!response.ok) return false;

      const data = (await response.json()) as {
        access_token: string;
        expires_in: number;
      };

      this.config.accessToken = data.access_token;
      this.config.tokenExpiry = new Date(Date.now() + data.expires_in * 1000);

      return true;
    } catch (error) {
      console.error('Zoom token error:', error);
      return false;
    }
  }

  private async request<T>(endpoint: string, options?: RequestInit): Promise<T> {
    if (!this.config.accessToken || (this.config.tokenExpiry && new Date() > this.config.tokenExpiry)) {
      await this.getAccessToken();
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
      const error = (await response.json().catch(() => ({}))) as { message?: string };
      throw new Error(`Zoom API error: ${error.message ?? response.statusText}`);
    }

    if (response.status === 204) return {} as T;

    return response.json() as Promise<T>;
  }

  /**
   * Create a Zoom meeting for an appointment
   */
  async createMeeting(meeting: ZoomMeeting, userId = 'me'): Promise<ZoomMeeting & { id: number; joinUrl: string; startUrl: string }> {
    const result = await this.request<{
      id: number;
      uuid: string;
      topic: string;
      type: number;
      start_time?: string;
      duration?: number;
      timezone?: string;
      agenda?: string;
      join_url: string;
      start_url: string;
      password?: string;
    }>(`/users/${userId}/meetings`, {
      method: 'POST',
      body: JSON.stringify({
        topic: meeting.topic,
        type: meeting.type,
        start_time: meeting.startTime?.toISOString(),
        duration: meeting.duration,
        timezone: meeting.timezone ?? 'UTC',
        agenda: meeting.agenda,
        settings: {
          host_video: meeting.settings?.hostVideo ?? true,
          participant_video: meeting.settings?.participantVideo ?? true,
          join_before_host: meeting.settings?.joinBeforeHost ?? false,
          waiting_room: meeting.settings?.waitingRoom ?? true,
          auto_recording: meeting.settings?.autoRecording ?? 'none',
          mute_upon_entry: meeting.settings?.muteUponEntry ?? false,
        },
      }),
    });

    return {
      id: result.id,
      uuid: result.uuid,
      topic: result.topic,
      type: result.type as ZoomMeeting['type'],
      startTime: result.start_time ? new Date(result.start_time) : undefined,
      duration: result.duration,
      timezone: result.timezone,
      agenda: result.agenda,
      joinUrl: result.join_url,
      startUrl: result.start_url,
      password: result.password,
    };
  }

  /**
   * Update a meeting
   */
  async updateMeeting(
    meetingId: number,
    updates: Partial<ZoomMeeting>
  ): Promise<boolean> {
    try {
      await this.request(`/meetings/${meetingId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          topic: updates.topic,
          start_time: updates.startTime?.toISOString(),
          duration: updates.duration,
          agenda: updates.agenda,
        }),
      });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Delete (end) a meeting
   */
  async deleteMeeting(meetingId: number): Promise<boolean> {
    try {
      await this.request(`/meetings/${meetingId}`, { method: 'DELETE' });
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Get meeting participants
   */
  async getMeetingParticipants(meetingId: string): Promise<ZoomParticipant[]> {
    const result = await this.request<{
      participants: Array<{
        id: string;
        user_id?: string;
        name: string;
        user_email?: string;
        join_time: string;
        leave_time?: string;
        duration: number;
      }>;
    }>(`/report/meetings/${meetingId}/participants`);

    return result.participants.map((p) => ({
      id: p.id,
      userId: p.user_id,
      name: p.name,
      userEmail: p.user_email,
      joinTime: new Date(p.join_time),
      leaveTime: p.leave_time ? new Date(p.leave_time) : undefined,
      duration: p.duration,
    }));
  }

  /**
   * List upcoming meetings
   */
  async listMeetings(userId = 'me'): Promise<ZoomMeeting[]> {
    const result = await this.request<{
      meetings: Array<{
        id: number;
        uuid: string;
        topic: string;
        type: number;
        start_time: string;
        duration: number;
        timezone: string;
        agenda?: string;
        join_url: string;
      }>;
    }>(`/users/${userId}/meetings?type=scheduled&page_size=100`);

    return result.meetings.map((m) => ({
      id: m.id,
      uuid: m.uuid,
      topic: m.topic,
      type: m.type as ZoomMeeting['type'],
      startTime: new Date(m.start_time),
      duration: m.duration,
      timezone: m.timezone,
      agenda: m.agenda,
      joinUrl: m.join_url,
    }));
  }

  /**
   * Create Zoom meetings for appointments
   */
  async syncAppointments(
    appointments: Array<{
      id: string;
      title: string;
      customerName: string;
      startTime: Date;
      durationMinutes: number;
      notes?: string;
    }>
  ): Promise<SyncResult> {
    const errors: string[] = [];
    let itemsSynced = 0;

    for (const appt of appointments) {
      try {
        await this.createMeeting({
          topic: `${appt.title} with ${appt.customerName}`,
          type: 2,
          startTime: appt.startTime,
          duration: appt.durationMinutes,
          agenda: appt.notes,
        });
        itemsSynced++;
      } catch (error) {
        errors.push(`Failed to create meeting for ${appt.id}: ${error}`);
      }
    }

    return { success: errors.length === 0, itemsSynced, errors, lastSyncAt: new Date() };
  }

  /**
   * Test connection
   */
  async testConnection(): Promise<boolean> {
    try {
      await this.request('/users/me');
      return true;
    } catch {
      return false;
    }
  }
}

export default ZoomConnector;
