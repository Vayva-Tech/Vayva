import { prisma } from "@vayva/db";
import { logger } from "@vayva/shared";
import crypto from "crypto";

interface FlagContext {
    merchantId?: string;
}

interface FlagRules {
    merchant_blocklist?: string[];
    merchant_allowlist?: string[];
    rollout_percent?: number;
}

export class FlagService {
    static async isEnabled(key: string, context: FlagContext = {}): Promise<boolean> {
        try {
            const flag = await prisma.featureFlag.findUnique({
                where: { key },
            });
            if (!flag)
                return false;
            
            const rules = flag.rules as FlagRules | null;
            if (context.merchantId && rules) {
                if (rules.merchant_blocklist?.includes(context.merchantId))
                    return false;
                if (rules.merchant_allowlist?.includes(context.merchantId))
                    return true;
                
                if (rules.rollout_percent && rules.rollout_percent > 0) {
                    const hash = crypto
                        .createHash("sha256")
                        .update(context.merchantId + key)
                        .digest("hex");
                    const val = parseInt(hash.substring(0, 8), 16);
                    const bucket = val % 100;
                    if (bucket < rules.rollout_percent)
                        return true;
                }
            }
            return flag.enabled;
        }
        catch (e) {
            logger.error(`[FlagService] Error evaluating ${key}`, { error: e instanceof Error ? e.message : String(e) });
            return false;
        }
    }
    
    static async isKillSwitchActive(key: string, merchantId: string): Promise<boolean> {
        return this.isEnabled(key, { merchantId });
    }
}
