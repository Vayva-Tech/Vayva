import { prisma } from "@vayva/db";
import { logger } from "../logger";

type EscalationTrigger = "PAYMENT_DISPUTE" | "FRAUD_RISK" | "BILLING_ERROR" | "SENTIMENT" | string;

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
            const ticket = await prisma.supportTicket?.create({
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
            await prisma.handoffEvent?.create({
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
        }
        catch (error: unknown) {
            logger.error("[EscalationService] Failed to trigger handoff", error);
            throw error; // Rethrow so the bot knows it failed
        }
    }

    static mapTriggerToPriority(trigger: EscalationTrigger): "low" | "medium" | "high" | "urgent" {
        switch (trigger) {
            case "PAYMENT_DISPUTE":
                return "urgent";
            case "FRAUD_RISK":
                return "urgent";
            case "BILLING_ERROR":
                return "high";
            case "SENTIMENT":
                return "high";
            default:
                return "medium";
        }
    }

    static mapTriggerToCategory(trigger: EscalationTrigger): "DELIVERY" | "PAYMENT" | "PRODUCT" | "REFUND" | "FRAUD" | "OTHER" {
        switch (trigger) {
            case "PAYMENT_DISPUTE":
                return "PAYMENT";
            case "FRAUD_RISK":
                return "FRAUD";
            case "BILLING_ERROR":
                return "PAYMENT";
            case "SENTIMENT":
                return "OTHER";
            default:
                return "OTHER";
        }
    }

    static mapTriggerToType(trigger: EscalationTrigger) {
        switch (trigger) {
            case "BILLING_ERROR":
                return "BILLING";
            case "PAYMENT_DISPUTE":
                return "BILLING";
            default:
                return "GENERAL";
        }
    }
}
