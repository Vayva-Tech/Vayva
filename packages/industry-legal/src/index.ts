/**
 * @vayva/industry-legal - Unified Legal Industry Package
 *
 * Complete legal industry solution including:
 * - Matter/Case Management
 * - Client Relationship Management
 * - Time Tracking & Billing
 * - Document Automation & Assembly
 * - Court Deadline Calendar
 * - Trust Accounting & IOLTA
 * - Conflict Checking
 */

// Main engine
export {
  LegalEngine,
  LegalEngineFactory,
  createDefaultLegalConfig,
  type LegalEngineConfig,
  type LegalFeatureId,
  type LegalEngineStatus,
} from './legal.engine';

// Types
export * from './types';

// Services
export * from './services';

// Dashboard Configuration
export {
  LEGAL_DASHBOARD_CONFIG,
} from './dashboard/index';

// Dashboard Components
export * from './dashboard';
export { LegalDashboard } from './components/LegalDashboard';

// Components (to be created)
// export * from './components';

// Features (to be created)
// export * from './features';

export const VERSION = '0.0.1';

export const PACKAGE_INFO = {
  name: '@vayva/industry-legal',
  version: VERSION,
  description: 'Vayva Legal Industry Engine',
  industries: ['legal', 'law-firm', 'attorney', 'litigation'],
} as const;