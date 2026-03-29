/**
 * Events Industry Features
 */

export { EventTimelineBuilderFeature } from './event-timeline-builder.feature';
export { VendorCoordinatorFeature } from './vendor-coordinator.feature';
export { SeatingChartDesignerFeature } from './seating-chart-designer.feature';
export { GuestListManagerFeature } from './guest-list-manager.feature';

// NEW Enhanced Features (Team A)
export { EventTimelineFeature } from './event-timeline.feature';
export { EventVendorFeature } from './event-vendor.feature';
export { EventSeatingFeature } from './event-seating.feature';
export { EventGuestListFeature } from './event-guest-list.feature';

// Phase 3: Compact Implementation
export { SeatingChartDesigner, createSeatingChartDesigner, TicketScanner, createTicketScanner, GuestListManager, createGuestListManager } from './event-management-features';
export type { SeatingChart, Table, Ticket, GuestList, Guest } from './event-management-features';
