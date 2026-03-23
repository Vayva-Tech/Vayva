// @ts-nocheck
/**
 * Event Timeline Builder Feature
 */

import { EventTimelineBuilderService } from '../services/event-timeline-builder.service.js';

export class EventTimelineBuilderFeature {
  constructor(private service: EventTimelineBuilderService) {}

  async initialize(): Promise<void> {
    await this.service.initialize();
  }

  createTimeline(eventId: string, name: string, start: Date, end: Date) {
    return this.service.createTimeline(eventId, name, start, end);
  }

  addEvent(timelineId: string, data: any) {
    return this.service.addEvent(timelineId, data);
  }

  updateEventStatus(timelineId: string, eventId: string, status: any) {
    return this.service.updateEventStatus(timelineId, eventId, status);
  }

  getTimeline(id: string) {
    return this.service.getTimeline(id);
  }

  getStatistics(id: string) {
    return this.service.getStatistics(id);
  }
}
