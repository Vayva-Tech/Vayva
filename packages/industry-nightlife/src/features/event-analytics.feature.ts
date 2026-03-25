/**
 * Event Analytics Feature
 */

import { EventAnalyticsService } from '../services/event-analytics.service.js';

export class EventAnalyticsFeature {
  constructor(private service: EventAnalyticsService) {}

  async initialize(): Promise<void> {
    await this.service.initialize();
  }

  getCurrentMetrics() {
    return this.service.getCurrentMetrics();
  }

  getTrends() {
    return this.service.getTrends();
  }

  generateInsights() {
    return this.service.generateInsights();
  }
}
