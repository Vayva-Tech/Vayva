import { fashionPrisma as prisma } from '../lib/prisma-fashion';
import type { DemandForecast } from './demand-forecast';

// ============================================================================
// Auto-Replenishment Types
// ============================================================================

export type TriggerType = 'stock-level' | 'forecast-based' | 'days-of-stock' | 'manual';

export type ReorderQuantityType = 'fixed' | 'forecast-based' | 'economic-order-quantity' | 'supplier-minimum';

export interface ReplenishmentRule {
  id: string;
  storeId: string;
  productId: string;
  enabled: boolean;
  triggerType: TriggerType;
  triggerValue: number; // units, %, or days depending on triggerType
  reorderQuantityType: ReorderQuantityType;
  reorderQuantity?: number; // fixed quantity or EOQ value
  leadTimeDays: number;
  supplierId?: string;
  safetyStockDays?: number;
  lastTriggeredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrder {
  id: string;
  storeId: string;
  supplierId: string;
  status: 'draft' | 'pending' | 'confirmed' | 'shipped' | 'received' | 'cancelled';
  expectedDeliveryDate?: Date;
  totalAmount: number;
  currency: string;
  items: PurchaseOrderItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface PurchaseOrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  sku?: string;
}

export interface SupplierInfo {
  id: string;
  name: string;
  leadTimeDays: number;
  minimumOrderQuantity: number;
  terms: string; // e.g., "Net 30"
}

// ============================================================================
// Auto-Replenishment Service
// ============================================================================

export class AutoReplenishmentService {
  /**
   * Get all auto-replenishment rules for a store
   */
  async getRules(storeId: string): Promise<ReplenishmentRule[]> {
    const rules = await prisma.autoReplenishmentRule.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });

    return rules.map(this.mapRuleFromDb);
  }

  /**
   * Create a new auto-replenishment rule
   */
  async createRule(
    storeId: string,
    data: Omit<ReplenishmentRule, 'id' | 'createdAt' | 'updatedAt' | 'lastTriggeredAt'>
  ): Promise<ReplenishmentRule> {
    const rule = await prisma.autoReplenishmentRule.create({
      data: {
        storeId,
        productId: data.productId,
        enabled: data.enabled,
        triggerType: data.triggerType,
        triggerValue: data.triggerValue,
        reorderQuantityType: data.reorderQuantityType,
        reorderQuantity: data.reorderQuantity,
        leadTimeDays: data.leadTimeDays,
        supplierId: data.supplierId,
        safetyStockDays: data.safetyStockDays,
      },
    });

    return this.mapRuleFromDb(rule);
  }

  /**
   * Update an existing auto-replenishment rule
   */
  async updateRule(
    id: string,
    data: Partial<Omit<ReplenishmentRule, 'id' | 'storeId' | 'createdAt' | 'updatedAt' | 'lastTriggeredAt'>>
  ): Promise<ReplenishmentRule> {
    const rule = await prisma.autoReplenishmentRule.update({
      where: { id },
      data: {
        enabled: data.enabled,
        triggerType: data.triggerType,
        triggerValue: data.triggerValue,
        reorderQuantityType: data.reorderQuantityType,
        reorderQuantity: data.reorderQuantity,
        leadTimeDays: data.leadTimeDays,
        supplierId: data.supplierId,
        safetyStockDays: data.safetyStockDays,
      },
    });

    return this.mapRuleFromDb(rule);
  }

  /**
   * Delete an auto-replenishment rule
   */
  async deleteRule(id: string): Promise<void> {
    await prisma.autoReplenishmentRule.delete({
      where: { id },
    });
  }

  /**
   * Check all rules and trigger replenishment when needed
   */
  async checkAndTriggerReplenishment(storeId: string): Promise<{
    triggered: string[]; // Product IDs that triggered
    purchaseOrdersCreated: string[]; // PO IDs created
    skipped: string[]; // Product IDs that were evaluated but not triggered
  }> {
    const rules = await this.getRules(storeId);
    const enabledRules = rules.filter(rule => rule.enabled);

    const triggered: string[] = [];
    const purchaseOrdersCreated: string[] = [];
    const skipped: string[] = [];

    for (const rule of enabledRules) {
      const shouldTrigger = await this.evaluateRule(rule);
      
      if (shouldTrigger) {
        const poId = await this.createPurchaseOrderForRule(rule);
        if (poId) {
          triggered.push(rule.productId);
          purchaseOrdersCreated.push(poId);
          
          // Update last triggered timestamp
          await prisma.autoReplenishmentRule.update({
            where: { id: rule.id },
            data: { lastTriggeredAt: new Date() },
          });
        }
      } else {
        skipped.push(rule.productId);
      }
    }

    return { triggered, purchaseOrdersCreated, skipped };
  }

  /**
   * Manually trigger replenishment for a specific product
   */
  async triggerManualReplenishment(
    storeId: string,
    productId: string,
    quantity?: number
  ): Promise<string | null> {
    const rule = await prisma.autoReplenishmentRule.findUnique({
      where: {
        storeId_productId: { storeId, productId },
      },
    });

    if (!rule || !rule.enabled) {
      // Create temporary rule for manual trigger
      const tempRule: ReplenishmentRule = {
        id: `temp-${Date.now()}`,
        storeId,
        productId,
        enabled: true,
        triggerType: 'manual',
        triggerValue: quantity || 10, // default quantity
        reorderQuantityType: 'fixed',
        reorderQuantity: quantity,
        leadTimeDays: 7, // default lead time
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      
      return this.createPurchaseOrderForRule(tempRule);
    }

    return this.createPurchaseOrderForRule(this.mapRuleFromDb(rule));
  }

  /**
   * Get supplier information for a product
   */
  async getSupplierInfo(productId: string): Promise<SupplierInfo | null> {
    // This would typically query a suppliers table or product-supplier relationships
    // For now, returning mock data
    return {
      id: 'supplier-1',
      name: 'Primary Fashion Supplier',
      leadTimeDays: 14,
      minimumOrderQuantity: 50,
      terms: 'Net 30',
    };
  }

  /**
   * Calculate economic order quantity (EOQ)
   */
  async calculateEOQ(
    productId: string,
    annualDemand: number,
    orderingCost: number,
    holdingCost: number
  ): Promise<number> {
    if (holdingCost <= 0) return 100; // fallback value
    
    const eoq = Math.sqrt((2 * annualDemand * orderingCost) / holdingCost);
    return Math.ceil(eoq);
  }

  /**
   * Get current inventory status for a product
   */
  private async getProductInventory(productId: string, storeId: string): Promise<{
    totalInventory: number;
    reserved: number;
    available: number;
    daysOfStock: number;
    avgDailySales: number;
  }> {
    // This would integrate with the inventory service
    // For now, returning mock data
    return {
      totalInventory: 150,
      reserved: 20,
      available: 130,
      daysOfStock: 45,
      avgDailySales: 3,
    };
  }

  /**
   * Evaluate whether a rule should trigger
   */
  private async evaluateRule(rule: ReplenishmentRule): Promise<boolean> {
    const inventory = await this.getProductInventory(rule.productId, rule.storeId);
    
    switch (rule.triggerType) {
      case 'stock-level':
        return inventory.available <= rule.triggerValue;
        
      case 'days-of-stock':
        return inventory.daysOfStock <= rule.triggerValue;
        
      case 'forecast-based':
        // Would integrate with demand forecasting service
        // For now, simple check
        return inventory.daysOfStock <= (rule.leadTimeDays + (rule.safetyStockDays || 7));
        
      case 'manual':
        return false; // Manual triggers are handled separately
        
      default:
        return false;
    }
  }

  /**
   * Create purchase order based on rule configuration
   */
  private async createPurchaseOrderForRule(rule: ReplenishmentRule): Promise<string | null> {
    const supplier = await this.getSupplierInfo(rule.productId);
    if (!supplier) {
      console.warn(`No supplier found for product ${rule.productId}`);
      return null;
    }

    let orderQuantity = 0;

    switch (rule.reorderQuantityType) {
      case 'fixed':
        orderQuantity = rule.reorderQuantity || 100;
        break;
        
      case 'forecast-based':
        // Would use demand forecast to calculate quantity
        orderQuantity = rule.reorderQuantity || 200;
        break;
        
      case 'economic-order-quantity': {
        // Calculate EOQ
        const eoq = await this.calculateEOQ(rule.productId, 1000, 50, 2);
        orderQuantity = Math.max(eoq, supplier.minimumOrderQuantity);
        break;
      }
        
      case 'supplier-minimum':
        orderQuantity = supplier.minimumOrderQuantity;
        break;
    }

    if (orderQuantity <= 0) {
      return null;
    }

    // Create purchase order
    const po = await prisma.purchaseOrder.create({
      data: {
        storeId: rule.storeId,
        supplierId: supplier.id,
        status: 'draft',
        expectedDeliveryDate: new Date(Date.now() + supplier.leadTimeDays * 24 * 60 * 60 * 1000),
        totalAmount: orderQuantity * 25, // Mock unit price
        currency: 'USD',
      },
    });

    // Create purchase order item
    await prisma.purchaseOrderItem.create({
      data: {
        purchaseOrderId: po.id,
        productId: rule.productId,
        quantity: orderQuantity,
        unitPrice: 25, // Mock unit price
      },
    });

    return po.id;
  }

  /**
   * Map database rule to our interface
   */
  private mapRuleFromDb(dbRule: any): ReplenishmentRule {
    return {
      id: dbRule.id,
      storeId: dbRule.storeId,
      productId: dbRule.productId,
      enabled: dbRule.enabled,
      triggerType: dbRule.triggerType as TriggerType,
      triggerValue: Number(dbRule.triggerValue),
      reorderQuantityType: dbRule.reorderQuantityType as ReorderQuantityType,
      reorderQuantity: dbRule.reorderQuantity ? Number(dbRule.reorderQuantity) : undefined,
      leadTimeDays: dbRule.leadTimeDays,
      supplierId: dbRule.supplierId ?? undefined,
      safetyStockDays: dbRule.safetyStockDays ?? undefined,
      lastTriggeredAt: dbRule.lastTriggeredAt ?? undefined,
      createdAt: dbRule.createdAt,
      updatedAt: dbRule.updatedAt,
    };
  }
}

export const autoReplenishment = new AutoReplenishmentService();