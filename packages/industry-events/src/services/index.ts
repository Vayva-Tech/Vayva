/**
 * Events Industry Services
 */

export { EventTimelineBuilderService } from './event-timeline-builder.service';
export type { TimelineEvent, EventTimeline, TimelineConfig } from './event-timeline-builder.service';

export { VendorCoordinatorService } from './vendor-coordinator.service';
export type { Vendor, VendorContract, VendorConfig } from './vendor-coordinator.service';

export { SeatingChartDesignerService } from './seating-chart-designer.service';
export type { Table, Guest, SeatingChart, SeatingConfig } from './seating-chart-designer.service';

export { GuestListManagerService } from './guest-list-manager.service';
export type { GuestListEntry, GuestListStats, GuestListConfig } from './guest-list-manager.service';

// NEW Enhanced Services (Team A)
export { EventTimelineService } from './event-timeline.service';
export type { TimelineEvent as TimelineEventV2, Milestone, TimelineConfig as TimelineConfigV2 } from './event-timeline.service';

export { EventVendorService } from './event-vendor.service';
export type { Vendor as VendorV2, VendorCommunication, VendorConfig as VendorConfigV2 } from './event-vendor.service';

export { EventSeatingService } from './event-seating.service';
export type { Table as TableV2, SeatingAssignment, SeatingConfig as SeatingConfigV2 } from './event-seating.service';

export { EventGuestListService } from './event-guest-list.service';
export type { Guest as GuestV2, GuestCategory, GuestListConfig as GuestListConfigV2 } from './event-guest-list.service';
