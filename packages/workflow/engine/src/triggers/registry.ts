/**
 * Trigger Registry
 * Central registry for workflow triggers
 */

import type { 
  TriggerType, 
  WorkflowTrigger, 
  TriggerConfig,
  TriggerHandler,
  OrderTriggerConfig,
  InventoryTriggerConfig,
  CustomerSegmentConfig,
  WebhookTriggerConfig,
} from '../types.js';

export interface TriggerDefinition {
  type: TriggerType;
  label: string;
  description: string;
  configSchema: Record<string, unknown>;
  requiresWebhook?: boolean;
}

export const TRIGGER_DEFINITIONS: Record<TriggerType, TriggerDefinition> = {
  order_created: {
    type: 'order_created',
    label: 'Order Created',
    description: 'Triggered when a new order is created',
    configSchema: {
      orderStatus: { type: 'string', enum: ['pending', 'paid', 'fulfilled', 'cancelled'] },
      minAmount: { type: 'number' },
      maxAmount: { type: 'number' },
      productTags: { type: 'array', items: { type: 'string' } },
    },
  },
  order_paid: {
    type: 'order_paid',
    label: 'Order Paid',
    description: 'Triggered when an order is paid',
    configSchema: {
      minAmount: { type: 'number' },
      maxAmount: { type: 'number' },
    },
  },
  order_cancelled: {
    type: 'order_cancelled',
    label: 'Order Cancelled',
    description: 'Triggered when an order is cancelled',
    configSchema: {
      reason: { type: 'string' },
    },
  },
  inventory_low: {
    type: 'inventory_low',
    label: 'Inventory Low',
    description: 'Triggered when inventory drops below threshold',
    configSchema: {
      thresholdType: { type: 'string', enum: ['overall', 'size_specific', 'variant_specific'] },
      minQuantity: { type: 'number' },
      productIds: { type: 'array', items: { type: 'string' } },
      categoryIds: { type: 'array', items: { type: 'string' } },
    },
  },
  customer_segment_entered: {
    type: 'customer_segment_entered',
    label: 'Customer Entered Segment',
    description: 'Triggered when a customer enters a segment',
    configSchema: {
      segmentId: { type: 'string' },
      segmentName: { type: 'string' },
    },
  },
  customer_segment_exited: {
    type: 'customer_segment_exited',
    label: 'Customer Exited Segment',
    description: 'Triggered when a customer exits a segment',
    configSchema: {
      segmentId: { type: 'string' },
      segmentName: { type: 'string' },
    },
  },
  schedule: {
    type: 'schedule',
    label: 'Schedule',
    description: 'Triggered on a schedule (cron or interval)',
    configSchema: {
      cron: { type: 'string', description: 'Cron expression' },
      interval: { type: 'string', description: 'Interval (e.g., 5m, 1h)' },
      timezone: { type: 'string', default: 'UTC' },
    },
  },
  webhook: {
    type: 'webhook',
    label: 'Webhook',
    description: 'Triggered by an external webhook',
    configSchema: {
      endpoint: { type: 'string' },
      secret: { type: 'string' },
      method: { type: 'string', enum: ['POST', 'PUT', 'PATCH'], default: 'POST' },
    },
    requiresWebhook: true,
  },
  manual: {
    type: 'manual',
    label: 'Manual',
    description: 'Triggered manually by a user',
    configSchema: {
      allowBulkExecution: { type: 'boolean', default: false },
    },
  },
  ai_intent_detected: {
    type: 'ai_intent_detected',
    label: 'AI Intent Detected',
    description: 'Triggered when AI detects a specific intent',
    configSchema: {
      intent: { type: 'string' },
      confidenceThreshold: { type: 'number', default: 0.7 },
    },
  },
  product_added: {
    type: 'product_added',
    label: 'Product Added',
    description: 'Triggered when a new product is added',
    configSchema: {
      categoryIds: { type: 'array', items: { type: 'string' } },
    },
  },
  product_updated: {
    type: 'product_updated',
    label: 'Product Updated',
    description: 'Triggered when a product is updated',
    configSchema: {
      fields: { type: 'array', items: { type: 'string' } },
    },
  },
  customer_created: {
    type: 'customer_created',
    label: 'Customer Created',
    description: 'Triggered when a new customer is created',
    configSchema: {
      source: { type: 'string' },
    },
  },
  payment_received: {
    type: 'payment_received',
    label: 'Payment Received',
    description: 'Triggered when a payment is received',
    configSchema: {
      minAmount: { type: 'number' },
      paymentMethod: { type: 'string' },
    },
  },
  refund_requested: {
    type: 'refund_requested',
    label: 'Refund Requested',
    description: 'Triggered when a refund is requested',
    configSchema: {
      autoApprove: { type: 'boolean', default: false },
    },
  },
};

export class TriggerRegistry {
  private handlers: Map<TriggerType, TriggerHandler> = new Map();

  register(type: TriggerType, handler: TriggerHandler): void {
    this.handlers.set(type, handler);
  }

  async evaluate(
    trigger: WorkflowTrigger,
    eventData: Record<string, unknown>
  ): Promise<boolean> {
    const handler = this.handlers.get(trigger.type);
    if (!handler) {
      // Default behavior: trigger if type matches
      return eventData.triggerType === trigger.type;
    }
    return handler(trigger, eventData);
  }

  getDefinition(type: TriggerType): TriggerDefinition | undefined {
    return TRIGGER_DEFINITIONS[type];
  }

  getAllDefinitions(): TriggerDefinition[] {
    return Object.values(TRIGGER_DEFINITIONS);
  }

  isValidTriggerType(type: string): type is TriggerType {
    return type in TRIGGER_DEFINITIONS;
  }
}

// Create default trigger handlers
export function createDefaultTriggerHandlers(): Map<TriggerType, TriggerHandler> {
  const handlers = new Map<TriggerType, TriggerHandler>();

  // Order created handler
  handlers.set('order_created', async (trigger, eventData) => {
    const config = trigger.config as OrderTriggerConfig;
    
    if (config.orderStatus && eventData.orderStatus !== config.orderStatus) {
      return false;
    }
    
    const amount = Number(eventData.amount) || 0;
    if (config.minAmount && amount < config.minAmount) {
      return false;
    }
    if (config.maxAmount && amount > config.maxAmount) {
      return false;
    }
    
    if (config.productTags && Array.isArray(eventData.productTags)) {
      const hasTag = config.productTags.some((tag) => 
        (eventData.productTags as string[]).includes(tag)
      );
      if (!hasTag) return false;
    }
    
    return true;
  });

  // Order paid handler
  handlers.set('order_paid', async (trigger, eventData) => {
    const config = trigger.config as OrderTriggerConfig;
    const amount = Number(eventData.amount) || 0;
    
    if (config.minAmount && amount < config.minAmount) {
      return false;
    }
    if (config.maxAmount && amount > config.maxAmount) {
      return false;
    }
    
    return true;
  });

  // Inventory low handler
  handlers.set('inventory_low', async (trigger, eventData) => {
    const config = trigger.config as InventoryTriggerConfig;
    const quantity = Number(eventData.quantity) || 0;
    
    if (quantity >= config.minQuantity) {
      return false;
    }
    
    if (config.productIds && !config.productIds.includes(String(eventData.productId))) {
      return false;
    }
    
    return true;
  });

  // Customer segment entered handler
  handlers.set('customer_segment_entered', async (trigger, eventData) => {
    const config = trigger.config as CustomerSegmentConfig;
    return eventData.segmentId === config.segmentId;
  });

  // Customer segment exited handler
  handlers.set('customer_segment_exited', async (trigger, eventData) => {
    const config = trigger.config as CustomerSegmentConfig;
    return eventData.segmentId === config.segmentId;
  });

  // Webhook handler - always triggers when webhook is called
  handlers.set('webhook', async (trigger, eventData) => {
    const config = trigger.config as WebhookTriggerConfig;
    
    // Verify secret if configured
    if (config.secret && eventData.secret !== config.secret) {
      return false;
    }
    
    return true;
  });

  // Manual trigger - always triggers when manually invoked
  handlers.set('manual', async () => true);

  // Schedule trigger - handled by scheduler
  handlers.set('schedule', async () => true);

  // AI intent detected handler
  handlers.set('ai_intent_detected', async (trigger, eventData) => {
    const config = trigger.config as { intent: string; confidenceThreshold?: number };
    const confidence = Number(eventData.confidence) || 0;
    const threshold = config.confidenceThreshold || 0.7;
    
    return eventData.intent === config.intent && confidence >= threshold;
  });

  return handlers;
}

// Singleton instance
let defaultRegistry: TriggerRegistry | null = null;

export function getDefaultTriggerRegistry(): TriggerRegistry {
  if (!defaultRegistry) {
    defaultRegistry = new TriggerRegistry();
    const handlers = createDefaultTriggerHandlers();
    handlers.forEach((handler, type) => {
      defaultRegistry!.register(type, handler);
    });
  }
  return defaultRegistry;
}
