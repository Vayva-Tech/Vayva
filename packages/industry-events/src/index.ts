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
} from './events.engine';

// Services
export {
  EventTimelineBuilderService,
  VendorCoordinatorService,
  SeatingChartDesignerService,
  GuestListManagerService,
} from './services/index';

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
} from './services/index';

// Features
export {
  EventTimelineBuilderFeature,
  VendorCoordinatorFeature,
  SeatingChartDesignerFeature,
  GuestListManagerFeature,
} from './features/index';

// Components
export {
  EventTimelineBuilder,
  VendorCoordinator,
  GuestListManager,
} from './components/index';

export type {
  EventTimelineBuilderProps,
  VendorCoordinatorProps,
  GuestListManagerProps,
} from './components/index';

// Dashboard
export * from './dashboard/index';

// Types
export * from './types/index';



export const VERSION = '0.1.0';

export const PACKAGE_INFO = {
  name: '@vayva/industry-events',
  version: VERSION,
  description: 'Vayva Events Industry Engine - Complete Event Management Platform',
  industry: 'events',
} as const;
