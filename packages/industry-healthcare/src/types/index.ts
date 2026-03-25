/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from 'zod';

// ─── Shared Dashboard Types (local copy to avoid cross-package dep) ───────────

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

export interface LayoutItem {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

export interface LayoutPreset {
  id: string;
  name: string;
  breakpoints: {
    lg?: LayoutItem[];
    md?: LayoutItem[];
    sm?: LayoutItem[];
  };
}

export interface KPICardDefinition {
  id: string;
  label: string;
  format: 'percent' | 'currency' | 'number';
  invert?: boolean;
  alertThreshold?: number;
}

export interface AlertRule {
  id: string;
  condition: string;
  threshold: number;
  action: string;
}

export interface QuickAction {
  id: string;
  label: string;
  icon: string;
  action: string;
}

export interface Permission {
  resource: string;
  action: string;
}

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

// ─── Core Healthcare Types ───────────────────────────────────────────────────

export const HealthcareIndustrySlug = 'healthcare' as const;
export type HealthcareIndustrySlug = typeof HealthcareIndustrySlug;

// Appointment types
export const AppointmentStatus = z.enum([
  'scheduled',
  'confirmed',
  'in_progress',
  'completed',
  'cancelled',
  'no_show',
]);
export type AppointmentStatus = z.infer<typeof AppointmentStatus>;

export const AppointmentType = z.enum([
  'in_person',
  'telemedicine',
  'home_visit',
  'emergency',
]);
export type AppointmentType = z.infer<typeof AppointmentType>;

export const AppointmentSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  doctorId: z.string(),
  type: AppointmentType,
  status: AppointmentStatus,
  scheduledAt: z.date(),
  duration: z.number().int().min(5), // minutes
  specialty: z.string(),
  notes: z.string().optional(),
  fee: z.number().min(0),
  insuranceCovered: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Appointment = z.infer<typeof AppointmentSchema>;

// Doctor types
export const DoctorSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  name: z.string(),
  specialty: z.string(),
  subspecialties: z.array(z.string()).default([]),
  licenseNumber: z.string(),
  yearsExperience: z.number().int().min(0),
  rating: z.number().min(0).max(5).default(0),
  reviewCount: z.number().int().default(0),
  consultationFee: z.number().min(0),
  telemedicineFee: z.number().min(0).optional(),
  available: z.boolean().default(true),
  bio: z.string().optional(),
  languages: z.array(z.string()).default(['English']),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Doctor = z.infer<typeof DoctorSchema>;

// Patient types
export const PatientSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  firstName: z.string(),
  lastName: z.string(),
  dateOfBirth: z.date(),
  gender: z.enum(['male', 'female', 'other', 'prefer_not_to_say']),
  bloodType: z.enum(['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']).optional(),
  phone: z.string().optional(),
  email: z.string().email().optional(),
  address: z.string().optional(),
  emergencyContact: z.object({
    name: z.string(),
    phone: z.string(),
    relationship: z.string(),
  }).optional(),
  insuranceProvider: z.string().optional(),
  insurancePolicyNumber: z.string().optional(),
  allergies: z.array(z.string()).default([]),
  chronicConditions: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Patient = z.infer<typeof PatientSchema>;

// Medical Record types
export const MedicalRecordSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  doctorId: z.string(),
  appointmentId: z.string().optional(),
  type: z.enum(['consultation', 'lab_result', 'prescription', 'imaging', 'surgery_report', 'discharge_summary']),
  title: z.string(),
  content: z.string(),
  attachments: z.array(z.string()).default([]),
  confidential: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type MedicalRecord = z.infer<typeof MedicalRecordSchema>;

// Prescription types
export const PrescriptionSchema = z.object({
  id: z.string(),
  patientId: z.string(),
  doctorId: z.string(),
  medications: z.array(z.object({
    name: z.string(),
    dosage: z.string(),
    frequency: z.string(),
    duration: z.string(),
    instructions: z.string().optional(),
  })),
  issuedAt: z.date(),
  expiresAt: z.date().optional(),
  refillsAllowed: z.number().int().default(0),
  refillsUsed: z.number().int().default(0),
  status: z.enum(['active', 'filled', 'expired', 'cancelled']).default('active'),
});
export type Prescription = z.infer<typeof PrescriptionSchema>;

// Telemedicine Session types
export const TelemedicineSessionSchema = z.object({
  id: z.string(),
  appointmentId: z.string(),
  patientId: z.string(),
  doctorId: z.string(),
  roomId: z.string(),
  startedAt: z.date().optional(),
  endedAt: z.date().optional(),
  duration: z.number().int().optional(), // seconds
  recordingUrl: z.string().optional(),
  chatLog: z.array(z.object({
    senderId: z.string(),
    senderRole: z.enum(['patient', 'doctor']),
    message: z.string(),
    timestamp: z.date(),
  })).default([]),
  status: z.enum(['waiting', 'active', 'ended', 'failed']).default('waiting'),
});
export type TelemedicineSession = z.infer<typeof TelemedicineSessionSchema>;

// Analytics
export interface HealthcareAnalytics {
  totalPatients: number;
  newPatientsThisMonth: number;
  totalAppointments: number;
  appointmentsToday: number;
  appointmentsFulfillmentRate: number;
  averageWaitTime: number; // minutes
  telemedicineUtilization: number; // percentage
  revenueThisMonth: number;
  revenueLastMonth: number;
  revenueGrowth: number;
  topSpecialties: Array<{ specialty: string; count: number }>;
  appointmentsByType: Record<AppointmentType, number>;
  patientSatisfactionScore: number;
}
