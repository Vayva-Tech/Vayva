export type AiPlanKey = "STARTER" | "PRO" | "PRO_PLUS";

export type AiPackage = {
  planKey: AiPlanKey;
  /**
   * Included AI messages per billing period (month).
   * One "AI message" is one AI interaction (chat reply, image analysis, etc).
   */
  includedMessagesPerMonth: number;
  /**
   * Autopilot runs included per month (evaluation runs).
   * We still meter Autopilot in messages as well, because it's expensive.
   */
  includedAutopilotRunsPerMonth: number;
  /**
   * If voice is enabled, cap voice note length and meter in messages.
   */
  voiceEnabled: boolean;
  maxVoiceSeconds: number;
  /**
   * How many AI messages to deduct for one Autopilot evaluation run.
   */
  autopilotRunMessageCost: number;
  /**
   * How many AI messages to deduct for one voice note processed
   * (transcription + assistant reply).
   */
  voiceNoteMessageCost: number;
  /**
   * Safety caps applied to OpenRouter requests.
   */
  caps: {
    chatMaxOutputTokens: number;
    autopilotMaxOutputTokens: number;
    /**
     * Maximum number of prior chat turns to include in context.
     * (Implemented by trimming in agent/services, not by model.)
     */
    maxRecentTurnsForChat: number;
    /**
     * Max tool calls allowed per response (soft cap via tool list and policy).
     */
    maxToolCalls: number;
  };
};

export const AI_PACKAGES: Record<AiPlanKey, AiPackage> = {
  STARTER: {
    planKey: "STARTER",
    includedMessagesPerMonth: 600,
    includedAutopilotRunsPerMonth: 0,
    voiceEnabled: false,
    maxVoiceSeconds: 0,
    autopilotRunMessageCost: 0,
    voiceNoteMessageCost: 0,
    caps: {
      chatMaxOutputTokens: 250,
      autopilotMaxOutputTokens: 0,
      maxRecentTurnsForChat: 10,
      maxToolCalls: 1,
    },
  },
  PRO: {
    planKey: "PRO",
    includedMessagesPerMonth: 800,
    includedAutopilotRunsPerMonth: 20,
    voiceEnabled: false,
    maxVoiceSeconds: 0,
    autopilotRunMessageCost: 10,
    voiceNoteMessageCost: 0,
    caps: {
      chatMaxOutputTokens: 350,
      autopilotMaxOutputTokens: 600,
      maxRecentTurnsForChat: 12,
      maxToolCalls: 2,
    },
  },
  PRO_PLUS: {
    planKey: "PRO_PLUS",
    includedMessagesPerMonth: 1200,
    includedAutopilotRunsPerMonth: 60,
    voiceEnabled: true,
    maxVoiceSeconds: 60,
    autopilotRunMessageCost: 10,
    voiceNoteMessageCost: 5,
    caps: {
      chatMaxOutputTokens: 500,
      autopilotMaxOutputTokens: 900,
      maxRecentTurnsForChat: 16,
      maxToolCalls: 3,
    },
  },
};

export function normalizePlanKey(input: string | null | undefined): AiPlanKey {
  const v = String(input || "").toUpperCase();
  if (v === "PRO_PLUS" || v === "PROPLUS" || v === "PRO+") return "PRO_PLUS";
  if (v === "PRO") return "PRO";
  return "STARTER";
}

export function getAiPackage(planKey: string | null | undefined): AiPackage {
  return AI_PACKAGES[normalizePlanKey(planKey)];
}
