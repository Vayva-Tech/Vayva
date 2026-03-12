/**
 * Free Intent Classifier
 * Rule-based intent classification - no ML model training required
 * Uses pattern matching and keyword extraction
 */

export interface IntentResult {
  intent: string;
  confidence: number;
  entities: Record<string, string>;
}

// Intent patterns with keywords and confidence weights
const INTENT_PATTERNS: Array<{
  intent: string;
  patterns: Array<{ keywords: string[]; weight: number }>;
  requiredWords?: string[];
}> = [
  {
    intent: "browse_products",
    patterns: [
      { keywords: ["show", "see", "look", "find", "search", "browse", "view"], weight: 0.3 },
      { keywords: ["product", "item", "goods", "merchandise", "catalog"], weight: 0.3 },
      { keywords: ["what", "which", "available", "have", "got", "offer"], weight: 0.2 },
    ],
  },
  {
    intent: "check_price",
    patterns: [
      { keywords: ["price", "cost", "how much", "pricing", "rate", "charge"], weight: 0.5 },
      { keywords: ["expensive", "cheap", "affordable", "discount"], weight: 0.3 },
    ],
  },
  {
    intent: "check_availability",
    patterns: [
      { keywords: ["stock", "available", "in stock", "have", "left", "remaining"], weight: 0.5 },
      { keywords: ["when", "arrive", "restock", "back in", "coming"], weight: 0.3 },
    ],
  },
  {
    intent: "place_order",
    patterns: [
      { keywords: ["buy", "purchase", "order", "get", "want", "need"], weight: 0.4 },
      { keywords: ["checkout", "pay", "payment", "complete", "confirm"], weight: 0.4 },
    ],
  },
  {
    intent: "track_order",
    patterns: [
      { keywords: ["track", "status", "where", "location", "delivery"], weight: 0.4 },
      { keywords: ["order", "package", "shipment", "parcel"], weight: 0.3 },
      { keywords: ["when", "arrive", "coming", "expected"], weight: 0.2 },
    ],
  },
  {
    intent: "cancel_order",
    patterns: [
      { keywords: ["cancel", "stop", "abort", "dont want"], weight: 0.5 },
      { keywords: ["order", "purchase", "transaction"], weight: 0.3 },
      { keywords: ["refund", "money back", "return"], weight: 0.2 },
    ],
  },
  {
    intent: "request_refund",
    patterns: [
      { keywords: ["refund", "money back", "return", "send back"], weight: 0.5 },
      { keywords: ["damaged", "broken", "wrong", "not working", "defective"], weight: 0.3 },
    ],
  },
  {
    intent: "ask_support",
    patterns: [
      { keywords: ["help", "support", "assist", "problem", "issue", "question"], weight: 0.4 },
      { keywords: ["how to", "how do", "can you", "could you", "please"], weight: 0.3 },
      { keywords: ["not working", "error", "trouble", "difficult"], weight: 0.3 },
    ],
  },
  {
    intent: "complaint",
    patterns: [
      { keywords: ["complaint", "complain", "unhappy", "disappointed", "terrible"], weight: 0.5 },
      { keywords: ["bad", "worst", "awful", "horrible", "angry", "frustrated"], weight: 0.4 },
    ],
  },
  {
    intent: "compliment",
    patterns: [
      { keywords: ["good", "great", "excellent", "amazing", "love", "perfect"], weight: 0.5 },
      { keywords: ["thank", "thanks", "appreciate", "happy", "pleased"], weight: 0.3 },
    ],
  },
  {
    intent: "ask_shipping",
    patterns: [
      { keywords: ["shipping", "delivery", "ship", "send", "transport"], weight: 0.5 },
      { keywords: ["how long", "when", "time", "days", "arrive"], weight: 0.3 },
      { keywords: ["cost", "fee", "charge", "free shipping"], weight: 0.2 },
    ],
  },
  {
    intent: "negotiate_price",
    patterns: [
      { keywords: ["discount", "cheaper", "lower", "reduce", "better price"], weight: 0.5 },
      { keywords: ["offer", "deal", "bargain", "negotiate", "best price"], weight: 0.4 },
      { keywords: ["bulk", "wholesale", "many", "quantity"], weight: 0.3 },
    ],
  },
  {
    intent: "compare_products",
    patterns: [
      { keywords: ["compare", "versus", "vs", "difference", "better"], weight: 0.5 },
      { keywords: ["which", "what", "recommend", "suggest", "advice"], weight: 0.3 },
    ],
  },
  {
    intent: "greeting",
    patterns: [
      { keywords: ["hello", "hi", "hey", "good morning", "good afternoon", "good evening"], weight: 0.6 },
      { keywords: ["how are you", "whats up", "sup"], weight: 0.4 },
    ],
  },
  {
    intent: "goodbye",
    patterns: [
      { keywords: ["bye", "goodbye", "see you", "later", "talk soon"], weight: 0.6 },
      { keywords: ["thank", "thanks", "have a good"], weight: 0.3 },
    ],
  },
];

// Entity extraction patterns
const ENTITY_PATTERNS: Array<{
  type: string;
  patterns: RegExp[];
}> = [
  {
    type: "product",
    patterns: [
      /\b(\d+)\s*(?:pieces?|pcs?|units?|items?)\s+of\s+([\w\s]+)/i,
      /\b([\w\s]+?)\s+(?:product|item)\b/i,
      /\bbuy\s+([\w\s]+)/i,
      /\border\s+([\w\s]+)/i,
    ],
  },
  {
    type: "quantity",
    patterns: [
      /\b(\d+)\s*(?:pieces?|pcs?|units?|items?|qty)/i,
      /\bquantity\s*(?:of|:)?\s*(\d+)/i,
    ],
  },
  {
    type: "price",
    patterns: [
      /(?:₦|N|NGN|naira)\s*(\d[\d,]*)/i,
      /(\d[\d,]*)\s*(?:₦|N|NGN|naira)/i,
      /(\d{3,})\s*(?:k)/i,
    ],
  },
  {
    type: "order_id",
    patterns: [
      /\border\s*(?:#|number|id)?\s*:?\s*([A-Z0-9-]+)/i,
      /\b#\s*([A-Z0-9-]{5,})/i,
    ],
  },
  {
    type: "date",
    patterns: [
      /\b(today|tomorrow|yesterday|next week|this week)\b/i,
      /\b(\d{1,2})\s*(?:st|nd|rd|th)?\s*(?:of)?\s*(January|February|March|April|May|June|July|August|September|October|November|December)\b/i,
    ],
  },
  {
    type: "location",
    patterns: [
      /\bto\s+([\w\s]+(?:state|city|lagos|abuja|kano|ibadan|port harcourt))/i,
      /\bin\s+([\w\s]+(?:state|city|lagos|abuja|kano|ibadan))/i,
      /\bdeliver\s+(?:to|in)\s+([\w\s]+)/i,
    ],
  },
  {
    type: "color",
    patterns: [
      /\b(red|blue|green|yellow|black|white|purple|orange|pink|brown|gray|grey|silver|gold)\b/i,
    ],
  },
  {
    type: "size",
    patterns: [
      /\b(small|medium|large|xl|xxl|xs|extra large|extra small)\b/i,
      /\bsize\s*(?:of|:)?\s*(\w+)/i,
    ],
  },
];

export class IntentClassifier {
  /**
   * Classify user message intent
   */
  classify(message: string): IntentResult {
    const normalizedMessage = message.toLowerCase().trim();
    const words = this.tokenize(normalizedMessage);
    
    let bestIntent = "unknown";
    let bestScore = 0;
    const intentScores: Map<string, number> = new Map();

    // Score each intent
    for (const intentPattern of INTENT_PATTERNS) {
      let score = 0;
      let matchedPatterns = 0;

      for (const pattern of intentPattern.patterns) {
        let patternMatched = false;
        for (const keyword of pattern.keywords) {
          if (normalizedMessage.includes(keyword)) {
            score += pattern.weight;
            patternMatched = true;
          }
        }
        if (patternMatched) matchedPatterns++;
      }

      // Boost score if multiple patterns matched
      if (matchedPatterns > 1) {
        score *= 1.2;
      }

      // Check required words
      if (intentPattern.requiredWords) {
        const hasRequired = intentPattern.requiredWords.some(w => 
          normalizedMessage.includes(w)
        );
        if (!hasRequired) score *= 0.5;
      }

      if (score > 0) {
        intentScores.set(intentPattern.intent, score);
        if (score > bestScore) {
          bestScore = score;
          bestIntent = intentPattern.intent;
        }
      }
    }

    // Calculate confidence
    let confidence = 0;
    if (bestScore > 0) {
      // Normalize confidence based on score
      confidence = Math.min(1, bestScore / 1.5);
      
      // Reduce confidence if there's a close second
      const sortedScores = Array.from(intentScores.entries())
        .filter(([intent]) => intent !== bestIntent)
        .sort((a, b) => b[1] - a[1]);
      
      if (sortedScores.length > 0) {
        const secondBest = sortedScores[0][1];
        const gap = bestScore - secondBest;
        if (gap < 0.2) {
          confidence *= 0.7; // Reduce confidence if close match
        }
      }
    }

    // Extract entities
    const entities = this.extractEntities(message);

    return {
      intent: bestIntent,
      confidence,
      entities,
    };
  }

  /**
   * Classify with top N intents (for ambiguous cases)
   */
  classifyTopN(message: string, n: number = 3): Array<{ intent: string; confidence: number; entities: Record<string, string> }> {
    const normalizedMessage = message.toLowerCase().trim();
    const intentScores: Map<string, number> = new Map();

    // Score each intent
    for (const intentPattern of INTENT_PATTERNS) {
      let score = 0;
      for (const pattern of intentPattern.patterns) {
        for (const keyword of pattern.keywords) {
          if (normalizedMessage.includes(keyword)) {
            score += pattern.weight;
          }
        }
      }
      if (score > 0) {
        intentScores.set(intentPattern.intent, score);
      }
    }

    // Sort by score and get top N
    const sorted = Array.from(intentScores.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, n);

    const entities = this.extractEntities(message);

    return sorted.map(([intent, score]) => ({
      intent,
      confidence: Math.min(1, score / 1.5),
      entities,
    }));
  }

  /**
   * Check if message is a greeting
   */
  isGreeting(message: string): boolean {
    const result = this.classify(message);
    return result.intent === "greeting" && result.confidence > 0.5;
  }

  /**
   * Check if message indicates buying intent
   */
  hasBuyingIntent(message: string): boolean {
    const result = this.classify(message);
    return ["place_order", "check_price", "check_availability", "negotiate_price"].includes(result.intent);
  }

  private extractEntities(message: string): Record<string, string> {
    const entities: Record<string, string> = {};
    
    for (const entityPattern of ENTITY_PATTERNS) {
      for (const pattern of entityPattern.patterns) {
        const match = message.match(pattern);
        if (match) {
          // Use first capture group or full match
          const value = match[1] || match[0];
          if (value && value.trim()) {
            entities[entityPattern.type] = value.trim();
            break; // Only take first match per entity type
          }
        }
      }
    }

    return entities;
  }

  private tokenize(text: string): string[] {
    return text
      .replace(/[^\w\s]/g, " ")
      .split(/\s+/)
      .filter(t => t.length > 0);
  }
}
