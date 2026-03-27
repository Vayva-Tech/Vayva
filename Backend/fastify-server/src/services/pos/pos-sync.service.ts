import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * POS Sync Service - Backend
 * Manages synchronization between Vayva and POS systems
 */
export class POSSyncService {
  constructor(private readonly db = prisma) {}

  /**
   * Register a new POS device
   */
  async registerDevice(deviceData: any) {
    const { storeId, provider, deviceId, deviceName, locationId } = deviceData;

    // Check if device already exists
    const existing = await this.db.posDevice.findFirst({
      where: {
        storeId,
        provider,
        deviceId,
      },
    });

    if (existing) {
      throw new Error('Device already registered');
    }

    const device = await this.db.posDevice.create({
      data: {
        id: `pos-${Date.now()}`,
        storeId,
        provider,
        deviceId,
        deviceName,
        locationId: locationId || null,
        status: 'active',
        lastSyncStatus: null,
        settings: {
          autoSyncInventory: true,
          autoSyncProducts: true,
          autoSyncOrders: true,
          syncInterval: 15,
          taxMapping: {},
          paymentTypeMapping: {},
          categoryMapping: {},
        },
        apiCredentials: {
          accessToken: deviceData.accessToken || null,
          expiresAt: deviceData.expiresAt || null,
        },
      },
    });

    return device;
  }

  /**
   * Get all devices for a store
   */
  async getStoreDevices(storeId: string) {
    return await this.db.posDevice.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Update device settings
   */
  async updateDeviceSettings(deviceId: string, storeId: string, settings: any) {
    const device = await this.db.posDevice.findFirst({
      where: { id: deviceId, storeId },
    });

    if (!device) {
      throw new Error('Device not found');
    }

    const updated = await this.db.posDevice.update({
      where: { id: deviceId },
      data: {
        settings: {
          ...device.settings,
          ...settings,
        },
      },
    });

    return updated;
  }

  /**
   * Trigger manual sync for a device
   */
  async triggerSync(deviceId: string, syncType: 'inventory' | 'products' | 'orders' | 'full') {
    const device = await this.db.posDevice.findUnique({
      where: { id: deviceId },
    });

    if (!device) {
      throw new Error('Device not found');
    }

    // Update device status
    await this.db.posDevice.update({
      where: { id: deviceId },
      data: {
        status: 'syncing',
        lastSyncStatus: null,
      },
    });

    try {
      const result = await this.performSync(device, syncType);

      // Update device with sync result
      await this.db.posDevice.update({
        where: { id: deviceId },
        data: {
          status: 'active',
          lastSyncAt: new Date(),
          lastSyncStatus: result.status,
        },
      });

      return result;
    } catch (error) {
      logger.error(`[POS] Sync failed for device ${deviceId}:`, error);

      await this.db.posDevice.update({
        where: { id: deviceId },
        data: {
          status: 'error',
          lastSyncAt: new Date(),
          lastSyncStatus: 'failed',
        },
      });

      throw error;
    }
  }

  /**
   * Perform actual sync based on type
   */
  private async performSync(device: any, syncType: string): Promise<any> {
    const startedAt = new Date();
    const stats = {
      productsCreated: 0,
      productsUpdated: 0,
      inventoryUpdated: 0,
      ordersImported: 0,
      errors: [] as any[],
    };

    switch (syncType) {
      case 'inventory':
        // Sync inventory levels
        stats.inventoryUpdated = await this.syncInventory(device);
        break;

      case 'products':
        // Sync product catalog
        const productStats = await this.syncProducts(device);
        stats.productsCreated = productStats.created;
        stats.productsUpdated = productStats.updated;
        break;

      case 'orders':
        // Import orders from POS
        stats.ordersImported = await this.importOrders(device);
        break;

      case 'full':
        // Full sync - all of the above
        const prodStats = await this.syncProducts(device);
        stats.productsCreated = prodStats.created;
        stats.productsUpdated = prodStats.updated;
        stats.inventoryUpdated = await this.syncInventory(device);
        stats.ordersImported = await this.importOrders(device);
        break;
    }

    return {
      deviceId: device.id,
      syncType,
      status: 'success',
      startedAt,
      completedAt: new Date(),
      stats,
    };
  }

  /**
   * Sync inventory from POS to Vayva
   */
  private async syncInventory(device: any): Promise<number> {
    // This would call the POS provider's API
    // For now, simplified implementation
    logger.info(`[POS:${device.provider}] Syncing inventory...`);
    return 0;
  }

  /**
   * Sync products from POS to Vayva
   */
  private async syncProducts(device: any): Promise<{ created: number; updated: number }> {
    logger.info(`[POS:${device.provider}] Syncing products...`);
    return { created: 0, updated: 0 };
  }

  /**
   * Import orders from POS
   */
  private async importOrders(device: any): Promise<number> {
    logger.info(`[POS:${device.provider}] Importing orders...`);
    return 0;
  }

  /**
   * Deactivate a device
   */
  async deactivateDevice(deviceId: string, storeId: string) {
    const device = await this.db.posDevice.findFirst({
      where: { id: deviceId, storeId },
    });

    if (!device) {
      throw new Error('Device not found');
    }

    await this.db.posDevice.update({
      where: { id: deviceId },
      data: { status: 'inactive' },
    });

    return { success: true };
  }

  /**
   * Remove a device
   */
  async removeDevice(deviceId: string, storeId: string) {
    const device = await this.db.posDevice.findFirst({
      where: { id: deviceId, storeId },
    });

    if (!device) {
      throw new Error('Device not found');
    }

    await this.db.posDevice.delete({
      where: { id: deviceId },
    });

    return { success: true };
  }

  /**
   * Get sync history for a device
   */
  async getSyncHistory(deviceId: string, limit = 20) {
    return await this.db.posSyncLog.findMany({
      where: { deviceId },
      orderBy: { startedAt: 'desc' },
      take: limit,
    });
  }
}
