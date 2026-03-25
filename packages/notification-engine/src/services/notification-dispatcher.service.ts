import { getSettingsManager } from '@vayva/settings';
import {
  EmailChannel,
  SMSChannel,
  PushChannel,
  InAppChannel,
  SlackChannel,
  WhatsAppChannel,
} from '../channels/email.channel';
import { NotificationQueue } from '../utils/notification-queue';
import { PriorityManager } from '../utils/priority-manager';
import type {
  NotificationPayload,
  DispatchResult,
  NotificationChannel,
  NotificationRule,
} from '../types/index';
import {
  getResolvedEngineNotificationSettings,
  type EngineNotificationSettings,
} from '../engine-notification-settings';

export interface NotificationMessage {
  id?: string;
  type: string;
  title: string;
  content: string;
  recipients: string[];
  channel: string;
  priority: 'low' | 'normal' | 'high' | 'urgent' | 'emergency';
  category?: string;
  metadata?: Record<string, any>;
  scheduledFor?: Date;
  expiresAt?: Date;
  allowQuietHoursOverride?: boolean;
}

export interface ChannelProvider {
  send(message: NotificationMessage): Promise<boolean>;
  validateConfig(config: any): boolean;
  getDeliveryStatus(messageId: string): Promise<string>;
}

export class NotificationDispatcher {
  private settingsManager;
  private channels: Map<string, ChannelProvider>;
  private queue: NotificationQueue;
  private priorityManager: PriorityManager;

  constructor() {
    this.settingsManager = getSettingsManager();
    this.channels = new Map();
    this.queue = new NotificationQueue();
    this.priorityManager = new PriorityManager();
    
    // Initialize channel providers
    this.initializeChannels();
  }

  private getNotificationSettings(): EngineNotificationSettings {
    return getResolvedEngineNotificationSettings(this.settingsManager);
  }

  private initializeChannels(): void {
    const notificationSettings = this.getNotificationSettings();

    if (notificationSettings.channels.email.enabled) {
      this.channels.set('email', new EmailChannel(notificationSettings.channels.email));
    }

    if (notificationSettings.channels.sms.enabled) {
      this.channels.set('sms', new SMSChannel(notificationSettings.channels.sms));
    }

    if (notificationSettings.channels.push.enabled) {
      this.channels.set('push', new PushChannel(notificationSettings.channels.push));
    }

    if (notificationSettings.channels.inApp.enabled) {
      this.channels.set('in-app', new InAppChannel(notificationSettings.channels.inApp));
    }

    if (notificationSettings.channels.slack.enabled) {
      this.channels.set('slack', new SlackChannel(notificationSettings.channels.slack));
    }

    if (notificationSettings.channels.whatsapp.enabled) {
      this.channels.set('whatsapp', new WhatsAppChannel(notificationSettings.channels.whatsapp));
    }
  }

  private mapPayloadPriority(p: string): NotificationMessage['priority'] {
    if (p === 'critical') return 'urgent';
    const allowed: NotificationMessage['priority'][] = [
      'low',
      'normal',
      'high',
      'urgent',
      'emergency',
    ];
    return (allowed.includes(p as NotificationMessage['priority'])
      ? p
      : 'normal') as NotificationMessage['priority'];
  }

  private recipientStrings(
    recipient: NotificationPayload['recipient'],
    channel: string,
  ): string[] {
    const out: string[] = [];
    if (recipient.email) out.push(recipient.email);
    if (recipient.phoneNumber) out.push(recipient.phoneNumber);
    if (recipient.userId) out.push(`user:${recipient.userId}`);
    if (recipient.storeId) out.push(`store:${recipient.storeId}`);
    if (recipient.deviceId) out.push(recipient.deviceId);
    if (recipient.slackChannel) out.push(recipient.slackChannel);
    if (recipient.webhookUrl) out.push(recipient.webhookUrl);
    if (out.length > 0) return out;
    if (channel === 'in-app' || channel === 'push') return ['in-app'];
    return ['unknown'];
  }

  private canDeliverOnChannel(payload: NotificationPayload, channel: string): boolean {
    const r = payload.recipient;
    if (channel === 'email') {
      return typeof r.email === 'string' && r.email.length > 0;
    }
    if (channel === 'sms' || channel === 'whatsapp') {
      return typeof r.phoneNumber === 'string' && r.phoneNumber.length > 0;
    }
    return true;
  }

  private buildInternalMessage(
    payload: NotificationPayload,
    channel: string,
  ): NotificationMessage {
    return {
      id: this.generateMessageId(),
      type: payload.category || 'general',
      title: payload.subject,
      content: payload.body,
      recipients: this.recipientStrings(payload.recipient, channel),
      channel,
      priority: this.mapPayloadPriority(payload.priority),
      category: payload.category,
      metadata: {
        source: payload.source,
        eventId: payload.eventId,
        data: payload.data,
      },
    };
  }

  async dispatch(payload: NotificationPayload): Promise<DispatchResult[]> {
    if (!payload.channels?.length) return [];

    const results: DispatchResult[] = [];

    for (const channelName of payload.channels) {
      if (!this.channels.has(channelName)) {
        results.push({
          success: false,
          channel: channelName as NotificationChannel,
          status: 'failed',
          error: `Channel not registered: ${channelName}`,
          timestamp: new Date(),
        });
        continue;
      }

      if (!this.canDeliverOnChannel(payload, channelName)) {
        results.push({
          success: false,
          channel: channelName as NotificationChannel,
          status: 'failed',
          error: 'Missing recipient for channel',
          timestamp: new Date(),
        });
        continue;
      }

      const message = this.buildInternalMessage(payload, channelName);
      const success = await this.send(message);
      results.push({
        success,
        messageId: message.id,
        channel: channelName as NotificationChannel,
        status: success ? 'delivered' : 'failed',
        timestamp: new Date(),
        metadata: { recipient: payload.recipient },
      });
    }

    return results;
  }
  

  async send(message: NotificationMessage): Promise<boolean> {
    try {
      // Validate message
      if (!this.validateMessage(message)) {
        console.warn('[NotificationDispatcher] Invalid message:', message);
        return false;
      }

      // Generate ID if not provided
      if (!message.id) {
        message.id = this.generateMessageId();
      }

      // Check if category is enabled
      if (message.category && !this.isCategoryEnabled(message.category)) {
        console.debug(`[NotificationDispatcher] Category ${message.category} is disabled`);
        return true; // Return true as this is expected behavior
      }

      // Check quiet hours
      const notificationSettings = this.getNotificationSettings();
      if (this.shouldRespectQuietHours(message, notificationSettings)) {
        if (this.isQuietHours(notificationSettings.quietHours)) {
          if (this.canOverrideQuietHours(message, notificationSettings)) {
            console.info(`[NotificationDispatcher] Overriding quiet hours for priority message: ${message.id}`);
          } else {
            console.info(`[NotificationDispatcher] Queuing message for quiet hours: ${message.id}`);
            await this.queueForLater(message);
            return true;
          }
        }
      }

      // Check Do Not Disturb mode
      if (this.isDoNotDisturbActive(notificationSettings)) {
        if (message.priority === 'emergency' || 
            (notificationSettings.doNotDisturb?.allowEmergency && 
             this.isEmergencyMessage(message, notificationSettings))) {
          console.info(`[NotificationDispatcher] Emergency override for DND: ${message.id}`);
        } else {
          console.info(`[NotificationDispatcher] Message blocked by DND: ${message.id}`);
          return true;
        }
      }

      // Process custom rules
      const processedMessage = await this.processRules(message);
      
      // Send through appropriate channel
      const success = await this.dispatchToChannel(processedMessage);
      
      if (success) {
        console.info(`[NotificationDispatcher] Message sent successfully: ${processedMessage.id}`);
      } else {
        console.error(`[NotificationDispatcher] Failed to send message: ${processedMessage.id}`);
      }
      
      return success;
    } catch (error) {
      console.error('[NotificationDispatcher] Error sending notification:', error);
      return false;
    }
  }

  private validateMessage(message: NotificationMessage): boolean {
    return !!(
      message.type &&
      message.title &&
      message.content &&
      message.recipients?.length > 0 &&
      message.channel &&
      this.channels.has(message.channel)
    );
  }

  private isCategoryEnabled(category: string): boolean {
    const notificationSettings = this.getNotificationSettings();
    const categoryPath = category.split('.');
    let current: unknown = notificationSettings.categories;

    if (!current || typeof current !== 'object') return true;

    for (const path of categoryPath) {
      const next = (current as Record<string, unknown>)[path];
      if (next === undefined) return true;
      current = next;
    }

    return typeof current === 'boolean' ? current : true;
  }

  private shouldRespectQuietHours(
    message: NotificationMessage,
    settings: EngineNotificationSettings,
  ): boolean {
    // Emergency messages always bypass quiet hours
    if (message.priority === 'emergency') return false;
    
    // Check if this specific message allows quiet hours override
    if (message.allowQuietHoursOverride === false) return false;
    
    // Check rule-specific quiet hours setting
    const rule = this.findMatchingRule(message);
    if (rule && rule.respectQuietHours === false) return false;
    
    return settings.quietHours.enabled;
  }

  private isQuietHours(quietHours: any): boolean {
    const now = new Date();
    const currentTime = now.getHours() * 60 + now.getMinutes();
    const startTime = parseInt(quietHours.startTime.split(':')[0]) * 60 + 
                     parseInt(quietHours.startTime.split(':')[1]);
    const endTime = parseInt(quietHours.endTime.split(':')[0]) * 60 + 
                   parseInt(quietHours.endTime.split(':')[1]);

    if (startTime > endTime) {
      // Overnight quiet hours (e.g., 22:00 - 08:00)
      return currentTime >= startTime || currentTime < endTime;
    } else {
      return currentTime >= startTime && currentTime < endTime;
    }
  }

  private canOverrideQuietHours(
    message: NotificationMessage,
    settings: EngineNotificationSettings,
  ): boolean {
    // Emergency priority always overrides
    if (message.priority === 'emergency') return true;
    
    // Check for emergency keywords
    const content = `${message.title} ${message.content}`.toLowerCase();
    const hasEmergencyKeyword = settings.quietHours.emergencyContactKeywords.some(
      keyword => content.includes(keyword.toLowerCase())
    );
    
    if (hasEmergencyKeyword) return true;
    
    // Check VIP contacts
    if (settings.quietHours.allowVipOverrides && settings.quietHours.vipContacts) {
      const isVipRecipient = message.recipients.some(recipient => 
        settings.quietHours.vipContacts?.includes(recipient)
      );
      if (isVipRecipient) return true;
    }
    
    // Check priority escalation
    const priorityLevel = this.priorityManager.getPriorityLevel(message.priority);
    const highPriorityKeywords = settings.priority.highPriorityKeywords || [];
    const hasHighPriorityKeyword = highPriorityKeywords.some(
      keyword => content.includes(keyword.toLowerCase())
    );
    
    if (priorityLevel >= 3 || hasHighPriorityKeyword) {
      const escalationTime = settings.priority.autoEscalateAfterMinutes || 60;
      const messageAge = message.scheduledFor 
        ? (Date.now() - message.scheduledFor.getTime()) / 60000 
        : 0;
      
      if (messageAge >= escalationTime) {
        return true;
      }
    }
    
    return false;
  }

  private isDoNotDisturbActive(settings: EngineNotificationSettings): boolean {
    if (!settings.doNotDisturb?.enabled) return false;
    
    const now = new Date();
    const startDate = new Date(settings.doNotDisturb.startDate);
    const endDate = new Date(settings.doNotDisturb.endDate);
    
    return now >= startDate && now <= endDate;
  }

  private isEmergencyMessage(
    message: NotificationMessage,
    settings: EngineNotificationSettings,
  ): boolean {
    const content = `${message.title} ${message.content}`.toLowerCase();
    const emergencyKeywords = settings.priority.highPriorityKeywords || [];
    
    return emergencyKeywords.some(keyword => 
      content.includes(keyword.toLowerCase())
    );
  }

  private async processRules(message: NotificationMessage): Promise<NotificationMessage> {
    const notificationSettings = this.getNotificationSettings();
    const rules = notificationSettings.customRules || [];

    // Find matching rules
    const matchingRules = (rules as NotificationRule[]).filter((rule) =>
      this.matchesRule(message, rule),
    );
    
    // Apply rule transformations
    const processedMessage = { ...message };
    
    for (const rule of matchingRules) {
      // Apply rule actions
      if (rule.actions) {
        // For now, we'll just log the actions
        console.debug(`[NotificationDispatcher] Applying rule ${rule.id} actions:`, rule.actions);
      }
      
      // Apply delivery options
      if (rule.deliveryOptions) {
        if (rule.deliveryOptions.batchWithSimilar) {
          // Queue for batching
          await this.queueForBatching(processedMessage, rule.deliveryOptions.batchWindowMinutes);
        }
      }
    }
    
    return processedMessage;
  }

  private matchesRule(message: NotificationMessage, rule: NotificationRule): boolean {
    // Check trigger type
    if (rule.trigger.type === 'event' && rule.trigger.event) {
      if (message.type !== rule.trigger.event) return false;
    }
    
    // Check conditions
    if (rule.conditions?.length) {
      for (const condition of rule.conditions) {
        const fieldValue = message.metadata?.[condition.field];
        if (!this.evaluateCondition(fieldValue, condition.operator, condition.value)) {
          return false;
        }
      }
    }
    
    return true;
  }

  private evaluateCondition(actual: any, operator: string, expected: any): boolean {
    switch (operator) {
      case 'equals':
        return actual === expected;
      case 'contains':
        return String(actual).includes(String(expected));
      case 'greater-than':
        return Number(actual) > Number(expected);
      case 'less-than':
        return Number(actual) < Number(expected);
      default:
        return false;
    }
  }

  private findMatchingRule(message: NotificationMessage): NotificationRule | undefined {
    const notificationSettings = this.getNotificationSettings();
    const rules = notificationSettings.customRules || [];

    return (rules as NotificationRule[]).find((rule) => this.matchesRule(message, rule));
  }

  private async dispatchToChannel(message: NotificationMessage): Promise<boolean> {
    const channel = this.channels.get(message.channel);
    if (!channel) {
      console.error(`[NotificationDispatcher] Channel ${message.channel} not found`);
      return false;
    }

    try {
      const success = await channel.send(message);
      
      // Track engagement if enabled
      const notificationSettings = this.getNotificationSettings();
      if (notificationSettings.trackEngagement) {
        this.trackEngagement(message);
      }
      
      return success;
    } catch (error) {
      console.error(`[NotificationDispatcher] Channel ${message.channel} failed:`, error);
      
      // Retry logic
      const rule = this.findMatchingRule(message);
      if (rule?.deliveryOptions?.retryOnFailure) {
        const maxRetries = rule.deliveryOptions.maxRetries || 3;
        // Implement retry logic here
        console.info(`[NotificationDispatcher] Retrying message ${message.id}`);
      }
      
      return false;
    }
  }

  private async queueForLater(message: NotificationMessage): Promise<void> {
    await this.queue.enqueue(message, 'scheduled');
  }

  private async queueForBatching(message: NotificationMessage, windowMinutes: number): Promise<void> {
    await this.queue.enqueue(message, 'batch', windowMinutes);
  }

  private trackEngagement(message: NotificationMessage): void {
    // Implement engagement tracking
    console.debug(`[NotificationDispatcher] Tracking engagement for message: ${message.id}`);
  }

  private generateMessageId(): string {
    return `msg_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Public methods for external use
  async sendToMultipleChannels(message: Omit<NotificationMessage, 'channel'>, channels: string[]): Promise<boolean[]> {
    const results = await Promise.all(
      channels.map(channel => 
        this.send({ ...message, channel })
      )
    );
    return results;
  }

  async broadcast(message: Omit<NotificationMessage, 'recipients' | 'channel'>, channel: string): Promise<boolean> {
    // Broadcast to all users through specified channel
    const allRecipients = await this.getAllRecipients();
    return this.send({
      ...message,
      recipients: allRecipients,
      channel
    });
  }

  private async getAllRecipients(): Promise<string[]> {
    // This would integrate with user management system
    return ['admin@example.com']; // Placeholder
  }

  getQueueStats() {
    return this.queue.getStats();
  }

  getChannelStatus(channelName: string) {
    const channel = this.channels.get(channelName);
    return channel ? 'active' : 'inactive';
  }
}