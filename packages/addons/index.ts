/**
 * @vayva/addons
 * 
 * Vayva Add-On System
 * 
 * A modular plugin system for Vayva templates.
 */

// Re-export all types from src/types
export * from './src/types';

// Re-export registry functions
export {
  registerAddon,
  getAddonById,
  getAllAddons,
  getAddonsByCategory,
} from './src/registry';

// Re-export mount points
export {
  MountPointEngine,
  type MountedAddOn,
  type MountPointState,
  type MountPointEngineProps,
} from './src/mount-points';

// Re-export grid system
export {
  DEFAULT_GRID_CONFIG,
  snapToGrid,
  getGridPosition,
  sortByGridPosition,
  type GridConfig,
  type ResponsiveConfig,
  type GridSize,
} from './src/mount-points/grid-system';

// Re-export placement validator
export {
  validatePlacement,
  checkCapacity,
  getRecommendedMountPoints,
  validateConfiguration,
  type PlacementValidationResult,
  type PlacementRequest,
} from './src/mount-points/placement-validator';

// Version
export const VERSION = '1.0.0';
