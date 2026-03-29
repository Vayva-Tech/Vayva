import { api } from '@/lib/api-client';
import { verifyReferralToken } from "./referral";
export class AttributionService {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    static async trackSignup(merchantId: any, token: string | null | undefined) {
        const payload = verifyReferralToken(token);
        if (!payload)
            return null;
        try {
            const response = await api.post('/partners/attribution/track-signup', {
                merchantId,
                partnerId: payload.partnerId,
                referralCode: payload.code,
            });
            return response.data || null;
        } catch {
            return null;
        }
    }
    static async trackStoreLive(storeId: string) {
        try {
            await api.post('/partners/attribution/track-store-live', { storeId });
        } catch {
            // Ignore errors - attribution is not critical path
        }
    }
    static async trackPayment(storeId: string, amount: any) {
        try {
            await api.post('/partners/attribution/track-payment', {
                storeId,
                amount,
            });
        } catch {
            // Ignore errors - payment tracking is not critical path
        }
    }
}
