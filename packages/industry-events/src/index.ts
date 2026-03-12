/**
 * @vayva/industry-events
 * Vayva Events Industry Engine
 *
 * Provides events-specific features including:
 * - Event timeline planning
 * - Vendor coordination & contracts
 * - Seating chart design
 * - Guest list management
 */

// Main engine
export {
  EventsEngine,
  EventsEngineFactory,
  createDefaultEventsConfig,
  type EventsEngineConfig,
  type EventsFeatureId,
} from './events.engine.js';

// Services
export {
  EventTimelineBuilderService,
  VendorCoordinatorService,
  SeatingChartDesignerService,
  GuestListManagerService,
} from './services/index.js';

export type {
  TimelineEvent,
  EventTimeline,
  TimelineConfig,
  Vendor,
  VendorContract,
  VendorConfig,
  Table,
  Guest,
  SeatingChart,
  SeatingConfig,
  GuestListEntry,
  GuestListStats,
  GuestListConfig,
} from './services/index.js';

// Features
export {
  EventTimelineBuilderFeature,
  VendorCoordinatorFeature,
  SeatingChartDesignerFeature,
  GuestListManagerFeature,
} from './features/index.js';

// Components
export {
  EventTimelineBuilder,
  VendorCoordinator,
  GuestListManager,
} from './components/index.js';

export type {
  EventTimelineBuilderProps,
  VendorCoordinatorProps,
  GuestListManagerProps,
} from './components/index.js';

// Dashboard
export * from './dashboard/index.js';

// Types
export * from './types/index.js';



export const VERSION = '0.1.0';

export const PACKAGE_INFO = {
  name: '@vayva/industry-events',
  version: VERSION,
  description: 'Vayva Events Industry Engine - Complete Event Management Platform',
  industry: 'events',
} as const;
