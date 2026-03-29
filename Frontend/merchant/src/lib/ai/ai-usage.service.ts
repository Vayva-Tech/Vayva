import { api } from '@/lib/api-client';
import { logger } from "@/lib/logger";
/**
 * AI Usage & Metering Service (V3 - Message Centric & Addon Aware)
 */
export class AiUsageService {
    /**
     * Record an AI message interaction
     */
    static async logUsage(params: { storeId: string; model: string; inputTokens: number; outputTokens: number; channel?: string; requestId?: string }) {
        const { storeId, model, inputTokens, outputTokens, channel = "WHATSAPP", requestId } = params;
        try {
            await api.post('/ai/usage/log', {
                storeId,
                channel,
                model,
                inputTokens,
                outputTokens,
                requestId,
                costEstimateKobo: Math.floor((inputTokens + outputTokens) * 0.005),
            });
        }
        catch (error) {
            logger.error("[AiUsageService] Log failure", error, { storeId });
        }
    }
    /**
     * Check if a merchant is within their message limits (including add-ons)
     */
    static async checkLimits(storeId: string) {
        const response = await api.get(`/ai/usage/${storeId}/check-limits`);
        return response.data || { allowed: false, reason: 'Error checking limits', usage: {} };
    }
    /**
     * Get usage statistics for the last N days
     */
    static async getUsageStats(storeId: string, days = 14) {
        const response = await api.get(`/ai/usage/${storeId}/stats`, { days });
        return response.data || [];
    }
}
