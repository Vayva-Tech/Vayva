import { prisma } from "@vayva/db";

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

export class SupportContextService {
  /**
   * Get a comprehensive safe snapshot for the support bot
   */
  static async getMerchantSnapshot(storeId: string) {
    const [storeData, orders] = await Promise.all([
      prisma.store.findUnique({
        where: { id: storeId },
        include: {
          aiSubscription: true,
        },
      }),
      prisma.order.findMany({
        where: { storeId },
        take: 5,
        orderBy: { createdAt: "desc" },
        select: { id: true, status: true, total: true, createdAt: true },
      }),
    ]);
    if (!storeData) return null;

    const settings = isRecord(storeData.settings) ? storeData.settings : {};
    const aiSubscription = storeData.aiSubscription;

    return {
      store: {
        name: storeData.name,
        category: storeData.category,
        verificationStatus: storeData.isLive ? "LIVE" : "DRAFT",
        domain: (settings.customDomain as string | undefined) || "vayva.shop",
      },
      plan: {
        name: storeData.plan || "FREE",
        status: aiSubscription?.status || "TRIAL",
        expiresAt: aiSubscription?.trialExpiresAt,
        daysRemaining: aiSubscription?.trialExpiresAt
          ? Math.max(
              0,
              Math.ceil(
                (new Date(aiSubscription.trialExpiresAt).getTime() -
                  new Date().getTime()) /
                  (1000 * 60 * 60 * 24),
              ),
            )
          : null,
      },
      stats: {
        totalOrders: await prisma.order.count({ where: { storeId } }),
        totalProducts: await prisma.product.count({ where: { storeId } }),
        totalLeads: await prisma.customer.count({ where: { storeId } }),
      },
      whatsapp: {
        connected: !!settings.agent,
        status: "ACTIVE",
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
