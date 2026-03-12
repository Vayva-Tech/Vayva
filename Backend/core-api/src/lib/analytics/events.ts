/**
 * Canonical Event Taxonomy for Vayva
 * Phase 2 - Product Analytics
 */
// --- TAXONOMY DEFINITIONS ---
// 1. ACQUISITION
export const ACQUISITION_EVENTS = {
  VIEW_LANDING: "view_landing",
  VIEW_PRICING: "view_pricing",
  START_SIGNUP: "start_signup",
  COMPLETE_SIGNUP: "complete_signup",
  VIEW_TEMPLATE_GALLERY: "view_template_gallery",
  PREVIEW_TEMPLATE: "preview_template",
};
// 2. ACTIVATION
export const ACTIVATION_EVENTS = {
  SELECT_CATEGORY: "select_category",
  CREATE_STORE: "create_store",
  SELECT_TEMPLATE: "select_template",
  PUBLISH_STORE: "publish_store",
  ADD_FIRST_PRODUCT: "add_first_product",
  COMPLETE_ONBOARDING: "complete_onboarding",
};
// 3. COMMERCE (Storefront & Admin)
export const COMMERCE_EVENTS = {
  VIEW_PRODUCT: "view_product",
  ADD_TO_CART: "add_to_cart",
  BEGIN_CHECKOUT: "begin_checkout",
  ADD_PAYMENT_INFO: "add_payment_info",
  PURCHASE_SUCCESS: "purchase_success",
  PURCHASE_FAILURE: "purchase_failure",
  REFUND_INITIATED: "refund_initiated",
};
// 4. OPS (Merchant Admin)
export const OPS_EVENTS = {
  ORDER_STATUS_UPDATE: "order_status_update",
  INVENTORY_LOW: "inventory_low",
  PAYOUT_REQUESTED: "payout_requested",
  WITHDRAWAL_PROCESSED: "withdrawal_processed",
};
// 5. ENGAGEMENT
export const ENGAGEMENT_EVENTS = {
  LOGIN: "login",
  VIEW_DASHBOARD: "view_dashboard",
  EXPORT_REPORT: "export_report",
  UPDATE_SETTINGS: "update_settings",
  INVITE_TEAM_MEMBER: "invite_team_member",
};
// Helper to create event payload
export function createEventPayload(
  category: string,
  action: string,
  metadata = {},
  userId: string,
  storeId: string,
) {
  return {
    category,
    action,
    metadata,
    userId,
    storeId,
  };
}
