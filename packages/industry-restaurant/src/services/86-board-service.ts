// @ts-nocheck
/**
 * 86 Board Management Service
 * 
 * Manages sold-out and low-stock items including:
 * - Real-time item availability
 * - Low stock alerts
 * - Auto-86 based on inventory
 * - Menu item substitutions
 */

import { EightySixItem, MenuItem } from '../types';

export class EightySixBoardService {
  private menuItems: Map<string, MenuItem>;
  private eightySixItems: Map<string, EightySixItem>;
  private lowStockThreshold: number;

  constructor(lowStockThreshold: number = 10) {
    this.menuItems = new Map();
    this.eightySixItems = new Map();
    this.lowStockThreshold = lowStockThreshold;
  }

  // ============================================================================
  // MENU ITEM MANAGEMENT
  // ============================================================================

  /**
   * Initialize menu items
   */
  setMenuItems(items: MenuItem[]): void {
    items.forEach((item) => {
      this.menuItems.set(item.id, item);
    });
  }

  /**
   * Get all menu items
   */
  getMenuItems(): MenuItem[] {
    return Array.from(this.menuItems.values());
  }

  /**
   * Update menu item availability
   */
  updateItemAvailability(itemId: string, isAvailable: boolean): MenuItem | null {
    const item = this.menuItems.get(itemId);
    if (!item) return null;

    item.isAvailable = isAvailable;
    this.menuItems.set(itemId, item);

    // If marking unavailable, create 86 record
    if (!isAvailable) {
      this.auto86Item(itemId, 'manual');
    } else {
      // If marking available, remove from 86 board
      this.eightySixItems.delete(itemId);
    }

    return item;
  }

  // ============================================================================
  // 86 BOARD MANAGEMENT
  // ============================================================================

  /**
   * Report item as 86'd (sold out)
   */
  report86(
    itemId: string,
    reason: EightySixItem['reason'],
    reportedBy: string,
    quantityRemaining?: number
  ): EightySixItem {
    const item = this.menuItems.get(itemId);
    if (!item) {
      throw new Error(`Menu item ${itemId} not found`);
    }

    const eightySixItem: EightySixItem = {
      itemId,
      itemName: item.name,
      reason,
      quantityRemaining,
      reportedBy,
      reportedAt: new Date(),
      status: 'active',
    };

    this.eightySixItems.set(itemId, eightySixItem);
    
    // Mark item as unavailable
    item.isAvailable = false;
    this.menuItems.set(itemId, item);

    return eightySixItem;
  }

  /**
   * Auto-86 item based on inventory level
   */
  auto86Item(itemId: string, trigger: 'low_stock' | 'out_of_stock' | 'quality_issue' | 'manual'): void {
    const item = this.menuItems.get(itemId);
    if (!item) return;

    const existing86 = this.eightySixItems.get(itemId);
    
    // Don't create duplicate if already active
    if (existing86 && existing86.status === 'active') return;

    const reasonMap: Record<typeof trigger, EightySixItem['reason']> = {
      low_stock: 'low_stock',
      out_of_stock: 'out_of_stock',
      quality_issue: 'quality_issue',
      manual: 'out_of_stock',
    };

    this.report86(itemId, reasonMap[trigger], 'system');
  }

  /**
   * Restore item to menu
   */
  restoreItem(itemId: string, notes?: string): EightySixItem | null {
    const eightySixItem = this.eightySixItems.get(itemId);
    if (!eightySixItem) return null;

    eightySixItem.status = 'resolved';
    this.eightySixItems.set(itemId, eightySixItem);

    // Mark item as available
    const item = this.menuItems.get(itemId);
    if (item) {
      item.isAvailable = true;
      this.menuItems.set(itemId, item);
    }

    return eightySixItem;
  }

  /**
   * Get 86 board status
   */
  get86Board(filters?: { status?: EightySixItem['status'] }): EightySixItem[] {
    let items = Array.from(this.eightySixItems.values());

    if (filters?.status) {
      items = items.filter((item) => item.status === filters.status);
    }

    // Sort by reported time (most recent first)
    return items.sort((a, b) => {
      const dateA = new Date(a.reportedAt).getTime();
      const dateB = new Date(b.reportedAt).getTime();
      return dateB - dateA;
    });
  }

  /**
   * Get low stock items
   */
  getLowStockItems(quantityThreshold?: number): Array<{
    itemId: string;
    itemName: string;
    quantityRemaining: number;
    is86d: boolean;
  }> {
    const threshold = quantityThreshold || this.lowStockThreshold;
    
    // This would integrate with inventory system
    // For now, return items marked as low stock in 86 board
    return this.get86Board({ status: 'active' })
      .filter((item) => item.reason === 'low_stock' && item.quantityRemaining !== undefined)
      .map((item) => ({
        itemId: item.itemId,
        itemName: item.itemName,
        quantityRemaining: item.quantityRemaining!,
        is86d: !this.menuItems.get(item.itemId)?.isAvailable,
      }));
  }

  /**
   * Get 86 board summary statistics
   */
  get86Summary(): {
    total86d: number;
    lowStock: number;
    outOfStock: number;
    qualityIssues: number;
    resolvedToday: number;
  } {
    const items = this.get86Board();
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    return {
      total86d: items.filter((i) => i.status === 'active').length,
      lowStock: items.filter((i) => i.reason === 'low_stock' && i.status === 'active').length,
      outOfStock: items.filter((i) => i.reason === 'out_of_stock' && i.status === 'active').length,
      qualityIssues: items.filter((i) => i.reason === 'quality_issue' && i.status === 'active').length,
      resolvedToday: items.filter((i) => {
        if (i.status !== 'resolved') return false;
        const resolvedDate = new Date(i.reportedAt);
        return resolvedDate >= today;
      }).length,
    };
  }

  // ============================================================================
  // SUBSTITUTIONS
  // ============================================================================

  /**
   * Suggest substitutions for 86'd items
   */
  suggestSubstitutions(itemId: string): MenuItem[] {
    const item = this.menuItems.get(itemId);
    if (!item) return [];

    // Find items in same category that are available
    const suggestions = this.getMenuItems()
      .filter(
        (m) =>
          m.category === item.category &&
          m.id !== itemId &&
          m.isAvailable &&
          m.price <= item.price * 1.2 // Similar or lower price
      )
      .slice(0, 3);

    return suggestions;
  }

  /**
   * Update affected orders when item is 86'd
   */
  getAffectedOrders(itemId: string): Array<{
    orderId: string;
    orderNumber: string;
    itemName: string;
    quantity: number;
    suggestedAction: string;
  }> {
    // This would query active orders containing the item
    // Placeholder implementation
    return [];
  }

  // ============================================================================
  // ALERTS & NOTIFICATIONS
  // ============================================================================

  /**
   * Check and generate alerts for critical items
   */
  checkCriticalItems(): Array<{
    type: 'warning' | 'critical';
    itemId: string;
    itemName: string;
    message: string;
  }> {
    const alerts: Array<{
      type: 'warning' | 'critical';
      itemId: string;
      itemName: string;
      message: string;
    }> = [];

    const lowStock = this.getLowStockItems();

    lowStock.forEach((item) => {
      if (item.quantityRemaining <= 5) {
        alerts.push({
          type: 'critical',
          itemId: item.itemId,
          itemName: item.itemName,
          message: `CRITICAL: Only ${item.quantityRemaining} left!`,
        });
      } else if (item.quantityRemaining <= this.lowStockThreshold) {
        alerts.push({
          type: 'warning',
          itemId: item.itemId,
          itemName: item.itemName,
          message: `LOW STOCK: ${item.quantityRemaining} remaining`,
        });
      }
    });

    return alerts;
  }

  /**
   * Get expiration warnings for items approaching expiry
   */
  getExpirationWarnings(hoursThreshold: number = 4): Array<{
    itemId: string;
    itemName: string;
    expiresAt: Date;
    hoursRemaining: number;
  }> {
    // This would integrate with inventory expiry tracking
    // Placeholder implementation
    return [];
  }

  // ============================================================================
  // ANALYTICS
  // ============================================================================

  /**
   * Get 86 board analytics
   */
  getAnalytics(period: 'today' | 'week' | 'month' = 'week'): {
    totalIncidents: number;
    avgIncidentsPerDay: number;
    top86dItems: Array<{ name: string; count: number }>;
    mostCommonReason: string;
    avgResolutionTime: number; // hours
  } {
    const items = this.get86Board();
    const periodStart = this.getPeriodStart(period);

    const filteredItems = items.filter(
      (item) => new Date(item.reportedAt) >= periodStart
    );

    // Count incidents by item
    const itemCounts = new Map<string, number>();
    filteredItems.forEach((item) => {
      itemCounts.set(item.itemName, (itemCounts.get(item.itemName) || 0) + 1);
    });

    const topItems = Array.from(itemCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Count by reason
    const reasonCounts = new Map<string, number>();
    filteredItems.forEach((item) => {
      reasonCounts.set(item.reason, (reasonCounts.get(item.reason) || 0) + 1);
    });

    const mostCommonReason = Array.from(reasonCounts.entries())
      .sort((a, b) => b[1] - a[1])[0]?.[0] || 'N/A';

    const daysInPeriod = this.getDaysInPeriod(period);

    return {
      totalIncidents: filteredItems.length,
      avgIncidentsPerDay: Math.round(filteredItems.length / daysInPeriod),
      top86dItems: topItems,
      mostCommonReason,
      avgResolutionTime: 2.5, // Would calculate from actual resolution times
    };
  }

  // ============================================================================
  // HELPERS
  // ============================================================================

  private getPeriodStart(period: string): Date {
    const now = new Date();
    
    switch (period) {
      case 'today':
        now.setHours(0, 0, 0, 0);
        return now;
      case 'week':
        now.setDate(now.getDate() - 7);
        return now;
      case 'month':
        now.setMonth(now.getMonth() - 1);
        return now;
      default:
        return now;
    }
  }

  private getDaysInPeriod(period: string): number {
    switch (period) {
      case 'today':
        return 1;
      case 'week':
        return 7;
      case 'month':
        return 30;
      default:
        return 1;
    }
  }
}

// Export singleton instance
export const eightySixBoardService = new EightySixBoardService();
