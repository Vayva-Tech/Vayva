/**
 * Universal Add-Ons Registry
 * 
 * All built-in Vayva add-ons are exported here for easy registration
 */

// ============================================================================
// E-Commerce Add-Ons
// ============================================================================
export { WISHLIST_ADDON, WISHLIST_MODEL } from './wishlist';
export { REVIEWS_ADDON, PRODUCT_REVIEW_MODEL } from './reviews';
export { COMPARISON_ADDON } from './comparison';
export { SHOPPING_CART_ADDON, SHOPPING_CART_MODELS } from './shopping-cart';
export { CHECKOUT_FLOW_ADDON, CHECKOUT_FLOW_MODELS } from './checkout-flow';

// ============================================================================
// Marketing Add-Ons
// ============================================================================
export { NEWSLETTER_ADDON, NEWSLETTER_SUBSCRIBER_MODEL } from './newsletter';
export { SOCIAL_SHARING_ADDON } from './social-share';
export { COOKIE_CONSENT_ADDON, COOKIE_CONSENT_MODELS } from './cookie-consent';
export { COUNTDOWN_TIMER_ADDON, COUNTDOWN_TIMER_MODELS } from './countdown-timer';

// ============================================================================
// Customer Service Add-Ons
// ============================================================================
export { WHATSAPP_ADDON, WHATSAPP_ANALYTICS_MODEL } from './whatsapp';
export { LIVE_CHAT_ADDON, LIVE_CHAT_MODELS } from './live-chat';

// ============================================================================
// Industry-Specific Add-Ons (Re-export from industry)
// ============================================================================
export {
  // Industry exports
  ALL_INDUSTRY_ADDONS,
  INDUSTRY_ADDONS,
  // Automotive
  TEST_DRIVE_ADDON,
  TEST_DRIVE_MODELS,
  // Restaurant/Food
  TABLE_BOOKING_ADDON,
  TABLE_BOOKING_MODELS,
  FOOD_MENU_ADDON,
  FOOD_MENU_MODELS,
  KITCHEN_DISPLAY_ADDON,
  KITCHEN_DISPLAY_MODELS,
  // Real Estate
  PROPERTY_SEARCH_ADDON,
  PROPERTY_SEARCH_MODELS,
  PROPERTY_BOOKING_ADDON,
  MORTGAGE_CALCULATOR_ADDON,
  VIRTUAL_TOUR_ADDON,
  // Services
  APPOINTMENT_SCHEDULER_ADDON,
  APPOINTMENT_SCHEDULER_MODELS,
  INVENTORY_COUNTER_ADDON,
  // Events
  EVENT_CALENDAR_ADDON,
  EVENT_CALENDAR_MODELS,
  // Healthcare
  PATIENT_PORTAL_ADDON,
  PATIENT_PORTAL_MODELS,
  SYMPTOM_CHECKER_ADDON,
  SYMPTOM_CHECKER_MODELS,
  INSURANCE_VERIFICATION_ADDON,
  INSURANCE_VERIFICATION_MODELS,
  TELEHEALTH_ADDON,
  TELEHEALTH_MODELS,
  PRESCRIPTIONS_ADDON,
  PRESCRIPTIONS_MODELS,
  LAB_RESULTS_ADDON,
  LAB_RESULTS_MODELS,
  WELLNESS_TRACKING_ADDON,
  WELLNESS_TRACKING_MODELS,
  HIPAA_COMPLIANCE_ADDON,
  HIPAA_COMPLIANCE_MODELS,
  // Education
  COURSES_ADDON,
  COURSES_MODELS,
  LESSON_PLAYER_ADDON,
  LESSON_PLAYER_MODELS,
  QUIZZES_ADDON,
  QUIZZES_MODELS,
  STUDENT_DASHBOARD_ADDON,
  STUDENT_DASHBOARD_MODELS,
  FORUM_ADDON,
  FORUM_MODELS,
  ASSIGNMENTS_ADDON,
  ASSIGNMENTS_MODELS,
  CERTIFICATES_ADDON,
  CERTIFICATES_MODELS,
  LIVE_CLASS_ADDON,
  LIVE_CLASS_MODELS,
  // Creative
  PROJECTS_ADDON,
  PROJECTS_MODELS,
  SKILLS_ADDON,
  SKILLS_MODELS,
  PORTFOLIO_TESTIMONIALS_ADDON,
  PORTFOLIO_TESTIMONIALS_MODELS,
  RESUME_ADDON,
  RESUME_MODELS,
  PORTFOLIO_FEED_ADDON,
  PORTFOLIO_FEED_MODELS,
  HIRE_ME_ADDON,
  HIRE_ME_MODELS,
  PROCESS_ADDON,
  PROCESS_MODELS,
  CLIENT_LOGOS_ADDON,
  CLIENT_LOGOS_MODELS,
} from './industry';

// ============================================================================
// IMPORTS FOR COLLECTIONS
// ============================================================================
import { WISHLIST_ADDON } from './wishlist';
import { REVIEWS_ADDON } from './reviews';
import { COMPARISON_ADDON } from './comparison';
import { SHOPPING_CART_ADDON } from './shopping-cart';
import { CHECKOUT_FLOW_ADDON } from './checkout-flow';
import { NEWSLETTER_ADDON } from './newsletter';
import { SOCIAL_SHARING_ADDON } from './social-share';
import { COOKIE_CONSENT_ADDON } from './cookie-consent';
import { COUNTDOWN_TIMER_ADDON } from './countdown-timer';
import { WHATSAPP_ADDON } from './whatsapp';
import { LIVE_CHAT_ADDON } from './live-chat';

// Industry add-ons
import { ALL_INDUSTRY_ADDONS } from './industry';

import type { AddOnDefinition } from '../types';

/** All official Vayva add-ons */
export const OFFICIAL_ADDONS: AddOnDefinition[] = [
  // E-Commerce
  WISHLIST_ADDON,
  REVIEWS_ADDON,
  COMPARISON_ADDON,
  SHOPPING_CART_ADDON,
  CHECKOUT_FLOW_ADDON,
  
  // Marketing
  NEWSLETTER_ADDON,
  SOCIAL_SHARING_ADDON,
  COOKIE_CONSENT_ADDON,
  COUNTDOWN_TIMER_ADDON,
  
  // Customer Service
  WHATSAPP_ADDON,
  LIVE_CHAT_ADDON,
  
  // All Industry-Specific Add-Ons
  ...ALL_INDUSTRY_ADDONS,
];

/** Add-ons by category */
export const ADDONS_BY_CATEGORY = {
  ecommerce: [WISHLIST_ADDON, REVIEWS_ADDON, COMPARISON_ADDON, SHOPPING_CART_ADDON, CHECKOUT_FLOW_ADDON],
  marketing: [NEWSLETTER_ADDON, SOCIAL_SHARING_ADDON, COOKIE_CONSENT_ADDON, COUNTDOWN_TIMER_ADDON],
  operations: [WHATSAPP_ADDON, LIVE_CHAT_ADDON],
  industry: ALL_INDUSTRY_ADDONS,
};

/** Default add-ons installed on new stores */
export const DEFAULT_ADDONS = [
  'vayva.shopping-cart',
  'vayva.checkout-flow',
  'vayva.cookie-consent',
  'vayva.countdown-timer',
  'vayva.live-chat',
  'vayva.whatsapp',
  'vayva.newsletter',
];

export default OFFICIAL_ADDONS;
