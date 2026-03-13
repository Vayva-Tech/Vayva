import { getSettingsManager } from '@vayva/settings';
import { 
  NotificationPayload, 
  NotificationRule,
  NotificationChannel 
} from '../types/index.js';

/**
 * Rule Engine - Evaluates custom notification rules
 * 
 * Features:
 * - Event-based triggers
 * - Threshold-based conditions
 * - Scheduled notifications
 * - AI insight triggers
 * - Complex condition evaluation
 */
export class RuleEngine {
  private settingsManager;

  constructor() {
    this.settingsManager = getSettingsManager();
  }

  /**
   * Evaluate all rules for a given event/context
   */
  async evaluateRules(context: {
    eventType: string;
    eventData: Record<string, unknown>;
    storeId?: string;
    userId?: string;
  }): Promise<NotificationPayload[]> {
    try {
      const notificationSettings = this.settingsManager.getSettings().notifications;
      const customRules = notificationSettings.customRules || [];
      
      const triggeredNotifications: NotificationPayload[] = [];

      for (const rule of customRules) {
        if (!rule.enabled) continue;

        const matches = await this.evaluateRule(rule, context);
        if (matches) {
          const payloads = await this.generatePayloadsFromRule(rule, context);
          triggeredNotifications.push(...payloads);
        }
      }

      return triggeredNotifications;
    } catch (error) {
      console.error('[RuleEngine] Error evaluating rules:', error);
      return [];
    }
  }

  /**
   * Evaluate if a rule should trigger for given context
   */
  private async evaluateRule(
    rule: NotificationRule, 
    context: { eventType: string; eventData: Record<string, unknown> }
  ): Promise<boolean> {
    try {
      // Check trigger type
      switch (rule.trigger.type) {
        case 'event':
          if (rule.trigger.event && rule.trigger.event !== context.eventType) {
            return false;
          }
          break;

        case 'threshold':
          if (!rule.trigger.threshold) return false;
          const metricValue = this.getNestedValue(context.eventData, rule.trigger.threshold.metric);
          if (metricValue === undefined) return false;
          
          switch (rule.trigger.threshold.operator) {
            case 'greater-than':
              if (metricValue !== null && metricValue <= rule.trigger.threshold.value) return false;
              break;
            case 'less-than':
              if (metricValue !== null && metricValue >= rule.trigger.threshold.value) return false;
              break;
            case 'equals':
              if (metricValue !== rule.trigger.threshold.value) return false;
              break;
            case 'crosses':
              // Would need historical data to implement crossing detection
              return false;
          }
          break;

        case 'schedule':
          // Schedule-based rules would be evaluated by a scheduler service
          return false;

        case 'ai-insight':
          // AI-generated insights would trigger these rules
          if (context.eventType !== 'ai.insight.generated') return false;
          break;
      }

      // Check additional conditions
      if (rule.conditions && rule.conditions.length > 0) {
        for (const condition of rule.conditions) {
          const fieldValue = this.getNestedValue(context.eventData, condition.field);
          if (fieldValue === undefined) return false;

          // Ensure value is not undefined
          if (condition.value === undefined) return false;

          switch (condition.operator) {
            case 'equals':
              if (fieldValue !== condition.value) return false;
              break;
            case 'contains':
              if (typeof fieldValue === 'string' && typeof condition.value === 'string') {
                if (!fieldValue.includes(condition.value)) return false;
              } else {
                return false;
              }
              break;
            case 'greater-than':
              if (typeof fieldValue !== 'number' || fieldValue <= Number(condition.value)) return false;
              break;
            case 'less-than':
              if (typeof fieldValue !== 'number' || fieldValue >= Number(condition.value)) return false;
              break;
          }
        }
      }

      // Check quiet hours respect setting
      if (rule.respectQuietHours === false) {
        // Rule explicitly ignores quiet hours
        return true;
      }

      return true;
    } catch (error) {
      console.error('[RuleEngine] Error evaluating rule:', error);
      return false;
    }
  }

  /**
   * Generate notification payloads from a triggered rule
   */
  private async generatePayloadsFromRule(
    rule: NotificationRule,
    context: { eventType: string; eventData: Record<string, unknown>; storeId?: string; userId?: string }
  ): Promise<NotificationPayload[]> {
    const payloads: NotificationPayload[] = [];

    for (const action of rule.actions) {
      // Determine recipient
      const recipient = {
        userId: context.userId,
        storeId: context.storeId
      };

      // Override recipient if specified in action
      if (action.recipient) {
        // In a real implementation, you'd resolve the recipient
        // For now, keeping the original recipient
      }

      // Generate content using template and variables
      const content = await this.renderTemplate(action.template, {
        ...context.eventData,
        ...action.variables
      });

      const payload: NotificationPayload = {
        subject: content.subject,
        body: content.body,
        recipient,
        category: `rule.${rule.id}`,
        priority: this.determinePriority(rule, context),
        channels: [action.type as NotificationChannel],
        source: `rule:${rule.id}`,
        eventId: context.eventType,
        data: {
          ruleId: rule.id,
          eventData: context.eventData,
          ...action.variables
        },
        maxRetries: rule.deliveryOptions.maxRetries,
        retryDelayMs: rule.deliveryOptions.batchWindowMinutes * 60 * 1000
      };

      payloads.push(payload);
    }

    return payloads;
  }

  /**
   * Render notification template with variables
   */
  private async renderTemplate(
    templateId: string, 
    variables: Record<string, unknown>
  ): Promise<{ subject: string; body: string }> {
    // In a real implementation, this would:
    // - Fetch template from database
    // - Parse and substitute variables
    // - Support different template formats
    
    // For simulation, using simple string replacement
    const templates: Record<string, { subject: string; body: string }> = {
      'new-order': {
        subject: 'New Order Received!',
        body: `You have a new order #{{orderId}} for {{amount}} from {{customerName}}.`
      },
      'low-stock': {
        subject: 'Low Stock Alert',
        body: `Item {{itemName}} is running low. Current stock: {{currentStock}}`
      },
      'large-order': {
        subject: 'Large Order Alert',
        body: `Large order #{{orderId}} for {{amount}} received from {{customerName}}.`
      }
    };

    const template = templates[templateId] || {
      subject: 'Notification',
      body: 'You have a new notification.'
    };

    let subject = template.subject;
    let body = template.body;

    // Replace variables
    Object.keys(variables).forEach(key => {
      const regex = new RegExp(`{{${key}}}`, 'g');
      const value = String(variables[key] ?? '');
      subject = subject.replace(regex, value);
      body = body.replace(regex, value);
    });

    return { subject, body };
  }

  /**
   * Determine notification priority based on rule and context
   */
  private determinePriority(
    rule: NotificationRule,
    context: { eventType: string; eventData: Record<string, unknown> }
  ): 'low' | 'normal' | 'high' | 'urgent' | 'critical' {
    // Check for emergency keywords in event data
    const emergencyKeywords = ['critical', 'emergency', 'urgent', 'immediate'];
    const eventDataString = JSON.stringify(context.eventData).toLowerCase();
    
    if (emergencyKeywords.some(keyword => eventDataString.includes(keyword))) {
      return 'critical';
    }

    // Default to rule-defined priority or normal
    return 'normal';
  }

  /**
   * Get nested value from object using dot notation
   */
  private getNestedValue(obj: Record<string, unknown>, path: string): unknown {
    return path.split('.').reduce((current, key) => {
      return current && typeof current === 'object' && key in current 
        ? (current as Record<string, unknown>)[key] 
        : undefined;
    }, obj as unknown);
  }

  /**
   * Add a new custom rule
   */
  async addRule(rule: Omit<NotificationRule, 'id'>): Promise<NotificationRule> {
    try {
      const notificationSettings = this.settingsManager.getSettings().notifications;
      
      const newRule: NotificationRule = {
        ...rule,
        id: `rule_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };

      const updatedRules = [...(notificationSettings.customRules || []), newRule];
      
      await this.settingsManager.updateNotificationSettings({ customRules: updatedRules });

      return newRule;
    } catch (error) {
      console.error('[RuleEngine] Error adding rule:', error);
      throw error;
    }
  }

  /**
   * Update an existing rule
   */
  async updateRule(ruleId: string, updates: Partial<NotificationRule>): Promise<void> {
    try {
      const notificationSettings = this.settingsManager.getSettings().notifications;
      const rules = notificationSettings.customRules || [];
      
      const updatedRules = rules.map((rule: any) => 
        rule.id === ruleId ? { ...rule, ...updates } : rule
      );
      
      await this.settingsManager.updateNotificationSettings({ customRules: updatedRules });
    } catch (error) {
      console.error('[RuleEngine] Error updating rule:', error);
      throw error;
    }
  }

  /**
   * Delete a rule
   */
  async deleteRule(ruleId: string): Promise<void> {
    try {
      const notificationSettings = this.settingsManager.getSettings().notifications;
      const rules = notificationSettings.customRules || [];
      
      const updatedRules = rules.filter((rule: any) => rule.id !== ruleId);
      
      await this.settingsManager.updateNotificationSettings({ customRules: updatedRules });
    } catch (error) {
      console.error('[RuleEngine] Error deleting rule:', error);
      throw error;
    }
  }

  /**
   * Get all rules
   */
  getRules(): NotificationRule[] {
    try {
      const notificationSettings = this.settingsManager.getSettings().notifications;
      return notificationSettings.customRules || [];
    } catch (error) {
      console.error('[RuleEngine] Error getting rules:', error);
      return [];
    }
  }

  /**
   * Get rule by ID
   */
  getRule(ruleId: string): NotificationRule | undefined {
    try {
      const rules = this.getRules();
      return rules.find(rule => rule.id === ruleId);
    } catch (error) {
      console.error('[RuleEngine] Error getting rule:', error);
      return undefined;
    }
  }
}