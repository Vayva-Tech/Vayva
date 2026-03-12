import { prisma } from "@vayva/db";
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
            await prisma.persuasionAttempt.create({
                data: {
                    storeId: data.storeId as string,
                    conversationId: (data.conversationId as string) || "",
                    strategy: data.strategy as string,
                    evidenceIds: data.evidenceIds as string[] | undefined,
                    confidenceScore: data.confidence as number,
                },
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
            await prisma.conversionEvent.create({
                data: {
                    storeId: data.storeId as string,
                    conversationId: data.conversationId as string | null | undefined,
                    eventType: data.eventType as string,
                    valueKobo: (data.valueKobo as number | bigint | undefined) || BigInt(0),
                    aiAttributionScore: 1.0, // Simple for now
                },
            });
        }
        catch (error) {
            logger.error("[ConversionService] Failed to record conversion", error);
        }
    }
}
