/**
 * @vayva/industry-beauty - Unified Beauty Industry Package
 * 
 * Complete beauty industry solution including:
 * - Appointment Scheduling & Booking
 * - Staff Management & Commission Tracking
 * - Service Menu Management
 * - Client Profiles & Preferences
 * - Inventory & Product Sales
 * - Membership & Loyalty Programs
 */

// Main engine
export {
  BeautyEngine,
  BeautyEngineFactory,
  createDefaultBeautyConfig,
  type BeautyEngineConfig,
  type BeautyFeatureId,
  type BeautyEngineStatus,
} from './beauty.engine';

// Types
export type * from './types/index';

// Features
export * from './features/index';

// Services
export * from './services/index';

// Dashboard Configuration
export { BEAUTY_DASHBOARD_CONFIG } from './dashboard/beauty-dashboard.config';

// Components
export { BeautyDashboard } from './dashboard/BeautyDashboard';
export * from './components/index';
