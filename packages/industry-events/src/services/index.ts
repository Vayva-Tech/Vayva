/**
 * Events Industry Services
 */

export { EventTimelineBuilderService } from './event-timeline-builder.service.js';
export type { TimelineEvent, EventTimeline, TimelineConfig } from './event-timeline-builder.service.js';

export { VendorCoordinatorService } from './vendor-coordinator.service.js';
export type { Vendor, VendorContract, VendorConfig } from './vendor-coordinator.service.js';

export { SeatingChartDesignerService } from './seating-chart-designer.service.js';
export type { Table, Guest, SeatingChart, SeatingConfig } from './seating-chart-designer.service.js';

export { GuestListManagerService } from './guest-list-manager.service.js';
export type { GuestListEntry, GuestListStats, GuestListConfig } from './guest-list-manager.service.js';

// NEW Enhanced Services (Team A)
export { EventTimelineService } from './event-timeline.service.js';
export type { TimelineEvent as TimelineEventV2, Milestone, TimelineConfig as TimelineConfigV2 } from './event-timeline.service.js';

export { EventVendorService } from './event-vendor.service.js';
export type { Vendor as VendorV2, VendorCommunication, VendorConfig as VendorConfigV2 } from './event-vendor.service.js';

export { EventSeatingService } from './event-seating.service.js';
export type { Table as TableV2, SeatingAssignment, SeatingConfig as SeatingConfigV2 } from './event-seating.service.js';

export { EventGuestListService } from './event-guest-list.service.js';
export type { Guest as GuestV2, GuestCategory, GuestListConfig as GuestListConfigV2 } from './event-guest-list.service.js';
