export const Permissions = {
  // Store & General
  STORE_UPDATE: "store.update",
  STORE_DESIGN: "store.design",
  STORE_SETTINGS: "store.settings",

  // Auth & Staff
  STAFF_INVITE: "staff.invite",
  STAFF_MANAGE: "staff.manage",

  // Products & Inventory
  PRODUCTS_VIEW: "products.view",
  PRODUCTS_CREATE: "products.create",
  PRODUCTS_UPDATE: "products.update",
  PRODUCTS_DELETE: "products.delete",
  INVENTORY_MANAGE: "inventory.manage",

  // Orders & Fulfillment
  ORDERS_VIEW: "orders.view",
  ORDERS_MANAGE: "orders.manage", // Update status, notes
  ORDERS_CANCEL: "orders.cancel", // Cancel order entirely
  DELIVERY_MANAGE: "delivery.manage", // Schedule tasks

  // Refunds (Special Gate)
  REFUND_REQUEST: "refund.request", // Can initiate
  REFUND_APPROVE: "refund.approve", // Can approve

  // Finance
  FINANCE_VIEW: "finance.view", // View transactions
  FINANCE_PAYOUT: "finance.payout", // Request withdrawals
  FINANCE_SETTINGS: "finance.settings", // Manage bank accounts

  // Customers
  CUSTOMERS_VIEW: "customers.view",
  CUSTOMERS_MANAGE: "customers.manage",

  // Marketplace
  MARKETPLACE_MANAGE: "marketplace.manage", // Opt-in/out
  MARKETPLACE_PROMOTE: "marketplace.promote", // Ads/Boosts

  // WhatsApp AI
  WA_SETTINGS: "wa.settings",
  WA_KB_EDIT: "wa.kb.edit",

  // Internal Ops (Vayva Admin)
  OPS_VIEW: "ops.view",
  OPS_MANAGE: "ops.manage",
  OPS_DISPUTE: "ops.dispute",
} as const;

export type Permission = (typeof Permissions)[keyof typeof Permissions];
