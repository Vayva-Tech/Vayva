/**
 * Centralized Route Configuration
 *
 * Single source of truth for internal application links.
 * Use this config instead of hardcoding strings to allow for safe refactoring.
 */
export const ROUTES = {
  ONBOARDING: {
    ROOT: "/onboarding",
    RESUME: "/onboarding/resume",
    WELCOME: "/onboarding/welcome",
    INDUSTRY: "/onboarding/industry",
  },
  DASHBOARD: {
    ROOT: "/dashboard",
    SITES: "/dashboard/sites",
    TEMPLATES: "/dashboard/templates",
    EDITOR: "/dashboard/editor",
    PUBLISH: "/dashboard/publish",
    DOMAINS: "/dashboard/domains",
    ORDERS: "/dashboard/orders",
    PRODUCTS: "/dashboard/products",
    FINANCE: "/dashboard/finance",
    SETTINGS: {
      ROOT: "/dashboard/settings",
      STORE: "/dashboard/settings/store",
      BILLING: "/dashboard/settings/billing",
      PROFILE: "/dashboard/settings/profile",
    },
  },
  AUTH: {
    SIGNIN: "/signin",
    SIGNUP: "/signup",
    VERIFY: "/verify",
  },
};

// Backwards compatibility for the specific placeholder we are replacing
export const ACCOUNT_ROUTES = {
  ONBOARDING: ROUTES.ONBOARDING.RESUME,
};
