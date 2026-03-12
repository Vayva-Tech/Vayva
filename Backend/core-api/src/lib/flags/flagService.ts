import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import crypto from "crypto";
function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class FlagService {
  // In a real app, use Redis or robust in-memory caching.
  // For V1, we fetch or use a short-lived simplistic cache concept.
  static async isEnabled(key: string, context: Record<string, unknown> = {}) {
    try {
      const flag = await prisma.featureFlag.findUnique({
        where: { key },
      });
      if (!flag) return false; // Default safe
      // 1. Check Global Disable (if not enabled and no rules override - usually enabled is the master switch)
      // Actually, usually 'enabled' means "Global ON unless rules restrict" or "Off unless rules enable".
      // Let's define: enabled = BASE STATE. Rules = OVERRIDES.
      // Allowlist overrides everything (Specific Turn ON)
      const rules = isRecord(flag.rules) ? flag.rules : {};
      if (context.merchantId && typeof context.merchantId === "string") {
        const blocklist = Array.isArray(rules.merchant_blocklist)
          ? (rules.merchant_blocklist as string[])
          : [];
        if (blocklist.includes(context.merchantId)) return false;

        const allowlist = Array.isArray(rules.merchant_allowlist)
          ? (rules.merchant_allowlist as string[])
          : [];
        if (allowlist.includes(context.merchantId)) return true;

        // Percentage Rollout
        const rolloutPercent =
          typeof rules.rollout_percent === "number" ? rules.rollout_percent : 0;
        if (rolloutPercent > 0) {
          const hash = crypto
            .createHash("sha256")
            .update(context.merchantId + key)
            .digest("hex");
          const val = parseInt(hash.substring(0, 8), 16); // Take first 8 chars
          const bucket = val % 100;
          if (bucket < rolloutPercent) return true;
        }
      }
      return flag.enabled;
    } catch (e) {
      logger.error(`[FlagService] Error evaluating ${key}`, {
        error: e instanceof Error ? e.message : String(e),
      });
      return false; // Fail safe
    }
  }
  static async isKillSwitchActive(key: string, merchantId: string) {
    // Semantic helper: "Active" means "The Kill Switch is ENGAGED (Blocking)"?
    // Or "Is the FEATURE enabled?"
    // Usually boolean questions should be "isFeatureXEnabled?".
    // If isEnabled returns FALSE, the feature is OFF (Kill switch active potentially).
    return this.isEnabled(key, { merchantId });
  }
}
