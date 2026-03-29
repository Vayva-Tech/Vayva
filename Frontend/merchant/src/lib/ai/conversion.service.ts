import { api } from '@/lib/api-client';
import { logger } from "@/lib/logger";
export class ConversionService {
    /**
     * Detect objections in buyer text
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static classifyObjection(text: string) {
        const lower = text.toLowerCase();
        if (lower.includes("expensive") ||
            lower.includes("price") ||
            lower.includes("cost"))
            return "PRICE";
        if (lower.includes("delivery") ||
            lower.includes("shipping") ||
            lower.includes("how long"))
            return "DELIVERY";
        if (lower.includes("real") ||
            lower.includes("fake") ||
            lower.includes("trust"))
            return "TRUST";
        return null;
    }
    /**
     * Decision engine to choose if/how to persuade
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async decidePersuasion(params: Record<string, any>) {
        // 1. Safety Override: Negative sentiment kills persuasion
        if (params.sentiment < -0.3)
            return "NONE";
        // 2. Intent-based logic
        if (params.intent === "COMPLAINING")
            return "NONE"; // Should escalate instead
        if (params.intent === "EXIT")
            return "NONE";
        // 3. Confidence Gate
        if (params.confidence < 0.7)
            return "NONE";
        // 4. Intensity Mapping
        if (params.intensity === 0)
            return "NONE"; // Clarification only mode
        if (params.intent === "BROWSING")
            return "BENEFIT_FRAME";
        if (params.intent === "NEGOTIating")
            return "RISK_REDUCTION"; // Highlight return policy
        return "BENEFIT_FRAME";
    }
    /**
     * Log a persuasion attempt
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async logPersuasion(data: Record<string, unknown>) {
        try {
            await api.post('/ai/conversions/log-persuasion', {
                storeId: data.storeId,
                conversationId: data.conversationId || "",
                strategy: data.strategy,
                evidenceIds: data.evidenceIds,
                confidenceScore: data.confidence,
            });
        }
        catch (error) {
            logger.error("[ConversionService] Failed to log persuasion", error);
        }
    }
    /**
     * Record a conversion event (e.g. checkout started)
     */
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async recordConversion(data: Record<string, unknown>) {
        try {
            await api.post('/ai/conversions/record', {
                storeId: data.storeId,
                conversationId: data.conversationId,
                eventType: data.eventType,
                valueKobo: data.valueKobo || 0,
                aiAttributionScore: 1.0,
            });
        }
        catch (error) {
            logger.error("[ConversionService] Failed to record conversion", error);
        }
    }
}
