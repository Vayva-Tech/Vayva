import { prisma, Prisma } from "@vayva/db";
import { logger } from "../logger.js";
import { MLInferenceClient } from "../ml/ml-client.js";

type UnknownRecord = Record<string, unknown>;

function isRecord(value: unknown): value is UnknownRecord {
    return typeof value === "object" && value !== null;
}

function getRecord(value: unknown): UnknownRecord {
    return isRecord(value) ? value : {};
}

function getString(value: unknown): string {
    return typeof value === "string" ? value : "";
}

type DeliveryQuote = {
    location: string;
    costKobo: number;
    estimatedDays: string;
    carrier: string;
};

export class MerchantBrainService {
    static computeStableHash(input: string) {
        let hash = 0;
        for (let i = 0; i < input.length; i++) {
            hash = (hash << 5) - hash + input.charCodeAt(i);
            hash |= 0; // 32-bit
        }
        return Math.abs(hash);
    }

    static async describeImage(storeId: string, imageUrl: string) {
        try {
            const apiKey = process.env.OPENAI_API_KEY;
            if (!apiKey) {
                return {
                    ok: false,
                    error: "IMAGE_UNDERSTANDING_DISABLED",
                };
            }

            const isHttpUrl = typeof imageUrl === "string" && /^https?:\/\//i.test(imageUrl);
            const isDataUrl = typeof imageUrl === "string" && /^data:image\//i.test(imageUrl);
            if (!imageUrl || typeof imageUrl !== "string" || (!isHttpUrl && !isDataUrl)) {
                return {
                    ok: false,
                    error: "INVALID_IMAGE_URL",
                };
            }

            const res = await fetch("https://api.openai.com/v1/chat/completions", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${apiKey}`,
                },
                body: JSON.stringify({
                    model: "gpt-4o-mini",
                    temperature: 0.2,
                    max_tokens: 200,
                    messages: [
                        {
                            role: "user",
                            content: [
                                { type: "text", text: "Describe what is in this image for product identification. Return a short description and 3-8 keywords." },
                                { type: "image_url", image_url: { url: imageUrl } },
                            ],
                        },
                    ],
                }),
            });

            if (!res.ok) {
                const body = await res.text();
                return {
                    ok: false,
                    error: "VISION_PROVIDER_ERROR",
                    status: res.status,
                    details: body,
                };
            }

            const data: unknown = await res.json();
            const dataObj = getRecord(data);
            const choices = Array.isArray(dataObj.choices) ? dataObj.choices : [];
            const first = isRecord(choices[0]) ? (choices[0] as UnknownRecord) : undefined;
            const msg = first && isRecord(first.message) ? (first.message as UnknownRecord) : undefined;
            const text = msg ? getString(msg.content) : "";
            return {
                ok: true,
                description: text,
            };
        }
        catch (error: unknown) {
            logger.error("[MerchantBrain] describeImage failed", { storeId, imageUrl, error });
            return {
                ok: false,
                error: "VISION_PROVIDER_ERROR",
            };
        }
    }

    static async searchCatalog(storeId: string, query: string) {
        try {
            const q = (query || "").trim();
            if (!q) {
                return { results: [] };
            }

            const products = await prisma.product.findMany({
                where: {
                    storeId,
                    status: "ACTIVE",
                    OR: [
                        { title: { contains: q, mode: "insensitive" } },
                        { description: { contains: q, mode: "insensitive" } },
                    ],
                },
                select: {
                    id: true,
                    title: true,
                    price: true,
                    trackInventory: true,
                },
                take: 5,
            });

            const ids = products.map((p) => p.id);
            const stockAgg = ids.length
                ? await prisma.inventoryItem.groupBy({
                    by: ["productId"],
                    where: { productId: { in: ids } },
                    _sum: { available: true },
                })
                : [];

            const stockMap = new Map<string, number>();
            for (const row of stockAgg) {
                const available = (row as { _sum?: { available?: number | null } })._sum?.available;
                stockMap.set(row.productId, typeof available === "number" ? available : 0);
            }

            const results = products.map((p) => {
                const qty = p.trackInventory ? (stockMap.get(p.id) || 0) : 999;
                return {
                    id: p.id,
                    title: p.title,
                    price: p.price,
                    inStock: qty > 0,
                    available: qty,
                };
            });

            return { results };
        }
        catch (error: unknown) {
            logger.error("[MerchantBrain] searchCatalog failed", { storeId, query, error });
            return { results: [] };
        }
    }

    static computeDynamicMarginNaira(location: string, capNaira = 1000) {
        const base = 200;
        const variable = this.computeStableHash((location || "").toLowerCase().trim()) % 801; // 0..800
        return Math.min(base + variable, capNaira);
    }

    static asObject(maybeJson: unknown): UnknownRecord {
        return getRecord(maybeJson);
    }

    static normalizePickupLocations(rawSettings: unknown) {
        const settings = this.asObject(rawSettings);
        const list = settings.pickupLocations;
        if (!Array.isArray(list))
            return [];
        return list.filter(Boolean);
    }

    static normalizeDeliveryConfig(rawSettings: unknown) {
        const settings = this.asObject(rawSettings);
        const cfg = getRecord(settings.deliveryConfig);
        return {
            deliveryRadiusKm: Number(cfg.deliveryRadiusKm ?? 10),
            baseDeliveryFee: Number(cfg.baseDeliveryFee ?? 1000),
            deliveryFeeType: (cfg.deliveryFeeType === "DISTANCE" ? "DISTANCE" : "FLAT"),
            allowSelfPickup: Boolean(cfg.allowSelfPickup ?? false),
            selfDeliveryEnabled: Boolean(cfg.selfDeliveryEnabled ?? false),
        };
    }

    static async getStoreFulfillmentPolicy(storeId: string) {
        try {
            const store = await prisma.store.findUnique({
                where: { id: storeId },
                select: {
                    name: true,
                    category: true,
                    settings: true,
                    deliverySettings: {
                        select: {
                            isEnabled: true,
                            provider: true,
                            pickupName: true,
                            pickupPhone: true,
                            pickupAddressLine1: true,
                            pickupAddressLine2: true,
                            pickupCity: true,
                            pickupState: true,
                            pickupLandmark: true,
                        },
                    },
                    agent: {
                        select: {
                            allowImageUnderstanding: true,
                            enabled: true,
                        },
                    },
                },
            });

            if (!store) {
                return null;
            }

            const storeProfile = await prisma.storeProfile.findUnique({
                where: { storeId },
                select: {
                    whatsappNumberE164: true,
                    pickupAvailable: true,
                    pickupAddress: true,
                    deliveryMethods: true,
                },
            });

            const deliveryConfig = this.normalizeDeliveryConfig(store.settings);
            const pickupLocations = this.normalizePickupLocations(store.settings);

            const deliveryProvider = store.deliverySettings?.provider || "CUSTOM";
            const deliveryMode = deliveryProvider === "KWIK" ? "KWIK" : "MANUAL";

            const pickupEnabled = Boolean(
                deliveryConfig.allowSelfPickup ||
                storeProfile?.pickupAvailable ||
                pickupLocations.length > 0 ||
                store.deliverySettings?.pickupAddressLine1
            );

            const deliveryEnabled = Boolean(store.deliverySettings?.isEnabled);

            const fallbackPickup = store.deliverySettings?.pickupAddressLine1
                ? {
                    id: "store_delivery_settings",
                    name: store.deliverySettings?.pickupName || store.name || "Pickup",
                    address: [
                        store.deliverySettings?.pickupAddressLine1,
                        store.deliverySettings?.pickupAddressLine2,
                        store.deliverySettings?.pickupLandmark,
                    ].filter(Boolean).join(", "),
                    city: store.deliverySettings?.pickupCity || "",
                    state: store.deliverySettings?.pickupState || "",
                    isPickupPoint: true,
                    isDefault: true,
                }
                : null;

            const normalizedPickupLocations = pickupLocations.map((l) => {
                const rec = getRecord(l);
                return {
                    id: getString(rec.id),
                    name: getString(rec.name),
                    address: getString(rec.address),
                    city: getString(rec.city),
                    state: getString(rec.state),
                    isPickupPoint: Boolean(rec.isPickupPoint),
                    isDefault: Boolean(rec.isDefault),
                };
            });

            const pickupPoints = fallbackPickup
                ? [...normalizedPickupLocations, fallbackPickup]
                : normalizedPickupLocations;

            return {
                storeId,
                storeName: store.name,
                category: store.category,
                whatsappNumberE164: storeProfile?.whatsappNumberE164 || null,
                pickupEnabled,
                deliveryEnabled,
                deliveryMode,
                deliveryProvider,
                deliveryMethods: storeProfile?.deliveryMethods || [],
                pickupPoints,
                deliveryConfig,
                whatsappAgent: {
                    enabled: Boolean(store.agent?.enabled),
                    allowImageUnderstanding: Boolean(store.agent?.allowImageUnderstanding),
                },
                marginPolicy: {
                    type: "DYNAMIC",
                    capNaira: 1000,
                },
            };
        }
        catch (error: unknown) {
            logger.error("[MerchantBrain] Fulfillment policy fetch failed", { storeId, error });
            return null;
        }
    }

    /**
     * Retrieve relevant knowledge for a query
     * Uses simple keyword search for now as vector extensions (pgvector) might not be configured on all envs yet.
     */
    static async retrieveContext(storeId: string, query: string, limit = 3) {
        try {
            // Fallback to keyword search on 'content'
            const embeddings = await prisma.knowledgeEmbedding.findMany({
                where: {
                    storeId,
                    content: { contains: query, mode: "insensitive" },
                },
                take: limit,
            });
            return embeddings.map((e) => ({
                content: e.content,
                sourceType: e.sourceType,
                sourceId: e.sourceId,
                score: 1.0, // Test score for keyword match
                metadata: e.metadata,
            }));
        }
        catch (error: unknown) {
            logger.error("[MerchantBrain] Retrieval failed", {
                storeId,
                query,
                error,
            });
            return [];
        }
    }

    /**
     * Tool: Get real-time inventory count
     */
    static async getInventoryStatus(storeId: string, productId: string) {
        try {
            const product = await prisma.product.findUnique({
                where: { id: productId },
            });
            if (!product)
                return null;
            // Logic: if any variant is in stock, product is in stock.
            // We assume 'inventoryItems' holds the quantity in 'available' field.
            const totalStock = await prisma.inventoryItem.groupBy({
                by: ['productId'],
                where: { productId: product.id },
                _sum: {
                    available: true
                }
            });
            const quantity = totalStock[0]?._sum.available || 0;
            return {
                productId,
                name: product.title,
                status: quantity > 0 || !product.trackInventory ? "IN_STOCK" : "OUT_OF_STOCK",
                available: product.trackInventory ? quantity : 999,
            };
        }
        catch (e: unknown) {
            logger.error("[MerchantBrain] Inventory check failed", { storeId, productId, error: e });
            return null; // Return null to indicate failure to retrieve (agent should handle this)
        }
    }

    /**
     * Tool: Calculate delivery cost and ETA
     * Deterministic pending based on rules, not hardcoded single value.
     */
    static async getDeliveryQuote(storeId: string, location: string): Promise<DeliveryQuote | null> {
        try {
            // Find a zone that matches the location (simple check)
            const zones = await prisma.deliveryZone.findMany({
                where: { storeId },
            });
            const matchedZone = zones.find((z) =>
                z.name.toLowerCase().includes(location.toLowerCase()) ||
                z.states.some((s) => location.toLowerCase().includes(s.toLowerCase())) ||
                z.cities.some((c) => location.toLowerCase().includes(c.toLowerCase()))
            );
            if (matchedZone) {
                return {
                    location,
                    costKobo: Number(matchedZone.feeAmount) * 100, // Convert Decimal to Kobo (if stored as major unit)
                    estimatedDays: `${matchedZone.etaMinDays}-${matchedZone.etaMaxDays} days`,
                    carrier: "Vayva Logistics (Zone Match)",
                };
            }
            // Fallback: General profile default or Lagos default
            const isLagos = location.toLowerCase().includes("lagos");
            return {
                location,
                costKobo: isLagos ? 150000 : 350000, // 1500 or 3500 NGN
                estimatedDays: isLagos ? "1-2 days" : "3-5 days",
                carrier: "Vayva standard",
            };
        }
        catch (e: unknown) {
            logger.error("[MerchantBrain] Delivery quote failed", { storeId, location, error: e });
            return null;
        }
    }

    static async getDeliveryQuoteV2(storeId: string, location: string) {
        try {
            const base = await this.getDeliveryQuote(storeId, location);
            if (!base) {
                return null;
            }

            const settings = await prisma.storeDeliverySettings.findUnique({
                where: { storeId },
                select: { provider: true, isEnabled: true },
            });

            const provider = settings?.provider || "CUSTOM";
            const chargeable = provider === "KWIK";
            const marginNaira = chargeable ? this.computeDynamicMarginNaira(location, 1000) : 0;
            const baseCostKobo = Number(base.costKobo || 0);
            const marginKobo = marginNaira * 100;
            const totalCostKobo = baseCostKobo + marginKobo;

            return {
                location,
                provider,
                chargeable,
                isDeliveryEnabled: Boolean(settings?.isEnabled),
                baseCostKobo,
                marginKobo,
                totalCostKobo,
                estimatedDays: base.estimatedDays,
                carrier: base.carrier,
            };
        }
        catch (error: unknown) {
            logger.error("[MerchantBrain] Delivery quote v2 failed", { storeId, location, error });
            return null;
        }
    }

    /**
     * Tool: Get active promotions for a store
     */
    static async getActivePromotions(storeId: string) {
        try {
            const now = new Date();
            const promos = await prisma.discountRule.findMany({
                where: {
                    storeId,
                    startsAt: { lte: now },
                    OR: [
                        { endsAt: null },
                        { endsAt: { gte: now } }
                    ]
                },
                take: 5
            });
            return promos.map((p) => ({
                id: p.id,
                name: p.name,
                type: p.type,
                value: p.valueAmount ? `₦${p.valueAmount}` : `${p.valuePercent}%`,
                description: p.requiresCoupon ? "Requires coupon code" : "Automatic discount",
            }));
        }
        catch (e: unknown) {
            logger.error("[MerchantBrain] Promo fetch failed", { storeId, error: e });
            return [];
        }
    }
    /**
     * Admin: Index store catalog for RAG
     */
    static async indexStoreCatalog(storeId: string) {
        // Keep pending as this is a write-action (indexing), 
        // but ensure it doesn't return fake success numbers unless it actually did work.
        return { indexed: 0, skipped: 0, count: 0 };
    }

    /**
     * ML-Powered: Predict sales for the next N days
     * FREE - Uses statistical models, no API cost
     */
    static async predictSales(storeId: string, days: number = 7) {
        try {
            // Get historical order data
            const orders = await prisma.order.findMany({
                where: { storeId, status: { not: "CANCELLED" } },
                select: {
                    createdAt: true,
                    total: true,
                },
                orderBy: { createdAt: "asc" },
                take: 90, // Last 90 days
            });

            if (orders.length < 7) {
                return {
                    ok: false,
                    error: "INSUFFICIENT_DATA",
                    message: "Need at least 7 days of sales data for forecasting",
                };
            }

            // Aggregate by day
            const dailyData: Record<string, { revenue: number; orders: number }> = {};
            for (const order of orders) {
                const date = order.createdAt.toISOString().split("T")[0];
                if (!dailyData[date]) {
                    dailyData[date] = { revenue: 0, orders: 0 };
                }
                dailyData[date].revenue += Number(order.total);
                dailyData[date].orders += 1;
            }

            const historicalData = Object.entries(dailyData).map(([date, data]) => ({
                date,
                revenue: data.revenue,
                orders: data.orders,
            }));

            const ml = new MLInferenceClient();
            const forecast = await ml.predictSales(historicalData, days);

            if (!forecast) {
                return { ok: false, error: "FORECAST_FAILED" };
            }

            return {
                ok: true,
                forecast,
            };
        }
        catch (error: unknown) {
            logger.error("[MerchantBrain] Sales prediction failed", { storeId, error });
            return { ok: false, error: "PREDICTION_ERROR" };
        }
    }

    /**
     * ML-Powered: Analyze customer sentiment from messages
     * FREE - Uses lexicon-based analysis
     */
    static async analyzeSentiment(messages: string[]) {
        try {
            const ml = new MLInferenceClient();
            const sentiments = await Promise.all(
                messages.map(msg => ml.analyzeSentiment(msg))
            );

            // Calculate aggregate sentiment
            const avgScore = sentiments.reduce((sum, s) => sum + s.score, 0) / sentiments.length;
            const positiveCount = sentiments.filter(s => s.label === "positive").length;
            const negativeCount = sentiments.filter(s => s.label === "negative").length;
            const neutralCount = sentiments.filter(s => s.label === "neutral").length;

            // Analyze trend
            const trend = ml.getSentimentAnalyzer().analyzeTrend(sentiments);

            return {
                ok: true,
                summary: {
                    averageScore: Math.round(avgScore * 100) / 100,
                    positive: positiveCount,
                    negative: negativeCount,
                    neutral: neutralCount,
                    total: messages.length,
                },
                trend,
                details: sentiments,
            };
        }
        catch (error: unknown) {
            logger.error("[MerchantBrain] Sentiment analysis failed", { error });
            return { ok: false, error: "ANALYSIS_ERROR" };
        }
    }

    /**
     * ML-Powered: Detect anomalies in sales data
     * FREE - Uses statistical outlier detection
     */
    static async detectSalesAnomalies(storeId: string, days: number = 30) {
        try {
            const orders = await prisma.order.findMany({
                where: {
                    storeId,
                    status: { not: "CANCELLED" },
                    createdAt: {
                        gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000),
                    },
                },
                select: {
                    createdAt: true,
                    total: true,
                },
                orderBy: { createdAt: "asc" },
            });

            // Group by day
            const dailyRevenue: Record<string, number> = {};
            for (const order of orders) {
                const date = order.createdAt.toISOString().split("T")[0];
                dailyRevenue[date] = (dailyRevenue[date] || 0) + Number(order.total);
            }

            const revenues = Object.values(dailyRevenue);
            if (revenues.length < 7) {
                return { ok: false, error: "INSUFFICIENT_DATA" };
            }

            const ml = new MLInferenceClient();
            const anomalies = await ml.detectAnomalies(revenues, 2);

            const anomalyDates = anomalies
                .filter(a => a.isAnomaly)
                .map(a => Object.keys(dailyRevenue)[a.index]);

            return {
                ok: true,
                anomalies: anomalyDates,
                totalAnalyzed: revenues.length,
                hasAnomalies: anomalyDates.length > 0,
            };
        }
        catch (error: unknown) {
            logger.error("[MerchantBrain] Anomaly detection failed", { storeId, error });
            return { ok: false, error: "DETECTION_ERROR" };
        }
    }

    /**
     * ML-Powered: Get product recommendations for a customer
     * FREE - Uses collaborative filtering
     */
    static async getProductRecommendations(
        storeId: string,
        customerId: string,
        limit: number = 5
    ) {
        try {
            // Get customer's purchase history
            const orders = await prisma.order.findMany({
                where: {
                    storeId,
                    customerId,
                    status: { not: "CANCELLED" },
                },
                include: {
                    items: {
                        select: { productId: true },
                    },
                },
                take: 50,
            });

            const purchaseHistory = orders.flatMap(o => 
                o.items.map(i => i.productId)
            );

            // Get all active products
            const products = await prisma.product.findMany({
                where: {
                    storeId,
                    status: "ACTIVE",
                },
                select: {
                    id: true,
                    tags: true,
                    productType: true,
                },
            });

            const ml = new MLInferenceClient();
            const recommendations = await ml.recommendProducts(
                customerId,
                purchaseHistory.filter((id): id is string => id !== null),
                products.map(p => ({
                    id: p.id,
                    category: p.productType || "general",
                    tags: (p.tags as string[]) || [],
                })),
                limit
            );

            // Get full product details
            const productIds = recommendations.map(r => r.productId);
            const productDetails = await prisma.product.findMany({
                where: { id: { in: productIds } },
                select: {
                    id: true,
                    title: true,
                    price: true,
                },
            });

            const productMap = new Map(productDetails.map(p => [p.id, p]));

            return {
                ok: true,
                recommendations: recommendations.map(r => ({
                    ...r,
                    product: productMap.get(r.productId),
                })),
            };
        }
        catch (error: unknown) {
            logger.error("[MerchantBrain] Recommendation failed", { storeId, customerId, error });
            return { ok: false, error: "RECOMMENDATION_ERROR" };
        }
    }

    /**
     * ML-Powered: Suggest price optimization
     * FREE - Uses market analysis
     */
    static async suggestPriceOptimization(storeId: string, productId: string) {
        try {
            const product = await prisma.product.findUnique({
                where: { id: productId },
                select: {
                    id: true,
                    title: true,
                    price: true,
                },
            });

            if (!product) {
                return { ok: false, error: "PRODUCT_NOT_FOUND" };
            }

            // Get competitor prices (same category products)
            const categoryProducts = await prisma.product.findMany({
                where: {
                    storeId,
                    id: { not: productId },
                    status: "ACTIVE",
                },
                select: { price: true },
                take: 20,
            });

            const competitorPrices = categoryProducts
                .map(p => Number(p.price))
                .filter(p => p > 0);

            // Get sales volume for this product
            const salesCount = await prisma.orderItem.count({
                where: {
                    productId,
                    order: {
                        status: { not: "CANCELLED" },
                    },
                },
            });

            const ml = new MLInferenceClient();
            const suggestion = await ml.suggestPriceOptimization(
                Number(product.price),
                salesCount,
                competitorPrices
            );

            return {
                ok: true,
                currentPrice: product.price,
                suggestion,
            };
        }
        catch (error: unknown) {
            logger.error("[MerchantBrain] Price optimization failed", { storeId, productId, error });
            return { ok: false, error: "OPTIMIZATION_ERROR" };
        }
    }
}
