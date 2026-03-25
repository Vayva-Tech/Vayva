/**
 * Real Estate Industry Types
 * Export all type definitions for the real estate industry engine
 */

import type { PropertyConfig } from '../services/property-management.service';

/** Engine bootstrap options: `false` disables property management. */
export type RealEstateConfig = {
  propertyManagement?: false | PropertyConfig;
};

// Property types
export * from './property';

// CMA types
export * from './cma';

// Transaction timeline types
export * from './transaction';

// Lead scoring types
export * from './lead';

// Showing management types
export * from './showing';

// Phase 4: Document management types
export * from './document';
