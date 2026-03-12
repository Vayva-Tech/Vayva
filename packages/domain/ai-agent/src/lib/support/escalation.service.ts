import { prisma, SupportTicketCategory, SupportTicketPriority, SupportTicketType } from "@vayva/db";
import { logger } from "../logger";

type EscalationTrigger =
  | "PAYMENT_DISPUTE"
  | "FRAUD_RISK"
  | "BILLING_ERROR"
  | "SENTIMENT"
  | string;

type HandoffParams = {
  storeId: string;
  conversationId?: string;
  trigger: EscalationTrigger;
  reason?: string;
  aiSummary?: string;
  [key: string]: unknown;
};

export class EscalationService {
  /**
   * Trigger a handoff from AI to Human Support
   */
  static async triggerHandoff(params: HandoffParams) {
    try {
      // 1. Create Support Ticket
      const ticket = await prisma.supportTicket.create({
        data: {
          storeId: params.storeId,
          type: this.mapTriggerToType(params.trigger),
          category: this.mapTriggerToCategory(params.trigger),
          status: "open",
          priority: this.mapTriggerToPriority(params.trigger),
          subject: `AI Escalation: ${params.trigger} - ${(params.reason || "").substring(0, 30)}...`,
          summary: params.aiSummary,
          lastMessageAt: new Date(),
        },
      });

      // 2. Create Audit Event
      await prisma.handoffEvent.create({
        data: {
          storeId: params.storeId,
          conversationId: params.conversationId || "unknown_conversation",
          ticketId: ticket.id,
          triggerType: params.trigger, // Mapped to triggerType
          aiSummary: params.aiSummary,
          // reason/metadata omitted if not in schema
        },
      });

      logger.info("[EscalationService] Handoff triggered", {
        ticketId: ticket.id,
        ...params,
      });

      return ticket;
    } catch (error: unknown) {
      logger.error("[EscalationService] Failed to trigger handoff", error);
      throw error; // Rethrow so the bot knows it failed
    }
  }

  static mapTriggerToPriority(trigger: EscalationTrigger): SupportTicketPriority {
    switch (trigger) {
      case "PAYMENT_DISPUTE":
        return "urgent" as SupportTicketPriority;
      case "FRAUD_RISK":
        return "urgent" as SupportTicketPriority;
      case "BILLING_ERROR":
        return "high" as SupportTicketPriority;
      case "SENTIMENT":
        return "high" as SupportTicketPriority;
      default:
        return "medium" as SupportTicketPriority;
    }
  }

  static mapTriggerToCategory(trigger: EscalationTrigger): SupportTicketCategory {
    switch (trigger) {
      case "PAYMENT_DISPUTE":
        return "PAYMENT" as SupportTicketCategory;
      case "FRAUD_RISK":
        return "FRAUD" as SupportTicketCategory;
      case "BILLING_ERROR":
        return "BILLING" as SupportTicketCategory;
      case "SENTIMENT":
        return "OTHER" as SupportTicketCategory;
      default:
        return "GENERAL" as SupportTicketCategory;
    }
  }

  static mapTriggerToType(trigger: EscalationTrigger): SupportTicketType {
    switch (trigger) {
      case "BILLING_ERROR":
        return "BILLING" as SupportTicketType;
      case "PAYMENT_DISPUTE":
        return "BILLING" as SupportTicketType;
      default:
        return "GENERAL" as SupportTicketType;
    }
  }
}
