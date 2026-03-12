/**
 * Integration Types - Shared types for API keys, webhooks, and third-party integrations
 */

// ============================================
// API Key Types
// ============================================

export type ApiKeyStatus = 'ACTIVE' | 'REVOKED';

export type ApiKeyScope = 
  | 'orders:read' 
  | 'orders:write'
  | 'products:read'
  | 'products:write'
  | 'customers:read'
  | 'customers:write'
  | 'inventory:read'
  | 'inventory:write'
  | 'analytics:read'
  | 'webhooks:manage'
  | 'api_keys:manage'
  | 'full_access';

export interface ApiKey {
  id: string;
  storeId: string;
  name: string;
  keyPrefix: string;
  keyHash: string;
  scopes: ApiKeyScope[];
  status: ApiKeyStatus;
  lastUsedAt: Date | null;
  createdAt: Date;
  revokedAt: Date | null;
  expiresAt: Date | null;
  ipAllowlist: string[];
  lastIp: string | null;
  rateLimitPerMinute: number;
  rateLimitPerHour: number;
  usageCount: number;
  createdBy?: string;
  revokeReason?: string;
}

export interface ApiKeyValidation {
  valid: boolean;
  reason?: 'invalid_key' | 'expired' | 'revoked' | 'ip_not_allowed' | 'rate_limited';
  apiKey?: Omit<ApiKey, 'keyHash'>;
}

export interface CreateApiKeyInput {
  storeId: string;
  name: string;
  scopes: ApiKeyScope[];
  createdByUserId: string;
  expiresAt?: Date;
  ipAllowlist?: string[];
  rateLimitPerMinute?: number;
  rateLimitPerHour?: number;
}

export interface ApiKeyRotationResult {
  newKey: { id: string; key: string; prefix: string };
  oldKeyExpiry: Date;
  message: string;
}

// ============================================
// Webhook Types
// ============================================

export type WebhookEndpointStatus = 'ACTIVE' | 'DISABLED';
export type WebhookDeliveryStatus = 'PENDING' | 'DELIVERED' | 'FAILED' | 'DEAD';

export type WebhookEventType =
  | 'order.created'
  | 'order.paid'
  | 'order.shipped'
  | 'order.delivered'
  | 'order.cancelled'
  | 'order.refunded'
  | 'payment.success'
  | 'payment.failed'
  | 'customer.created'
  | 'customer.updated'
  | 'product.created'
  | 'product.updated'
  | 'product.deleted'
  | 'inventory.low_stock'
  | 'inventory.out_of_stock'
  | 'subscription.created'
  | 'subscription.cancelled'
  | 'subscription.renewed'
  | 'subscription.payment_failed'
  | 'whatsapp.message.received'
  | 'whatsapp.message.sent'
  | 'autopilot.action.triggered'
  | '*'; // Subscribe to all events

export interface WebhookEndpoint {
  id: string;
  storeId: string;
  url: string;
  status: WebhookEndpointStatus;
  secret: string;
  secretEnc: string;
  subscribedEvents: WebhookEventType[];
  createdAt: Date;
  updatedAt: Date;
  description?: string;
}

export interface WebhookDelivery {
  id: string;
  storeId: string;
  endpointId: string;
  eventId: string;
  eventType: WebhookEventType;
  attempt: number;
  status: WebhookDeliveryStatus;
  responseCode?: number;
  responseBodySnippet?: string;
  nextRetryAt?: Date;
  deliveredAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  errorMessage?: string;
}

export interface WebhookEvent {
  id: string;
  storeId: string;
  type: WebhookEventType;
  payload: Record<string, unknown>;
  createdAt: Date;
}

export interface WebhookPayload {
  event: WebhookEventType;
  timestamp: string;
  data: Record<string, unknown>;
  signature?: string;
}

export interface CreateWebhookInput {
  storeId: string;
  url: string;
  events: WebhookEventType[];
  secret?: string;
  description?: string;
}

export interface WebhookDeliveryStats {
  total: number;
  successful: number;
  failed: number;
  pending: number;
  successRate: number;
  averageResponseTime: number;
}

// ============================================
// Zapier Integration Types
// ============================================

export interface ZapierTrigger {
  key: string;
  noun: string;
  display: {
    label: string;
    description: string;
  };
  operation: {
    type: 'hook' | 'polling';
    performSubscribe?: (z: unknown, bundle: ZapierBundle) => Promise<{ webhookId: string }>;
    performUnsubscribe?: (z: unknown, bundle: ZapierBundle) => Promise<void>;
    perform?: (z: unknown, bundle: ZapierBundle) => Promise<unknown[]>;
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
    perform: (z: unknown, bundle: ZapierBundle) => Promise<unknown>;
  };
}

export interface ZapierInputField {
  key: string;
  label: string;
  type?: 'string' | 'number' | 'boolean' | 'datetime' | 'text';
  required?: boolean;
  default?: string;
  helpText?: string;
}

export interface ZapierBundle {
  authData: {
    merchantId: string;
    apiKey: string;
  };
  inputData: Record<string, unknown>;
  targetUrl?: string;
  subscribeData?: {
    webhookId: string;
  };
}

export interface ZapierAuthentication {
  type: 'custom';
  test: (z: unknown, bundle: ZapierBundle) => Promise<void>;
  fields: ZapierInputField[];
}

// ============================================
// Integration Event Types
// ============================================

export interface IntegrationEvent {
  type: 'api_key.created' | 'api_key.revoked' | 'api_key.rotated' |
        'webhook.created' | 'webhook.deleted' | 'webhook.updated' |
        'webhook.delivery.success' | 'webhook.delivery.failed' |
        'zapier.connected' | 'zapier.disconnected';
  timestamp: Date;
  storeId: string;
  data: Record<string, unknown>;
}

// ============================================
// Rate Limiting Types
// ============================================

export interface RateLimitInfo {
  limit: number;
  remaining: number;
  resetAt: Date;
  window: 'minute' | 'hour';
}

export interface RateLimitCheck {
  allowed: boolean;
  info: RateLimitInfo;
  retryAfter?: number;
}
