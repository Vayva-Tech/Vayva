import { z } from 'zod';

// ─── Shared Dashboard Types ───────────────────────────────────────────────────

export type IndustrySlug = 'fashion' | 'restaurant' | 'realestate' | 'healthcare' | 'electronics' | 'beauty' | 'events' | 'b2b' | 'grocery' | 'retail' | 'travel' | 'automotive';

export type WidgetType =
  | 'kpi-card'
  | 'chart-line'
  | 'chart-bar'
  | 'chart-pie'
  | 'table'
  | 'calendar'
  | 'map'
  | 'kanban'
  | 'timeline'
  | 'heatmap'
  | 'gauge'
  | 'list'
  | 'custom';

export interface DataSourceConfig {
  type: 'analytics' | 'composite' | 'realtime' | 'event';
  query?: string;
  queries?: string[];
  params?: Record<string, unknown>;
  channel?: string;
  entity?: string;
}

export interface VisualizationConfig {
  type: string;
  options?: Record<string, unknown>;
}

export interface LayoutItem { i: string; x: number; y: number; w: number; h: number; }

export interface LayoutPreset {
  id: string;
  name: string;
  breakpoints: { lg?: LayoutItem[]; md?: LayoutItem[]; sm?: LayoutItem[] };
}

export interface KPICardDefinition {
  id: string;
  label: string;
  format: 'percent' | 'currency' | 'number';
  invert?: boolean;
  alertThreshold?: number;
}

export interface AlertRule { id: string; condition: string; threshold: number; action: string; }
export interface QuickAction { id: string; label: string; icon: string; action: string; }
export interface Permission { resource: string; action: string; }

export interface WidgetDefinition {
  id: string;
  type: WidgetType;
  title: string;
  industry: IndustrySlug;
  component?: string;
  dataSource: DataSourceConfig;
  visualization?: VisualizationConfig;
  refreshInterval?: number;
  permissions?: Permission[];
}

export interface DashboardEngineConfig {
  industry: IndustrySlug;
  widgets: WidgetDefinition[];
  layouts: LayoutPreset[];
  kpiCards: KPICardDefinition[];
  alertRules: AlertRule[];
  actions: QuickAction[];
}

// ─── Core Events Types ────────────────────────────────────────────────────────

export const EventsIndustrySlug = 'events' as const;
export type EventsIndustrySlug = typeof EventsIndustrySlug;

export const EventCategory = z.enum([
  'conference',
  'concert',
  'festival',
  'workshop',
  'webinar',
  'sports',
  'exhibition',
  'corporate',
  'networking',
  'other',
]);
export type EventCategory = z.infer<typeof EventCategory>;

export const EventStatus = z.enum([
  'draft',
  'published',
  'sold_out',
  'cancelled',
  'completed',
  'postponed',
]);
export type EventStatus = z.infer<typeof EventStatus>;

export const EventSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  title: z.string(),
  description: z.string().optional(),
  category: EventCategory,
  status: EventStatus,
  startDate: z.date(),
  endDate: z.date(),
  venueName: z.string(),
  venueAddress: z.string().optional(),
  venueCity: z.string(),
  venueCountry: z.string().default('NG'),
  capacity: z.number().int().min(1),
  ticketsSold: z.number().int().default(0),
  isOnline: z.boolean().default(false),
  streamUrl: z.string().optional(),
  coverImageUrl: z.string().optional(),
  organizerId: z.string(),
  tags: z.array(z.string()).default([]),
  ageRestriction: z.number().int().optional(),
  dressCode: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Event = z.infer<typeof EventSchema>;

// Ticket types
export const TicketTierSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string(), // e.g. "VIP", "General Admission", "Early Bird"
  description: z.string().optional(),
  price: z.number().min(0),
  currency: z.string().default('NGN'),
  quantity: z.number().int().min(1),
  quantitySold: z.number().int().default(0),
  maxPerOrder: z.number().int().default(10),
  saleStartDate: z.date().optional(),
  saleEndDate: z.date().optional(),
  benefits: z.array(z.string()).default([]),
  transferable: z.boolean().default(true),
  refundable: z.boolean().default(false),
  refundDeadline: z.date().optional(),
});
export type TicketTier = z.infer<typeof TicketTierSchema>;

export const TicketStatus = z.enum(['valid', 'used', 'cancelled', 'refunded', 'transferred']);
export type TicketStatus = z.infer<typeof TicketStatus>;

export const TicketSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  tierId: z.string(),
  orderId: z.string(),
  attendeeId: z.string(),
  attendeeName: z.string(),
  attendeeEmail: z.string().email(),
  qrCode: z.string(),
  status: TicketStatus,
  seatNumber: z.string().optional(),
  checkInAt: z.date().optional(),
  transferredFrom: z.string().optional(),
  transferredTo: z.string().optional(),
  issuedAt: z.date(),
});
export type Ticket = z.infer<typeof TicketSchema>;

// Seating types
export const SeatStatus = z.enum(['available', 'reserved', 'sold', 'blocked', 'accessible']);
export type SeatStatus = z.infer<typeof SeatStatus>;

export const SeatSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  section: z.string(),
  row: z.string(),
  seatNumber: z.string(),
  status: SeatStatus,
  tierId: z.string().optional(),
  price: z.number().min(0).optional(),
  accessibilityFeatures: z.array(z.string()).default([]),
});
export type Seat = z.infer<typeof SeatSchema>;

// Vendor types
export const VendorCategory = z.enum([
  'catering',
  'audio_visual',
  'security',
  'photography',
  'decoration',
  'entertainment',
  'transportation',
  'other',
]);
export type VendorCategory = z.infer<typeof VendorCategory>;

export const EventVendorSchema = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string(),
  category: VendorCategory,
  contactName: z.string(),
  contactEmail: z.string().email(),
  contactPhone: z.string(),
  contractValue: z.number().min(0),
  status: z.enum(['prospective', 'confirmed', 'contracted', 'completed', 'cancelled']),
  notes: z.string().optional(),
  createdAt: z.date(),
});
export type EventVendor = z.infer<typeof EventVendorSchema>;

// Analytics
export interface EventsAnalytics {
  totalEvents: number;
  upcomingEvents: number;
  totalTicketsSold: number;
  totalRevenue: number;
  revenueThisMonth: number;
  averageTicketPrice: number;
  averageAttendanceRate: number;
  topEventsByRevenue: Array<{ eventId: string; title: string; revenue: number }>;
  ticketsByCategory: Record<EventCategory, number>;
  checkInRate: number;
}
