import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class AutomationService {
  constructor(private readonly db = prisma) {}

  async getRules(storeId: string) {
    try {
      const rules = await this.db.automationRule.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
      });

      const formattedRules = rules.map((r) => ({
        id: r.id,
        key: r.key,
        name: r.name,
        triggerType: r.triggerType,
        actionType: r.actionType,
        mfaEnabled: false,
        config: r.config as Record<string, unknown>,
        createdAt: r.createdAt.toISOString(),
        updatedAt: r.updatedAt.toISOString(),
      }));

      return { rules: formattedRules };
    } catch (error) {
      logger.error('[AUTOMATION] Get rules error', error, { storeId });
      throw error;
    }
  }

  async createRule(storeId: string, ruleData: any) {
    const { key, name, triggerType, actionType, config } = ruleData;

    if (!key || !name || !triggerType || !actionType) {
      throw new Error('Key, name, triggerType, and actionType are required');
    }

    // Validate triggerType
    const validTriggerTypes = [
      'ORDER_CREATED',
      'ABANDONED_CHECKOUT',
      'CUSTOMER_CREATED',
      'PRODUCT_VIEWED',
      'PRODUCT_LOW_STOCK',
      'PRODUCT_OUT_OF_STOCK',
      'PAYMENT_FAILED',
      'SUBSCRIPTION_CREATED',
      'SUBSCRIPTION_CANCELLED',
    ];

    if (!validTriggerTypes.includes(triggerType)) {
      throw new Error('Invalid trigger type');
    }

    // Validate actionType
    const validActionTypes = [
      'SEND_EMAIL',
      'SEND_WHATSAPP',
      'APPLY_DISCOUNT',
      'ADD_TO_SEGMENT',
      'UPDATE_ORDER_STATUS',
      'TRIGGER_WEBHOOK',
    ];

    if (!validActionTypes.includes(actionType)) {
      throw new Error('Invalid action type');
    }

    try {
      const rule = await this.db.automationRule.create({
        data: {
          storeId,
          key,
          name,
          triggerType,
          actionType,
          enabled: true,
          config: config || {},
        },
      });

      logger.info(`[AUTOMATION] Created rule ${rule.id} for store ${storeId}`);
      return { rule };
    } catch (error) {
      logger.error('[AUTOMATION] Create rule error', error, { storeId });
      throw error;
    }
  }

  async updateRule(storeId: string, ruleId: string, updates: any) {
    try {
      const existingRule = await this.db.automationRule.findFirst({
        where: { id: ruleId, storeId },
      });

      if (!existingRule) {
        throw new Error('Automation rule not found');
      }

      const rule = await this.db.automationRule.update({
        where: { id: ruleId },
        data: {
          ...updates,
          config: updates.config || existingRule.config,
        },
      });

      logger.info(`[AUTOMATION] Updated rule ${ruleId} for store ${storeId}`);
      return { rule };
    } catch (error) {
      logger.error('[AUTOMATION] Update rule error', error, { storeId, ruleId });
      throw error;
    }
  }

  async deleteRule(storeId: string, ruleId: string) {
    try {
      const existingRule = await this.db.automationRule.findFirst({
        where: { id: ruleId, storeId },
      });

      if (!existingRule) {
        throw new Error('Automation rule not found');
      }

      await this.db.automationRule.delete({
        where: { id: ruleId },
      });

      logger.info(`[AUTOMATION] Deleted rule ${ruleId} for store ${storeId}`);
      return { success: true };
    } catch (error) {
      logger.error('[AUTOMATION] Delete rule error', error, { storeId, ruleId });
      throw error;
    }
  }

  async toggleRule(storeId: string, ruleId: string) {
    try {
      const existingRule = await this.db.automationRule.findFirst({
        where: { id: ruleId, storeId },
      });

      if (!existingRule) {
        throw new Error('Automation rule not found');
      }

      const rule = await this.db.automationRule.update({
        where: { id: ruleId },
        data: {
          enabled: !existingRule.enabled,
        },
      });

      logger.info(
        `[AUTOMATION] Toggled rule ${ruleId} to ${rule.enabled ? 'enabled' : 'disabled'} for store ${storeId}`,
      );
      return { rule };
    } catch (error) {
      logger.error('[AUTOMATION] Toggle rule error', error, { storeId, ruleId });
      throw error;
    }
  }

  async executeRule(storeId: string, ruleId: string, context: any) {
    try {
      const rule = await this.db.automationRule.findFirst({
        where: { id: ruleId, storeId, enabled: true },
      });

      if (!rule) {
        throw new Error('Automation rule not found or disabled');
      }

      // Execute based on action type
      let result: any;
      switch (rule.actionType) {
        case 'SEND_EMAIL':
          result = await this.executeSendEmail(rule, context);
          break;
        case 'SEND_WHATSAPP':
          result = await this.executeSendWhatsApp(rule, context);
          break;
        case 'APPLY_DISCOUNT':
          result = await this.executeApplyDiscount(rule, context);
          break;
        case 'ADD_TO_SEGMENT':
          result = await this.executeAddToSegment(rule, context);
          break;
        case 'UPDATE_ORDER_STATUS':
          result = await this.executeUpdateOrderStatus(rule, context);
          break;
        case 'TRIGGER_WEBHOOK':
          result = await this.executeTriggerWebhook(rule, context);
          break;
        default:
          throw new Error(`Unknown action type: ${rule.actionType}`);
      }

      logger.info(`[AUTOMATION] Executed rule ${ruleId} for store ${storeId}`);
      return { success: true, data: result };
    } catch (error) {
      logger.error('[AUTOMATION] Execute rule error', error, { storeId, ruleId });
      throw error;
    }
  }

  // Helper methods for executing different action types
  private async executeSendEmail(rule: any, context: any) {
    // Implementation for sending email
    logger.info(`[AUTOMATION] Would send email: ${rule.name}`);
    return { action: 'email_sent', ruleId: rule.id };
  }

  private async executeSendWhatsApp(rule: any, context: any) {
    // Implementation for sending WhatsApp message
    logger.info(`[AUTOMATION] Would send WhatsApp: ${rule.name}`);
    return { action: 'whatsapp_sent', ruleId: rule.id };
  }

  private async executeApplyDiscount(rule: any, context: any) {
    // Implementation for applying discount
    logger.info(`[AUTOMATION] Would apply discount: ${rule.name}`);
    return { action: 'discount_applied', ruleId: rule.id };
  }

  private async executeAddToSegment(rule: any, context: any) {
    // Implementation for adding customer to segment
    logger.info(`[AUTOMATION] Would add to segment: ${rule.name}`);
    return { action: 'added_to_segment', ruleId: rule.id };
  }

  private async executeUpdateOrderStatus(rule: any, context: any) {
    // Implementation for updating order status
    logger.info(`[AUTOMATION] Would update order status: ${rule.name}`);
    return { action: 'order_updated', ruleId: rule.id };
  }

  private async executeTriggerWebhook(rule: any, context: any) {
    // Implementation for triggering webhook
    logger.info(`[AUTOMATION] Would trigger webhook: ${rule.name}`);
    return { action: 'webhook_triggered', ruleId: rule.id };
  }
}
