/**
 * Event Timeline Service
 * Manages event schedules, milestones, and day-of timelines
 */

import { z } from 'zod';

export interface TimelineEvent {
  id: string;
  eventId: string;
  title: string;
  description?: string;
  startTime: Date;
  endTime?: Date;
  location?: string;
  responsibleParty?: string;
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled';
  category: 'setup' | 'ceremony' | 'reception' | 'break' | 'activity' | 'teardown';
}

export interface Milestone {
  id: string;
  eventId: string;
  title: string;
  dueDate: Date;
  completed: boolean;
  completedAt?: Date;
  assignedTo?: string;
}

export interface TimelineConfig {
  enableReminders?: boolean;
  autoAdjustTimes?: boolean;
  enableConflicts?: boolean;
}

const TimelineEventSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  startTime: z.date(),
  endTime: z.date().optional(),
  location: z.string().optional(),
  responsibleParty: z.string().optional(),
  status: z.enum(['planned', 'in-progress', 'completed', 'cancelled']),
  category: z.enum(['setup', 'ceremony', 'reception', 'break', 'activity', 'teardown']),
});

export class EventTimelineService {
  private events: Map<string, TimelineEvent>;
  private milestones: Map<string, Milestone>;
  private config: TimelineConfig;

  constructor(config: TimelineConfig = {}) {
    this.config = {
      enableReminders: true,
      autoAdjustTimes: false,
      enableConflicts: true,
      ...config,
    };
    this.events = new Map();
    this.milestones = new Map();
  }

  async initialize(): Promise<void> {
    console.log('[EVENT_TIMELINE] Initializing service...');
    this.initializeSampleData();
    console.log('[EVENT_TIMELINE] Service initialized');
  }

  private initializeSampleData(): void {
    const now = new Date();
    const sampleEvents: TimelineEvent[] = [
      {
        id: 'te1',
        eventId: 'event1',
        title: 'Venue Setup',
        description: 'Arrange tables, chairs, and decorations',
        startTime: new Date(now.getTime() - 2 * 60 * 60 * 1000),
        endTime: new Date(now.getTime() - 30 * 60 * 1000),
        location: 'Main Hall',
        responsibleParty: 'Venue Staff',
        status: 'completed',
        category: 'setup',
      },
      {
        id: 'te2',
        eventId: 'event1',
        title: 'Guest Arrival',
        startTime: new Date(now.getTime()),
        endTime: new Date(now.getTime() + 30 * 60 * 1000),
        location: 'Entrance',
        status: 'in-progress',
        category: 'reception',
      },
      {
        id: 'te3',
        eventId: 'event1',
        title: 'Keynote Speech',
        startTime: new Date(now.getTime() + 60 * 60 * 1000),
        endTime: new Date(now.getTime() + 90 * 60 * 1000),
        location: 'Main Stage',
        responsibleParty: 'John Speaker',
        status: 'planned',
        category: 'activity',
      },
    ];

    const sampleMilestones: Milestone[] = [
      {
        id: 'ms1',
        eventId: 'event1',
        title: 'Finalize Catering Menu',
        dueDate: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000),
        completed: true,
        completedAt: new Date(now.getTime() - 8 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'ms2',
        eventId: 'event1',
        title: 'Send Final Headcount',
        dueDate: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
        completed: true,
        completedAt: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000),
      },
      {
        id: 'ms3',
        eventId: 'event1',
        title: 'Confirm AV Setup',
        dueDate: new Date(now.getTime() + 1 * 24 * 60 * 60 * 1000),
        completed: false,
      },
    ];

    sampleEvents.forEach(event => this.events.set(event.id, event));
    sampleMilestones.forEach(milestone => this.milestones.set(milestone.id, milestone));
  }

  createTimelineEvent(eventData: Partial<TimelineEvent>): TimelineEvent {
    const event: TimelineEvent = {
      ...eventData,
      id: eventData.id || `te_${Date.now()}`,
      status: eventData.status || 'planned',
    } as TimelineEvent;

    TimelineEventSchema.parse(event);
    this.events.set(event.id, event);
    
    if (this.config.enableConflicts && event.startTime && event.endTime) {
      const conflicts = this.detectConflicts(event.eventId, event.startTime, event.endTime);
      if (conflicts.length > 0) {
        console.warn(`[EVENT_TIMELINE] Detected ${conflicts.length} scheduling conflicts`);
      }
    }
    
    return event;
  }

  updateEventStatus(eventId: string, status: TimelineEvent['status']): boolean {
    const event = this.events.get(eventId);
    if (!event) return false;
    
    event.status = status;
    // Completion tracking would be added in full implementation
    
    return true;
  }

  createMilestone(milestoneData: Partial<Milestone>): Milestone {
    const milestone: Milestone = {
      ...milestoneData,
      id: milestoneData.id || `ms_${Date.now()}`,
      completed: milestoneData.completed || false,
    } as Milestone;

    this.milestones.set(milestone.id, milestone);
    return milestone;
  }

  completeMilestone(milestoneId: string): boolean {
    const milestone = this.milestones.get(milestoneId);
    if (!milestone) return false;
    
    milestone.completed = true;
    milestone.completedAt = new Date();
    return true;
  }

  getTimelineForEvent(eventId: string): TimelineEvent[] {
    return Array.from(this.events.values())
      .filter(e => e.eventId === eventId)
      .sort((a, b) => a.startTime.getTime() - b.startTime.getTime());
  }

  getMilestonesForEvent(eventId: string): Milestone[] {
    return Array.from(this.milestones.values())
      .filter(m => m.eventId === eventId)
      .sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime());
  }

  detectConflicts(eventId: string, startTime: Date, endTime: Date): TimelineEvent[] {
    return Array.from(this.events.values())
      .filter(e => 
        e.eventId === eventId && 
        e.id !== eventId &&
        e.startTime < endTime && 
        e.endTime && e.endTime > startTime
      );
  }

  getStatistics(): {
    totalEvents: number;
    completedEvents: number;
    upcomingEvents: number;
    totalMilestones: number;
    completedMilestones: number;
    onTimeCompletionRate: number;
  } {
    const allEvents = Array.from(this.events.values());
    const allMilestones = Array.from(this.milestones.values());
    
    const completed = allEvents.filter(e => e.status === 'completed');
    const upcoming = allEvents.filter(e => e.startTime > new Date());
    const completedMilestones = allMilestones.filter(m => m.completed);
    const onTimeMilestones = allMilestones.filter(m => 
      m.completed && m.completedAt && m.completedAt <= m.dueDate
    );

    return {
      totalEvents: allEvents.length,
      completedEvents: completed.length,
      upcomingEvents: upcoming.length,
      totalMilestones: allMilestones.length,
      completedMilestones: completedMilestones.length,
      onTimeCompletionRate: allMilestones.length > 0 
        ? (onTimeMilestones.length / allMilestones.length) * 100 
        : 0,
    };
  }
}
