/**
 * Zapier Integration
 * Triggers and actions for Zapier platform integration
 */

import { logger } from '@vayva/shared';
import type {
  ZapierTrigger,
  ZapierAction,
  ZapierBundle,
  ZapierInputField,
  WebhookEventType,
} from '../types';
import { webhookManager } from '../webhooks/manager';

// ============================================
// Authentication
// ============================================

export const zapierAuth = {
  type: 'custom' as const,
  fields: [
    {
      key: 'merchantId',
      label: 'Merchant ID',
      type: 'string' as const,
      required: true,
      helpText: 'Your Vayva merchant/store ID',
    },
    {
      key: 'apiKey',
      label: 'API Key',
      type: 'string' as const,
      required: true,
      helpText: 'Your Vayva API key with appropriate scopes',
    },
  ],
  test: async (z: unknown, bundle: ZapierBundle): Promise<void> => {
    // Test authentication by fetching merchant info
    const response = await fetch('https://api.vayva.ng/v1/merchant', {
      headers: {
        'Authorization': `Bearer ${bundle.authData.apiKey}`,
        'X-Merchant-ID': bundle.authData.merchantId,
      },
    });

    if (!response.ok) {
      throw new Error('Invalid API credentials');
    }
  },
};

// ============================================
// Triggers
// ============================================

export const zapierTriggers: Record<string, ZapierTrigger> = {
  new_order: {
    key: 'new_order',
    noun: 'Order',
    display: {
      label: 'New Order',
      description: 'Triggers when a new order is received in your store.',
    },
    operation: {
      type: 'hook',
      performSubscribe: async (z: unknown, bundle: ZapierBundle) => {
        const webhook = await webhookManager.createWebhook({
          storeId: bundle.authData.merchantId,
          url: bundle.targetUrl!,
          events: ['order.created'],
          description: 'Zapier integration - New Order trigger',
        });
        return { webhookId: webhook.id };
      },
      performUnsubscribe: async (z: unknown, bundle: ZapierBundle) => {
        await webhookManager.deleteWebhook(
          bundle.authData.merchantId,
          bundle.subscribeData!.webhookId
        );
      },
    },
  },

  order_paid: {
    key: 'order_paid',
    noun: 'Order',
    display: {
      label: 'Order Paid',
      description: 'Triggers when an order payment is confirmed.',
    },
    operation: {
      type: 'hook',
      performSubscribe: async (z: unknown, bundle: ZapierBundle) => {
        const webhook = await webhookManager.createWebhook({
          storeId: bundle.authData.merchantId,
          url: bundle.targetUrl!,
          events: ['order.paid'],
          description: 'Zapier integration - Order Paid trigger',
        });
        return { webhookId: webhook.id };
      },
      performUnsubscribe: async (z: unknown, bundle: ZapierBundle) => {
        await webhookManager.deleteWebhook(
          bundle.authData.merchantId,
          bundle.subscribeData!.webhookId
        );
      },
    },
  },

  order_shipped: {
    key: 'order_shipped',
    noun: 'Order',
    display: {
      label: 'Order Shipped',
      description: 'Triggers when an order is dispatched for delivery.',
    },
    operation: {
      type: 'hook',
      performSubscribe: async (z: unknown, bundle: ZapierBundle) => {
        const webhook = await webhookManager.createWebhook({
          storeId: bundle.authData.merchantId,
          url: bundle.targetUrl!,
          events: ['order.shipped'],
          description: 'Zapier integration - Order Shipped trigger',
        });
        return { webhookId: webhook.id };
      },
      performUnsubscribe: async (z: unknown, bundle: ZapierBundle) => {
        await webhookManager.deleteWebhook(
          bundle.authData.merchantId,
          bundle.subscribeData!.webhookId
        );
      },
    },
  },

  new_customer: {
    key: 'new_customer',
    noun: 'Customer',
    display: {
      label: 'New Customer',
      description: 'Triggers when a new customer is added to your store.',
    },
    operation: {
      type: 'hook',
      performSubscribe: async (z: unknown, bundle: ZapierBundle) => {
        const webhook = await webhookManager.createWebhook({
          storeId: bundle.authData.merchantId,
          url: bundle.targetUrl!,
          events: ['customer.created'],
          description: 'Zapier integration - New Customer trigger',
        });
        return { webhookId: webhook.id };
      },
      performUnsubscribe: async (z: unknown, bundle: ZapierBundle) => {
        await webhookManager.deleteWebhook(
          bundle.authData.merchantId,
          bundle.subscribeData!.webhookId
        );
      },
    },
  },

  low_stock: {
    key: 'low_stock',
    noun: 'Product',
    display: {
      label: 'Low Stock Alert',
      description: 'Triggers when a product inventory falls below the threshold.',
    },
    operation: {
      type: 'hook',
      performSubscribe: async (z: unknown, bundle: ZapierBundle) => {
        const webhook = await webhookManager.createWebhook({
          storeId: bundle.authData.merchantId,
          url: bundle.targetUrl!,
          events: ['inventory.low_stock'],
          description: 'Zapier integration - Low Stock trigger',
        });
        return { webhookId: webhook.id };
      },
      performUnsubscribe: async (z: unknown, bundle: ZapierBundle) => {
        await webhookManager.deleteWebhook(
          bundle.authData.merchantId,
          bundle.subscribeData!.webhookId
        );
      },
    },
  },

  payment_received: {
    key: 'payment_received',
    noun: 'Payment',
    display: {
      label: 'Payment Received',
      description: 'Triggers when a payment is successfully processed.',
    },
    operation: {
      type: 'hook',
      performSubscribe: async (z: unknown, bundle: ZapierBundle) => {
        const webhook = await webhookManager.createWebhook({
          storeId: bundle.authData.merchantId,
          url: bundle.targetUrl!,
          events: ['payment.success'],
          description: 'Zapier integration - Payment Received trigger',
        });
        return { webhookId: webhook.id };
      },
      performUnsubscribe: async (z: unknown, bundle: ZapierBundle) => {
        await webhookManager.deleteWebhook(
          bundle.authData.merchantId,
          bundle.subscribeData!.webhookId
        );
      },
    },
  },

  subscription_created: {
    key: 'subscription_created',
    noun: 'Subscription',
    display: {
      label: 'New Subscription',
      description: 'Triggers when a customer subscribes to a recurring plan.',
    },
    operation: {
      type: 'hook',
      performSubscribe: async (z: unknown, bundle: ZapierBundle) => {
        const webhook = await webhookManager.createWebhook({
          storeId: bundle.authData.merchantId,
          url: bundle.targetUrl!,
          events: ['subscription.created'],
          description: 'Zapier integration - New Subscription trigger',
        });
        return { webhookId: webhook.id };
      },
      performUnsubscribe: async (z: unknown, bundle: ZapierBundle) => {
        await webhookManager.deleteWebhook(
          bundle.authData.merchantId,
          bundle.subscribeData!.webhookId
        );
      },
    },
  },
};

// ============================================
// Actions
// ============================================

export const zapierActions: Record<string, ZapierAction> = {
  create_product: {
    key: 'create_product',
    noun: 'Product',
    display: {
      label: 'Create Product',
      description: 'Creates a new product in your Vayva store.',
    },
    operation: {
      inputFields: [
        {
          key: 'name',
          label: 'Product Name',
          type: 'string',
          required: true,
        },
        {
          key: 'price',
          label: 'Price (in kobo/cents)',
          type: 'number',
          required: true,
          helpText: 'Price in smallest currency unit (e.g., 10000 for ₦100.00)',
        },
        {
          key: 'description',
          label: 'Description',
          type: 'text',
          required: false,
        },
        {
          key: 'sku',
          label: 'SKU',
          type: 'string',
          required: false,
          helpText: 'Stock Keeping Unit - unique product identifier',
        },
        {
          key: 'inventory_quantity',
          label: 'Inventory Quantity',
          type: 'number',
          required: false,
          default: '0',
        },
        {
          key: 'category',
          label: 'Category',
          type: 'string',
          required: false,
        },
        {
          key: 'is_published',
          label: 'Published',
          type: 'boolean',
          required: false,
          default: 'true',
        },
      ],
      perform: async (z: unknown, bundle: ZapierBundle) => {
        const response = await fetch('https://api.vayva.ng/v1/products', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
            'X-Merchant-ID': bundle.authData.merchantId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bundle.inputData),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Failed to create product: ${error}`);
        }

        return await response.json();
      },
    },
  },

  create_customer: {
    key: 'create_customer',
    noun: 'Customer',
    display: {
      label: 'Create Customer',
      description: 'Adds a new customer to your store.',
    },
    operation: {
      inputFields: [
        {
          key: 'name',
          label: 'Full Name',
          type: 'string',
          required: true,
        },
        {
          key: 'email',
          label: 'Email Address',
          type: 'string',
          required: false,
        },
        {
          key: 'phone',
          label: 'Phone Number',
          type: 'string',
          required: false,
          helpText: 'Include country code (e.g., +2348012345678)',
        },
        {
          key: 'address',
          label: 'Address',
          type: 'text',
          required: false,
        },
        {
          key: 'tags',
          label: 'Tags',
          type: 'string',
          required: false,
          helpText: 'Comma-separated list of tags',
        },
      ],
      perform: async (z: unknown, bundle: ZapierBundle) => {
        const response = await fetch('https://api.vayva.ng/v1/customers', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
            'X-Merchant-ID': bundle.authData.merchantId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bundle.inputData),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Failed to create customer: ${error}`);
        }

        return await response.json();
      },
    },
  },

  update_inventory: {
    key: 'update_inventory',
    noun: 'Inventory',
    display: {
      label: 'Update Inventory',
      description: 'Updates the stock quantity for a product.',
    },
    operation: {
      inputFields: [
        {
          key: 'product_id',
          label: 'Product ID',
          type: 'string',
          required: true,
          helpText: 'The ID of the product to update',
        },
        {
          key: 'quantity',
          label: 'New Quantity',
          type: 'number',
          required: true,
          helpText: 'The new stock quantity',
        },
        {
          key: 'reason',
          label: 'Reason',
          type: 'string',
          required: false,
          helpText: 'Reason for inventory adjustment',
        },
      ],
      perform: async (z: unknown, bundle: ZapierBundle) => {
        const response = await fetch(`https://api.vayva.ng/v1/products/${bundle.inputData.product_id}/inventory`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
            'X-Merchant-ID': bundle.authData.merchantId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            quantity: bundle.inputData.quantity,
            reason: bundle.inputData.reason,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Failed to update inventory: ${error}`);
        }

        return await response.json();
      },
    },
  },

  send_whatsapp_message: {
    key: 'send_whatsapp_message',
    noun: 'Message',
    display: {
      label: 'Send WhatsApp Message',
      description: 'Sends a WhatsApp message to a customer.',
    },
    operation: {
      inputFields: [
        {
          key: 'phone_number',
          label: 'Phone Number',
          type: 'string',
          required: true,
          helpText: 'Customer phone number with country code',
        },
        {
          key: 'message',
          label: 'Message',
          type: 'text',
          required: true,
        },
        {
          key: 'template_name',
          label: 'Template Name',
          type: 'string',
          required: false,
          helpText: 'Use a pre-approved WhatsApp template (optional)',
        },
      ],
      perform: async (z: unknown, bundle: ZapierBundle) => {
        const response = await fetch('https://api.vayva.ng/v1/whatsapp/send', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
            'X-Merchant-ID': bundle.authData.merchantId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(bundle.inputData),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Failed to send message: ${error}`);
        }

        return await response.json();
      },
    },
  },

  create_order: {
    key: 'create_order',
    noun: 'Order',
    display: {
      label: 'Create Order',
      description: 'Creates a new order in your store.',
    },
    operation: {
      inputFields: [
        {
          key: 'customer_id',
          label: 'Customer ID',
          type: 'string',
          required: false,
          helpText: 'Existing customer ID (optional)',
        },
        {
          key: 'customer_name',
          label: 'Customer Name',
          type: 'string',
          required: true,
        },
        {
          key: 'customer_phone',
          label: 'Customer Phone',
          type: 'string',
          required: true,
        },
        {
          key: 'customer_email',
          label: 'Customer Email',
          type: 'string',
          required: false,
        },
        {
          key: 'items',
          label: 'Order Items (JSON)',
          type: 'text',
          required: true,
          helpText: 'JSON array of items: [{"product_id": "123", "quantity": 2, "price": 5000}]',
        },
        {
          key: 'delivery_address',
          label: 'Delivery Address',
          type: 'text',
          required: false,
        },
        {
          key: 'notes',
          label: 'Order Notes',
          type: 'text',
          required: false,
        },
      ],
      perform: async (z: unknown, bundle: ZapierBundle) => {
        const items = JSON.parse(bundle.inputData.items as string);
        
        const response = await fetch('https://api.vayva.ng/v1/orders', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${bundle.authData.apiKey}`,
            'X-Merchant-ID': bundle.authData.merchantId,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...bundle.inputData,
            items,
          }),
        });

        if (!response.ok) {
          const error = await response.text();
          throw new Error(`Failed to create order: ${error}`);
        }

        return await response.json();
      },
    },
  },
};

// ============================================
// Zapier App Manifest
// ============================================

export const zapierAppManifest = {
  version: '1.0.0',
  platformVersion: '15.0.0',
  authentication: zapierAuth,
  triggers: Object.values(zapierTriggers),
  actions: Object.values(zapierActions),
  
  // Search operations
  searches: {
    find_customer: {
      key: 'find_customer',
      noun: 'Customer',
      display: {
        label: 'Find Customer',
        description: 'Finds a customer by email or phone.',
      },
      operation: {
        inputFields: [
          {
            key: 'email',
            label: 'Email',
            type: 'string',
            required: false,
          },
          {
            key: 'phone',
            label: 'Phone',
            type: 'string',
            required: false,
          },
        ],
        perform: async (z: unknown, bundle: ZapierBundle) => {
          const params = new URLSearchParams();
          if (bundle.inputData.email) params.set('email', bundle.inputData.email as string);
          if (bundle.inputData.phone) params.set('phone', bundle.inputData.phone as string);

          const response = await fetch(`https://api.vayva.ng/v1/customers/search?${params}`, {
            headers: {
              'Authorization': `Bearer ${bundle.authData.apiKey}`,
              'X-Merchant-ID': bundle.authData.merchantId,
            },
          });

          if (!response.ok) {
            throw new Error('Failed to search customers');
          }

          const data = await response.json();
          return data.customers || [];
        },
      },
    },
    
    find_product: {
      key: 'find_product',
      noun: 'Product',
      display: {
        label: 'Find Product',
        description: 'Finds a product by name or SKU.',
      },
      operation: {
        inputFields: [
          {
            key: 'query',
            label: 'Search Query',
            type: 'string',
            required: true,
            helpText: 'Product name or SKU to search for',
          },
        ],
        perform: async (z: unknown, bundle: ZapierBundle) => {
          const response = await fetch(
            `https://api.vayva.ng/v1/products/search?q=${encodeURIComponent(bundle.inputData.query as string)}`,
            {
              headers: {
                'Authorization': `Bearer ${bundle.authData.apiKey}`,
                'X-Merchant-ID': bundle.authData.merchantId,
              },
            }
          );

          if (!response.ok) {
            throw new Error('Failed to search products');
          }

          const data = await response.json();
          return data.products || [];
        },
      },
    },
  },
};

// Export all for use in Zapier platform
export default zapierAppManifest;
