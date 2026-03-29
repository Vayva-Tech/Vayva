/**
 * Utilities Module
 * 
 * Class names, performance utilities, and storage helpers
 */

// Class names
export {
  cn,
  mergeClasses,
  createClassManager,
  createStateClasses,
  booleanClass,
  type ClassConfig,
} from './cn';

// Performance
export {
  debounce,
  throttle,
  memoize,
  memoizeWithTTL,
  lazyLoad,
  withRetry,
  requestIdleCallbackCompat,
} from './performance';

// Storage
export {
  createStorage,
  localStorageWrapper,
  sessionStorageWrapper,
  cookies,
  createTypedKey,
  safeGet,
  type StorageType,
  type StorageOptions,
} from './storage';
