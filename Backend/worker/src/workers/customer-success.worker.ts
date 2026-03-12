/**
 * Customer Success Worker
 * Handles health score calculations, playbook executions, and NPS surveys
 */

import { Worker, Queue } from 'bullmq';
import { logger, QUEUES } from '@vayva/shared';
import type { RedisConnection } from '../types';
import {
  healthScoreCalculator,
  playbookExecutor,
  npsSystem,
  CS_QUEUES,
  HealthScoreJobData,
  PlaybookJobData,
  NpsSurveyJobData,
  NpsResponseJobData,
} from '@vayva/customer-success';

// WhatsApp sender using Evolution API
async function sendWhatsAppMessage(phone: string, message: string): Promise<void> {
  const EVOLUTION_API_URL = process.env.EVOLUTION_API_URL;
  const EVOLUTION_API_KEY = process.env.EVOLUTION_API_KEY;
  const INSTANCE_NAME = process.env.EVOLUTION_INSTANCE_NAME || 'vayva-official';

  if (!EVOLUTION_API_URL || !EVOLUTION_API_KEY) {
    logger.warn('Evolution API not configured, skipping WhatsApp send', {
      app: 'worker',
      phone,
    });
    return;
  }

  try {
    const cleanPhone = String(phone).replace(/\D/g, '');
    const res = await fetch(
      `${EVOLUTION_API_URL}/message/sendText/${INSTANCE_NAME}`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          apikey: EVOLUTION_API_KEY,
        },
        body: JSON.stringify({
          number: cleanPhone,
          options: { delay: 1200, presence: 'composing' },
          text: message,
        }),
      }
    );

    if (!res.ok) {
      const errorText = await res.text();
      throw new Error(`Failed to send WhatsApp: ${res.status} - ${errorText}`);
    }

    logger.info('WhatsApp message sent', { app: 'worker', phone });
  } catch (error) {
    logger.error('Failed to send WhatsApp message', {
      app: 'worker',
      error: error instanceof Error ? error.message : String(error),
      phone,
    });
    throw error;
  }
}

// Email sender (placeholder - integrate with your email service)
async function sendEmail(email: string, template: string, data: unknown): Promise<void> {
  logger.info('Email would be sent', {
    app: 'worker',
    email,
    template,
    data,
  });
  // TODO: Integrate with your email service (Resend, SendGrid, etc.)
}

// Slack notifier (placeholder - integrate with your Slack)
async function sendSlackNotification(channel: string, message: string): Promise<void> {
  const SLACK_WEBHOOK_URL = process.env.SLACK_WEBHOOK_URL;

  if (!SLACK_WEBHOOK_URL) {
    logger.warn('Slack not configured, logging to console', {
      app: 'worker',
      channel,
      message,
    });
    return;
  }

  try {
    await fetch(SLACK_WEBHOOK_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ channel, text: message }),
    });

    logger.info('Slack notification sent', { app: 'worker', channel });
  } catch (error) {
    logger.error('Failed to send Slack notification', {
      app: 'worker',
      error: error instanceof Error ? error.message : String(error),
    });
    throw error;
  }
}

// Task creator for CSM tasks
async function createCsTask(
  assignee: string,
  title: string,
  priority: string,
  storeId: string
): Promise<void> {
  const { prisma } = await import('@vayva/db');

  try {
    await prisma.customerSuccessTask.create({
      data: {
        storeId,
        title,
        priority: priority as 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT',
        status: 'OPEN',
        source: 'playbook',
      },
    });

    logger.info('CS task created', {
      app: 'worker',
      storeId,
      title,
      assignee,
    });
  } catch (error) {
    logger.error('Failed to create CS task', {
      app: 'worker',
      error: error instanceof Error ? error.message : String(error),
      storeId,
    });
    throw error;
  }
}

// Configure playbook executor with action handlers
playbookExecutor.setWhatsAppSender(sendWhatsAppMessage);
playbookExecutor.setEmailSender(sendEmail);
playbookExecutor.setSlackNotifier(sendSlackNotification);
playbookExecutor.setTaskCreator(createCsTask);

// Configure NPS system
npsSystem.setWhatsAppSender(sendWhatsAppMessage);

/**
 * Register health score calculation worker
 */
function registerHealthScoreWorker(connection: RedisConnection): void {
  new Worker(
    CS_QUEUES.HEALTH_SCORE_CALCULATION,
    async (job) => {
      const data = job.data as HealthScoreJobData;
      logger.info('Calculating health score', {
        app: 'worker',
        storeId: data.storeId,
        jobId: job.id,
      });

      const result = await healthScoreCalculator.calculate(data.storeId);

      logger.info('Health score calculated', {
        app: 'worker',
        storeId: data.storeId,
        score: result.score,
        trend: result.trend,
      });

      // Trigger playbooks based on health score
      const queue = new Queue(CS_QUEUES.PLAYBOOK_EXECUTION, { connection });

      if (result.score < 40) {
        await queue.add('health_critical', {
          playbookId: 'health_score_critical',
          storeId: data.storeId,
          triggerData: { score: result.score },
        });
      } else if (result.score < 60) {
        await queue.add('health_at_risk', {
          playbookId: 'health_score_at_risk',
          storeId: data.storeId,
          triggerData: { score: result.score },
        });
      }

      // Check for significant decline
      if (result.previousScore && result.previousScore - result.score > 15) {
        await queue.add('health_declining', {
          playbookId: 'health_score_declining',
          storeId: data.storeId,
          triggerData: {
            previousScore: result.previousScore,
            currentScore: result.score,
            decline: result.previousScore - result.score,
          },
        });
      }

      await queue.close();

      return result;
    },
    {
      connection,
      concurrency: 5,
      limiter: {
        max: 100,
        duration: 60000, // 100 jobs per minute
      },
    }
  );

  logger.info('Health score worker registered', { app: 'worker' });
}

/**
 * Register playbook execution worker
 */
function registerPlaybookWorker(connection: RedisConnection): void {
  new Worker(
    CS_QUEUES.PLAYBOOK_EXECUTION,
    async (job) => {
      const data = job.data as PlaybookJobData;
      logger.info('Executing playbook', {
        app: 'worker',
        playbookId: data.playbookId,
        storeId: data.storeId,
        jobId: job.id,
      });

      const result = await playbookExecutor.execute(data);

      logger.info('Playbook executed', {
        app: 'worker',
        playbookId: data.playbookId,
        storeId: data.storeId,
        status: result.status,
        actionsCompleted: result.actionsExecuted.filter(
          (a) => a.status === 'completed'
        ).length,
      });

      return result;
    },
    {
      connection,
      concurrency: 10,
    }
  );

  logger.info('Playbook worker registered', { app: 'worker' });
}

/**
 * Register NPS survey worker
 */
function registerNpsSurveyWorker(connection: RedisConnection): void {
  new Worker(
    CS_QUEUES.NPS_SURVEY,
    async (job) => {
      const data = job.data as NpsSurveyJobData;
      logger.info('Sending NPS survey', {
        app: 'worker',
        storeId: data.storeId,
        jobId: job.id,
      });

      const result = await npsSystem.sendSurvey(data);

      if (result) {
        logger.info('NPS survey sent', {
          app: 'worker',
          storeId: data.storeId,
          surveyId: result.id,
        });
      } else {
        logger.info('NPS survey skipped', {
          app: 'worker',
          storeId: data.storeId,
        });
      }

      return result;
    },
    {
      connection,
      concurrency: 5,
    }
  );

  logger.info('NPS survey worker registered', { app: 'worker' });
}

/**
 * Register NPS response processor worker
 */
function registerNpsResponseWorker(connection: RedisConnection): void {
  new Worker(
    CS_QUEUES.NPS_RESPONSE_PROCESSOR,
    async (job) => {
      const data = job.data as NpsResponseJobData;
      logger.info('Processing NPS response', {
        app: 'worker',
        storeId: data.storeId,
        jobId: job.id,
      });

      const result = await npsSystem.processResponse(data);

      if (result) {
        logger.info('NPS response processed', {
          app: 'worker',
          storeId: data.storeId,
          surveyId: result.id,
          score: result.score,
        });
      } else {
        logger.warn('NPS response not processed', {
          app: 'worker',
          storeId: data.storeId,
        });
      }

      return result;
    },
    {
      connection,
      concurrency: 10,
    }
  );

  logger.info('NPS response worker registered', { app: 'worker' });
}

/**
 * Schedule recurring jobs for customer success
 */
async function scheduleRecurringJobs(connection: RedisConnection): Promise<void> {
  const healthScoreQueue = new Queue(CS_QUEUES.HEALTH_SCORE_CALCULATION, {
    connection,
  });
  const npsQueue = new Queue(CS_QUEUES.NPS_SURVEY, { connection });

  // Schedule daily health score calculations at 2 AM
  await healthScoreQueue.add(
    'daily-calculation',
    { storeId: 'ALL' },
    {
      repeat: { pattern: '0 2 * * *' },
      jobId: 'health-score-daily',
    }
  );

  // Schedule NPS survey batch every 90 days
  await npsQueue.add(
    'quarterly-surveys',
    { storeId: 'ALL', surveyType: 'scheduled' },
    {
      repeat: { pattern: '0 10 1 */3 *' }, // 10 AM on 1st of every 3rd month
      jobId: 'nps-quarterly',
    }
  );

  await healthScoreQueue.close();
  await npsQueue.close();

  logger.info('Customer success recurring jobs scheduled', { app: 'worker' });
}

/**
 * Register all customer success workers
 */
export function registerCustomerSuccessWorkers(connection: RedisConnection): void {
  registerHealthScoreWorker(connection);
  registerPlaybookWorker(connection);
  registerNpsSurveyWorker(connection);
  registerNpsResponseWorker(connection);

  // Schedule recurring jobs
  scheduleRecurringJobs(connection).catch((error) => {
    logger.error('Failed to schedule recurring CS jobs', {
      app: 'worker',
      error: error instanceof Error ? error.message : String(error),
    });
  });

  logger.info('All customer success workers registered', { app: 'worker' });
}
