/**
 * @vayva/industry-automotive
 * Vayva Automotive Industry Engine
 *
 * Provides automotive dealership features including:
 * - Vehicle gallery & inventory management
 * - Test drive scheduling & coordination
 * - CRM integration & lead management
 * - Financing calculator
 * - Complete dealership platform
 */

// Main engine
export {
  AutomotiveEngine,
  AutomotiveEngineFactory,
  createDefaultAutomotiveConfig,
  type AutomotiveEngineConfig,
  type AutomotiveFeatureId,
  type AutomotiveEngineStatus,
} from './automotive.engine.js';

// Services (export specific items to avoid conflicts)
export {
  VehicleGalleryService,
  TestDriveCoordinatorService,
  CRMConnectorService,
} from './services/index.js';

export type {
  Vehicle,
  VehicleFilter,
  VehicleGalleryConfig,
  TestDrive,
  TestDriveFeedback,
  TestDriveSchedule,
  TimeSlot,
  TestDriveConfig,
  Customer,
  Lead,
  Interaction,
  CRMConfig,
} from './services/index.js';

// Features
export {
  VehicleShowcaseFeature,
  TestDriveCoordinatorFeature,
  CRMIntegrationFeature,
} from './features/index.js';

export type {
  VehicleShowcaseConfig,
  TestDriveCoordinatorConfig,
  CRMIntegrationConfig,
} from './features/index.js';

// Components
export {
  CRMIntegration,
  FinancingCalculator,
  InventoryManager,
} from './components/index.js';

// Dashboard
export * from './dashboard/index.js';

// Types (only export types not already exported)
export type {
  AutomotiveIndustrySlug,
} from './types/index.js';

export const VERSION = '0.1.0';

export const PACKAGE_INFO = {
  name: '@vayva/industry-automotive',
  version: VERSION,
  description: 'Vayva Automotive Industry Engine - Complete Dealership Platform',
  industry: 'automotive',
} as const;
