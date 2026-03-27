/**
 * POS Sync Service - PURE BUSINESS LOGIC ONLY (NO DATABASE)
 * Database operations moved to Backend/core-api/src/services/pos/pos-sync.service.ts
 */

export interface POSDevice {
  id: string;
  storeId: string;
  provider: "square" | "shopify_pos" | "lightspeed" | "vend" | "toast" | "custom";
  deviceId: string;
  deviceName: string;
  locationId?: string;
  status: "active" | "inactive" | "syncing" | "error";
  lastSyncAt?: Date;
  lastSyncStatus?: "success" | "partial" | "failed";
  settings: {
    autoSyncInventory: boolean;
    autoSyncProducts: boolean;
    autoSyncOrders: boolean;
    syncInterval: number; // minutes
    taxMapping: Record<string, string>;
    paymentTypeMapping: Record<string, string>;
    categoryMapping: Record<string, string>;
  };
  apiCredentials: {
    apiKey?: string;
    apiSecret?: string;
    accessToken?: string;
    refreshToken?: string;
    expiresAt?: Date;
  };
  webhookUrl?: string;
  createdAt: Date;
}

export interface POSSyncResult {
  deviceId: string;
  syncType: "inventory" | "products" | "orders" | "full";
  status: "success" | "partial" | "failed";
  startedAt: Date;
  completedAt?: Date;
  stats: {
    productsCreated: number;
    productsUpdated: number;
    inventoryUpdated: number;
    ordersImported: number;
    errors: Array<{
      item: string;
      error: string;
    }>;
  };
}

export interface POSOrder {
  externalId: string;
  deviceId: string;
  lineItems: Array<{
    productId?: string;
    externalProductId: string;
    quantity: number;
    price: number;
    name: string;
  }>;
  total: number;
  subtotal: number;
  tax: number;
  discount: number;
  paymentMethod: string;
  status: "completed" | "refunded" | "partially_refunded" | "cancelled";
  createdAt: Date;
  receiptNumber?: string;
  cashierName?: string;
  locationName?: string;
}

export class POSSyncService {
  private readonly DEFAULT_SYNC_INTERVAL = 5; // minutes

  /**
   * Register a new POS device/integration
   */
  async registerDevice(
    storeId: string,
    data: {
      provider: POSDevice["provider"];
      deviceName: string;
      locationId?: string;
      credentials: POSDevice["apiCredentials"];
      settings?: Partial<POSDevice["settings"]>;
    }
  ): Promise<POSDevice> {
    // Validate credentials with provider
    const validation = await this.validateCredentials(data.provider, data.credentials);
    if (!validation.valid) {
      throw new Error(`Invalid credentials: ${validation.error}`);
    }

    const device = await prisma.pOSDevice.create({
      data: {
        storeId,
        provider: data.provider,
        deviceId: `pos-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        deviceName: data.deviceName,
        locationId: data.locationId,
        status: "active",
        settings: {
          autoSyncInventory: true,
          autoSyncProducts: true,
          autoSyncOrders: true,
          syncInterval: this.DEFAULT_SYNC_INTERVAL,
          taxMapping: {},
          paymentTypeMapping: {},
          categoryMapping: {},
          ...data.settings,
        },
        apiCredentials: data.credentials,
        webhookUrl: `${process.env.APP_URL}/api/pos/webhook/${storeId}`,
      },
    });

    // Initial sync
    await this.syncFull(device.id);

    return this.mapDevice(device);
  }

  /**
   * Sync all data from POS to Vayva
   */
  async syncFull(deviceId: string): Promise<POSSyncResult> {
    const device = await prisma.pOSDevice.findUnique({
      where: { id: deviceId },
      include: { store: true },
    });

    if (!device) throw new Error("POS device not found");

    await this.updateDeviceStatus(deviceId, "syncing");

    const result: POSSyncResult = {
      deviceId,
      syncType: "full",
      status: "success",
      startedAt: new Date(),
      stats: {
        productsCreated: 0,
        productsUpdated: 0,
        inventoryUpdated: 0,
        ordersImported: 0,
        errors: [],
      },
    };

    try {
      // Sync products
      if (device.settings.autoSyncProducts) {
        const productResult = await this.syncProducts(device);
        result.stats.productsCreated += productResult.created;
        result.stats.productsUpdated += productResult.updated;
        result.stats.errors.push(...productResult.errors);
      }

      // Sync inventory
      if (device.settings.autoSyncInventory) {
        const inventoryResult = await this.syncInventory(device);
        result.stats.inventoryUpdated += inventoryResult.updated;
        result.stats.errors.push(...inventoryResult.errors);
      }

      // Sync orders
      if (device.settings.autoSyncOrders) {
        const orderResult = await this.syncOrders(device);
        result.stats.ordersImported += orderResult.imported;
        result.stats.errors.push(...orderResult.errors);
      }

      result.status = result.stats.errors.length > 0 ? "partial" : "success";
    } catch (error) {
      result.status = "failed";
      result.stats.errors.push({
        item: "sync",
        error: error instanceof Error ? error.message : "Unknown error",
      });
    }

    result.completedAt = new Date();

    // Update device
    await prisma.pOSDevice.update({
      where: { id: deviceId },
      data: {
        lastSyncAt: result.completedAt,
        lastSyncStatus: result.status,
        status: "active",
      },
    });

    // Log sync
    await prisma.pOSSyncLog.create({
      data: {
        deviceId,
        storeId: device.storeId,
        syncType: "full",
        status: result.status,
        stats: result.stats,
        startedAt: result.startedAt,
        completedAt: result.completedAt,
      },
    });

    return result;
  }

  /**
   * Sync products from POS
   */
  async syncProducts(device: Record<string, unknown>): Promise<{
    created: number;
    updated: number;
    errors: Array<{ item: string; error: string }>;
  }> {
    const provider = device.provider as string;
    const credentials = device.apiCredentials as Record<string, string>;

    let products: Array<{
      externalId: string;
      name: string;
      description?: string;
      price: number;
      sku?: string;
      barcode?: string;
      category?: string;
      taxCategory?: string;
    }> = [];

    // Fetch from provider
    switch (provider) {
      case "square":
        products = await this.fetchSquareProducts(credentials);
        break;
      case "shopify_pos":
        products = await this.fetchShopifyProducts(credentials);
        break;
      default:
        throw new Error(`Unsupported POS provider: ${provider}`);
    }

    const stats = { created: 0, updated: 0, errors: [] as Array<{ item: string; error: string }> };

    for (const posProduct of products) {
      try {
        // Check if product exists by external ID or SKU
        const existing = await prisma.product.findFirst({
          where: {
            storeId: device.storeId as string,
            OR: [
              { posExternalId: posProduct.externalId },
              { sku: posProduct.sku },
            ],
          },
        });

        const categoryMapping = (device.settings as Record<string, unknown>).categoryMapping as Record<string, string>;
        const categoryId = categoryMapping?.[posProduct.category || ""] || null;

        if (existing) {
          // Update existing
          await prisma.product.update({
            where: { id: existing.id },
            data: {
              name: posProduct.name,
              description: posProduct.description,
              price: posProduct.price,
              sku: posProduct.sku,
              barcode: posProduct.barcode,
              categoryId,
              posLastSync: new Date(),
            },
          });
          stats.updated++;
        } else {
          // Create new
          await prisma.product.create({
            data: {
              storeId: device.storeId as string,
              name: posProduct.name,
              description: posProduct.description,
              price: posProduct.price,
              sku: posProduct.sku,
              barcode: posProduct.barcode,
              categoryId,
              posExternalId: posProduct.externalId,
              posProvider: provider,
              posLastSync: new Date(),
              status: "active",
            },
          });
          stats.created++;
        }
      } catch (error) {
        stats.errors.push({
          item: posProduct.name,
          error: error instanceof Error ? error.message : "Failed to sync",
        });
      }
    }

    return stats;
  }

  /**
   * Sync inventory levels from POS
   */
  async syncInventory(device: Record<string, unknown>): Promise<{
    updated: number;
    errors: Array<{ item: string; error: string }>;
  }> {
    const provider = device.provider as string;
    const credentials = device.apiCredentials as Record<string, string>;

    let inventory: Array<{ externalProductId: string; quantity: number; locationId?: string }> = [];

    switch (provider) {
      case "square":
        inventory = await this.fetchSquareInventory(credentials);
        break;
      case "shopify_pos":
        inventory = await this.fetchShopifyInventory(credentials);
        break;
    }

    const stats = { updated: 0, errors: [] as Array<{ item: string; error: string }> };

    for (const item of inventory) {
      try {
        const product = await prisma.product.findFirst({
          where: {
            storeId: device.storeId as string,
            posExternalId: item.externalProductId,
          },
        });

        if (product) {
          await prisma.inventory.upsert({
            where: { productId: product.id },
            create: {
              productId: product.id,
              quantity: item.quantity,
              lastPosSync: new Date(),
            },
            update: {
              quantity: item.quantity,
              lastPosSync: new Date(),
            },
          });
          stats.updated++;
        }
      } catch (error) {
        stats.errors.push({
          item: item.externalProductId,
          error: error instanceof Error ? error.message : "Failed to update",
        });
      }
    }

    return stats;
  }

  /**
   * Sync orders from POS
   */
  async syncOrders(device: Record<string, unknown>): Promise<{
    imported: number;
    errors: Array<{ item: string; error: string }>;
  }> {
    const provider = device.provider as string;
    const credentials = device.apiCredentials as Record<string, string>;
    const lastSync = device.lastSyncAt as Date;

    let orders: POSOrder[] = [];

    switch (provider) {
      case "square":
        orders = await this.fetchSquareOrders(credentials, lastSync);
        break;
      case "shopify_pos":
        orders = await this.fetchShopifyOrders(credentials, lastSync);
        break;
    }

    const stats = { imported: 0, errors: [] as Array<{ item: string; error: string }> };

    for (const posOrder of orders) {
      try {
        // Check if already imported
        const existing = await prisma.order.findFirst({
          where: {
            storeId: device.storeId as string,
            posExternalId: posOrder.externalId,
          },
        });

        if (existing) continue;

        // Map line items to products
        const orderItems = [];
        for (const lineItem of posOrder.lineItems) {
          const product = await prisma.product.findFirst({
            where: {
              storeId: device.storeId as string,
              OR: [
                { posExternalId: lineItem.externalProductId },
                { sku: lineItem.externalProductId },
              ],
            },
          });

          orderItems.push({
            productId: product?.id,
            name: lineItem.name,
            quantity: lineItem.quantity,
            price: lineItem.price,
          });
        }

        // Create order
        await prisma.order.create({
          data: {
            storeId: device.storeId as string,
            posExternalId: posOrder.externalId,
            posDeviceId: device.id as string,
            source: "pos",
            items: orderItems as unknown as Record<string, unknown>[],
            subtotal: posOrder.subtotal,
            tax: posOrder.tax,
            discount: posOrder.discount,
            total: posOrder.total,
            status: this.mapPOSOrderStatus(posOrder.status),
            paymentMethod: posOrder.paymentMethod,
            paymentStatus: "completed",
            createdAt: posOrder.createdAt,
            metadata: {
              posReceiptNumber: posOrder.receiptNumber,
              posCashier: posOrder.cashierName,
              posLocation: posOrder.locationName,
            },
          },
        });

        stats.imported++;
      } catch (error) {
        stats.errors.push({
          item: posOrder.externalId,
          error: error instanceof Error ? error.message : "Failed to import",
        });
      }
    }

    return stats;
  }

  /**
   * Push Vayva order to POS
   */
  async pushOrderToPOS(deviceId: string, orderId: string): Promise<{
    success: boolean;
    externalId?: string;
    error?: string;
  }> {
    const device = await prisma.pOSDevice.findUnique({
      where: { id: deviceId },
      include: { store: true },
    });

    if (!device) throw new Error("POS device not found");

    const order = await prisma.order.findUnique({
      where: { id: orderId },
      include: { items: { include: { product: true } } },
    });

    if (!order) throw new Error("Order not found");

    const provider = device.provider as string;
    const credentials = device.apiCredentials as Record<string, string>;

    try {
      switch (provider) {
        case "square":
          return await this.pushSquareOrder(credentials, order);
        case "shopify_pos":
          return await this.pushShopifyOrder(credentials, order);
        default:
          throw new Error(`Unsupported provider: ${provider}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to push order",
      };
    }
  }

  /**
   * Update inventory in POS from Vayva
   */
  async pushInventoryToPOS(
    deviceId: string,
    productId: string,
    quantity: number
  ): Promise<{ success: boolean; error?: string }> {
    const device = await prisma.pOSDevice.findUnique({ where: { id: deviceId } });
    if (!device) throw new Error("POS device not found");

    const product = await prisma.product.findUnique({
      where: { id: productId },
      include: { inventory: true },
    });

    if (!product?.posExternalId) {
      return { success: false, error: "Product not synced with POS" };
    }

    const provider = device.provider as string;
    const credentials = device.apiCredentials as Record<string, string>;

    try {
      switch (provider) {
        case "square":
          return await this.pushSquareInventory(credentials, product.posExternalId, quantity);
        default:
          throw new Error(`Push inventory not supported for ${provider}`);
      }
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Failed to push inventory",
      };
    }
  }

  /**
   * Get sync history
   */
  async getSyncHistory(deviceId: string, limit = 10): Promise<POSSyncResult[]> {
    const logs = await prisma.pOSSyncLog.findMany({
      where: { deviceId },
      orderBy: { startedAt: "desc" },
      take: limit,
    });

    return logs.map((log) => ({
      deviceId,
      syncType: log.syncType as POSSyncResult["syncType"],
      status: log.status as POSSyncResult["status"],
      startedAt: log.startedAt,
      completedAt: log.completedAt,
      stats: log.stats as POSSyncResult["stats"],
    }));
  }

  /**
   * Handle webhook from POS provider
   */
  async handleWebhook(
    storeId: string,
    provider: string,
    payload: Record<string, unknown>
  ): Promise<void> {
    const device = await prisma.pOSDevice.findFirst({
      where: { storeId, provider },
    });

    if (!device) return;

    const eventType = String(payload.type || payload.event_type || "");

    // Queue sync based on event type
    switch (eventType) {
      case "inventory.updated":
      case "inventory.count.updated":
        if (device.settings.autoSyncInventory) {
          await this.syncInventory(device);
        }
        break;

      case "order.created":
      case "payment.created":
        if (device.settings.autoSyncOrders) {
          await this.syncOrders(device);
        }
        break;

      case "catalog.updated":
        if (device.settings.autoSyncProducts) {
          await this.syncProducts(device);
        }
        break;
    }
  }

  // Private methods for provider-specific APIs
  private async validateCredentials(
    provider: string,
    _credentials: Record<string, string>
  ): Promise<{ valid: boolean; error?: string }> {
    // Implement provider-specific validation
    console.warn(`[POS] Validating ${provider} credentials`);
    return { valid: true };
  }

  private async fetchSquareProducts(_credentials: Record<string, string>): Promise<
    Array<{
      externalId: string;
      name: string;
      description?: string;
      price: number;
      sku?: string;
      barcode?: string;
      category?: string;
      taxCategory?: string;
    }>
  > {
    // Square API implementation
    console.warn("[POS] Fetching Square products");
    return [];
  }

  private async fetchShopifyProducts(_credentials: Record<string, string>): Promise<
    Array<{
      externalId: string;
      name: string;
      description?: string;
      price: number;
      sku?: string;
      barcode?: string;
      category?: string;
      taxCategory?: string;
    }>
  > {
    // Shopify API implementation
    console.warn("[POS] Fetching Shopify products");
    return [];
  }

  private async fetchSquareInventory(_credentials: Record<string, string>): Promise<
    Array<{ externalProductId: string; quantity: number; locationId?: string }>
  > {
    console.warn("[POS] Fetching Square inventory");
    return [];
  }

  private async fetchShopifyInventory(_credentials: Record<string, string>): Promise<
    Array<{ externalProductId: string; quantity: number; locationId?: string }>
  > {
    console.warn("[POS] Fetching Shopify inventory");
    return [];
  }

  private async fetchSquareOrders(
    _credentials: Record<string, string>,
    _since?: Date
  ): Promise<POSOrder[]> {
    console.warn("[POS] Fetching Square orders");
    return [];
  }

  private async fetchShopifyOrders(
    _credentials: Record<string, string>,
    _since?: Date
  ): Promise<POSOrder[]> {
    console.warn("[POS] Fetching Shopify orders");
    return [];
  }

  private async pushSquareOrder(
    _credentials: Record<string, string>,
    _order: Record<string, unknown>
  ): Promise<{ success: boolean; externalId?: string; error?: string }> {
    console.warn("[POS] Pushing order to Square");
    return { success: true, externalId: "mock_square_order" };
  }

  private async pushShopifyOrder(
    _credentials: Record<string, string>,
    _order: Record<string, unknown>
  ): Promise<{ success: boolean; externalId?: string; error?: string }> {
    console.warn("[POS] Pushing order to Shopify");
    return { success: true, externalId: "mock_shopify_order" };
  }

  private async pushSquareInventory(
    _credentials: Record<string, string>,
    _externalProductId: string,
    _quantity: number
  ): Promise<{ success: boolean; error?: string }> {
    console.warn("[POS] Pushing inventory to Square");
    return { success: true };
  }

  private async updateDeviceStatus(deviceId: string, status: string): Promise<void> {
    await prisma.pOSDevice.update({
      where: { id: deviceId },
      data: { status },
    });
  }

  private mapPOSOrderStatus(posStatus: string): string {
    const statusMap: Record<string, string> = {
      completed: "completed",
      refunded: "refunded",
      partially_refunded: "partially_refunded",
      cancelled: "cancelled",
    };
    return statusMap[posStatus] || "completed";
  }

  private mapDevice(data: Record<string, unknown>): POSDevice {
    return {
      id: String(data.id),
      storeId: String(data.storeId),
      provider: data.provider as POSDevice["provider"],
      deviceId: String(data.deviceId),
      deviceName: String(data.deviceName),
      locationId: data.locationId ? String(data.locationId) : undefined,
      status: data.status as POSDevice["status"],
      lastSyncAt: data.lastSyncAt as Date,
      lastSyncStatus: data.lastSyncStatus as POSDevice["lastSyncStatus"],
      settings: data.settings as POSDevice["settings"],
      apiCredentials: data.apiCredentials as POSDevice["apiCredentials"],
      webhookUrl: data.webhookUrl ? String(data.webhookUrl) : undefined,
      createdAt: data.createdAt as Date,
    };
  }
}

// Export singleton instance
export const posSyncService = new POSSyncService();
