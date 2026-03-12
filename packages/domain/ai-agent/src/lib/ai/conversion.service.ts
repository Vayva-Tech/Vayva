import { prisma } from "@vayva/db";
import { logger } from "../logger";

type Objection = "PRICE" | "DELIVERY" | "TRUST";

type Intent = "BROWSING" | "COMPLAINING" | "EXIT" | "NEGOTIating" | string;

type PersuasionStrategy = "NONE" | "BENEFIT_FRAME" | "RISK_REDUCTION";

type PersuasionDecisionParams = {
  storeId: string;
  intent: Intent;
  sentiment: number;
  confidence: number;
  intensity: number;
};

type PersuasionLogData = {
  storeId: string;
  conversationId?: string;
  strategy: string;
  evidenceIds?: string[];
  confidence: number;
};

type ConversionEventData = {
  storeId: string;
  conversationId?: string;
  eventType: string;
  valueKobo?: bigint;
};

export class ConversionService {
  /**
   * Detect objections in buyer text
   */
  static classifyObjection(text: string): Objection | null {
    const lower = (text || "").toLowerCase();
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
  static async decidePersuasion(
    params: PersuasionDecisionParams,
  ): Promise<PersuasionStrategy> {
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
  static async logPersuasion(data: PersuasionLogData): Promise<void> {
    try {
      await prisma.persuasionAttempt.create({
        data: {
          storeId: data.storeId,
          conversationId: data.conversationId || "anon",
          strategy: data.strategy,
          evidenceIds: data.evidenceIds,
          confidenceScore: data.confidence,
        },
      });
    } catch (error: unknown) {
      logger.error("[ConversionService] Failed to log persuasion", error);
    }
  }
  /**
   * Record a conversion event (e.g. checkout started)
   */
  static async recordConversion(data: ConversionEventData): Promise<void> {
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
    } catch (error: unknown) {
      logger.error("[ConversionService] Failed to record conversion", error);
    }
  }
}
