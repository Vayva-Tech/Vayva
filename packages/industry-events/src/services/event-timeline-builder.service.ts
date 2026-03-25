/**
 * Event Timeline Builder Service
 * Manages event planning timelines and milestone tracking
 */

import { z } from 'zod';

export interface TimelineEvent {
  id: string;
  eventId: string;
  name: string;
  description?: string;
  date: Date;
  time?: string;
  type: 'milestone' | 'task' | 'reminder' | 'deadline';
  status: 'pending' | 'in-progress' | 'completed' | 'cancelled';
  priority: 'low' | 'medium' | 'high' | 'critical';
  assignedTo?: string[];
  dependencies?: string[]; // IDs of dependent events
  completedAt?: Date;
  notes?: string;
}

export interface EventTimeline {
  id: string;
  eventId: string;
  name: string;
  startDate: Date;
  endDate: Date;
  events: TimelineEvent[];
  progress: number; // 0-100
}

export interface TimelineConfig {
  enableDependencies?: boolean;
  autoProgressCalculation?: boolean;
  reminderDaysBefore?: number;
}

const TimelineEventSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string(),
  description: z.string().optional(),
  date: z.date(),
  time: z.string().optional(),
  type: z.enum(['milestone', 'task', 'reminder', 'deadline']),
  status: z.enum(['pending', 'in-progress', 'completed', 'cancelled']),
  priority: z.enum(['low', 'medium', 'high', 'critical']),
  assignedTo: z.array(z.string()).optional(),
  dependencies: z.array(z.string()).optional(),
  completedAt: z.date().optional(),
  notes: z.string().optional(),
});

export class EventTimelineBuilderService {
  private timelines: Map<string, EventTimeline>;
  private config: TimelineConfig;

  constructor(config: TimelineConfig = {}) {
    this.config = {
      enableDependencies: true,
      autoProgressCalculation: true,
      reminderDaysBefore: 3,
      ...config,
    };
    this.timelines = new Map();
  }

  async initialize(): Promise<void> {
    console.warn('[EVENT_TIMELINE] Initializing service...');
    console.warn('[EVENT_TIMELINE] Service initialized');
  }

  /**
   * Create a timeline for an event
   */
  createTimeline(eventId: string, name: string, startDate: Date, endDate: Date): EventTimeline {
    const timeline: EventTimeline = {
      id: `timeline_${Date.now()}`,
      eventId,
      name,
      startDate,
      endDate,
      events: [],
      progress: 0,
    };

    this.timelines.set(timeline.id, timeline);
    return timeline;
  }

  /**
   * Add event to timeline
   */
  addEvent(timelineId: string, eventData: Partial<TimelineEvent>): TimelineEvent {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) throw new Error('Timeline not found');

    const event: TimelineEvent = {
      ...eventData,
      id: eventData.id || `event_${Date.now()}`,
      status: eventData.status || 'pending',
      priority: eventData.priority || 'medium',
      type: eventData.type || 'task',
    } as TimelineEvent;

    TimelineEventSchema.parse(event);
    timeline.events.push(event);
    
    if (this.config.autoProgressCalculation) {
      timeline.progress = this.calculateProgress(timeline.events);
    }

    return event;
  }

  /**
   * Update event status
   */
  updateEventStatus(timelineId: string, eventId: string, status: TimelineEvent['status']): void {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return;

    const event = timeline.events.find(e => e.id === eventId);
    if (!event) return;

    event.status = status;
    if (status === 'completed') {
      event.completedAt = new Date();
    }

    if (this.config.autoProgressCalculation) {
      timeline.progress = this.calculateProgress(timeline.events);
    }
  }

  /**
   * Get timeline by ID
   */
  getTimeline(timelineId: string): EventTimeline | undefined {
    return this.timelines.get(timelineId);
  }

  /**
   * Get upcoming events
   */
  getUpcomingEvents(timelineId: string, daysAhead: number = 7): TimelineEvent[] {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return [];

    const now = new Date();
    const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);

    return timeline.events.filter(event => 
      event.date >= now && 
      event.date <= future &&
      event.status !== 'completed' &&
      event.status !== 'cancelled'
    );
  }

  /**
   * Get timeline statistics
   */
  getStatistics(timelineId: string): {
    totalEvents: number;
    completed: number;
    pending: number;
    inProgress: number;
    overdue: number;
    progress: number;
  } {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) {
      return { totalEvents: 0, completed: 0, pending: 0, inProgress: 0, overdue: 0, progress: 0 };
    }

    const now = new Date();
    return {
      totalEvents: timeline.events.length,
      completed: timeline.events.filter(e => e.status === 'completed').length,
      pending: timeline.events.filter(e => e.status === 'pending').length,
      inProgress: timeline.events.filter(e => e.status === 'in-progress').length,
      overdue: timeline.events.filter(e => 
        e.date < now && 
        e.status !== 'completed' &&
        e.status !== 'cancelled'
      ).length,
      progress: timeline.progress,
    };
  }

  private calculateProgress(events: TimelineEvent[]): number {
    if (events.length === 0) return 0;
    const completed = events.filter(e => e.status === 'completed').length;
    return Math.round((completed / events.length) * 100);
  }
}
