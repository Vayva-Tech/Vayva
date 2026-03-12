export class EscalationPolicy {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static SENSITIVE_KEYWORDS: any;
  /**
   * Evaluates whether a user query requires human intervention.
   */
  static evaluate(query: string, confidence = 1.0, _historyCount = 0) {
    const lowerQuery = query.toLowerCase();
    // 1. Critical Keywords (Deterministic)
    for (const kw of this.SENSITIVE_KEYWORDS.PAYMENT_DISPUTE) {
      if (lowerQuery.includes(kw)) {
        return {
          shouldEscalate: true,
          trigger: "PAYMENT_DISPUTE",
          reason: `User mentioned critical keyword: "${kw}"`,
        };
      }
    }
    for (const kw of this.SENSITIVE_KEYWORDS.BILLING_ERROR) {
      if (lowerQuery.includes(kw)) {
        return {
          shouldEscalate: true,
          trigger: "BILLING_ERROR",
          reason: `User mentioned billing issue: "${kw}"`,
        };
      }
    }
    // 2. High Risk Sentiment
    for (const kw of this.SENSITIVE_KEYWORDS.SENTIMENT) {
      if (lowerQuery.includes(kw)) {
        return {
          shouldEscalate: true,
          trigger: "SENTIMENT",
          reason: `High risk sentiment detected: "${kw}"`,
        };
      }
    }
    // 3. Low Confidence (Probabilistic)
    if (confidence < 0.62) {
      return {
        shouldEscalate: true,
        trigger: "LOW_CONFIDENCE",
        reason: `Model confidence too low (${confidence.toFixed(2)})`,
      };
    }
    // 4. Manual Request
    if (
      lowerQuery.includes("talk to human") ||
      lowerQuery.includes("support agent")
    ) {
      return {
        shouldEscalate: true,
        trigger: "MANUAL_REQUEST",
        reason: "User explicitly requested human support",
      };
    }
    return { shouldEscalate: false };
  }
}
EscalationPolicy.SENSITIVE_KEYWORDS = {
  PAYMENT_DISPUTE: [
    "refund",
    "chargeback",
    "scam",
    "fraud",
    "stolen",
    "unrecognized charge",
  ],
  BILLING_ERROR: [
    "double charged",
    "wrong amount",
    "billing error",
    "invoice mistake",
  ],
  SENTIMENT: ["lawyer", "sue", "illegal", "report you", "police"],
};
