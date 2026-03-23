// @ts-nocheck
/**
 * @vayva/industry-nonprofit
 * Vayva Nonprofit Industry Engine
 *
 * Provides specialized features for nonprofit organizations including:
 * - Donor management and engagement
 * - Campaign fundraising and goal tracking
 * - Donation processing and reporting
 */

// Main engine
export {
  NonprofitEngine,
  NonprofitEngineFactory,
  createDefaultNonprofitConfig,
  type NonprofitEngineConfig,
  type NonprofitFeatureId,
} from './nonprofit.engine';

// Services
export {
  DonorManagementService,
  CampaignManagerService,
  GrantTrackerService,
} from './services/index';

export type {
  Donor,
  Donation,
  DonorConfig,
  Campaign,
  CampaignConfig,
  Grant,
  GrantReport,
  GrantConfig,
} from './services/index';

// Features
export {
  DonorManagementFeature,
  CampaignManagerFeature,
  GrantTrackerFeature,
} from './features/index';

// Components
export {
  DonationTracker,
  GrantPipelineDashboard,
} from './components/index.ts';

export type {
  DonationTrackerProps,
  GrantPipelineDashboardProps,
} from './components/index.ts';

// Dashboard
export * from './dashboard/index';

// Types
export * from './types/index';

// Package metadata
export const VERSION = '0.1.0';

export const PACKAGE_INFO = {
  name: '@vayva/industry-nonprofit',
  version: VERSION,
  description: 'Vayva Nonprofit Industry Engine - Fundraising & Donor Platform',
  industries: ['nonprofit', 'charity', 'foundation'],
} as const;