import { NotificationDispatcher } from './services/notification-dispatcher.service';
import { RuleEngine } from './services/rule-engine.service';
import { QuietHoursEnforcer } from './services/quiet-hours-enforcer.service';
import { 
  NotificationPayload, 
  DispatchResult,
  NotificationRule 
} from './types/index';

/**
 * NotificationEngine - Main orchestrator for the notification system
 * 
 * Responsibilities:
 * - Coordinate all notification services
 * - Handle event-driven notifications
 * - Manage rule evaluation and execution
 * - Provide unified API for notification sending
 * - Handle system-wide configuration
 */
export class NotificationEngine {
  private dispatcher: NotificationDispatcher;
  private ruleEngine: RuleEngine;
  private quietHoursEnforcer: QuietHoursEnforcer;
  private isInitialized: boolean = false;

  constructor() {
    this.dispatcher = new NotificationDispatcher();
    this.ruleEngine = new RuleEngine();
    this.quietHoursEnforcer = new QuietHoursEnforcer();
  }

  /**
   * Initialize the notification engine
   */
  async initialize(): Promise<void> {
    if (this.isInitialized) {
      console.warn('[NotificationEngine] Already initialized');
      return;
    }

    try {
      console.log('[NotificationEngine] Initializing...');
      
      // Initialize all services
      // In a real implementation, services might need async initialization
      
      this.isInitialized = true;
      console.log('[NotificationEngine] Initialization complete');
    } catch (error) {
      console.error('[NotificationEngine] Initialization failed:', error);
      throw error;
    }
  }

  /**
   * Send a notification directly (bypasses rules)
   */
  async send(payload: NotificationPayload): Promise<DispatchResult[]> {
    if (!this.isInitialized) {
      throw new Error('NotificationEngine not initialized. Call initialize() first.');
    }

    return await this.dispatcher.dispatch(payload);
  }

  /**
   * Process an event and trigger relevant notifications
   */
  async processEvent(event: {
    type: string;
    data: Record<string, unknown>;
    storeId?: string;
    userId?: string;
  }): Promise<{
    directNotifications: DispatchResult[];
    ruleTriggeredNotifications: DispatchResult[];
  }> {
    if (!this.isInitialized) {
      throw new Error('NotificationEngine not initialized. Call initialize() first.');
    }

    const results = {
      directNotifications: [] as DispatchResult[],
      ruleTriggeredNotifications: [] as DispatchResult[]
    };

    try {
      // 1. Evaluate rules for this event
      const rulePayloads = await this.ruleEngine.evaluateRules({
        eventType: event.type,
        eventData: event.data,
        storeId: event.storeId,
        userId: event.userId
      });

      // 2. Send notifications triggered by rules
      for (const payload of rulePayloads) {
        try {
          const ruleResults = await this.dispatcher.dispatch(payload);
          results.ruleTriggeredNotifications.push(...ruleResults);
        } catch (error) {
          console.error('[NotificationEngine] Failed to send rule-triggered notification:', error);
        }
      }

      return results;
    } catch (error) {
      console.error('[NotificationEngine] Error processing event:', error);
      throw error;
    }
  }

  /**
   * Add a custom notification rule
   */
  async addRule(rule: Omit<NotificationRule, 'id'>): Promise<NotificationRule> {
    return await this.ruleEngine.addRule(rule);
  }

  /**
   * Update an existing rule
   */
  async updateRule(ruleId: string, updates: Partial<NotificationRule>): Promise<void> {
    await this.ruleEngine.updateRule(ruleId, updates);
  }

  /**
   * Delete a rule
   */
  async deleteRule(ruleId: string): Promise<void> {
    await this.ruleEngine.deleteRule(ruleId);
  }

  /**
   * Get all notification rules
   */
  getRules(): NotificationRule[] {
    return this.ruleEngine.getRules();
  }

  /**
   * Get specific rule by ID
   */
  getRule(ruleId: string): NotificationRule | undefined {
    return this.ruleEngine.getRule(ruleId);
  }

  /**
   * Check quiet hours status for an entity
   */
  async checkQuietHours(
    entityId: string,
    priority: string = 'normal'
  ): Promise<{
    allowImmediate: boolean;
    isEmergencyOverride: boolean;
    scheduledTime?: Date;
    reason?: string;
  }> {
    return await this.quietHoursEnforcer.checkQuietHours(entityId, priority);
  }

  /**
   * Get quiet hours configuration
   */
  getQuietHoursConfig(entityId: string): {
    enabled: boolean;
    startTime: string;
    endTime: string;
    timezone?: string;
  } {
    return this.quietHoursEnforcer.getQuietHoursConfig(entityId);
  }

  /**
   * Check if quiet hours are currently active
   */
  async isQuietHoursActive(entityId: string): Promise<boolean> {
    return await this.quietHoursEnforcer.isCurrentlyActive(entityId);
  }

  /**
   * Get next quiet hours period
   */
  getNextQuietHoursPeriod(entityId: string): { start: Date; end: Date } | null {
    return this.quietHoursEnforcer.getNextQuietHoursPeriod(entityId);
  }

  /**
   * Convenience method for sending common notification types
   */
  
  /**
   * Send order notification
   */
  async sendOrderNotification(params: {
    storeId: string;
    orderId: string;
    customerName: string;
    amount: number;
    orderType?: string;
    priority?: 'normal' | 'high' | 'urgent';
  }): Promise<DispatchResult[]> {
    const payload: NotificationPayload = {
      subject: `New ${params.orderType || 'Order'} #${params.orderId}`,
      body: `New order from ${params.customerName} for $${params.amount.toFixed(2)}`,
      recipient: { storeId: params.storeId },
      category: 'sales.newOrder',
      priority: params.priority || 'normal',
      channels: ['in-app', 'email'],
      source: 'order.notification',
      eventId: 'order.created',
      data: {
        orderId: params.orderId,
        customerName: params.customerName,
        amount: params.amount,
        orderType: params.orderType
      }
    };

    return await this.send(payload);
  }

  /**
   * Send inventory alert
   */
  async sendInventoryAlert(params: {
    storeId: string;
    itemName: string;
    currentStock: number;
    threshold: number;
    alertType: 'low-stock' | 'out-of-stock' | 'expiration';
    priority?: 'normal' | 'high' | 'urgent';
  }): Promise<DispatchResult[]> {
    const payload: NotificationPayload = {
      subject: `Inventory Alert: ${params.itemName}`,
      body: `${params.itemName} is ${params.alertType.replace('-', ' ')} (${params.currentStock} remaining)`,
      recipient: { storeId: params.storeId },
      category: `inventory.${params.alertType}`,
      priority: params.priority || 'high',
      channels: ['in-app', 'email', 'sms'],
      source: 'inventory.alert',
      eventId: `inventory.${params.alertType}`,
      data: {
        itemName: params.itemName,
        currentStock: params.currentStock,
        threshold: params.threshold,
        alertType: params.alertType
      }
    };

    return await this.send(payload);
  }

  /**
   * Send appointment notification
   */
  async sendAppointmentNotification(params: {
    storeId: string;
    customerName: string;
    serviceName: string;
    appointmentTime: Date;
    reminderType: 'confirmation' | 'reminder' | 'cancellation';
    customerPhone?: string;
    customerEmail?: string;
    priority?: 'normal' | 'high';
  }): Promise<DispatchResult[]> {
    const timeString = params.appointmentTime.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const payload: NotificationPayload = {
      subject: `${params.reminderType === 'cancellation' ? 'Cancellation' : 'Appointment'}: ${params.serviceName}`,
      body: `${params.reminderType === 'cancellation' ? 'Cancelled' : 'Confirmed'} appointment with ${params.customerName} at ${timeString}`,
      recipient: { 
        storeId: params.storeId,
        email: params.customerEmail,
        phoneNumber: params.customerPhone
      },
      category: `appointments.${params.reminderType}`,
      priority: params.priority || 'normal',
      channels: params.reminderType === 'cancellation' ? ['in-app', 'email'] : ['in-app', 'email', 'sms'],
      source: 'appointment.notification',
      eventId: `appointment.${params.reminderType}`,
      data: {
        customerName: params.customerName,
        serviceName: params.serviceName,
        appointmentTime: params.appointmentTime.toISOString(),
        reminderType: params.reminderType
      }
    };

    return await this.send(payload);
  }

  /**
   * Send system alert
   */
  async sendSystemAlert(params: {
    storeId?: string;
    userId?: string;
    alertType: string;
    message: string;
    severity: 'info' | 'warning' | 'error' | 'critical';
    priority?: 'normal' | 'high' | 'urgent' | 'critical';
  }): Promise<DispatchResult[]> {
    const priorityMap = {
      info: 'normal',
      warning: 'high',
      error: 'urgent',
      critical: 'critical'
    } as const;

    const payload: NotificationPayload = {
      subject: `System Alert: ${params.alertType}`,
      body: params.message,
      recipient: { storeId: params.storeId, userId: params.userId },
      category: `system.${params.alertType}`,
      priority: params.priority || priorityMap[params.severity],
      channels: ['in-app', 'email'],
      source: 'system.alert',
      eventId: `system.${params.alertType}`,
      data: {
        alertType: params.alertType,
        severity: params.severity,
        message: params.message
      }
    };

    return await this.send(payload);
  }

  /**
   * Check if engine is initialized
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Graceful shutdown
   */
  async shutdown(): Promise<void> {
    console.log('[NotificationEngine] Shutting down...');
    
    // In a real implementation, you might:
    // - Flush pending notifications
    // - Close database connections
    // - Clean up resources
    
    this.isInitialized = false;
    console.log('[NotificationEngine] Shutdown complete');
  }
}

// Singleton instance
let instance: NotificationEngine | null = null;

/**
 * Get singleton instance of NotificationEngine
 */
export function getNotificationEngine(): NotificationEngine {
  if (!instance) {
    instance = new NotificationEngine();
  }
  return instance;
}

/**
 * Initialize and get the notification engine
 */
export async function initializeNotificationEngine(): Promise<NotificationEngine> {
  const engine = getNotificationEngine();
  await engine.initialize();
  return engine;
}