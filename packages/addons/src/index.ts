/**
 * Vayva Add-on System
 * 
 * A comprehensive add-on system for extending storefront functionality.
 */

// ============================================================================
// CORE TYPES
// ============================================================================

export type {
  AddOnDefinition,
  AddOnCategory,
  InstalledAddOn,
  AddOnInstallationRequest,
  AddOnInstallationResult,
} from './types';

export {
  ADDON_CATEGORIES,
} from './types';

// ============================================================================
// REGISTRY
// ============================================================================

export {
  registerAddon,
  getAddonById,
  getAllAddons,
  getAddonsByCategory,
} from './registry';

// ============================================================================
// ADD-ON DEFINITIONS - Universal
// ============================================================================

export {
  default as NEWSLETTER_ADDON,
  NEWSLETTER_SUBSCRIBER_MODEL as NEWSLETTER_MODELS,
} from './addons/newsletter';
export {
  default as REVIEWS_ADDON,
  PRODUCT_REVIEW_MODEL as REVIEWS_MODELS,
} from './addons/reviews';
export {
  default as WHATSAPP_ADDON,
  WHATSAPP_ANALYTICS_MODEL as WHATSAPP_MODELS,
} from './addons/whatsapp';
export { default as COMPARISON_ADDON } from './addons/comparison';
export {
  default as WISHLIST_ADDON,
  WISHLIST_MODEL as WISHLIST_MODELS,
} from './addons/wishlist';
export { default as SOCIAL_SHARING_ADDON } from './addons/social-share';
export { default as SHOPPING_CART_ADDON, SHOPPING_CART_MODELS } from './addons/shopping-cart';
export { default as CHECKOUT_FLOW_ADDON, CHECKOUT_FLOW_MODELS } from './addons/checkout-flow';
export { default as LIVE_CHAT_ADDON, LIVE_CHAT_MODELS } from './addons/live-chat';
export { default as COUNTDOWN_TIMER_ADDON, COUNTDOWN_TIMER_MODELS } from './addons/countdown-timer';
export { default as COOKIE_CONSENT_ADDON, COOKIE_CONSENT_MODELS } from './addons/cookie-consent';

// ============================================================================
// ADD-ON DEFINITIONS - Industry Specific
// ============================================================================

export { default as TEST_DRIVE_ADDON, TEST_DRIVE_MODELS } from './addons/industry/test-drive';
export { default as TABLE_BOOKING_ADDON, TABLE_BOOKING_MODELS } from './addons/industry/table-booking';
export { default as FOOD_MENU_ADDON, FOOD_MENU_MODELS } from './addons/industry/food-menu';
export { default as KITCHEN_DISPLAY_ADDON, KITCHEN_DISPLAY_MODELS } from './addons/industry/kitchen-display';
export { default as PROPERTY_SEARCH_ADDON, PROPERTY_SEARCH_MODELS } from './addons/industry/property-search';
export { default as APPOINTMENT_SCHEDULER_ADDON, APPOINTMENT_SCHEDULER_MODELS } from './addons/industry/appointment-scheduler';
export { default as EVENT_CALENDAR_ADDON, EVENT_CALENDAR_MODELS } from './addons/industry/event-calendar';

// ============================================================================
// UNIVERSAL ADD-ONS COLLECTION
// ============================================================================

export { default as ALL_UNIVERSAL_ADDONS, ADDONS_BY_CATEGORY } from './addons/index';

// ============================================================================
// INDUSTRY ADD-ONS COLLECTION
// ============================================================================

export { default as ALL_INDUSTRY_ADDONS } from './addons/industry/index';

// ============================================================================
// RUNTIME & INFRASTRUCTURE
// ============================================================================

export { LifecycleManager } from './runtime/lifecycle';

export { DiscoveryEngine } from './registry/discovery';
export { VersioningEngine } from './registry/versioning';
export { CompatibilityEngine } from './registry/compatibility';

export { StateSync } from './state-sync';

// ============================================================================
// VERSION
// ============================================================================

export const VERSION = '1.0.0';
