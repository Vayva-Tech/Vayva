/**
 * @vayva/industry-retail - Unified Retail Industry Package
 * 
 * Complete retail industry solution including:
 * - Inventory Management
 * - Loyalty Programs
 * - Multi-Channel Sales
 * - Store Performance Analytics
 * - Transfer Workflow
 * - Channel Sync
 * - Dynamic Pricing
 * - Customer Segmentation
 */

// Main engine
export {
  RetailEngine,
  RetailEngineFactory,
  createDefaultRetailConfig,
  type RetailEngineConfig,
  type RetailFeatureId,
  type RetailEngineStatus,
} from './retail.engine';

// Types
export type * from './types/index';

// Features
export * from './features/inventory';
export * from './features/loyalty';
export * from './features/multi-channel';
export * from './features/store-performance';
export * from './features/transfers';

// Dashboard Configuration
export {
  RETAIL_DASHBOARD_CONFIG,
} from './dashboard-config';

// Components
export { RetailDashboard } from './components/RetailDashboard';
export type { RetailDashboardProps } from './components/RetailDashboard';
export * from './components';

// Widget Registry
export { registerRetailWidgets } from './widgets/registry';

// Services
export * from './services/index';
