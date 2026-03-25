/**
 * Deadline Calendar Feature Module
 */

import { DeadlineCalendarService } from '../services/deadline-calendar.service';

export class DeadlineCalendarFeature {
  private service: DeadlineCalendarService;
  private initialized: boolean = false;

  constructor() {
    this.service = new DeadlineCalendarService();
  }

  async initialize(): Promise<void> {
    if (!this.initialized) {
      await this.service.initialize();
      this.initialized = true;
      console.log('[DeadlineCalendarFeature] Initialized');
    }
  }

  calculateDeadline(triggerDate: Date, daysBefore: number, excludeWeekends: boolean = true, excludeHolidays: boolean = true) {
    return this.service.calculateDeadline(triggerDate, daysBefore, excludeWeekends, excludeHolidays);
  }

  async createDeadline(data: any) {
    return this.service.createDeadline(data);
  }

  async getUpcomingDeadlines(storeId: string, daysAhead: number = 30) {
    return this.service.getUpcomingDeadlines(storeId, daysAhead);
  }

  async getOverdueDeadlines(storeId: string) {
    return this.service.getOverdueDeadlines(storeId);
  }

  async completeDeadline(deadlineId: string, completedBy: string) {
    return this.service.completeDeadline(deadlineId, completedBy);
  }

  isInitialized(): boolean {
    return this.initialized;
  }

  async dispose(): Promise<void> {
    await this.service.dispose();
    this.initialized = false;
  }
}
