import { getSettingsManager } from '@vayva/settings';
import type { NotificationSettings, NotificationRule } from '@vayva/settings';
import { EmailChannel } from '../channels/email.channel';
import { SMSChannel } from '../channels/sms.channel';
import { PushChannel } from '../channels/push.channel';
import { InAppChannel } from '../channels/in-app.channel';
import { SlackChannel } from '../channels/slack.channel';
import { WhatsAppChannel } from '../channels/whatsapp.channel';
import { NotificationQueue } from '../utils/notification-queue';
import { PriorityManager } from '../utils/priority-manager';

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

  private initializeChannels(): void {
    const notificationSettings = this.settingsManager.getSettings().notifications;
    
    // Register enabled channels
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

  async dispatch(payload: NotificationPayload): Promise<DispatchResult[]> {
    const message: NotificationMessage = {
      id: this.generateMessageId(),
      subject: payload.subject,
      body: payload.body,
      recipients: [payload.recipient],
      channel: payload.channels[0] || "in-app",
      priority: payload.priority,
      category: payload.category,
      metadata: {
        source: payload.source,
        eventId: payload.eventId,
        data: payload.data
      },
      createdAt: new Date()
    };
    
    const success = await this.send(message);
    return [{
      messageId: message.id,
      channel: message.channel,
      status: success ? "delivered" : "failed",
      timestamp: new Date(),
      recipient: payload.recipient
    }];
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
      const notificationSettings = this.settingsManager.getSettings().notifications;
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
    const notificationSettings = this.settingsManager.getSettings().notifications;
    const categoryPath = category.split('.');
    let current: any = notificationSettings.categories;
    
    for (const path of categoryPath) {
      if (!current[path]) return false;
      current = current[path];
    }
    
    return typeof current === 'boolean' ? current : true;
  }

  private shouldRespectQuietHours(message: NotificationMessage, settings: NotificationSettings): boolean {
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

  private canOverrideQuietHours(message: NotificationMessage, settings: NotificationSettings): boolean {
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

  private isDoNotDisturbActive(settings: NotificationSettings): boolean {
    if (!settings.doNotDisturb?.enabled) return false;
    
    const now = new Date();
    const startDate = new Date(settings.doNotDisturb.startDate);
    const endDate = new Date(settings.doNotDisturb.endDate);
    
    return now >= startDate && now <= endDate;
  }

  private isEmergencyMessage(message: NotificationMessage, settings: NotificationSettings): boolean {
    const content = `${message.title} ${message.content}`.toLowerCase();
    const emergencyKeywords = settings.priority.highPriorityKeywords || [];
    
    return emergencyKeywords.some(keyword => 
      content.includes(keyword.toLowerCase())
    );
  }

  private async processRules(message: NotificationMessage): Promise<NotificationMessage> {
    const notificationSettings = this.settingsManager.getSettings().notifications;
    const rules = notificationSettings.customRules || [];
    
    // Find matching rules
    const matchingRules = rules.filter((rule: any) => this.matchesRule(message, rule));
    
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
    const notificationSettings = this.settingsManager.getSettings().notifications;
    const rules = notificationSettings.customRules || [];
    
    return rules.find((rule: any) => this.matchesRule(message, rule));
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
      const notificationSettings = this.settingsManager.getSettings().notifications;
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