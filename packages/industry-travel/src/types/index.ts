import { z } from 'zod';

// ─── Shared Dashboard Types ───────────────────────────────────────────────────

export type IndustrySlug = 'fashion' | 'restaurant' | 'realestate' | 'healthcare' | 'electronics' | 'beauty' | 'events' | 'b2b' | 'grocery' | 'retail' | 'travel' | 'automotive';

// ─── Enhanced Travel Enums ────────────────────────────────────────────────────

export const RoomType = z.enum([
  'single',
  'double',
  'twin',
  'queen',
  'king',
  'suite',
  'deluxe',
  'family',
  'penthouse',
  'villa',
  'cabin',
  'tent',
  'dormitory'
]);
export type RoomType = z.infer<typeof RoomType>;

export const PropertyType = z.enum([
  'hotel',
  'resort',
  'motel',
  'bnb',
  'vacation_rental',
  'apartment',
  'villa',
  'cabin',
  'campground',
  'hostel',
  'luxury_lodge',
  'boutique_hotel'
]);
export type PropertyType = z.infer<typeof PropertyType>;

export const PricingStrategy = z.enum([
  'fixed',
  'dynamic',
  'seasonal',
  'length_of_stay',
  'group_rate'
]);
export type PricingStrategy = z.infer<typeof PricingStrategy>;

export const GuestType = z.enum([
  'individual',
  'couple',
  'family',
  'group',
  'business',
  'vip'
]);
export type GuestType = z.infer<typeof GuestType>;

export const ReviewStatus = z.enum([
  'pending',
  'approved',
  'rejected',
  'featured'
]);
export type ReviewStatus = z.infer<typeof ReviewStatus>;

export type WidgetType =
  | 'kpi-card' | 'chart-line' | 'chart-bar' | 'chart-pie' | 'table'
  | 'calendar' | 'map' | 'kanban' | 'timeline' | 'heatmap' | 'gauge' | 'list' | 'custom';

export interface DataSourceConfig {
  type: 'analytics' | 'composite' | 'realtime' | 'event';
  query?: string;
  queries?: string[];
  params?: Record<string, unknown>;
  channel?: string;
  entity?: string;
}

export interface VisualizationConfig { type: string; options?: Record<string, unknown>; }
export interface LayoutItem { i: string; x: number; y: number; w: number; h: number; }
export interface LayoutPreset { id: string; name: string; breakpoints: { lg?: LayoutItem[]; md?: LayoutItem[]; sm?: LayoutItem[] }; }
export interface KPICardDefinition { id: string; label: string; format: 'percent' | 'currency' | 'number'; invert?: boolean; alertThreshold?: number; }
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

// ─── Core Travel Types ────────────────────────────────────────────────────────

export const TravelIndustrySlug = 'travel' as const;
export type TravelIndustrySlug = typeof TravelIndustrySlug;

export const TravelProductType = z.enum([
  'flight',
  'hotel',
  'tour_package',
  'car_rental',
  'cruise',
  'activity',
  'transfer',
  'visa_service',
]);
export type TravelProductType = z.infer<typeof TravelProductType>;

export const BookingStatus = z.enum([
  'inquiry',
  'pending',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'refunded',
]);
export type BookingStatus = z.infer<typeof BookingStatus>;

// ─── Enhanced Travel Models ───────────────────────────────────────────────────

// Property Model
export const TravelPropertySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  type: PropertyType,
  description: z.string().optional(),
  address: z.string(),
  city: z.string(),
  state: z.string().optional(),
  country: z.string(),
  postalCode: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  phoneNumber: z.string().optional(),
  email: z.string().email().optional(),
  website: z.string().url().optional(),
  amenities: z.array(z.string()).default([]),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().default(0),
  checkInTime: z.string().default('14:00'),
  checkOutTime: z.string().default('11:00'),
  cancellationPolicy: z.string().optional(),
  isPublished: z.boolean().default(false),
  isActive: z.boolean().default(true),
  images: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TravelProperty = z.infer<typeof TravelPropertySchema>;

// Room Model
export const TravelRoomSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  type: RoomType,
  name: z.string(),
  description: z.string().optional(),
  capacity: z.number().int().min(1),
  basePrice: z.number().min(0),
  currency: z.string().default('USD'),
  amenities: z.array(z.string()).default([]),
  images: z.array(z.string()).default([]),
  isAvailable: z.boolean().default(true),
  maxOccupancy: z.number().int().min(1),
  bedConfiguration: z.string().optional(),
  viewType: z.string().optional(),
  floor: z.number().int().optional(),
  size: z.number().optional(), // in square feet
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type TravelRoom = z.infer<typeof TravelRoomSchema>;

// Availability Calendar
export const AvailabilitySchema = z.object({
  id: z.string(),
  roomId: z.string(),
  date: z.date(),
  isAvailable: z.boolean().default(true),
  price: z.number().min(0).optional(), // Override daily rate
  minStay: z.number().int().min(1).default(1),
  maxStay: z.number().int().optional(),
  closedToArrival: z.boolean().default(false),
  closedToDeparture: z.boolean().default(false),
});

export type Availability = z.infer<typeof AvailabilitySchema>;

// Pricing Rules
export const PricingRuleSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  name: z.string(),
  strategy: PricingStrategy,
  startDate: z.date(),
  endDate: z.date(),
  multiplier: z.number().min(0).default(1), // For dynamic pricing
  fixedPrice: z.number().min(0).optional(), // For fixed pricing
  minPrice: z.number().min(0).optional(),
  maxPrice: z.number().min(0).optional(),
  daysOfWeek: z.array(z.number()).min(1).max(7).default([0,1,2,3,4,5,6]), // 0=Sunday
  isActive: z.boolean().default(true),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type PricingRule = z.infer<typeof PricingRuleSchema>;

// Guest Profile
export const GuestProfileSchema = z.object({
  id: z.string(),
  userId: z.string().optional(),
  firstName: z.string(),
  lastName: z.string(),
  email: z.string().email(),
  phone: z.string(),
  dateOfBirth: z.date().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }).optional(),
  preferences: z.object({
    roomType: RoomType.optional(),
    floorPreference: z.enum(['ground', 'middle', 'high']).optional(),
    smoking: z.boolean().default(false),
    accessibility: z.boolean().default(false),
    quietRoom: z.boolean().default(false),
  }).default({}),
  loyaltyPoints: z.number().int().default(0),
  totalBookings: z.number().int().default(0),
  lastBookingDate: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type GuestProfile = z.infer<typeof GuestProfileSchema>;

// Review Model
export const ReviewSchema = z.object({
  id: z.string(),
  propertyId: z.string(),
  bookingId: z.string(),
  guestId: z.string(),
  rating: z.number().min(1).max(5),
  title: z.string().min(5).max(100),
  comment: z.string().min(10).max(1000),
  pros: z.array(z.string()).default([]),
  cons: z.array(z.string()).default([]),
  status: ReviewStatus.default('pending'),
  isVerified: z.boolean().default(false),
  response: z.string().optional(),
  respondedAt: z.date().optional(),
  respondedBy: z.string().optional(), // Admin ID
  helpfulVotes: z.number().int().default(0),
  createdAt: z.date(),
  updatedAt: z.date(),
});

export type Review = z.infer<typeof ReviewSchema>;

// Travel Package
export const TravelPackageSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  title: z.string(),
  destination: z.string(),
  destinationId: z.string().optional(),
  type: TravelProductType,
  description: z.string(),
  durationDays: z.number().int().min(1),
  pricePerPerson: z.number().min(0),
  currency: z.string().default('USD'),
  inclusions: z.array(z.string()).default([]),
  exclusions: z.array(z.string()).default([]),
  highlights: z.array(z.string()).default([]),
  maxGroupSize: z.number().int().optional(),
  minGroupSize: z.number().int().default(1),
  difficulty: z.enum(['easy', 'moderate', 'challenging']).default('easy'),
  imageUrls: z.array(z.string()).default([]),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().default(0),
  isAvailable: z.boolean().default(true),
  availableDates: z.array(z.date()).optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type TravelPackage = z.infer<typeof TravelPackageSchema>;

// Booking
export const TravelBookingSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  packageId: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string(),
  status: BookingStatus,
  travelDate: z.date(),
  returnDate: z.date().optional(),
  adults: z.number().int().min(1),
  children: z.number().int().default(0),
  infants: z.number().int().default(0),
  totalPrice: z.number().min(0),
  amountPaid: z.number().min(0).default(0),
  specialRequests: z.string().optional(),
  passports: z.array(z.object({
    name: z.string(),
    passportNumber: z.string(),
    nationality: z.string(),
    expiryDate: z.date(),
  })).default([]),
  confirmationCode: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type TravelBooking = z.infer<typeof TravelBookingSchema>;

// Itinerary
export const ItineraryDaySchema = z.object({
  day: z.number().int().min(1),
  title: z.string(),
  description: z.string(),
  accommodation: z.string().optional(),
  meals: z.array(z.enum(['breakfast', 'lunch', 'dinner'])).default([]),
  activities: z.array(z.string()).default([]),
  transfers: z.string().optional(),
});
export type ItineraryDay = z.infer<typeof ItineraryDaySchema>;

export const ItinerarySchema = z.object({
  id: z.string(),
  packageId: z.string(),
  bookingId: z.string().optional(),
  title: z.string(),
  days: z.array(ItineraryDaySchema),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Itinerary = z.infer<typeof ItinerarySchema>;

// Analytics
// ─── Utility Types and Interfaces ─────────────────────────────────────────────

export interface DateRange {
  startDate: Date;
  endDate: Date;
}

export interface BookingFilters {
  status?: string;
  propertyId?: string;
  dateRange?: DateRange;
}

export interface TravelReview {
  id: string;
  propertyId: string;
  bookingId: string;
  guestName: string;
  rating: number;
  comment?: string;
  status: string;
  sentimentScore?: number;
  sentimentLabel?: string;
  helpfulCount?: number;
  title?: string;
  photos?: string[];
  response?: string;
  responderId?: string;
  responsePublic?: boolean;
  respondedAt?: Date;
  moderatedAt?: Date;
  moderatorId?: string;
  moderationReason?: string;
  createdAt: Date;
  updatedAt?: Date;
}

export interface MetaTags {
  title: string;
  description: string;
  keywords: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
  canonicalUrl?: string;
  robots?: string;
}

export interface SEOData {
  propertyId: string;
  pageTitle: string;
  metaDescription: string;
  keywords: string[];
  structuredData: any;
  altTextSuggestions: Array<{ image: string; altText: string }>;
  contentSuggestions: string[];
  seoScore: number; // 0-100
}

export interface PriceCalculationResult {
  basePrice: number;
  totalPrice: number;
  breakdown: Array<{
    description: string;
    amount: number;
    type: 'base' | 'tax' | 'fee' | 'discount';
  }>;
}

export interface AvailabilityCheckResult {
  isAvailable: boolean;
  price?: number;
  reason?: string;
}

export interface SearchFilters {
  location?: string;
  checkInDate?: Date;
  checkOutDate?: Date;
  guests?: number;
  roomTypes?: RoomType[];
  minPrice?: number;
  maxPrice?: number;
  amenities?: string[];
  propertyTypes?: PropertyType[];
  sortBy?: 'price_asc' | 'price_desc' | 'rating' | 'distance';
  page?: number;
  limit?: number;
}

export interface BookingData {
  propertyId: string;
  roomId: string;
  guestId: string;
  checkInDate: Date;
  checkOutDate: Date;
  guests: number;
  totalPrice: number;
  specialRequests?: string;
}

export interface PaymentMethod {
  type: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer';
  token?: string;
  details?: Record<string, unknown>;
}

export interface NotificationPayload {
  type: 'booking_confirmation' | 'booking_confirmed' | 'cancellation' | 'reminder' | 'review_request';
  recipient: string;
  data: Record<string, unknown>;
}

// ─── Extended Analytics Types ─────────────────────────────────────────────────

export interface OccupancyMetrics {
  currentRate: number;
  projectedRate: number;
  historicalRates: Array<{ date: Date; rate: number }>;
  byRoomType: Record<RoomType, number>;
}

export interface RevenueReport {
  totalRevenue: number;
  revenueBySource: Record<string, number>;
  revenueByRoomType: Record<RoomType, number>;
  dailyBreakdown: Array<{ date: Date; revenue: number }>;
  growthRate: number;
}

export interface GuestDemographics {
  byCountry: Record<string, number>;
  byAgeGroup: Record<string, number>;
  byBookingType: Record<GuestType, number>;
  repeatGuestRate: number;
}

export interface BenchmarkData {
  occupancyRate: { property: number; industry: number; percentile: number };
  averageDailyRate: { property: number; industry: number; percentile: number };
  revenuePerAvailableRoom: { property: number; industry: number; percentile: number };
}
