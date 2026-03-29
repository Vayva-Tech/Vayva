import { api } from '@/lib/api-client';
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
            const response = await api.get(`/flags/${key}/evaluate`, {
                merchantId: context.merchantId,
            });
            return response.data?.enabled ?? false;
        }
        catch (e) {
            console.error(`[FlagService] Error evaluating ${key}`, e);
            return false;
        }
    }
    
    static async isKillSwitchActive(key: string, merchantId: string): Promise<boolean> {
        return this.isEnabled(key, { merchantId });
    }
}
