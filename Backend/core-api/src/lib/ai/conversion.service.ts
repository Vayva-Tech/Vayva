import { prisma } from "@vayva/db";
import { logger } from "@/lib/logger";

interface PersuasionParams {
  sentiment: number;
  confidence: number;
  intensity: number;
  intent: string;
}

interface PersuasionData {
  storeId: string;
  conversationId: string;
  strategy: string;
  evidenceIds?: string[];
  confidence: number;
}

interface ConversionData {
  storeId: string;
  conversationId?: string | null;
  eventType: string;
  valueKobo?: number | bigint;
}

export class ConversionService {
  /**
   * Detect objections in buyer text
   */
  static classifyObjection(text: string) {
    const lower = text.toLowerCase();
    if (
      lower.includes("expensive") ||
      lower.includes("price") ||
      lower.includes("cost")
    )
      return "PRICE";
    if (
      lower.includes("delivery") ||
      lower.includes("shipping") ||
      lower.includes("how long")
    )
      return "DELIVERY";
    if (
      lower.includes("real") ||
      lower.includes("fake") ||
      lower.includes("trust")
    )
      return "TRUST";
    return null;
  }
  /**
   * Decision engine to choose if/how to persuade
   */
  static async decidePersuasion(params: PersuasionParams) {
    // 1. Safety Override: Negative sentiment kills persuasion
    if (params.sentiment < -0.3) return "NONE";
    // 2. Intent-based logic
    if (params.intent === "COMPLAINING") return "NONE"; // Should escalate instead
    if (params.intent === "EXIT") return "NONE";
    // 3. Confidence Gate
    if (params.confidence < 0.7) return "NONE";
    // 4. Intensity Mapping
    if (params.intensity === 0) return "NONE"; // Clarification only mode
    if (params.intent === "BROWSING") return "BENEFIT_FRAME";
    if (params.intent === "NEGOTIating") return "RISK_REDUCTION"; // Highlight return policy
    return "BENEFIT_FRAME";
  }
  /**
   * Log a persuasion attempt
   */
  static async logPersuasion(data: PersuasionData) {
    try {
      await prisma.persuasionAttempt.create({
        data: {
          storeId: data.storeId,
          conversationId: data.conversationId,
          strategy: data.strategy,
          evidenceIds: data.evidenceIds,
          confidenceScore: data.confidence,
        },
      });
    } catch (error) {
      logger.error("[ConversionService] Failed to log persuasion", error);
    }
  }
  /**
   * Record a conversion event (e.g. checkout started)
   */
  static async recordConversion(data: ConversionData) {
    try {
      await prisma.conversionEvent.create({
        data: {
          storeId: data.storeId,
          conversationId: data.conversationId,
          eventType: data.eventType,
          valueKobo: data.valueKobo || BigInt(0),
          aiAttributionScore: 1.0, // Simple for now
        },
      });
    } catch (error) {
      logger.error("[ConversionService] Failed to record conversion", error);
    }
  }
}
