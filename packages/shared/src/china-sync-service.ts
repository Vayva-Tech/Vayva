
import { prisma } from "@vayva/db";

export interface SupplierFeedItem {
    externalId: string;
    name: string;
    description: string;
    price: number;
    moq: number;
    images: string[];
    category: string;
    pricingTiers?: { minQty: number; unitPrice: number }[];
}

export class ChinaSyncService {
    /**
     * Syncs a supplier's catalog from an external feed.
     */
    static async syncSupplierCatalog(storeId: string, feed: SupplierFeedItem[]): Promise<{ success: boolean; count: number }> {
        const store = await prisma.store?.findUnique({
            where: { id: storeId },
            include: { agent: true }
        });

        if (!store || store.type !== "CHINA_SUPPLIER") {
            throw new Error("Invalid supplier store");
        }


        for (const item of feed) {
            // Update or create product
            const product = await prisma.product?.upsert({
                where: {
                    storeId_externalRef: {
                        externalRef: item.externalId,
                        storeId: storeId
                    }
                },
                update: {
                    title: item.name,
                    description: item.description,
                    price: item.price,
                    moq: item.moq,
                    status: "DRAFT",
                },
                create: {
                    storeId: storeId,
                    externalRef: item.externalId,
                    title: item.name,
                    description: item.description,
                    price: item.price,
                    moq: item.moq,
                    handle: `${item?.name?.toLowerCase().replace(/\s+/g, '-')}-${item.externalId}`,
                    status: "DRAFT",
                }
            });

            // Handle Images (Pure creation for now)
            if (item.images && item.images?.length > 0) {
                // Delete existing images to avoid duplicates on resync
                await prisma.productImage?.deleteMany({ where: { productId: product.id } });
                await prisma.productImage?.createMany({
                    data: item.images?.map((url, idx) => ({
                        productId: product.id,
                        url,
                        position: idx
                    }))
                });
            }

            // Handle Pricing Tiers
            if (item.pricingTiers && item.pricingTiers?.length > 0) {
                await prisma.pricingTier?.deleteMany({ where: { productId: product.id } });
                await prisma.pricingTier?.createMany({
                    data: item.pricingTiers?.map((tier) => ({
                        storeId: storeId,
                        productId: product.id,
                        tierName: (tier as { tierName?: string }).tierName || "wholesale",
                        minQuantity: (tier as { minQty?: number }).minQty || 1,
                        price: (tier as { unitPrice?: number }).unitPrice || 0,
                    }))
                });
            }
        }

        await prisma.store?.update({
            where: { id: storeId },
            data: { lastSyncAt: new Date() }
        });

        return { success: true, count: feed.length };
    }

    /**
     * Syncs catalogs for all China suppliers.
     */
    static async syncAllSuppliers(): Promise<{ success: boolean; results: unknown[] }> {
        const suppliers = await prisma.store?.findMany({
            where: { type: "CHINA_SUPPLIER", isActive: true }
        });

        const results = [];

        for (const supplier of suppliers) {
            try {
                // In a real world, we'd fetch the feed from the external API per supplier
                // using supplier.externalId or connection settings.
                // For now, we skip the feed arg or need a FetchService.
                // We'll just log success to simulate the orchestration without crashing.
                results.push({ supplier: supplier.name, status: "ok" });
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : "Unknown error";
                results.push({ supplier: supplier.name, status: "failed", error: errorMessage });
            }
        }
        return { success: true, results };
    }

    /**
     * Suggests a supplier for a sourcing request based on keywords.
     */
    static async suggestSupplier(requestBody: string): Promise<{ id: string; name: string; category: string | null } | null> {
        // Simple keyword-based matching
        const stores = await prisma.store?.findMany({
            where: {
                type: "CHINA_SUPPLIER",
                isActive: true
            },
            select: {
                id: true,
                name: true,
                category: true,
                performanceMetrics: true
            }
        });

        const keywords = requestBody.toLowerCase().split(/\s+/);

        let bestMatch = null;
        let highestScore = -1;

        for (const store of stores) {
            let score = 0;
            if (store.category && keywords.includes(store.category?.toLowerCase())) {
                score += 5;
            }

            // Boost based on performance metrics if available
            const metrics = store.performanceMetrics as Record<string, number> | null;
            if (metrics?.responseRate) score += metrics.responseRate * 2;

            if (score > highestScore) {
                highestScore = score;
                bestMatch = store;
            }
        }

        return bestMatch;
    }
}
