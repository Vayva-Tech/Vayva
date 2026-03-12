import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

export class EscalationService {
    /**
     * Trigger a handoff from AI to Human Support
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async triggerHandoff(params: Record<string, any>) {
        try {
            // 1. Create Support Ticket
            const ticket = await prisma.supportTicket?.create({
                data: {
                    storeId: params.storeId,
                    type: this.mapTriggerToType(params.trigger),
                    category: this.mapTriggerToCategory(params.trigger) as any,
                    status: status as any,
                    priority: this.mapTriggerToPriority(params.trigger) as any,
                    subject: `AI Escalation: ${params.trigger} - ${(params.reason || "").substring(0, 30)}...`,
                    summary: params.aiSummary,
                    lastMessageAt: new Date(),
                },
            });

            // 2. Create Audit Event
            await prisma.handoffEvent?.create({
                data: {
                    storeId: params.storeId,
                    conversationId: params.conversationId,
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
        catch (error) {
            logger.error("[EscalationService] Failed to trigger handoff", error);
            throw error; // Rethrow so the bot knows it failed
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static mapTriggerToPriority(trigger: unknown) {
        switch (trigger) {
            case "PAYMENT_DISPUTE":
                return "URGENT";
            case "FRAUD_RISK":
                return "URGENT";
            case "BILLING_ERROR":
                return "HIGH";
            case "SENTIMENT":
                return "HIGH";
            default:
                return "MEDIUM";
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static mapTriggerToCategory(trigger: unknown) {
        switch (trigger) {
            case "PAYMENT_DISPUTE":
                return "PAYMENT";
            case "FRAUD_RISK":
                return "FRAUD";
            case "BILLING_ERROR":
                return "BILLING";
            case "SENTIMENT":
                return "OTHER";
            default:
                return "GENERAL";
        }
    }

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static mapTriggerToType(trigger: unknown) {
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
