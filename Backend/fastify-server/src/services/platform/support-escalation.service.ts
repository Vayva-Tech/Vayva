import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class SupportEscalationService {
  constructor(private readonly db = prisma) {}

  async triggerHandoff(params: {
    storeId: string;
    trigger: string;
    conversationId?: string;
    reason?: string;
    aiSummary: string;
  }) {
    try {
      // Create support ticket
      const ticket = await this.db.supportTicket.create({
        data: {
          storeId: params.storeId,
          type: this.mapTriggerToType(params.trigger),
          category: this.mapTriggerToCategory(params.trigger),
          status: 'OPEN',
          priority: this.mapTriggerToPriority(params.trigger),
          subject: `AI Escalation: ${params.trigger} - ${(params.reason || '').substring(0, 30)}...`,
          summary: params.aiSummary,
          lastMessageAt: new Date(),
        },
      });

      // Create audit event
      await this.db.handoffEvent.create({
        data: {
          storeId: params.storeId,
          conversationId: params.conversationId,
          ticketId: ticket.id,
          triggerType: params.trigger,
          aiSummary: params.aiSummary,
        },
      });

      logger.info('[SupportEscalation] Handoff triggered', {
        ticketId: ticket.id,
        ...params,
      });

      return ticket;
    } catch (error) {
      logger.error('[SupportEscalation] Failed to trigger handoff', error);
      throw error;
    }
  }

  private mapTriggerToPriority(trigger: string): 'URGENT' | 'HIGH' | 'MEDIUM' | 'LOW' {
    switch (trigger) {
      case 'PAYMENT_DISPUTE':
      case 'FRAUD_RISK':
        return 'URGENT';
      case 'BILLING_ERROR':
      case 'SENTIMENT':
        return 'HIGH';
      default:
        return 'MEDIUM';
    }
  }

  private mapTriggerToCategory(trigger: string): string {
    switch (trigger) {
      case 'PAYMENT_DISPUTE':
        return 'PAYMENT';
      case 'FRAUD_RISK':
        return 'FRAUD';
      case 'BILLING_ERROR':
        return 'BILLING';
      case 'SENTIMENT':
        return 'OTHER';
      default:
        return 'GENERAL';
    }
  }

  private mapTriggerToType(trigger: string): string {
    switch (trigger) {
      case 'BILLING_ERROR':
      case 'PAYMENT_DISPUTE':
        return 'BILLING';
      default:
        return 'GENERAL';
    }
  }

  async getTickets(storeId: string, limit: number = 50) {
    return await this.db.supportTicket.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: limit,
    });
  }

  async updateTicketStatus(ticketId: string, status: string) {
    return await this.db.supportTicket.update({
      where: { id: ticketId },
      data: { status },
    });
  }
}
