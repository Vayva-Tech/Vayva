/**
 * @vayva/integrations
 * Integration ecosystem for Vayva - API keys, webhooks, and third-party integrations
 */

// ============================================
// Connectors
// ============================================
export * from './connectors';

// ============================================
// Connection Manager
// ============================================
export {
  IntegrationConnectionManager,
  connectionManager,
} from './connection-manager';

export type {
  ConnectionCredentials,
  ConnectionStatus,
  OAuthInitResult,
  OAuthCallbackResult,
} from './connection-manager';

// ============================================
// Marketplace
// ============================================
export {
  IntegrationMarketplace,
  integrationMarketplace,
  integrationCatalog,
  getIntegrationById,
  getIntegrationsByCategory,
  searchIntegrations,
} from './marketplace';

export type {
  IntegrationCategory,
  IntegrationPricing,
  SetupType,
  InstallationStatus,
  Integration,
  IntegrationInstallation,
  IntegrationFilter,
  InstallationResult,
  ConnectorConfig,
  SyncResult,
} from './marketplace';

// ============================================
// Types
// ============================================
export type {
  // API Key Types
  ApiKey,
  ApiKeyStatus,
  ApiKeyScope,
  ApiKeyValidation,
  CreateApiKeyInput,
  ApiKeyRotationResult,
  
  // Webhook Types
  WebhookEndpoint,
  WebhookEndpointStatus,
  WebhookDelivery,
  WebhookDeliveryStatus,
  WebhookEvent,
  WebhookEventType,
  WebhookPayload,
  CreateWebhookInput,
  WebhookDeliveryStats,
  
  // Zapier Types
  ZapierTrigger,
  ZapierAction,
  ZapierBundle,
  ZapierInputField,
  ZapierAuthentication,
  
  // Rate Limiting
  RateLimitInfo,
  RateLimitCheck,
  
  // Events
  IntegrationEvent,
} from './types';

// ============================================
// API Key Management
// ============================================
export { ApiKeyManager, apiKeyManager } from './api-keys/manager';

// ============================================
// Webhook Management
// ============================================
export { WebhookManager, webhookManager } from './webhooks/manager';
export { WebhookWorker, webhookWorker, createWebhookWorker } from './webhooks/worker';
export type { WebhookWorkerConfig } from './webhooks/worker';
export type { WebhookDeliveryResult } from './webhooks/manager';

// ============================================
// Zapier Integration
// ============================================
export {
  zapierAuth,
  zapierTriggers,
  zapierActions,
  zapierApp,
  handleZapierWebhook,
} from './zapier';

// ============================================
// OAuth Provider
// ============================================
export {
  OAuthProvider,
  oauthProvider,
  createAuthorizationCode,
  exchangeCodeForToken,
  validateAccessToken,
  revokeToken,
} from './oauth/provider';

export type {
  OAuthClient,
  OAuthAuthorizationCode,
  OAuthToken,
  OAuthScope,
  AuthorizationRequest,
  TokenResponse,
} from './oauth/provider';

// ============================================
// Constants
// ============================================
export const WEBHOOK_EVENTS = {
  // Orders
  ORDER_CREATED: 'order.created',
  ORDER_PAID: 'order.paid',
  ORDER_SHIPPED: 'order.shipped',
  ORDER_DELIVERED: 'order.delivered',
  ORDER_CANCELLED: 'order.cancelled',
  ORDER_REFUNDED: 'order.refunded',
  
  // Payments
  PAYMENT_SUCCESS: 'payment.success',
  PAYMENT_FAILED: 'payment.failed',
  
  // Customers
  CUSTOMER_CREATED: 'customer.created',
  CUSTOMER_UPDATED: 'customer.updated',
  
  // Products
  PRODUCT_CREATED: 'product.created',
  PRODUCT_UPDATED: 'product.updated',
  PRODUCT_DELETED: 'product.deleted',
  
  // Inventory
  INVENTORY_LOW_STOCK: 'inventory.low_stock',
  INVENTORY_OUT_OF_STOCK: 'inventory.out_of_stock',
  
  // Subscriptions
  SUBSCRIPTION_CREATED: 'subscription.created',
  SUBSCRIPTION_CANCELLED: 'subscription.cancelled',
  SUBSCRIPTION_RENEWED: 'subscription.renewed',
  SUBSCRIPTION_PAYMENT_FAILED: 'subscription.payment_failed',
  
  // WhatsApp
  WHATSAPP_MESSAGE_RECEIVED: 'whatsapp.message.received',
  WHATSAPP_MESSAGE_SENT: 'whatsapp.message.sent',
  
  // Autopilot
  AUTOPILOT_ACTION_TRIGGERED: 'autopilot.action.triggered',
  
  // Wildcard
  ALL: '*',
} as const;

export const API_KEY_SCOPES = {
  ORDERS_READ: 'orders:read',
  ORDERS_WRITE: 'orders:write',
  PRODUCTS_READ: 'products:read',
  PRODUCTS_WRITE: 'products:write',
  CUSTOMERS_READ: 'customers:read',
  CUSTOMERS_WRITE: 'customers:write',
  INVENTORY_READ: 'inventory:read',
  INVENTORY_WRITE: 'inventory:write',
  ANALYTICS_READ: 'analytics:read',
  WEBHOOKS_MANAGE: 'webhooks:manage',
  API_KEYS_MANAGE: 'api_keys:manage',
  FULL_ACCESS: 'full_access',
} as const;

// ============================================
// Version
// ============================================
export const VERSION = '1.0.0';
