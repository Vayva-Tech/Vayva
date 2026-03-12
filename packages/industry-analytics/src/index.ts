// Industry Analytics Package - Generalized for all industries

// Engine
export { AnalyticsEngine } from './analytics.engine.js';
export type { AnalyticsEngineConfig } from './analytics.engine.js';

// Types
export * from './types';

// Services
export * from './services';

// Components
export * from './components';

// Dashboard
export { ANALYTICS_DASHBOARD_CONFIG } from './dashboard/analytics-dashboard.config.js';

// Email Marketing (from fashion package, generalized)
export { EmailMarketing } from '../../industry-fashion/src/components/marketing/EmailMarketing';
export type { EmailCampaign } from '../../industry-fashion/src/components/marketing/EmailMarketing';

// Customer Segmentation (from fashion package, generalized)
export { CustomerSegmentation } from '../../industry-fashion/src/components/marketing/CustomerSegmentation';
export type { CustomerSegment } from '../../industry-fashion/src/components/marketing/CustomerSegmentation';
