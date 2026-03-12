// Retail API Service Layer

import { MultiChannelService } from '../features/multi-channel';
import { RetailInventoryService } from '../features/inventory';
import { StoreTransferService } from '../features/transfers';
import { LoyaltyProgramService } from '../features/loyalty';
import { StorePerformanceService } from '../features/store-performance';

export class RetailApiService {
  private multiChannel: MultiChannelService;
  private inventory: RetailInventoryService;
  private transfers: StoreTransferService;
  private loyalty: LoyaltyProgramService;
  private storePerformance: StorePerformanceService;

  constructor() {
    this.multiChannel = new MultiChannelService();
    this.inventory = new RetailInventoryService();
    this.transfers = new StoreTransferService();
    this.loyalty = new LoyaltyProgramService();
    this.storePerformance = new StorePerformanceService();
  }

  // Dashboard Data APIs
  async getDashboardAggregate(storeId: string) {
    const [revenue, orders, customers, inventoryValue, conversionRate] =
      await Promise.all([
        this.getRevenueTotal(storeId),
        this.getOrdersTotal(storeId),
        this.getActiveCustomers(storeId),
        this.getInventoryValue(storeId),
        this.getConversionRate(storeId),
      ]);

    return {
      revenue,
      orders,
      customers,
      inventoryValue,
      conversionRate,
    };
  }

  // Channel APIs
  async getChannels(storeId: string) {
    return this.multiChannel.getChannels(storeId);
  }

  async getChannelSales(storeId: string, timeframe: 'today' | '7d' | '30d') {
    return this.multiChannel.getChannelSalesBreakdown(storeId, timeframe);
  }

  async syncChannels(storeId: string) {
    await this.multiChannel.syncInventory(storeId, {
      bufferStock: 5,
      conflictResolution: 'online-priority',
      autoSync: true,
    });
    return { success: true };
  }

  // Store Performance APIs
  async getStores(storeId: string) {
    return this.storePerformance.getAllStoresPerformance(storeId);
  }

  async getStorePerformance(storeId: string, locationId: string) {
    return this.storePerformance.getStoreMetrics(locationId);
  }

  // Inventory APIs
  async getInventoryAlerts(storeId: string) {
    return this.inventory.getInventoryAlerts(storeId, {
      defaultThreshold: 10,
      alertRecipients: ['inventory@store.com'],
      autoReorderEnabled: false,
    });
  }

  async getLowStockSummary(storeId: string) {
    return this.inventory.getLowStockSummary(storeId);
  }

  async adjustInventory(
    storeId: string,
    productId: string,
    adjustment: any
  ) {
    return this.inventory.adjustInventory(storeId, productId, adjustment);
  }

  // Transfer APIs
  async getTransfers(storeId: string) {
    return this.transfers.getPendingTransfers(storeId);
  }

  async createTransfer(storeId: string, transferData: any) {
    return this.transfers.createTransfer(storeId, transferData);
  }

  async approveTransfer(transferId: string, approverId: string) {
    return this.transfers.approveTransfer(transferId, approverId);
  }

  async completeTransfer(transferId: string) {
    return this.transfers.completeTransfer(transferId);
  }

  // Loyalty APIs
  async getLoyaltyStats(storeId: string) {
    return this.loyalty.getLoyaltyStats(storeId);
  }

  async getLoyaltyMembers(storeId: string) {
    return this.loyalty.getMembers(storeId);
  }

  async getCustomerSegments(storeId: string) {
    return this.loyalty.getCustomerSegments(storeId);
  }

  // Order APIs
  async getOrders(storeId: string, filters?: any) {
    // Would integrate with order management system
    return [];
  }

  async createOrder(storeId: string, orderData: any) {
    // Would integrate with order management system
    return { success: true };
  }

  // Helper methods for dashboard aggregation
  private async getRevenueTotal(storeId: string): Promise<number> {
    return this.storePerformance.getTodaySales(storeId).then((r) => r.total);
  }

  private async getOrdersTotal(storeId: string): Promise<number> {
    return this.storePerformance.getTodaySales(storeId).then((r) => r.orders);
  }

  private async getActiveCustomers(storeId: string): Promise<number> {
    const stats = await this.loyalty.getLoyaltyStats(storeId);
    return stats.activeThisMonth;
  }

  private async getInventoryValue(storeId: string): Promise<number> {
    const summary = await this.inventory.getLowStockSummary(storeId);
    return summary.estimatedRestockCost * 10; // Approximate total value
  }

  private async getConversionRate(storeId: string): Promise<number> {
    // Would calculate from actual foot traffic and sales data
    return 0.048;
  }
}
