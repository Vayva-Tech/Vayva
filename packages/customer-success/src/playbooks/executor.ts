/**
 * Playbook Executor
 * Executes playbook actions and manages playbook runs
 */

import { prisma } from '../lib/prisma';
import {
  Playbook,
  PlaybookAction,
  PlaybookExecution,
  PlaybookActionExecution,
  PlaybookJobData,
} from '../lib/types';
import { getPlaybookById } from './definitions';
import { PLAYBOOK_CONFIG } from '../lib/constants';
import { logger } from '@vayva/shared';

export class PlaybookExecutor {
  private whatsappSender: ((phone: string, message: string) => Promise<void>) | null = null;
  private emailSender: ((email: string, template: string, data: unknown) => Promise<void>) | null = null;
  private slackNotifier: ((channel: string, message: string) => Promise<void>) | null = null;
  private taskCreator: ((assignee: string, title: string, priority: string, storeId: string) => Promise<void>) | null = null;

  /**
   * Set WhatsApp sender function
   */
  setWhatsAppSender(sender: (phone: string, message: string) => Promise<void>): void {
    this.whatsappSender = sender;
  }

  /**
   * Set email sender function
   */
  setEmailSender(sender: (email: string, template: string, data: unknown) => Promise<void>): void {
    this.emailSender = sender;
  }

  /**
   * Set Slack notifier function
   */
  setSlackNotifier(notifier: (channel: string, message: string) => Promise<void>): void {
    this.slackNotifier = notifier;
  }

  /**
   * Set task creator function
   */
  setTaskCreator(creator: (assignee: string, title: string, priority: string, storeId: string) => Promise<void>): void {
    this.taskCreator = creator;
  }

  /**
   * Execute a playbook for a merchant
   */
  async execute(data: PlaybookJobData): Promise<PlaybookExecution> {
    const { playbookId, storeId, triggerData } = data;

    const playbook = getPlaybookById(playbookId);
    if (!playbook) {
      throw new Error(`Playbook not found: ${playbookId}`);
    }

    if (!playbook.enabled) {
      throw new Error(`Playbook is disabled: ${playbookId}`);
    }

    // Check rate limiting
    const canExecute = await this.checkRateLimit(playbookId, storeId);
    if (!canExecute) {
      throw new Error(`Rate limit exceeded for playbook ${playbookId} on store ${storeId}`);
    }
    
    // Get store data for templating
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { owner: true },
    });

    if (!store) {
      throw new Error(`Store not found: ${storeId}`);
    }

    // Create execution record
    const execution: PlaybookExecution = {
      id: this.generateId(),
      playbookId,
      storeId,
      status: 'running',
      startedAt: new Date(),
      actionsExecuted: [],
    };

    // Execute each action
    for (let i = 0; i < playbook.actions.length; i++) {
      const action = playbook.actions[i];
      const actionExecution: PlaybookActionExecution = {
        actionIndex: i,
        actionType: action.type,
        status: 'pending',
      };

      try {
        // Apply delay if specified
        if (action.delay && action.delay > 0) {
          await this.sleep(action.delay);
        }

        actionExecution.status = 'running';

        // Process template variables
        const processedAction = this.processTemplates(action, store, triggerData);

        // Execute the action
        const result = await this.executeAction(processedAction, store);

        actionExecution.status = 'completed';
        actionExecution.executedAt = new Date();
        actionExecution.result = result;

        logger.info(`Playbook action completed`, {
          playbookId,
          storeId,
          actionIndex: i,
          actionType: action.type,
        });
      } catch (error) {
        actionExecution.status = 'failed';
        actionExecution.error = error instanceof Error ? error.message : String(error);

        logger.error(`Playbook action failed`, {
          playbookId,
          storeId,
          actionIndex: i,
          actionType: action.type,
          error: actionExecution.error,
        });

        // Continue with next action or fail based on configuration
        if (this.isCriticalAction(action)) {
          execution.status = 'failed';
          execution.error = actionExecution.error;
          break;
        }
      }

      execution.actionsExecuted.push(actionExecution);
    }

    // Mark execution complete
    if (execution.status === 'running') {
      execution.status = 'completed';
    }
    execution.completedAt = new Date();

    // Log execution
    await this.logExecution(execution);

    return execution;
  }

  /**
   * Execute a single action
   */
  private async executeAction(
    action: PlaybookAction,
    store: { id: string; name: string; owner: { phone: string | null; email: string | null } }
  ): Promise<unknown> {
    switch (action.type) {
      case 'whatsapp':
        if (!this.whatsappSender) {
          throw new Error('WhatsApp sender not configured');
        }
        if (!store.owner.phone) {
          throw new Error('Store owner has no phone number');
        }
        await this.whatsappSender(store.owner.phone, action.message || '');
        return { sent: true, channel: 'whatsapp' };

      case 'email':
        if (!this.emailSender) {
          throw new Error('Email sender not configured');
        }
        if (!store.owner.email) {
          throw new Error('Store owner has no email');
        }
        await this.emailSender(store.owner.email, action.template || 'default', { store });
        return { sent: true, channel: 'email' };

      case 'slack':
        if (!this.slackNotifier) {
          throw new Error('Slack notifier not configured');
        }
        await this.slackNotifier(action.channel || '#general', action.message || '');
        return { sent: true, channel: 'slack' };

      case 'task':
        if (!this.taskCreator) {
          throw new Error('Task creator not configured');
        }
        await this.taskCreator(
          action.assignee || 'csm',
          action.title || 'Playbook Task',
          action.priority || 'medium',
          store.id
        );
        return { created: true, type: 'task' };

      case 'in_app':
        // In-app notifications would be handled by a notification service
        return { sent: true, channel: 'in_app' };

      case 'webhook':
        // Webhook calls would be handled here
        return { sent: true, channel: 'webhook' };

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Process template variables in action fields
   */
  private processTemplates(
    action: PlaybookAction,
    store: { id: string; name: string; owner: { firstName?: string | null; phone: string | null; email: string | null } },
    triggerData?: Record<string, unknown>
  ): PlaybookAction {
    const processed = { ...action };

    const templateVars: Record<string, string> = {
      firstName: store.owner?.firstName || 'there',
      storeName: store.name,
      storeId: store.id,
      upgradeUrl: `${process.env.APP_URL}/settings/billing/upgrade`,
      productsUrl: `${process.env.APP_URL}/products`,
      whatsappUrl: `${process.env.APP_URL}/settings/whatsapp`,
      featuresUrl: `${process.env.APP_URL}/features`,
      demoUrl: `${process.env.APP_URL}/demo`,
      setupUrl: `${process.env.APP_URL}/setup`,
      tipsUrl: `${process.env.APP_URL}/tips`,
      fulfillmentUrl: `${process.env.APP_URL}/orders`,
      growthTips: `${process.env.APP_URL}/growth`,
      scalingTip: `${process.env.APP_URL}/scale`,
      reviewUrl: `${process.env.APP_URL}/review`,
      updateUrl: `${process.env.APP_URL}/settings/billing`,
      ...Object.entries(triggerData || {}).reduce((acc, [key, value]) => {
        acc[key] = String(value);
        return acc;
      }, {} as Record<string, string>),
    };

    if (processed.message) {
      processed.message = this.replaceTemplateVars(processed.message, templateVars);
    }

    if (processed.title) {
      processed.title = this.replaceTemplateVars(processed.title, templateVars);
    }

    return processed;
  }

  /**
   * Replace template variables in a string
   */
  private replaceTemplateVars(template: string, vars: Record<string, string>): string {
    return template.replace(/\{\{(\w+)\}\}/g, (match, key) => {
      return vars[key] !== undefined ? vars[key] : match;
    });
  }

  /**
   * Check if action is critical (failure should stop playbook)
   */
  private isCriticalAction(action: PlaybookAction): boolean {
    // Actions that are critical and should stop playbook on failure
    return action.priority === 'urgent' || action.type === 'task';
  }

  /**
   * Check rate limiting for playbook execution
   */
  private async checkRateLimit(playbookId: string, storeId: string): Promise<boolean> {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    // Count executions today
    const executionsToday = await prisma.playbookExecution.count({
      where: {
        playbookId,
        storeId,
        startedAt: { gte: today },
      },
    });

    return executionsToday < PLAYBOOK_CONFIG.MAX_EXECUTIONS_PER_PLAYBOOK_PER_DAY;
  }

  /**
   * Log playbook execution to database
   */
  private async logExecution(execution: PlaybookExecution): Promise<void> {
    try {
      await prisma.playbookExecution.create({
        data: {
          id: execution.id,
          playbookId: execution.playbookId,
          storeId: execution.storeId,
          status: execution.status,
          startedAt: execution.startedAt,
          completedAt: execution.completedAt,
          actionsExecuted: execution.actionsExecuted,
          error: execution.error,
        },
      });
    } catch (error) {
      logger.error('Failed to log playbook execution', {
        executionId: execution.id,
        error: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `exec_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Sleep for specified milliseconds
   */
  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  /**
   * Get execution history for a store
   */
  async getExecutionHistory(storeId: string, limit: number = 50): Promise<PlaybookExecution[]> {
    const records = await prisma.playbookExecution.findMany({
      where: { storeId },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });

    return records.map(r => ({
      id: r.id,
      playbookId: r.playbookId,
      storeId: r.storeId,
      status: r.status as PlaybookExecution['status'],
      startedAt: r.startedAt,
      completedAt: r.completedAt ?? undefined,
      actionsExecuted: r.actionsExecuted as PlaybookActionExecution[],
      error: r.error ?? undefined,
    }));
  }

  /**
   * Get playbook statistics
   */
  async getPlaybookStats(playbookId: string): Promise<{
    totalExecutions: number;
    successfulExecutions: number;
    failedExecutions: number;
    averageActionsCompleted: number;
  }> {
    const executions = await prisma.playbookExecution.findMany({
      where: { playbookId },
    });

    const successful = executions.filter(e => e.status === 'completed').length;
    const failed = executions.filter(e => e.status === 'failed').length;

    const totalActions = executions.reduce((sum, e) => {
      const actions = e.actionsExecuted as PlaybookActionExecution[];
      return sum + actions.filter(a => a.status === 'completed').length;
    }, 0);

    return {
      totalExecutions: executions.length,
      successfulExecutions: successful,
      failedExecutions: failed,
      averageActionsCompleted: executions.length > 0 ? totalActions / executions.length : 0,
    };
  }
}

// Export singleton instance
export const playbookExecutor = new PlaybookExecutor();
