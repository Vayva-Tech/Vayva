/**
 * Event Timeline Feature
 * High-level API for event timeline management
 */

import { EventTimelineService, TimelineEvent, Milestone } from '../services/event-timeline.service';

export class EventTimelineFeature {
  constructor(private service: EventTimelineService) {}

  async getTimeline(eventId: string): Promise<TimelineEvent[]> {
    return this.service.getTimelineForEvent(eventId);
  }

  async addEvent(eventData: Partial<TimelineEvent>): Promise<TimelineEvent> {
    return this.service.createTimelineEvent(eventData);
  }

  async updateStatus(eventId: string, status: TimelineEvent['status']): Promise<boolean> {
    return this.service.updateEventStatus(eventId, status);
  }

  async getMilestones(eventId: string): Promise<Milestone[]> {
    return this.service.getMilestonesForEvent(eventId);
  }

  async addMilestone(milestoneData: Partial<Milestone>): Promise<Milestone> {
    return this.service.createMilestone(milestoneData);
  }

  async completeMilestone(milestoneId: string): Promise<boolean> {
    return this.service.completeMilestone(milestoneId);
  }

  async checkConflicts(eventId: string, startTime: Date, endTime: Date): Promise<TimelineEvent[]> {
    return this.service.detectConflicts(eventId, startTime, endTime);
  }

  async getStats(): Promise<{
    totalEvents: number;
    completedEvents: number;
    upcomingEvents: number;
    totalMilestones: number;
    completedMilestones: number;
    onTimeCompletionRate: number;
  }> {
    return this.service.getStatistics();
  }
}
