// @ts-nocheck
import { z } from 'zod';

// ─── Shared Dashboard Types ───────────────────────────────────────────────────

export type IndustrySlug = 'fashion' | 'restaurant' | 'realestate' | 'healthcare' | 'electronics' | 'beauty' | 'events' | 'b2b' | 'grocery' | 'retail' | 'travel' | 'automotive';

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

// ─── Core Automotive Types ────────────────────────────────────────────────────

export const AutomotiveIndustrySlug = 'automotive' as const;
export type AutomotiveIndustrySlug = typeof AutomotiveIndustrySlug;

export const VehicleCondition = z.enum(['new', 'certified_pre_owned', 'used']);
export type VehicleCondition = z.infer<typeof VehicleCondition>;

export const VehicleStatus = z.enum([
  'available',
  'reserved',
  'sold',
  'in_service',
  'pending_delivery',
  'trade_in',
]);
export type VehicleStatus = z.infer<typeof VehicleStatus>;

export const VehicleSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  vin: z.string().length(17),
  make: z.string(),
  model: z.string(),
  year: z.number().int().min(1900).max(2100),
  trim: z.string().optional(),
  color: z.string(),
  interiorColor: z.string().optional(),
  condition: VehicleCondition,
  status: VehicleStatus,
  mileage: z.number().int().min(0),
  fuelType: z.enum(['petrol', 'diesel', 'electric', 'hybrid', 'cng']),
  transmission: z.enum(['automatic', 'manual', 'cvt']),
  engineSize: z.string().optional(), // e.g. "2.0L"
  horsepower: z.number().int().optional(),
  bodyType: z.enum(['sedan', 'suv', 'hatchback', 'pickup', 'coupe', 'convertible', 'van', 'wagon']).optional(),
  price: z.number().min(0),
  negotiable: z.boolean().default(true),
  features: z.array(z.string()).default([]),
  imageUrls: z.array(z.string()).default([]),
  description: z.string().optional(),
  warrantyMonths: z.number().int().default(0),
  inspectionReport: z.string().optional(),
  locationId: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Vehicle = z.infer<typeof VehicleSchema>;

// Test Drive
export const TestDriveStatus = z.enum(['scheduled', 'completed', 'cancelled', 'no_show']);
export type TestDriveStatus = z.infer<typeof TestDriveStatus>;

export const TestDriveSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  vehicleId: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  customerEmail: z.string().email(),
  customerPhone: z.string(),
  scheduledAt: z.date(),
  duration: z.number().int().default(30), // minutes
  status: TestDriveStatus,
  salesRepId: z.string().optional(),
  notes: z.string().optional(),
  feedback: z.string().optional(),
  followUpScheduled: z.boolean().default(false),
  createdAt: z.date(),
});
export type TestDrive = z.infer<typeof TestDriveSchema>;

// Financing Application
export const FinancingStatus = z.enum(['submitted', 'under_review', 'approved', 'rejected', 'accepted', 'disbursed']);
export type FinancingStatus = z.infer<typeof FinancingStatus>;

export const FinancingApplicationSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  vehicleId: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  vehiclePrice: z.number().min(0),
  downPayment: z.number().min(0),
  loanAmount: z.number().min(0),
  termMonths: z.number().int().min(12).max(84),
  interestRate: z.number().min(0).optional(), // APR %
  monthlyPayment: z.number().min(0).optional(),
  status: FinancingStatus,
  lender: z.string().optional(),
  approvedAmount: z.number().min(0).optional(),
  approvalDate: z.date().optional(),
  rejectionReason: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type FinancingApplication = z.infer<typeof FinancingApplicationSchema>;

// Service Appointment
export const ServiceType = z.enum([
  'routine_service',
  'oil_change',
  'tire_rotation',
  'brake_service',
  'engine_repair',
  'body_repair',
  'recall_service',
  'inspection',
  'other',
]);
export type ServiceType = z.infer<typeof ServiceType>;

export const ServiceAppointmentSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  vehicleId: z.string(),
  vehicleVin: z.string(),
  customerId: z.string(),
  customerName: z.string(),
  customerPhone: z.string(),
  serviceType: ServiceType,
  description: z.string().optional(),
  scheduledAt: z.date(),
  estimatedDuration: z.number().int(), // minutes
  estimatedCost: z.number().min(0).optional(),
  actualCost: z.number().min(0).optional(),
  status: z.enum(['scheduled', 'in_progress', 'completed', 'cancelled']),
  technicianId: z.string().optional(),
  notes: z.string().optional(),
  completedAt: z.date().optional(),
  createdAt: z.date(),
});
export type ServiceAppointment = z.infer<typeof ServiceAppointmentSchema>;

// Analytics
export interface AutomotiveAnalytics {
  totalInventory: number;
  newVehicles: number;
  usedVehicles: number;
  vehiclesSoldThisMonth: number;
  totalRevenue: number;
  revenueThisMonth: number;
  averageSalePrice: number;
  testDrivesThisMonth: number;
  testDriveToSaleConversionRate: number;
  pendingFinancingApplications: number;
  approvedFinancingRate: number;
  serviceAppointmentsToday: number;
  topSellingMakes: Array<{ make: string; count: number; revenue: number }>;
}
