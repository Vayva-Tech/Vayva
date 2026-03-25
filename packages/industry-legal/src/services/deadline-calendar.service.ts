/**
 * Deadline & court calendar service (in-process stub)
 */

export interface DeadlineData {
  caseId: string;
  title: string;
  dueDate: Date;
  type: string;
  priority?: string;
}

export interface CourtRule {
  jurisdiction: string;
  ruleCode: string;
  description: string;
}

export class DeadlineCalendarService {
  calculateDeadline(
    triggerDate: Date,
    daysBefore: number,
    excludeWeekends: boolean = true,
    _excludeHolidays: boolean = true,
  ): Date {
    const d = new Date(triggerDate);
    let remaining = daysBefore;
    while (remaining > 0) {
      d.setDate(d.getDate() - 1);
      const dow = d.getDay();
      if (!excludeWeekends || (dow !== 0 && dow !== 6)) {
        remaining--;
      }
    }
    return d;
  }

  async getOverdueDeadlines(_storeId: string): Promise<DeadlineData[]> {
    return [];
  }

  async completeDeadline(_deadlineId: string, _completedBy: string): Promise<void> {}

  async createDeadline(data: DeadlineData): Promise<DeadlineData & { id: string }> {
    return { ...data, id: `dl_${Date.now()}` };
  }

  async getDeadlinesForCase(_caseId: string): Promise<DeadlineData[]> {
    return [];
  }

  async getUpcomingDeadlines(storeId: string, daysAhead: number = 30): Promise<DeadlineData[]> {
    void storeId;
    void daysAhead;
    return [];
  }

  async updateDeadlineStatus(_deadlineId: string, _status: string): Promise<void> {}

  async calculateCourtDeadline(
    triggerDate: Date,
    days: number,
    _rules?: CourtRule[],
  ): Promise<Date> {
    const d = new Date(triggerDate);
    d.setDate(d.getDate() + days);
    return d;
  }

  async getMissedDeadlines(_storeId: string): Promise<DeadlineData[]> {
    return [];
  }

  async initialize(): Promise<void> {
    console.log('[DeadlineCalendarService] Initialized');
  }

  async dispose(): Promise<void> {}
}
