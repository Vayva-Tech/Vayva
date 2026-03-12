/**
 * 86 Manager Service
 * Manages sold-out items across all channels
 */

import {
  type EightySixConfig,
  type EightySixItem,
  type EightySixReason,
  type EightySixChannel,
  type EightySixEvent,
  type EightySixStats,
  type Auto86Rule,
  type EightySixNotification,
} from '../../types/eighty-six.js';

export interface EightySixAction {
  menuItemId: string;
  name: string;
  reason: EightySixReason;
  reasonDetails?: string;
  channels: EightySixChannel[];
  estimatedRestock?: Date;
  userId: string;
  userName: string;
}

export interface RestockAction {
  eightySixId: string;
  userId: string;
  userName: string;
}

export class EightySixService {
  private config: EightySixConfig;
  private active86s: Map<string, EightySixItem> = new Map();
  private history: EightySixEvent[] = [];
  private autoRules: Map<string, Auto86Rule> = new Map();
  private listeners: Set<(event: EightySixEvent) => void> = new Set();
  private ingredientToItems: Map<string, string[]> = new Map(); // ingredientId -> menuItemIds

  constructor(config: EightySixConfig) {
    this.config = config;
  }

  /**
   * Initialize the 86 service
   */
  async initialize(): Promise<void> {
    // Load active 86s from database
    // Load auto-86 rules
  }

  /**
   * 86 an item (mark as sold out)
   */
  async eightySixItem(action: EightySixAction): Promise<EightySixItem> {
    const id = this.generateId();
    const now = new Date();

    // Calculate estimated restock if not provided
    let estimatedRestock = action.estimatedRestock;
    if (!estimatedRestock && this.config.autoRestockEstimate) {
      estimatedRestock = new Date(now.getTime() + this.config.restockLeadTimeMinutes * 60000);
    }

    // Determine affected items (other menu items using same ingredients)
    const affectedItems = this.getAffectedItems(action.menuItemId);

    // Determine which channels to disable
    const channelsToDisable = action.channels.length > 0
      ? action.channels
      : this.config.channelSync;

    const eightySixItem: EightySixItem = {
      id,
      menuItemId: action.menuItemId,
      name: action.name,
      reason: action.reason,
      reasonDetails: action.reasonDetails,
      eightySixedAt: now,
      eightySixedBy: action.userId,
      estimatedRestock,
      affectedItems,
      channelsDisabled: channelsToDisable,
      isActive: true,
    };

    this.active86s.set(id, eightySixItem);

    // Record event
    const event: EightySixEvent = {
      id: this.generateId(),
      itemId: id,
      type: 'eighty_sixed',
      timestamp: now,
      userId: action.userId,
      userName: action.userName,
      details: action.reasonDetails,
    };
    this.history.push(event);
    this.emit(event);

    // Sync to channels
    await this.syncToChannels(eightySixItem, 'disable');

    // Notify staff if enabled
    if (this.config.staffNotification) {
      await this.notifyStaff(eightySixItem, 'new_86');
    }

    return eightySixItem;
  }

  /**
   * Restock an item (remove 86)
   */
  async restockItem(action: RestockAction): Promise<EightySixItem | undefined> {
    const item = this.active86s.get(action.eightySixId);
    if (!item) return undefined;

    const now = new Date();

    item.isActive = false;
    item.restockedAt = now;
    item.restockedBy = action.userId;

    // Keep in map but marked inactive, or move to history
    this.active86s.delete(action.eightySixId);

    // Record event
    const event: EightySixEvent = {
      id: this.generateId(),
      itemId: action.eightySixId,
      type: 'restocked',
      timestamp: now,
      userId: action.userId,
      userName: action.userName,
    };
    this.history.push(event);
    this.emit(event);

    // Sync to channels
    await this.syncToChannels(item, 'enable');

    // Notify staff
    if (this.config.staffNotification) {
      await this.notifyStaff(item, 'restocked');
    }

    return item;
  }

  /**
   * Get active 86s
   */
  getActive86s(): EightySixItem[] {
    return Array.from(this.active86s.values())
      .filter(item => item.isActive)
      .sort((a, b) => b.eightySixedAt.getTime() - a.eightySixedAt.getTime());
  }

  /**
   * Get 86 by ID
   */
  getEightySix(id: string): EightySixItem | undefined {
    return this.active86s.get(id);
  }

  /**
   * Check if a menu item is 86'd
   */
  isItemEightySixed(menuItemId: string, channel?: EightySixChannel): boolean {
    for (const item of this.active86s.values()) {
      if (item.menuItemId === menuItemId && item.isActive) {
        if (!channel) return true;
        return item.channelsDisabled.includes(channel);
      }
    }
    return false;
  }

  /**
   * Check if a menu item is 86'd for a specific channel
   */
  isItemEightySixedForChannel(menuItemId: string, channel: EightySixChannel): boolean {
    return this.isItemEightySixed(menuItemId, channel);
  }

  /**
   * Get 86 stats
   */
  getStats(): EightySixStats {
    const active = this.getActive86s();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000);

    // Count today's 86s
    const today86s = this.history.filter(
      e => e.type === 'eighty_sixed' && e.timestamp >= today
    ).length;

    // Count week's 86s
    const week86s = this.history.filter(
      e => e.type === 'eighty_sixed' && e.timestamp >= weekAgo
    ).length;

    // Most 86'd items
    const itemCounts = new Map<string, { name: string; count: number }>();
    for (const event of this.history) {
      if (event.type === 'eighty_sixed') {
        const item = this.active86s.get(event.itemId) || this.findInHistory(event.itemId);
        if (item) {
          const existing = itemCounts.get(item.menuItemId);
          if (existing) {
            existing.count++;
          } else {
            itemCounts.set(item.menuItemId, { name: item.name, count: 1 });
          }
        }
      }
    }

    const most86dItems = Array.from(itemCounts.entries())
      .map(([menuItemId, data]) => ({ menuItemId, ...data }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    // Average restock time
    const restockedItems = this.history.filter(e => e.type === 'restocked');
    let avgRestockTimeMinutes = 0;
    if (restockedItems.length > 0) {
      let totalMinutes = 0;
      let count = 0;
      for (const restockEvent of restockedItems) {
        const eightySixEvent = this.history.find(
          e => e.itemId === restockEvent.itemId && e.type === 'eighty_sixed'
        );
        if (eightySixEvent) {
          totalMinutes += (restockEvent.timestamp.getTime() - eightySixEvent.timestamp.getTime()) / 60000;
          count++;
        }
      }
      avgRestockTimeMinutes = count > 0 ? Math.round(totalMinutes / count) : 0;
    }

    return {
      active86s: active.length,
      today86s,
      week86s,
      most86dItems,
      avgRestockTimeMinutes,
    };
  }

  /**
   * Register ingredient to menu item mapping for auto-86
   */
  registerIngredientMapping(ingredientId: string, menuItemIds: string[]): void {
    this.ingredientToItems.set(ingredientId, menuItemIds);
  }

  /**
   * Check inventory and auto-86 if needed
   */
  async checkInventoryAndAuto86(
    ingredientId: string,
    currentQuantity: number,
    userId: string,
    userName: string
  ): Promise<EightySixItem[]> {
    if (!this.config.auto86) return [];

    const affectedMenuItems = this.ingredientToItems.get(ingredientId) || [];
    const eightySixedItems: EightySixItem[] = [];

    // Check if below threshold
    if (currentQuantity <= this.config.thresholdQuantity) {
      for (const menuItemId of affectedMenuItems) {
        // Check if already 86'd
        if (this.isItemEightySixed(menuItemId)) continue;

        const item = await this.eightySixItem({
          menuItemId,
          name: this.getMenuItemName(menuItemId),
          reason: 'ingredient_unavailable',
          reasonDetails: `Auto-86'd due to low inventory of ingredient ${ingredientId}`,
          channels: this.config.channelSync,
          userId,
          userName,
        });

        eightySixedItems.push(item);
      }
    }

    return eightySixedItems;
  }

  /**
   * Add auto-86 rule
   */
  addAuto86Rule(rule: Auto86Rule): void {
    this.autoRules.set(rule.id, rule);
  }

  /**
   * Remove auto-86 rule
   */
  removeAuto86Rule(ruleId: string): void {
    this.autoRules.delete(ruleId);
  }

  /**
   * Get auto-86 rules
   */
  getAuto86Rules(): Auto86Rule[] {
    return Array.from(this.autoRules.values());
  }

  /**
   * Extend an 86 (update estimated restock time)
   */
  async extendEightySix(
    eightySixId: string,
    newEstimatedRestock: Date,
    userId: string,
    userName: string
  ): Promise<EightySixItem | undefined> {
    const item = this.active86s.get(eightySixId);
    if (!item) return undefined;

    item.estimatedRestock = newEstimatedRestock;

    // Record event
    const event: EightySixEvent = {
      id: this.generateId(),
      itemId: eightySixId,
      type: 'extended',
      timestamp: new Date(),
      userId,
      userName,
      details: `Restock time extended to ${newEstimatedRestock.toISOString()}`,
    };
    this.history.push(event);
    this.emit(event);

    return item;
  }

  /**
   * Get 86 history for a menu item
   */
  getHistoryForItem(menuItemId: string): EightySixEvent[] {
    const itemIds = Array.from(this.active86s.values())
      .filter(item => item.menuItemId === menuItemId)
      .map(item => item.id);

    return this.history.filter(e => itemIds.includes(e.itemId));
  }

  /**
   * Subscribe to 86 events
   */
  subscribe(listener: (event: EightySixEvent) => void): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  /**
   * Get items that will be restocked soon
   */
  getUpcomingRestocks(withinMinutes: number = 30): EightySixItem[] {
    const cutoff = new Date(Date.now() + withinMinutes * 60000);
    return this.getActive86s().filter(
      item => item.estimatedRestock && item.estimatedRestock <= cutoff
    );
  }

  private async syncToChannels(
    item: EightySixItem,
    action: 'disable' | 'enable'
  ): Promise<void> {
    // This would integrate with:
    // - POS system
    // - Online ordering platform
    // - Delivery platforms
    // - KDS
    // - Kiosks
    // - Third-party integrations

    for (const channel of item.channelsDisabled) {
      try {
        await this.syncToChannel(channel, item, action);
      } catch (error) {
        console.error(`Failed to sync 86 to channel ${channel}:`, error);
      }
    }
  }

  private async syncToChannel(
    channel: EightySixChannel,
    item: EightySixItem,
    action: 'disable' | 'enable'
  ): Promise<void> {
    // Implementation would depend on channel-specific APIs
    // This is a placeholder for the actual integration
    console.log(`Syncing ${action} for ${item.name} to ${channel}`);
  }

  private async notifyStaff(
    item: EightySixItem,
    type: 'new_86' | 'restocked' | 'low_inventory_warning'
  ): Promise<void> {
    const notification: EightySixNotification = {
      id: this.generateId(),
      itemId: item.id,
      type,
      message: type === 'new_86'
        ? `${item.name} has been 86'd (${item.reason})`
        : `${item.name} has been restocked`,
      channels: this.config.notificationChannels,
      sent: false,
      recipients: [], // Would be populated from staff settings
    };

    // Send notifications via configured channels
    for (const channel of notification.channels) {
      try {
        await this.sendNotification(channel, notification);
        notification.sent = true;
      } catch (error) {
        console.error(`Failed to send ${channel} notification:`, error);
      }
    }
  }

  private async sendNotification(
    channel: 'push' | 'sms' | 'email' | 'in_app',
    notification: EightySixNotification
  ): Promise<void> {
    // Implementation would integrate with notification services
    console.log(`Sending ${channel} notification: ${notification.message}`);
  }

  private getAffectedItems(menuItemId: string): string[] {
    // Find other menu items that share ingredients with this item
    const affected: string[] = [];
    for (const [ingredientId, menuItems] of this.ingredientToItems) {
      if (menuItems.includes(menuItemId)) {
        for (const otherItem of menuItems) {
          if (otherItem !== menuItemId && !affected.includes(otherItem)) {
            affected.push(otherItem);
          }
        }
      }
    }
    return affected;
  }

  private findInHistory(itemId: string): EightySixItem | undefined {
    // Search through history to find item details
    const event = this.history.find(e => e.itemId === itemId);
    if (!event) return undefined;

    // Reconstruct item from history (simplified)
    return {
      id: itemId,
      menuItemId: '', // Would need to store this in events
      name: '',
      reason: 'sold_out',
      eightySixedAt: event.timestamp,
      eightySixedBy: event.userId,
      affectedItems: [],
      channelsDisabled: [],
      isActive: false,
    };
  }

  private getMenuItemName(menuItemId: string): string {
    // Would lookup from menu/item service
    return `Menu Item ${menuItemId}`;
  }

  private generateId(): string {
    return `86_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private emit(event: EightySixEvent): void {
    for (const listener of this.listeners) {
      try {
        listener(event);
      } catch (error) {
        console.error('Error in 86 event listener:', error);
      }
    }
  }
}
