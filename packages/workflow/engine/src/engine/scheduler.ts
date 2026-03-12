/**
 * Workflow Scheduler
 * Handles scheduled workflow triggers using cron and interval-based scheduling
 */

import { parseExpression } from 'cron-parser';
import type { Workflow, ScheduleTriggerConfig } from '../types.js';

export interface ScheduledWorkflow {
  id: string;
  workflowId: string;
  merchantId: string;
  nextRunAt: Date;
  cronExpression?: string;
  intervalMs?: number;
  timezone?: string;
}

export class WorkflowScheduler {
  private scheduledWorkflows: Map<string, ScheduledWorkflow> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private onTrigger: (workflowId: string, merchantId: string) => Promise<void>;

  constructor(onTrigger: (workflowId: string, merchantId: string) => Promise<void>) {
    this.onTrigger = onTrigger;
  }

  /**
   * Schedule a workflow based on its trigger configuration
   */
  schedule(workflow: Workflow): void {
    if (workflow.trigger.type !== 'schedule') {
      return;
    }

    const config = workflow.trigger.config as ScheduleTriggerConfig;
    const scheduled: ScheduledWorkflow = {
      id: `schedule_${workflow.id}`,
      workflowId: workflow.id,
      merchantId: workflow.merchantId,
      nextRunAt: new Date(),
      cronExpression: config.cron,
      intervalMs: this.parseInterval(config.interval),
      timezone: config.timezone,
    };

    // Calculate next run time
    scheduled.nextRunAt = this.calculateNextRun(scheduled);

    this.scheduledWorkflows.set(scheduled.id, scheduled);
    this.scheduleNextRun(scheduled);
  }

  /**
   * Unschedule a workflow
   */
  unschedule(workflowId: string): void {
    const scheduleId = `schedule_${workflowId}`;
    const timer = this.timers.get(scheduleId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(scheduleId);
    }
    this.scheduledWorkflows.delete(scheduleId);
  }

  /**
   * Get all scheduled workflows
   */
  getScheduledWorkflows(): ScheduledWorkflow[] {
    return Array.from(this.scheduledWorkflows.values());
  }

  /**
   * Get next run time for a scheduled workflow
   */
  getNextRunTime(workflowId: string): Date | null {
    const scheduleId = `schedule_${workflowId}`;
    const scheduled = this.scheduledWorkflows.get(scheduleId);
    return scheduled?.nextRunAt || null;
  }

  /**
   * Clear all scheduled workflows
   */
  clear(): void {
    this.timers.forEach((timer) => clearTimeout(timer));
    this.timers.clear();
    this.scheduledWorkflows.clear();
  }

  private scheduleNextRun(scheduled: ScheduledWorkflow): void {
    const now = new Date();
    const delay = scheduled.nextRunAt.getTime() - now.getTime();

    const timer = setTimeout(async () => {
      try {
        await this.onTrigger(scheduled.workflowId, scheduled.merchantId);
      } catch (error) {
        console.error(`Failed to trigger workflow ${scheduled.workflowId}:`, error);
      }

      // Reschedule for next run
      scheduled.nextRunAt = this.calculateNextRun(scheduled);
      this.scheduleNextRun(scheduled);
    }, Math.max(delay, 0));

    this.timers.set(scheduled.id, timer);
  }

  private calculateNextRun(scheduled: ScheduledWorkflow): Date {
    const now = new Date();

    if (scheduled.cronExpression) {
      try {
        const interval = parseExpression(scheduled.cronExpression, {
          currentDate: now,
          tz: scheduled.timezone,
        });
        return interval.next().toDate();
      } catch (error) {
        console.error(`Invalid cron expression: ${scheduled.cronExpression}`, error);
        return new Date(now.getTime() + 60000); // Default to 1 minute
      }
    }

    if (scheduled.intervalMs) {
      return new Date(now.getTime() + scheduled.intervalMs);
    }

    return new Date(now.getTime() + 60000); // Default to 1 minute
  }

  private parseInterval(interval?: string): number | undefined {
    if (!interval) return undefined;

    const match = interval.match(/^(\d+)\s*(ms|s|m|h|d)$/);
    if (!match) return undefined;

    const value = parseInt(match[1], 10);
    const unit = match[2];

    switch (unit) {
      case 'ms':
        return value;
      case 's':
        return value * 1000;
      case 'm':
        return value * 60 * 1000;
      case 'h':
        return value * 60 * 60 * 1000;
      case 'd':
        return value * 24 * 60 * 60 * 1000;
      default:
        return undefined;
    }
  }
}

/**
 * Delay utility for workflow execution
 */
export async function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Check if current time is within business hours
 */
export function isBusinessHours(
  timezone: string = 'UTC',
  startHour: number = 9,
  endHour: number = 17
): boolean {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    timeZone: timezone,
    hour: 'numeric',
    hour12: false,
    weekday: 'short',
  };
  
  const formatter = new Intl.DateTimeFormat('en-US', options);
  const parts = formatter.formatToParts(now);
  const hour = parseInt(parts.find((p) => p.type === 'hour')?.value || '0', 10);
  const weekday = parts.find((p) => p.type === 'weekday')?.value || '';

  // Check if weekday (Mon-Fri)
  const isWeekday = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'].includes(weekday);
  
  // Check if within business hours
  const withinHours = hour >= startHour && hour < endHour;

  return isWeekday && withinHours;
}

/**
 * Calculate next business day
 */
export function nextBusinessDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + 1);
  
  // Skip weekends
  while (result.getDay() === 0 || result.getDay() === 6) {
    result.setDate(result.getDate() + 1);
  }
  
  return result;
}
