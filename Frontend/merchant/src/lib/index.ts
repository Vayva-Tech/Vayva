/**
 * Merchant Shared Utilities
 * Central export for all utility libraries
 */

// Constants
export * from './constants';

// Error Handling
export * from './error-handling';

// Design System
export * from './design-system';

// Lazy Loading
export * from './lazy-loading';

// TypeScript Utilities
export * from './typescript-utils';

/* ------------------------------------------------------------------ */
/*  Re-export Common Patterns                                           */
/* ------------------------------------------------------------------ */

/**
 * Quick access to most-used utilities
 */
import { CONSTANTS } from './constants';
import { handleError, withErrorHandling } from './error-handling';
import { lazyLoad } from './lazy-loading';
import { isDefined, safeProperty } from './typescript-utils';

export const Utils = {
  // Constants
  LOADING_DELAYS: CONSTANTS.LOADING_DELAYS,
  PAGINATION: CONSTANTS.PAGINATION,
  DATE_RANGES: CONSTANTS.DATE_RANGES,
  
  // Error Handling
  handleError,
  withErrorHandling,
  
  // Type Guards
  isDefined,
  safeProperty,
  
  // Lazy Loading
  lazyLoad,
};

export default Utils;
