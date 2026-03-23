// @ts-nocheck
/**
 * Deadline Calendar Service
 * 
 * Manages court deadlines, hearing dates, and legal calendar
 * with automatic calculation based on court rules.
 */

import { PrismaClient } from '@vayva/prisma';

const prisma = new PrismaClient();

export interface DeadlineData {
  storeId: string;
  caseId: string;
  deadlineType: string;
  triggerDate: Date;
  calculatedDate: Date;
  description: string;
  priority?: 'low' | 'medium' | 'high' | 'urgent';
}

export interface CourtRule {
  id?: string;
  courtName: string;
  ruleCode: string;
  daysBefore: number;
  excludeWeekends: boolean;
  excludeHolidays: boolean;
  description: string;
}

export class DeadlineCalendarService {
  /**
   * Calculate deadline based on court rules
   */
  calculateDeadline(
    triggerDate: Date,
    daysBefore: number,
    excludeWeekends: boolean = true,
    excludeHolidays: boolean = true
  ): Date {
    const result = new Date(triggerDate);
    
    if (excludeWeekends) {
      let added = 0;
      while (added < daysBefore) {
        result.setDate(result.getDate() - 1);
        const dayOfWeek = result.getDay();
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
          // Not weekend
          if (!excludeHolidays || !this.isHoliday(result)) {
            added++;
          }
        }
      }
    } else {
      result.setDate(result.getDate() - daysBefore);
    }

    return result;
  }

  /**
   * Check if date is a holiday
   */
  private isHoliday(date: Date): boolean {
    // Simplified holiday check - would be more comprehensive in production
    const month = date.getMonth();
    const day = date.getDate();
    
    // Common US holidays
    if ((month === 0 && day === 1) || // New Year's Day
        (month === 6 && day === 4) || // Independence Day
        (month === 11 && day === 25)) { // Christmas
      return true;
    }
    
    return false;
  }

  /**
   * Create deadline for case
   */
  async createDeadline(data: DeadlineData): Promise<any> {
    return prisma.deadline.create({
      data: {
        storeId: data.storeId,
        caseId: data.caseId,
        deadlineType: data.deadlineType,
        triggerDate: data.triggerDate,
        dueDate: data.calculatedDate,
        description: data.description,
        priority: data.priority || 'medium',
        status: 'pending',
      },
    });
  }

  /**
   * Get upcoming deadlines
   */
  async getUpcomingDeadlines(
    storeId: string,
    daysAhead: number = 30
  ): Promise<any[]> {
    const today = new Date();
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysAhead);

    return prisma.deadline.findMany({
      where: {
        storeId,
        status: 'pending',
        dueDate: {
          gte: today,
          lte: futureDate,
        },
      },
      include: {
        case: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  /**
   * Get overdue deadlines
   */
  async getOverdueDeadlines(storeId: string): Promise<any[]> {
    return prisma.deadline.findMany({
      where: {
        storeId,
        status: 'pending',
        dueDate: {
          lt: new Date(),
        },
      },
      include: {
        case: true,
      },
      orderBy: { dueDate: 'asc' },
    });
  }

  /**
   * Mark deadline as complete
   */
  async completeDeadline(deadlineId: string, completedBy: string): Promise<void> {
    await prisma.deadline.update({
      where: { id: deadlineId },
      data: {
        status: 'completed',
        completedAt: new Date(),
        completedBy,
      },
    });
  }

  /**
   * Generate recurring deadlines
   */
  async generateRecurringDeadlines(
    storeId: string,
    caseId: string,
    pattern: 'monthly' | 'quarterly' | 'yearly',
    count: number,
    startDate: Date
  ): Promise<any[]> {
    const deadlines = [];

    for (let i = 0; i < count; i++) {
      const dueDate = new Date(startDate);
      
      switch (pattern) {
        case 'monthly':
          dueDate.setMonth(dueDate.getMonth() + i);
          break;
        case 'quarterly':
          dueDate.setMonth(dueDate.getMonth() + (i * 3));
          break;
        case 'yearly':
          dueDate.setFullYear(dueDate.getFullYear() + i);
          break;
      }

      const deadline = await this.createDeadline({
        storeId,
        caseId,
        deadlineType: 'recurring',
        triggerDate: startDate,
        calculatedDate: dueDate,
        description: `Recurring deadline ${i + 1}`,
        priority: 'medium',
      });

      deadlines.push(deadline);
    }

    return deadlines;
  }

  /**
   * Get deadlines by case
   */
  async getDeadlinesByCase(caseId: string): Promise<any[]> {
    return prisma.deadline.findMany({
      where: { caseId },
      orderBy: { dueDate: 'asc' },
    });
  }

  /**
   * Send deadline reminders
   */
  async sendDeadlineReminders(daysBefore: number = 7): Promise<number> {
    const today = new Date();
    const reminderDate = new Date();
    reminderDate.setDate(reminderDate.getDate() + daysBefore);

    const upcomingDeadlines = await prisma.deadline.findMany({
      where: {
        status: 'pending',
        dueDate: {
          gte: today,
          lte: reminderDate,
        },
        reminderSent: false,
      },
      include: {
        case: {
          include: {
            assignments: {
              include: {
                user: true,
              },
            },
          },
        },
      },
    });

    // In production, would send emails/notifications here
    console.log(`[DeadlineCalendar] Would send ${upcomingDeadlines.length} reminders`);

    // Mark reminders as sent
    for (const deadline of upcomingDeadlines) {
      await prisma.deadline.update({
        where: { id: deadline.id },
        data: { reminderSent: true },
      });
    }

    return upcomingDeadlines.length;
  }

  async initialize(): Promise<void> {
    console.log('[DeadlineCalendarService] Initialized');
  }

  async dispose(): Promise<void> {
    // Cleanup if needed
  }
}
