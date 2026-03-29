import { logger, urls } from "@vayva/shared";

const BACKEND_URL = process.env.BACKEND_API_URL || '';

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
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/merchant-brain/describe-image`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ imageUrl }),
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ error: { message: 'Failed to describe image' } }));
        logger.error('[MerchantBrain] Failed to describe image', error);
        return {
          ok: false,
          error: 'VISION_PROVIDER_ERROR',
        };
      }

      const data = await res.json();
      return data;
    } catch (error) {
      logger.error('[MerchantBrain] describeImage failed', { storeId, imageUrl, error });
      return {
        ok: false,
        error: 'VISION_PROVIDER_ERROR',
      };
    }
  }

  static async searchCatalog(storeId: string, query: string) {
    try {
      const token = await getAuthToken();
      const res = await fetch(
        `${BACKEND_URL}/api/v1/merchant-brain/search-catalog?q=${encodeURIComponent(query)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error('Failed to search catalog');
      }

      const data = await res.json();
      return data;
    } catch (error) {
      logger.error('[MerchantBrain] searchCatalog failed', { storeId, query, error });
      return { results: [] };
    }
  }

  static computeDynamicMarginNaira(location: string, capNaira = 1000) {
    const base = 200;
    const variable = this.computeStableHash((location || '').toLowerCase().trim()) % 801; // 0..800
    return Math.min(base + variable, capNaira);
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static asObject(maybeJson: unknown) {
    if (!maybeJson)
      return {};
    if (typeof maybeJson === "object")
      return maybeJson as Record<string, unknown>;
    return {};
  }

  static normalizePickupLocations(rawSettings: unknown) {
    const settings = this.asObject(rawSettings);
    const list = (settings as Record<string, unknown>).pickupLocations;
    if (!Array.isArray(list))
      return [];
    return list.filter(Boolean);
  }

  static normalizeDeliveryConfig(rawSettings: unknown) {
    const settings = this.asObject(rawSettings);
    const cfg = ((settings as Record<string, unknown>).deliveryConfig || {}) as Record<string, unknown>;
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
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/merchant-brain/fulfillment-policy`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to fetch fulfillment policy');
      }

      const data = await res.json();
      return data;
    } catch (error) {
      logger.error('[MerchantBrain] Fulfillment policy fetch failed', { storeId, error });
      return null;
    }
  }

  /**
   * Retrieve relevant knowledge for a query
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async retrieveContext(storeId: string, query: any, limit = 3) {
    try {
      const token = await getAuthToken();
      const res = await fetch(
        `${BACKEND_URL}/api/v1/merchant-brain/retrieve-context?query=${encodeURIComponent(query)}&limit=${limit}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error('Failed to retrieve context');
      }

      const data = await res.json();
      return data.results || [];
    } catch (error) {
      logger.error('[MerchantBrain] Retrieval failed', {
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async getInventoryStatus(storeId: string, productId: string) {
    try {
      const token = await getAuthToken();
      const res = await fetch(
        `${BACKEND_URL}/api/v1/merchant-brain/inventory-status?productId=${productId}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error('Failed to get inventory status');
      }

      const data = await res.json();
      return data;
    } catch (e) {
      logger.error('[MerchantBrain] Inventory check failed', { storeId, productId, error: e });
      return null;
    }
  }

  /**
   * Tool: Calculate delivery cost and ETA
   */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  static async getDeliveryQuote(storeId: string, location: any) {
    try {
      const token = await getAuthToken();
      const res = await fetch(
        `${BACKEND_URL}/api/v1/merchant-brain/delivery-quote?location=${encodeURIComponent(location)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error('Failed to get delivery quote');
      }

      const data = await res.json();
      return data;
    } catch (e) {
      logger.error('[MerchantBrain] Delivery quote failed', { storeId, location, error: e });
      return null;
    }
  }

  static async getDeliveryQuoteV2(storeId: string, location: string) {
    try {
      const token = await getAuthToken();
      const res = await fetch(
        `${BACKEND_URL}/api/v1/merchant-brain/delivery-quote-v2?location=${encodeURIComponent(location)}`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) {
        throw new Error('Failed to get delivery quote v2');
      }

      const data = await res.json();
      return data;
    } catch (error) {
      logger.error('[MerchantBrain] Delivery quote v2 failed', { storeId, location, error });
      return null;
    }
  }

  /**
   * Tool: Get active promotions for a store
   */
  static async getActivePromotions(storeId: string) {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/merchant-brain/promotions`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to get promotions');
      }

      const data = await res.json();
      return data.promotions || [];
    } catch (e) {
      logger.error('[MerchantBrain] Promo fetch failed', { storeId, error: e });
      return [];
    }
  }

  /**
   * Admin: Index store catalog for RAG
   */
  static async indexStoreCatalog(storeId: string) {
    try {
      const token = await getAuthToken();
      const res = await fetch(`${BACKEND_URL}/api/v1/merchant-brain/index-catalog`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error('Failed to index catalog');
      }

      const data = await res.json();
      return data;
    } catch (e) {
      logger.error('[MerchantBrain] Index catalog failed', { storeId, error: e });
      return { indexed: 0, skipped: 0, count: 0 };
    }
  }
}

/**
 * Get auth token from cookies
 */
async function getAuthToken(): Promise<string | null> {
  try {
    const { cookies } = await import('next/headers');
    const cookieStore = await cookies();
    return cookieStore.get('auth_token')?.value || null;
  } catch {
    return null;
  }
}
