/**
 * NPS (Net Promoter Score) System
 * Handles NPS survey sending, response collection, and follow-up actions
 */

import { prisma } from '../lib/prisma';
import { NpsSurvey, NpsMetrics, NpsCategory, categorizeNps, NpsSurveyJobData, NpsResponseJobData } from '../lib/types';
import { NPS_CONFIG } from '../lib/constants';
import { logger } from '@vayva/shared';
import { subDays, differenceInDays } from 'date-fns';

export class NpsSystem {
  private whatsappSender: ((phone: string, message: string) => Promise<void>) | null = null;

  /**
   * Set WhatsApp sender function
   */
  setWhatsAppSender(sender: (phone: string, message: string) => Promise<void>): void {
    this.whatsappSender = sender;
  }

  /**
   * Send NPS survey to a merchant
   */
  async sendSurvey(data: NpsSurveyJobData): Promise<NpsSurvey | null> {
    const { storeId, surveyType } = data;

    // Get store with owner
    const store = await prisma.store.findUnique({
      where: { id: storeId },
      include: { owner: true },
    });

    if (!store || !store.owner?.phone) {
      logger.warn(`Cannot send NPS survey: store or phone not found`, { storeId });
      return null;
    }

    // Check if we should send survey (not too frequently)
    const shouldSend = await this.shouldSendSurvey(storeId);
    if (!shouldSend) {
      logger.info(`Skipping NPS survey: too soon since last survey`, { storeId });
      return null;
    }

    // Check for active survey
    const activeSurvey = await this.getActiveSurvey(storeId);
    if (activeSurvey) {
      logger.info(`Skipping NPS survey: active survey exists`, { storeId, surveyId: activeSurvey.id });
      return null;
    }

    // Create survey record
    const survey: NpsSurvey = {
      id: this.generateId(),
      storeId,
      status: 'sent',
      sentAt: new Date(),
    };

    // Save to database
    await prisma.npsSurvey.create({
      data: {
        id: survey.id,
        storeId,
        status: 'sent',
        sentAt: survey.sentAt,
        surveyType,
      },
    });

    // Send WhatsApp message
    if (this.whatsappSender) {
      const message = this.buildSurveyMessage(store.owner.firstName || 'there');
      await this.whatsappSender(store.owner.phone, message);

      logger.info(`NPS survey sent`, { storeId, surveyId: survey.id });
    } else {
      logger.warn(`WhatsApp sender not configured, survey not sent`, { storeId });
    }

    return survey;
  }

  /**
   * Process incoming NPS response
   */
  async processResponse(data: NpsResponseJobData): Promise<NpsSurvey | null> {
    const { storeId, phone, message, receivedAt } = data;

    // Find active survey for this store
    const activeSurvey = await this.getActiveSurvey(storeId);
    if (!activeSurvey) {
      logger.warn(`No active NPS survey found for response`, { storeId, phone });
      return null;
    }

    // Parse score from message
    const score = this.parseScore(message);
    if (score === null) {
      logger.warn(`Could not parse NPS score from message`, { storeId, message });
      return null;
    }

    // Validate score range
    if (score < 0 || score > 10) {
      logger.warn(`Invalid NPS score received`, { storeId, score });
      return null;
    }

    // Update survey with response
    const updatedSurvey: NpsSurvey = {
      ...activeSurvey,
      status: 'responded',
      respondedAt: receivedAt,
      score,
      feedback: message,
    };

    await prisma.npsSurvey.update({
      where: { id: activeSurvey.id },
      data: {
        status: 'responded',
        respondedAt,
        score,
        feedback: message,
      },
    });

    // Trigger follow-up playbook based on score
    await this.triggerFollowUp(storeId, score);

    logger.info(`NPS response recorded`, { storeId, surveyId: activeSurvey.id, score });

    return updatedSurvey;
  }

  /**
   * Check if we should send a survey to this store
   */
  private async shouldSendSurvey(storeId: string): Promise<boolean> {
    const lastSurvey = await prisma.npsSurvey.findFirst({
      where: { storeId },
      orderBy: { sentAt: 'desc' },
    });

    if (!lastSurvey) {
      return true; // Never surveyed before
    }

    const daysSinceLastSurvey = differenceInDays(new Date(), lastSurvey.sentAt);
    return daysSinceLastSurvey >= NPS_CONFIG.MIN_DAYS_BETWEEN_SURVEYS;
  }

  /**
   * Get active (non-expired, non-responded) survey for a store
   */
  private async getActiveSurvey(storeId: string): Promise<NpsSurvey | null> {
    const expiryDate = subDays(new Date(), NPS_CONFIG.SURVEY_EXPIRY_DAYS);

    const survey = await prisma.npsSurvey.findFirst({
      where: {
        storeId,
        status: 'sent',
        sentAt: { gte: expiryDate },
      },
      orderBy: { sentAt: 'desc' },
    });

    if (!survey) return null;

    return {
      id: survey.id,
      storeId: survey.storeId,
      status: survey.status as NpsSurvey['status'],
      sentAt: survey.sentAt,
      respondedAt: survey.respondedAt ?? undefined,
      score: survey.score ?? undefined,
      feedback: survey.feedback ?? undefined,
    };
  }

  /**
   * Parse NPS score from message text
   */
  private parseScore(message: string): number | null {
    // Look for a number 0-10 in the message
    const match = message.match(/\b(10|[0-9])\b/);
    if (match) {
      return parseInt(match[1], 10);
    }
    return null;
  }

  /**
   * Build NPS survey WhatsApp message
   */
  private buildSurveyMessage(firstName: string): string {
    return `Hi ${firstName}! 👋

Quick question: How likely are you to recommend Vayva to a friend or colleague?

Reply with a number from 0 to 10:

0 = Not likely at all 😞
5 = Neutral 😐
10 = Very likely! 🎉

Your feedback helps us improve. Thanks! 🙏`;
  }

  /**
   * Trigger follow-up actions based on NPS score
   */
  private async triggerFollowUp(storeId: string, score: number): Promise<void> {
    const category = categorizeNps(score);

    // Queue appropriate playbook based on category
    const { Queue } = await import('bullmq');
    const { getRedis } = await import('@vayva/redis');
    const connection = await getRedis();

    const queue = new Queue('cs.playbook.execution', { connection });

    switch (category) {
      case 'detractor':
        await queue.add('nps_detractor', {
          playbookId: 'nps_detractor',
          storeId,
          triggerData: { score, category },
        });
        break;

      case 'passive':
        // Could add a passive follow-up playbook
        logger.info(`NPS passive recorded`, { storeId, score });
        break;

      case 'promoter':
        await queue.add('nps_promoter', {
          playbookId: 'nps_promoter',
          storeId,
          triggerData: { score, category },
        });
        break;
    }

    await queue.close();
  }

  /**
   * Get NPS metrics for a store or globally
   */
  async getMetrics(storeId?: string): Promise<NpsMetrics> {
    const where = storeId ? { storeId } : {};

    const surveys = await prisma.npsSurvey.findMany({
      where: {
        ...where,
        status: 'responded',
      },
    });

    const totalSent = await prisma.npsSurvey.count({
      where: { ...where, status: { in: ['sent', 'responded'] } },
    });

    const totalResponded = surveys.length;

    if (totalResponded === 0) {
      return {
        totalSent,
        totalResponded: 0,
        responseRate: 0,
        averageScore: 0,
        npsScore: 0,
        promoters: 0,
        passives: 0,
        detractors: 0,
      };
    }

    const scores = surveys.map(s => s.score!).filter((s): s is number => s !== null);
    const promoters = scores.filter(s => s >= 9).length;
    const passives = scores.filter(s => s >= 7 && s <= 8).length;
    const detractors = scores.filter(s => s <= 6).length;

    const averageScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    const npsScore = Math.round(((promoters - detractors) / scores.length) * 100);

    return {
      totalSent,
      totalResponded,
      responseRate: totalSent > 0 ? (totalResponded / totalSent) * 100 : 0,
      averageScore: Math.round(averageScore * 10) / 10,
      npsScore,
      promoters,
      passives,
      detractors,
    };
  }

  /**
   * Schedule NPS surveys for all eligible merchants
   */
  async scheduleSurveysForAll(): Promise<{ scheduled: number; skipped: number }> {
    const stores = await prisma.store.findMany({
      where: { deletedAt: null },
      include: { owner: true },
    });

    let scheduled = 0;
    let skipped = 0;

    const { Queue } = await import('bullmq');
    const { getRedis } = await import('@vayva/redis');
    const connection = await getRedis();

    const queue = new Queue('cs.nps.survey', { connection });

    for (const store of stores) {
      const shouldSend = await this.shouldSendSurvey(store.id);
      if (shouldSend && store.owner?.phone) {
        await queue.add(`nps_${store.id}`, {
          storeId: store.id,
          surveyType: 'scheduled',
        }, {
          delay: Math.random() * 1000 * 60 * 60 * 24, // Spread over 24 hours
        });
        scheduled++;
      } else {
        skipped++;
      }
    }

    await queue.close();

    logger.info(`NPS surveys scheduled`, { scheduled, skipped });

    return { scheduled, skipped };
  }

  /**
   * Get survey history for a store
   */
  async getSurveyHistory(storeId: string): Promise<NpsSurvey[]> {
    const surveys = await prisma.npsSurvey.findMany({
      where: { storeId },
      orderBy: { sentAt: 'desc' },
    });

    return surveys.map(s => ({
      id: s.id,
      storeId: s.storeId,
      status: s.status as NpsSurvey['status'],
      sentAt: s.sentAt,
      respondedAt: s.respondedAt ?? undefined,
      score: s.score ?? undefined,
      feedback: s.feedback ?? undefined,
      followUpAction: s.followUpAction ?? undefined,
    }));
  }

  /**
   * Expire old surveys
   */
  async expireOldSurveys(): Promise<number> {
    const expiryDate = subDays(new Date(), NPS_CONFIG.SURVEY_EXPIRY_DAYS);

    const result = await prisma.npsSurvey.updateMany({
      where: {
        status: 'sent',
        sentAt: { lt: expiryDate },
      },
      data: {
        status: 'expired',
      },
    });

    logger.info(`Expired old NPS surveys`, { count: result.count });

    return result.count;
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `nps_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

// Export singleton instance
export const npsSystem = new NpsSystem();
