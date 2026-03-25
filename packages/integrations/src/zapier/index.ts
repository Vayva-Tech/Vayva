/**
 * Zapier Integration for Vayva
 * 
 * Enables workflow automation with 5000+ apps through Zapier.
 * Implements triggers, actions, and authentication.
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { logger } from '@vayva/shared';

const integrationsPackageJsonPath = join(
  dirname(fileURLToPath(import.meta.url)),
  '..',
  '..',
  'package.json',
);
const integrationsVersion = (
  JSON.parse(readFileSync(integrationsPackageJsonPath, 'utf8')) as { version: string }
).version;

/** Zapier Platform CLI major version this manifest targets (see Zapier Platform changelog). */
const ZAPIER_PLATFORM_VERSION = '15.0.0';
// Note: prisma models would be defined in schema when needed
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const prisma: any = {
    webhook: {
        findMany: async () => [],
        update: async () => ({}),
    },
};

// ============================================================================
// Types
// ============================================================================

export interface ZapierAuth {
  access_token: string;
  refresh_token: string;
  expires_at: Date;
  merchantId: string;
}

export interface ZapierTrigger {
  key: string;
  noun: string;
  display: {
    label: string;
    description: string;
  };
  operation: {
    type: 'hook' | 'polling';
    performSubscribe: (z: ZapierZObject, bundle: ZapierBundle) => Promise<unknown>;
    performUnsubscribe: (z: ZapierZObject, bundle: ZapierBundle) => Promise<unknown>;
    perform: (z: ZapierZObject, bundle: ZapierBundle) => Promise<unknown[]>;
    sample?: Record<string, unknown>;
  };
}

export interface ZapierAction {
  key: string;
  noun: string;
  display: {
    label: string;
    description: string;
  };
  operation: {
    inputFields: ZapierInputField[];
    perform: (z: ZapierZObject, bundle: ZapierBundle) => Promise<unknown>;
    sample?: Record<string, unknown>;
  };
}

export interface ZapierInputField {
  key: string;
  label: string;
  type?: 'string' | 'number' | 'boolean' | 'datetime' | 'text';
  required?: boolean;
  choices?: string[] | Record<string, string>;
  helpText?: string;
  default?: unknown;
}

export interface ZapierResponse<T = unknown> {
  data: T;
  status: number;
}

export interface ZapierZObject {
  request: {
    get: (url: string, options?: unknown) => Promise<ZapierResponse>;
    post: (url: string, options?: unknown) => Promise<ZapierResponse>;
    patch: (url: string, options?: unknown) => Promise<ZapierResponse>;
    delete: (url: string, options?: unknown) => Promise<ZapierResponse>;
  };
  JSON: {
    stringify: (obj: unknown) => string;
    parse: (str: string) => unknown;
  };
  console: Console;
}

export interface ZapierBundle {
  authData: ZapierAuth;
  inputData: Record<string, unknown>;
  targetUrl?: string;
  subscribeData?: {
    webhookId: string;
  };
  cleanedRequest?: Record<string, unknown>;
}

// ============================================================================
// Authentication
// ============================================================================

export const zapierAuth = {
  type: 'oauth2',
  oauth2Config: {
    authorizeUrl: {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/zapier/auth`,
      params: {
        client_id: '{{process.env.ZAPIER_CLIENT_ID}}',
        state: '{{bundle.inputData.state}}',
        redirect_uri: '{{bundle.inputData.redirect_uri}}',
        response_type: 'code',
      },
    },
    getAccessToken: {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/zapier/token`,
      method: 'POST',
      params: {
        code: '{{bundle.inputData.code}}',
        client_id: '{{process.env.ZAPIER_CLIENT_ID}}',
        client_secret: '{{process.env.ZAPIER_CLIENT_SECRET}}',
        redirect_uri: '{{bundle.inputData.redirect_uri}}',
        grant_type: 'authorization_code',
      },
    },
    refreshAccessToken: {
      url: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/zapier/refresh`,
      method: 'POST',
      params: {
        refresh_token: '{{bundle.authData.refresh_token}}',
        grant_type: 'refresh_token',
      },
    },
    autoRefresh: true,
  },
  test: {
    url: `${process.env.NEXT_PUBLIC_APP_URL}/api/integrations/zapier/me`,
  },
  connectionLabel: '{{merchantName}}',
};

// ============================================================================
// Triggers
// ============================================================================

export const zapierTriggers: Record<string, ZapierTrigger> = {
  new_order: {
    key: 'new_order',
    noun: 'Order',
    display: {
      label: 'New Order',
      description: 'Triggers when a new order is received in your Vayva store.',
    },
    operation: {
      type: 'hook',
      performSubscribe: async (z, bundle) => {
        const response = await z.request.post(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/zapier`,
          {
            body: {
              targetUrl: bundle.targetUrl,
              event: 'order.created',
              merchantId: bundle.authData.merchantId,
            },
            headers: {
              Authorization: `Bearer ${bundle.authData.access_token}`,
            },
          }
        );
        return { webhookId: (response.data as { id: string }).id };
      },
      performUnsubscribe: async (z, bundle) => {
        await z.request.delete(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/zapier/${bundle.subscribeData?.webhookId}`,
          {
            headers: {
              Authorization: `Bearer ${bundle.authData.access_token}`,
            },
          }
        );
        return {};
      },
      perform: async (z, bundle) => {
        return [bundle.cleanedRequest];
      },
      sample: {
        id: 'ord_123',
        orderNumber: 'VA-2026-001',
        customer: {
          name: 'John Doe',
          phone: '+2348012345678',
          email: 'john@example.com',
        },
        items: [
          { name: 'Product A', quantity: 2, price: 5000, sku: 'SKU-001' },
        ],
        subtotal: 10000,
        shipping: 500,
        tax: 750,
        total: 11250,
        status: 'pending',
        paymentStatus: 'pending',
        createdAt: '2026-03-10T10:00:00Z',
        storeId: 'store_123',
      },
    },
  },

  order_status_changed: {
    key: 'order_status_changed',
    noun: 'Order',
    display: {
      label: 'Order Status Changed',
      description: 'Triggers when an order status changes (e.g., pending → confirmed → shipped).',
    },
    operation: {
      type: 'hook',
      performSubscribe: async (z, bundle) => {
        const response = await z.request.post(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/zapier`,
          {
            body: {
              targetUrl: bundle.targetUrl,
              event: 'order.status_updated',
              merchantId: bundle.authData.merchantId,
            },
            headers: {
              Authorization: `Bearer ${bundle.authData.access_token}`,
            },
          }
        );
        return { webhookId: (response.data as { id: string }).id };
      },
      performUnsubscribe: async (z, bundle) => {
        await z.request.delete(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/zapier/${bundle.subscribeData?.webhookId}`,
          {
            headers: {
              Authorization: `Bearer ${bundle.authData.access_token}`,
            },
          }
        );
        return {};
      },
      perform: async (z, bundle) => {
        return [bundle.cleanedRequest];
      },
      sample: {
        id: 'ord_123',
        orderNumber: 'VA-2026-001',
        previousStatus: 'pending',
        newStatus: 'confirmed',
        customer: {
          name: 'John Doe',
          phone: '+2348012345678',
        },
        total: 11250,
        changedAt: '2026-03-10T11:30:00Z',
        storeId: 'store_123',
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
      performSubscribe: async (z, bundle) => {
        const response = await z.request.post(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/zapier`,
          {
            body: {
              targetUrl: bundle.targetUrl,
              event: 'customer.created',
              merchantId: bundle.authData.merchantId,
            },
            headers: {
              Authorization: `Bearer ${bundle.authData.access_token}`,
            },
          }
        );
        return { webhookId: (response.data as { id: string }).id };
      },
      performUnsubscribe: async (z, bundle) => {
        await z.request.delete(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/zapier/${bundle.subscribeData?.webhookId}`,
          {
            headers: {
              Authorization: `Bearer ${bundle.authData.access_token}`,
            },
          }
        );
        return {};
      },
      perform: async (z, bundle) => {
        return [bundle.cleanedRequest];
      },
      sample: {
        id: 'cust_123',
        name: 'Jane Smith',
        email: 'jane@example.com',
        phone: '+2348098765432',
        source: 'whatsapp',
        totalOrders: 0,
        totalSpent: 0,
        createdAt: '2026-03-10T10:00:00Z',
        storeId: 'store_123',
      },
    },
  },

  new_payment: {
    key: 'new_payment',
    noun: 'Payment',
    display: {
      label: 'New Payment Received',
      description: 'Triggers when a payment is successfully processed.',
    },
    operation: {
      type: 'hook',
      performSubscribe: async (z, bundle) => {
        const response = await z.request.post(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/zapier`,
          {
            body: {
              targetUrl: bundle.targetUrl,
              event: 'payment.success',
              merchantId: bundle.authData.merchantId,
            },
            headers: {
              Authorization: `Bearer ${bundle.authData.access_token}`,
            },
          }
        );
        return { webhookId: (response.data as { id: string }).id };
      },
      performUnsubscribe: async (z, bundle) => {
        await z.request.delete(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/zapier/${bundle.subscribeData?.webhookId}`,
          {
            headers: {
              Authorization: `Bearer ${bundle.authData.access_token}`,
            },
          }
        );
        return {};
      },
      perform: async (z, bundle) => {
        return [bundle.cleanedRequest];
      },
      sample: {
        id: 'pay_123',
        orderId: 'ord_123',
        orderNumber: 'VA-2026-001',
        amount: 11250,
        currency: 'NGN',
        paymentMethod: 'paystack',
        status: 'success',
        reference: 'PAY-123456',
        paidAt: '2026-03-10T10:05:00Z',
        customer: {
          name: 'John Doe',
          email: 'john@example.com',
        },
        storeId: 'store_123',
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
      performSubscribe: async (z, bundle) => {
        const response = await z.request.post(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/zapier`,
          {
            body: {
              targetUrl: bundle.targetUrl,
              event: 'inventory.low_stock',
              merchantId: bundle.authData.merchantId,
            },
            headers: {
              Authorization: `Bearer ${bundle.authData.access_token}`,
            },
          }
        );
        return { webhookId: (response.data as { id: string }).id };
      },
      performUnsubscribe: async (z, bundle) => {
        await z.request.delete(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/webhooks/zapier/${bundle.subscribeData?.webhookId}`,
          {
            headers: {
              Authorization: `Bearer ${bundle.authData.access_token}`,
            },
          }
        );
        return {};
      },
      perform: async (z, bundle) => {
        return [bundle.cleanedRequest];
      },
      sample: {
        productId: 'prod_123',
        name: 'Product A',
        sku: 'SKU-001',
        currentStock: 5,
        threshold: 10,
        status: 'low_stock',
        alertAt: '2026-03-10T10:00:00Z',
        storeId: 'store_123',
      },
    },
  },
};

// ============================================================================
// Actions
// ============================================================================

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
        { key: 'name', label: 'Product Name', type: 'string', required: true },
        { key: 'price', label: 'Price', type: 'number', required: true },
        { key: 'description', label: 'Description', type: 'text', required: false },
        { key: 'sku', label: 'SKU', type: 'string', required: false },
        { key: 'category', label: 'Category', type: 'string', required: false },
        { key: 'inventory', label: 'Initial Inventory', type: 'number', required: false, default: 0 },
        { key: 'trackInventory', label: 'Track Inventory', type: 'boolean', required: false, default: true },
      ],
      perform: async (z, bundle) => {
        const response = await z.request.post(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/products`,
          {
            body: {
              name: bundle.inputData.name,
              price: bundle.inputData.price,
              description: bundle.inputData.description,
              sku: bundle.inputData.sku,
              category: bundle.inputData.category,
              inventory: bundle.inputData.inventory,
              trackInventory: bundle.inputData.trackInventory,
            },
            headers: {
              Authorization: `Bearer ${bundle.authData.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      },
      sample: {
        id: 'prod_123',
        name: 'New Product',
        price: 5000,
        description: 'Product description',
        sku: 'SKU-NEW-001',
        category: 'General',
        inventory: 100,
        trackInventory: true,
        createdAt: '2026-03-10T10:00:00Z',
      },
    },
  },

  update_order_status: {
    key: 'update_order_status',
    noun: 'Order',
    display: {
      label: 'Update Order Status',
      description: 'Updates the status of an existing order.',
    },
    operation: {
      inputFields: [
        { key: 'orderId', label: 'Order ID', type: 'string', required: true },
        {
          key: 'status',
          label: 'New Status',
          type: 'string',
          required: true,
          choices: ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled'],
        },
        { key: 'note', label: 'Note (optional)', type: 'text', required: false },
      ],
      perform: async (z, bundle) => {
        const response = await z.request.patch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/orders/${bundle.inputData.orderId}/status`,
          {
            body: {
              status: bundle.inputData.status,
              note: bundle.inputData.note,
            },
            headers: {
              Authorization: `Bearer ${bundle.authData.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      },
      sample: {
        id: 'ord_123',
        orderNumber: 'VA-2026-001',
        status: 'confirmed',
        previousStatus: 'pending',
        updatedAt: '2026-03-10T11:30:00Z',
      },
    },
  },

  create_customer: {
    key: 'create_customer',
    noun: 'Customer',
    display: {
      label: 'Create Customer',
      description: 'Adds a new customer to your Vayva store.',
    },
    operation: {
      inputFields: [
        { key: 'name', label: 'Customer Name', type: 'string', required: true },
        { key: 'phone', label: 'Phone Number', type: 'string', required: true },
        { key: 'email', label: 'Email', type: 'string', required: false },
        { key: 'address', label: 'Address', type: 'text', required: false },
        { key: 'tags', label: 'Tags (comma-separated)', type: 'string', required: false },
      ],
      perform: async (z, bundle) => {
        const response = await z.request.post(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/customers`,
          {
            body: {
              name: bundle.inputData.name,
              phone: bundle.inputData.phone,
              email: bundle.inputData.email,
              address: bundle.inputData.address,
              tags: (bundle.inputData.tags as string | undefined)?.split(',').map((t: string) => t.trim()),
            },
            headers: {
              Authorization: `Bearer ${bundle.authData.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      },
      sample: {
        id: 'cust_123',
        name: 'Jane Smith',
        phone: '+2348098765432',
        email: 'jane@example.com',
        address: '123 Main St, Lagos',
        tags: ['vip', 'repeat'],
        createdAt: '2026-03-10T10:00:00Z',
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
        { key: 'phone', label: 'Phone Number', type: 'string', required: true },
        { key: 'message', label: 'Message', type: 'text', required: true },
        { key: 'templateName', label: 'Template Name (optional)', type: 'string', required: false },
      ],
      perform: async (z, bundle) => {
        const response = await z.request.post(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/whatsapp/send`,
          {
            body: {
              to: bundle.inputData.phone,
              body: bundle.inputData.message,
              templateName: bundle.inputData.templateName,
            },
            headers: {
              Authorization: `Bearer ${bundle.authData.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      },
      sample: {
        id: 'msg_123',
        phone: '+2348012345678',
        status: 'sent',
        sentAt: '2026-03-10T10:00:00Z',
      },
    },
  },

  update_inventory: {
    key: 'update_inventory',
    noun: 'Inventory',
    display: {
      label: 'Update Inventory',
      description: 'Updates the stock level for a product.',
    },
    operation: {
      inputFields: [
        { key: 'productId', label: 'Product ID', type: 'string', required: true },
        { key: 'quantity', label: 'New Quantity', type: 'number', required: true },
        { key: 'reason', label: 'Reason', type: 'string', required: false },
      ],
      perform: async (z, bundle) => {
        const response = await z.request.patch(
          `${process.env.NEXT_PUBLIC_APP_URL}/api/products/${bundle.inputData.productId}/inventory`,
          {
            body: {
              quantity: bundle.inputData.quantity,
              reason: bundle.inputData.reason || 'Zapier update',
            },
            headers: {
              Authorization: `Bearer ${bundle.authData.access_token}`,
              'Content-Type': 'application/json',
            },
          }
        );
        return response.data;
      },
      sample: {
        productId: 'prod_123',
        name: 'Product A',
        previousQuantity: 50,
        newQuantity: 100,
        updatedAt: '2026-03-10T10:00:00Z',
      },
    },
  },
};

// ============================================================================
// Zapier App Manifest
// ============================================================================

export const zapierApp = {
  version: integrationsVersion,
  platformVersion: ZAPIER_PLATFORM_VERSION,

  authentication: zapierAuth,

  triggers: zapierTriggers,

  actions: zapierActions,

  searches: {},

  creates: zapierActions,

  resources: {},

  beforeRequest: [
    (request: unknown, z: ZapierZObject, bundle: ZapierBundle) => {
      // Add common headers
      (request as { headers: Record<string, string> }).headers['X-Integration'] = 'zapier';
      (request as { headers: Record<string, string> }).headers['X-Request-ID'] = `zap_${Date.now()}`;
      return request;
    },
  ],

  afterResponse: [
    (response: unknown, z: ZapierZObject, bundle: ZapierBundle) => {
      // Log response for debugging
      if ((response as { status: number }).status >= 400) {
        logger.error('[Zapier] API error', {
          status: (response as { status: number }).status,
          content: (response as { content: string }).content,
        });
      }
      return response;
    },
  ],
};

// ============================================================================
// Webhook Handler
// ============================================================================

export async function handleZapierWebhook(
  event: string,
  payload: Record<string, unknown>,
  merchantId: string
): Promise<void> {
  // Find all active Zapier webhooks for this event
  const webhooks = await prisma.webhook.findMany({
    where: {
      storeId: merchantId,
      event,
      provider: 'zapier',
      isActive: true,
    },
  });

  // Deliver to all subscribed Zaps
  for (const webhook of webhooks) {
    try {
      await fetch(webhook.url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Zapier-Event': event,
          'X-Webhook-ID': webhook.id,
        },
        body: JSON.stringify(payload),
      });

      // Update last used
      await prisma.webhook.update({
        where: { id: webhook.id },
        data: { lastUsedAt: new Date() },
      });
    } catch (error) {
      logger.error('[Zapier] Failed to deliver webhook', {
        webhookId: webhook.id,
        error,
      });
    }
  }
}
