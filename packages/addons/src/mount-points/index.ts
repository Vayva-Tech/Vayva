/**
 * Mount Points Module - Drag-and-drop system for add-on placement
 * 
 * Exports:
 * - MountPointEngine: Main drag-and-drop UI component
 * - gridSystem: Grid configuration and snapping utilities
 * - placementValidator: Validation logic for add-on placement
 */

export { MountPointEngine } from './engine';
export type {
  MountedAddOn,
  MountPointState,
  MountPointEngineProps,
} from './engine';

export {
  DEFAULT_GRID_CONFIG,
  snapToGrid,
  getGridPosition,
  sortByGridPosition,
  type GridConfig,
  type ResponsiveConfig,
  type GridSize,
} from './grid-system';

export {
  validatePlacement,
  checkCapacity,
  getRecommendedMountPoints,
  validateConfiguration,
  type PlacementValidationResult,
  type PlacementRequest,
} from './placement-validator';
