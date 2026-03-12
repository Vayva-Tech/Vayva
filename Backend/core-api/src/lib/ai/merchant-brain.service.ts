import { prisma } from "@vayva/db";
import { logger, urls } from "@vayva/shared";

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

      const isHttpUrl =
        typeof imageUrl === "string" && /^https?:\/\//i.test(imageUrl);
      const isDataUrl =
        typeof imageUrl === "string" && /^data:image\//i.test(imageUrl);
      if (
        !imageUrl ||
        typeof imageUrl !== "string" ||
        (!isHttpUrl && !isDataUrl)
      ) {
        return {
          ok: false,
          error: "INVALID_IMAGE_URL",
        };
      }

      const res = await fetch(`${urls.openaiBase()}/chat/completions`, {
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
                {
                  type: "text",
                  text: "Describe what is in this image for product identification. Return a short description and 3-8 keywords.",
                },
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

      const data = (await res.json()) as {
        choices?: Array<{ message?: { content?: string } }>;
      };
      const text = data?.choices?.[0]?.message?.content || "";
      return {
        ok: true,
        description: text,
      };
    } catch (error) {
      logger.error("[MerchantBrain] describeImage failed", {
        storeId,
        imageUrl,
        error,
      });
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
      for (const row of stockAgg as Array<{
        productId: string;
        _sum: { available: number | null };
      }>) {
        stockMap.set(row.productId, row._sum?.available || 0);
      }

      const results = products.map((p) => {
        const qty = p.trackInventory ? stockMap.get(p.id) || 0 : 999;
        return {
          id: p.id,
          title: p.title,
          price: p.price,
          inStock: qty > 0,
          available: qty,
        };
      });

      return { results };
    } catch (error) {
      logger.error("[MerchantBrain] searchCatalog failed", {
        storeId,
        query,
        error,
      });
      return { results: [] };
    }
  }

  static computeDynamicMarginNaira(location: string, capNaira = 1000) {
    const base = 200;
    const variable =
      this.computeStableHash((location || "").toLowerCase().trim()) % 801; // 0..800
    return Math.min(base + variable, capNaira);
  }

  static asObject(maybeJson: unknown) {
    if (!maybeJson) return {};
    if (typeof maybeJson === "object")
      return maybeJson as Record<string, unknown>;
    return {};
  }

  static normalizePickupLocations(rawSettings: unknown) {
    const settings = this.asObject(rawSettings);
    const list = (settings as Record<string, unknown>).pickupLocations;
    if (!Array.isArray(list)) return [];
    return list.filter(Boolean);
  }

  static normalizeDeliveryConfig(rawSettings: unknown) {
    const settings = this.asObject(rawSettings);
    const cfg = ((settings as Record<string, unknown>).deliveryConfig ||
      {}) as Record<string, unknown>;
    return {
      deliveryRadiusKm: Number(cfg.deliveryRadiusKm ?? 10),
      baseDeliveryFee: Number(cfg.baseDeliveryFee ?? 1000),
      deliveryFeeType: cfg.deliveryFeeType === "DISTANCE" ? "DISTANCE" : "FLAT",
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
        store.deliverySettings?.pickupAddressLine1,
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
            ]
              .filter(Boolean)
              .join(", "),
            city: store.deliverySettings?.pickupCity || "",
            state: store.deliverySettings?.pickupState || "",
            isPickupPoint: true,
            isDefault: true,
          }
        : null;

      const normalizedPickupLocations = pickupLocations.map((l) => ({
        id: l.id,
        name: l.name,
        address: l.address,
        city: l.city,
        state: l.state,
        isPickupPoint: Boolean(l.isPickupPoint),
        isDefault: Boolean(l.isDefault),
      }));

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
          allowImageUnderstanding: Boolean(
            store.agent?.allowImageUnderstanding,
          ),
        },
        marginPolicy: {
          type: "DYNAMIC",
          capNaira: 1000,
        },
      };
    } catch (error) {
      logger.error("[MerchantBrain] Fulfillment policy fetch failed", {
        storeId,
        error,
      });
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
    } catch (error) {
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
      if (!product) return null;
      // Logic: if any variant is in stock, product is in stock.
      // We assume 'inventoryItems' holds the quantity in 'available' field.
      const totalStock = await prisma.inventoryItem.groupBy({
        by: ["productId"],
        where: { productId: product.id },
        _sum: {
          available: true,
        },
      });
      const quantity = totalStock[0]?._sum.available || 0;
      return {
        productId,
        name: product.title,
        status:
          quantity > 0 || !product.trackInventory ? "IN_STOCK" : "OUT_OF_STOCK",
        available: product.trackInventory ? quantity : 999,
      };
    } catch (e) {
      logger.error("[MerchantBrain] Inventory check failed", {
        storeId,
        productId,
        error: e,
      });
      return null; // Return null to indicate failure to retrieve (agent should handle this)
    }
  }

  /**
   * Tool: Calculate delivery cost and ETA
   * Deterministic pending based on rules, not hardcoded single value.
   */
  static async getDeliveryQuote(storeId: string, location: string) {
    try {
      // Find a zone that matches the location (simple check)
      const zones = await prisma.deliveryZone.findMany({
        where: { storeId },
      });
      const matchedZone = zones.find(
        (z) =>
          z.name.toLowerCase().includes(location.toLowerCase()) ||
          z.states.some((s) =>
            location.toLowerCase().includes(s.toLowerCase()),
          ) ||
          z.cities.some((c) =>
            location.toLowerCase().includes(c.toLowerCase()),
          ),
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
    } catch (e) {
      logger.error("[MerchantBrain] Delivery quote failed", {
        storeId,
        location,
        error: e,
      });
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
      const marginNaira = chargeable
        ? this.computeDynamicMarginNaira(location, 1000)
        : 0;
      const baseCostKobo = Number(
        (base as Record<string, unknown>).costKobo || 0,
      );
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
        estimatedDays: (base as Record<string, unknown>).estimatedDays,
        carrier: (base as Record<string, unknown>).carrier,
      };
    } catch (error) {
      logger.error("[MerchantBrain] Delivery quote v2 failed", {
        storeId,
        location,
        error,
      });
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
          OR: [{ endsAt: null }, { endsAt: { gte: now } }],
        },
        take: 5,
      });
      return promos.map((p) => ({
        id: p.id,
        name: p.name,
        type: p.type,
        value: p.valueAmount ? `₦${p.valueAmount}` : `${p.valuePercent}%`,
        description: p.requiresCoupon
          ? "Requires coupon code"
          : "Automatic discount",
      }));
    } catch (e) {
      logger.error("[MerchantBrain] Promo fetch failed", { storeId, error: e });
      return [];
    }
  }
  /**
   * Admin: Index store catalog for RAG
   */
  static async indexStoreCatalog(_storeId: string) {
    // Keep pending as this is a write-action (indexing),
    // but ensure it doesn't return fake success numbers unless it actually did work.
    return { indexed: 0, skipped: 0, count: 0 };
  }
}
