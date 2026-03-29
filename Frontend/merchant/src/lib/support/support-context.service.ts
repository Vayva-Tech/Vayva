import { api } from '@/lib/api-client';

interface AiSubscriptionInfo {
    status?: string;
    trialEndsAt?: string | Date;
}

interface StoreWithRelations extends Store {
    customDomain?: string;
    aiSubscription?: AiSubscriptionInfo;
    agent?: unknown;
}

interface MerchantSnapshot {
    store: {
        name: string;
        category: string | null;
        verificationStatus: string;
        domain: string;
    };
    plan: {
        name: string;
        status: string;
        expiresAt: string | Date | undefined;
        daysRemaining: number | null;
    };
    stats: {
        totalOrders: number;
        totalProducts: number;
        totalLeads: number;
    };
    whatsapp: {
        connected: boolean;
        status: string;
        aiActive: boolean;
    };
    recentOrders: Array<{
        id: string;
        status: string;
        amount: string;
        date: string;
    }>;
}

export class SupportContextService {
    static async getMerchantSnapshot(storeId: string): Promise<MerchantSnapshot | null> {
        try {
            const response = await api.get(`/support/${storeId}/merchant-snapshot`);
            return response.data || null;
        } catch {
            return null;
        }
    }
}
