/**
 * Merchant Dashboard Constants
 * Centralized constants to replace magic numbers and standardize values
 */

/* ------------------------------------------------------------------ */
/*  Loading & Timing Constants                                          */
/* ------------------------------------------------------------------ */
export const LOADING_DELAYS = {
  SKELETON_DEFAULT: 800,
  ANALYTICS_DATA: 800,
  FULFILLMENT_DATA: 600,
  CUSTOMERS_DATA: 1000,
  INVENTORY_DATA: 700,
} as const;

export const DEBOUNCE_DELAY = 300;
export const THROTTLE_DELAY = 500;
export const API_TIMEOUT = 30000;
export const REFRESH_INTERVAL = 60000; // 1 minute

/* ------------------------------------------------------------------ */
/*  Pagination Constants                                                */
/* ------------------------------------------------------------------ */
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 20,
  PAGE_SIZE_OPTIONS: [10, 20, 50, 100],
  MAX_PAGE_SIZE: 100,
  INITIAL_PAGE: 1,
} as const;

/* ------------------------------------------------------------------ */
/*  Date Range Constants                                                */
/* ------------------------------------------------------------------ */
export const DATE_RANGES = {
  TODAY: 'today',
  LAST_7_DAYS: '7d',
  LAST_30_DAYS: '30d',
  LAST_90_DAYS: '90d',
  THIS_MONTH: 'this_month',
  LAST_MONTH: 'last_month',
  THIS_YEAR: 'this_year',
  CUSTOM: 'custom',
} as const;

export type DateRangeKey = keyof typeof DATE_RANGES;

/* ------------------------------------------------------------------ */
/*  Status Constants                                                    */
/* ------------------------------------------------------------------ */
export const ORDER_STATUS = {
  PENDING: 'pending',
  PROCESSING: 'processing',
  SHIPPED: 'shipped',
  DELIVERED: 'delivered',
  CANCELLED: 'cancelled',
  REFUNDED: 'refunded',
} as const;

export const PAYMENT_STATUS = {
  PENDING: 'pending',
  COMPLETED: 'completed',
  FAILED: 'failed',
  REFUNDED: 'refunded',
  PARTIALLY_REFUNDED: 'partially_refunded',
} as const;

export const INVENTORY_STATUS = {
  IN_STOCK: 'in_stock',
  LOW_STOCK: 'low_stock',
  OUT_OF_STOCK: 'out_of_stock',
  PRE_ORDER: 'pre_order',
} as const;

/* ------------------------------------------------------------------ */
/*  Layout Constants                                                    */
/* ------------------------------------------------------------------ */
export const SIDEBAR = {
  DESKTOP_WIDTH: 320,
  COLLAPSED_WIDTH: 80,
  MOBILE_WIDTH: 320,
  MOBILE_BREAKPOINT: 768,
} as const;

export const HEADER_HEIGHT = 64;
export const FOOTER_HEIGHT = 56;

/* ------------------------------------------------------------------ */
/*  Grid Layout Constants                                               */
/* ------------------------------------------------------------------ */
export const GRID_COLUMNS = {
  MOBILE: 1,
  TABLET: 2,
  DESKTOP: 4,
  WIDESCREEN: 6,
} as const;

export const CARD_GAP = {
  MOBILE: 16,
  TABLET: 20,
  DESKTOP: 24,
} as const;

/* ------------------------------------------------------------------ */
/*  Chart Configuration Constants                                       */
/* ------------------------------------------------------------------ */
export const CHART_CONFIG = {
  SPARKLINE_WIDTH: 80,
  SPARKLINE_HEIGHT: 28,
  DUAL_AXIS_WIDTH: 720,
  DUAL_AXIS_HEIGHT: 300,
  HEATMAP_CELL_SIZE: 24,
  ANIMATION_DURATION: 300,
} as const;

/* ------------------------------------------------------------------ */
/*  File Upload Constants                                               */
/* ------------------------------------------------------------------ */
export const FILE_UPLOAD = {
  MAX_FILE_SIZE: 5 * 1024 * 1024, // 5MB
  MAX_FILES: 10,
  ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/webp'],
  ALLOWED_DOCUMENT_TYPES: ['application/pdf', 'application/msword'],
} as const;

/* ------------------------------------------------------------------ */
/*  Search & Filter Constants                                           */
/* ------------------------------------------------------------------ */
export const SEARCH = {
  MIN_QUERY_LENGTH: 2,
  MAX_QUERY_LENGTH: 100,
  RESULTS_PER_PAGE: 20,
} as const;

/* ------------------------------------------------------------------ */
/*  Notification Constants                                              */
/* ------------------------------------------------------------------ */
export const NOTIFICATION = {
  TOAST_DURATION: 4000,
  ERROR_TOAST_DURATION: 6000,
  SUCCESS_MESSAGE: 'Operation completed successfully',
  ERROR_MESSAGE: 'Something went wrong. Please try again.',
  LOADING_MESSAGE: 'Please wait...',
} as const;

/* ------------------------------------------------------------------ */
/*  Cache Keys                                                          */
/* ------------------------------------------------------------------ */
export const CACHE_KEYS = {
  MERCHANT: 'merchant',
  STORE: 'store',
  ANALYTICS: 'analytics',
  ORDERS: 'orders',
  PRODUCTS: 'products',
  CUSTOMERS: 'customers',
  INVENTORY: 'inventory',
} as const;

/* ------------------------------------------------------------------ */
/*  API Endpoints                                                       */
/* ------------------------------------------------------------------ */
export const API_ENDPOINTS = {
  ANALYTICS: '/api/analytics',
  ORDERS: '/api/orders',
  PRODUCTS: '/api/products',
  CUSTOMERS: '/api/customers',
  INVENTORY: '/api/inventory',
  FULFILLMENT: '/api/fulfillment',
} as const;

/* ------------------------------------------------------------------ */
/*  Error Codes                                                         */
/* ------------------------------------------------------------------ */
export const ERROR_CODES = {
  UNAUTHORIZED: 'UNAUTHORIZED',
  FORBIDDEN: 'FORBIDDEN',
  NOT_FOUND: 'NOT_FOUND',
  BAD_REQUEST: 'BAD_REQUEST',
  INTERNAL_SERVER: 'INTERNAL_SERVER_ERROR',
  NETWORK_ERROR: 'NETWORK_ERROR',
  TIMEOUT: 'TIMEOUT',
} as const;

/* ------------------------------------------------------------------ */
/*  Local Storage Keys                                                  */
/* ------------------------------------------------------------------ */
export const LOCAL_STORAGE_KEYS = {
  SIDEBAR_COLLAPSED: 'sidebar_collapsed',
  THEME: 'theme',
  PREFERRED_LANGUAGE: 'language',
  LAST_VISIT: 'last_visit',
} as const;

/* ------------------------------------------------------------------ */
/*  Export All Constants as Single Object                               */
/* ------------------------------------------------------------------ */
export const CONSTANTS = {
  LOADING_DELAYS,
  PAGINATION,
  DATE_RANGES,
  ORDER_STATUS,
  PAYMENT_STATUS,
  INVENTORY_STATUS,
  SIDEBAR,
  HEADER_HEIGHT,
  FOOTER_HEIGHT,
  GRID_COLUMNS,
  CARD_GAP,
  CHART_CONFIG,
  FILE_UPLOAD,
  SEARCH,
  NOTIFICATION,
  CACHE_KEYS,
  API_ENDPOINTS,
  ERROR_CODES,
  LOCAL_STORAGE_KEYS,
} as const;
