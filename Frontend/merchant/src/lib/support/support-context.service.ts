import { prisma, type Store, type Order } from "@vayva/db";

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
        const [storeData, orders] = await Promise.all([
            prisma.store.findUnique({
                where: { id: storeId },
            }) as Promise<StoreWithRelations | null>,
            prisma.order.findMany({
                where: { storeId },
                take: 5,
                orderBy: { createdAt: "desc" },
                select: { id: true, status: true, total: true, createdAt: true },
            }),
        ]);
        
        if (!storeData)
            return null;
            
        const trialEndsAt = storeData.aiSubscription?.trialEndsAt;
        const daysRemaining = trialEndsAt
            ? Math.max(0, Math.ceil((new Date(trialEndsAt).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
            : null;
            
        return {
            store: {
                name: storeData.name,
                category: storeData.category,
                verificationStatus: storeData.isLive ? "LIVE" : "DRAFT",
                domain: storeData.customDomain || "vayva.shop",
            },
            plan: {
                name: storeData.plan || "FREE",
                status: storeData.aiSubscription?.status || "TRIAL",
                expiresAt: trialEndsAt,
                daysRemaining,
            },
            stats: {
                totalOrders: await prisma.order.count({ where: { storeId } }),
                totalProducts: await prisma.product.count({ where: { storeId } }),
                totalLeads: await prisma.customer.count({ where: { storeId } }),
            },
            whatsapp: {
                connected: !!storeData.agent,
                status: "active",
                aiActive: true,
            },
            recentOrders: orders.map((o) => ({
                id: o.id,
                status: o.status,
                amount: `₦${(Number(o.total) / 100).toFixed(2)}`,
                date: o.createdAt.toISOString().split("T")[0],
            })),
        };
    }
}
