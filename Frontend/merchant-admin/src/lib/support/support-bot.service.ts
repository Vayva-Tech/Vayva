import { MerchantSupportBot } from "@/lib/support/merchant-support-bot.service";
/**
 * Orchestrator for the entire Support Bot Flow
 * - Fetches Context
 * - Calls Bot Logic (RAG + Intent)
 * - DECIDES Escalate vs Reply
 */
export class SupportBotService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async processMessage(storeId: string, message: any, history = []) {
        // 1. Delegate to the Core Bot Logic (which already handles context fetching)
        const response = await MerchantSupportBot.handleQuery(storeId, message, history);
        // Note: The MerchantSupportBot.handleQuery already:
        // - Fetches context
        // - Checks for escalation keywords via shouldEscalate
        // - Calls EscalationService.triggerHandoff if needed
        return {
            reply: response.message,
            actions: response.suggestedActions || [],
            // You could enhance this to return 'ESCALATED' status if needed
            status: response.message?.includes("escalating")
                ? "ESCALATED"
                : "CONTINUE",
        };
    }
}
