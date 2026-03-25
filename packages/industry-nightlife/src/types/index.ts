import { z } from 'zod';

// ─── Nightlife Industry Types ────────────────────────────────────────────────

export const TableStatus = z.enum(['available', 'reserved', 'occupied', 'offline']);
export type TableStatus = z.infer<typeof TableStatus>;

export const TableType = z.enum(['standard', 'vip', 'booth', 'stage_front', 'private_room']);
export type TableType = z.infer<typeof TableType>;

export const GuestCategory = z.enum(['celebrity', 'high_roller', 'special_occasion', 'regular_vip']);
export type GuestCategory = z.infer<typeof GuestCategory>;

export const OrderStatus = z.enum(['pending', 'preparing', 'delivered', 'completed']);
export type OrderStatus = z.infer<typeof OrderStatus>;

export const IncidentType = z.enum(['intoxication', 'fake_id', 'altercation', 'medical', 'noise', 'other']);
export type IncidentType = z.infer<typeof IncidentType>;

export const IncidentStatus = z.enum(['open', 'resolved', 'escalated']);
export type IncidentStatus = z.infer<typeof IncidentStatus>;

export const StaffRole = z.enum(['bouncer', 'id_checker', 'bartender', 'server', 'security', 'manager', 'promoter']);
export type StaffRole = z.infer<typeof StaffRole>;

// ─── Data Models ─────────────────────────────────────────────────────────────

export const NightlifeTable = z.object({
  id: z.string(),
  venueId: z.string(),
  tableNumber: z.string(),
  capacity: z.number().int().positive(),
  minSpend: z.number().positive(),
  tableType: TableType,
  location: z.string().optional(),
  description: z.string().max(500).optional(),
  amenities: z.array(z.string()).default([]),
  status: TableStatus,
  currentRevenue: z.number().default(0),
});
export type NightlifeTable = z.infer<typeof NightlifeTable>;

export const BottleItem = z.object({
  id: z.string(),
  name: z.string(),
  brand: z.string(),
  type: z.string(),
  price: z.number().positive(),
  quantity: z.number().int().nonnegative(),
  abv: z.number().optional(),
});
export type BottleItem = z.infer<typeof BottleItem>;

export const Mixer = z.object({
  name: z.string(),
  quantity: z.number().int().positive(),
  brand: z.string().optional(),
});
export type Mixer = z.infer<typeof Mixer>;

export const BottleOrder = z.object({
  id: z.string(),
  tableId: z.string(),
  tableName: z.string(),
  items: z.array(z.object({
    bottle: BottleItem,
    quantity: z.number().int().positive(),
    mixers: z.array(Mixer).optional(),
  })),
  totalAmount: z.number().positive(),
  status: OrderStatus,
  notes: z.string().optional(),
  createdAt: z.date(),
  deliveredAt: z.date().optional(),
});
export type BottleOrder = z.infer<typeof BottleOrder>;

export const VIPGuest = z.object({
  id: z.string(),
  eventId: z.string(),
  name: z.string(),
  phone: z.string(),
  email: z.string().email().optional(),
  category: GuestCategory,
  tableId: z.string().optional(),
  tableName: z.string().optional(),
  guestCount: z.number().int().positive(),
  minimumSpend: z.number().optional(),
  depositPaid: z.number().default(0),
  specialRequests: z.string().optional(),
  isOnList: z.boolean().default(true),
  hasArrived: z.boolean().default(false),
  checkedInAt: z.date().optional(),
  promoterId: z.string().optional(),
  occasion: z.string().optional(), // e.g., "Birthday", "Anniversary"
});
export type VIPGuest = z.infer<typeof VIPGuest>;

export const TableReservation = z.object({
  id: z.string(),
  customerId: z.string(),
  venueId: z.string(),
  tableId: z.string(),
  tableName: z.string(),
  date: z.date(),
  arrivalTime: z.string(),
  guestCount: z.number().int().positive(),
  occasion: z.enum(['none', 'birthday', 'anniversary', 'business', 'special_event']).default('none'),
  specialRequests: z.string().max(1000).optional(),
  bottleService: z.boolean().default(false),
  status: z.enum(['pending', 'confirmed', 'cancelled', 'completed', 'no_show']),
  totalAmount: z.number().default(0),
  createdAt: z.date(),
});
export type TableReservation = z.infer<typeof TableReservation>;

export const PromoterSale = z.object({
  id: z.string(),
  promoterId: z.string(),
  promoterName: z.string(),
  eventId: z.string(),
  guestCount: z.number().int().positive(),
  barRevenue: z.number().default(0),
  commissionRate: z.number().default(0.1),
  commissionAmount: z.number().default(0),
  date: z.date(),
});
export type PromoterSale = z.infer<typeof PromoterSale>;

export const SecurityIncident = z.object({
  id: z.string(),
  eventId: z.string(),
  venueId: z.string(),
  type: IncidentType,
  description: z.string(),
  location: z.string(),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  status: IncidentStatus,
  officerName: z.string(),
  officerId: z.string(),
  involvedPersons: z.array(z.string()).optional(),
  actionsTaken: z.string(),
  resolvedAt: z.date().optional(),
  reportedAt: z.date(),
});
export type SecurityIncident = z.infer<typeof SecurityIncident>;

export const DoorEntry = z.object({
  id: z.string(),
  eventId: z.string(),
  venueId: z.string(),
  timestamp: z.date(),
  gender: z.enum(['male', 'female', 'other']),
  ageGroup: z.enum(['21-25', '26-30', '31-35', '35+']),
  entryType: z.enum(['general', 'vip', 'guest_list', 'comp']),
  coverCharge: z.number().default(0),
  idVerified: z.boolean().default(true),
  denied: z.boolean().default(false),
  denialReason: z.string().optional(),
});
export type DoorEntry = z.infer<typeof DoorEntry>;

export const StaffShift = z.object({
  id: z.string(),
  venueId: z.string(),
  staffId: z.string(),
  staffName: z.string(),
  role: StaffRole,
  shiftStart: z.date(),
  shiftEnd: z.date(),
  isOnBreak: z.boolean().default(false),
  breakStart: z.date().optional(),
  breakEnd: z.date().optional(),
});
export type StaffShift = z.infer<typeof StaffShift>;

// ─── Dashboard Metrics & Aggregations ────────────────────────────────────────

export const NightlifeMetrics = z.object({
  revenue: z.number().default(0),
  revenueChange: z.number().optional(),
  covers: z.number().int().default(0),
  coversChange: z.number().optional(),
  vipCount: z.number().int().default(0),
  vipCountChange: z.number().optional(),
  bottleSales: z.number().int().default(0),
  bottleSalesChange: z.number().optional(),
  occupancyRate: z.number().default(0),
  occupancyChange: z.number().optional(),
  waitTime: z.string().optional(), // e.g., "25-35 min"
  walksCount: z.number().int().default(0),
});
export type NightlifeMetrics = z.infer<typeof NightlifeMetrics>;

export const VenueStatus = z.object({
  isOpen: z.boolean(),
  capacity: z.number().int(),
  currentOccupancy: z.number().int(),
  nextEvent: z.object({
    name: z.string(),
    startTime: z.date(),
  }).optional(),
  staffOnDuty: z.number().int(),
  securityActive: z.boolean(),
});
export type VenueStatus = z.infer<typeof VenueStatus>;

export const DemographicsBreakdown = z.object({
  gender: z.object({
    male: z.number(),
    female: z.number(),
    other: z.number(),
  }),
  ageGroups: z.object({
    '21-25': z.number(),
    '26-30': z.number(),
    '31-35': z.number(),
    '35+': z.number(),
  }),
});
export type DemographicsBreakdown = z.infer<typeof DemographicsBreakdown>;
