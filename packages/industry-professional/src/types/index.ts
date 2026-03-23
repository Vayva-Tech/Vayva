// @ts-nocheck
/* eslint-disable @typescript-eslint/no-unused-vars */
import { z } from 'zod';

// ─── Shared Dashboard Types (local copy to avoid cross-package dep) ───────────

export type IndustrySlug = 'fashion' | 'restaurant' | 'realestate' | 'healthcare' | 'electronics' | 'beauty' | 'events' | 'b2b' | 'grocery' | 'retail' | 'travel' | 'automotive' | 'professional';

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

// ─── Core Professional Services Types ─────────────────────────────────────────

export const ProfessionalIndustrySlug = 'professional' as const;
export type ProfessionalIndustrySlug = typeof ProfessionalIndustrySlug;

// Matter types
export const MatterStatus = z.enum([
  'active',
  'on_hold',
  'pending_closure',
  'closed',
  'archived',
]);
export type MatterStatus = z.infer<typeof MatterStatus>;

export const PracticeArea = z.enum([
  'corporate_law',
  'litigation',
  'real_estate',
  'family_law',
  'intellectual_property',
  'employment_law',
  'tax_law',
  'estate_planning',
  'immigration',
  'bankruptcy',
]);
export type PracticeArea = z.infer<typeof PracticeArea>;

export const FeeArrangement = z.enum([
  'hourly',
  'flat_fee',
  'contingency',
  'retainer',
  'mixed',
]);
export type FeeArrangement = z.infer<typeof FeeArrangement>;

export const MatterSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  matterNumber: z.string(),
  title: z.string(),
  description: z.string().optional(),
  clientId: z.string(),
  practiceArea: PracticeArea,
  status: MatterStatus,
  responsibleAttorneyId: z.string(),
  billingAttorneyId: z.string().optional(),
  originatingAttorneyId: z.string().optional(),
  feeArrangement: FeeArrangement,
  hourlyRate: z.number().min(0).optional(),
  flatFeeAmount: z.number().min(0).optional(),
  contingencyPercentage: z.number().min(0).max(100).optional(),
  retainerAmount: z.number().min(0).optional(),
  openedAt: z.date(),
  closedAt: z.date().optional(),
  estimatedCloseDate: z.date().optional(),
  actualCloseDate: z.date().optional(),
  billingMethod: z.enum(['prebill', 'postbill']).default('prebill'),
  isProBono: z.boolean().default(false),
  conflictCheckCompleted: z.boolean().default(false),
  conflictCheckNotes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Matter = z.infer<typeof MatterSchema>;

// Client types
export const ClientType = z.enum([
  'individual',
  'corporation',
  'partnership',
  'llc',
  'trust',
  'government',
  'nonprofit',
]);
export type ClientType = z.infer<typeof ClientType>;

export const ClientSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  clientNumber: z.string(),
  type: ClientType,
  name: z.string(),
  displayName: z.string(),
  primaryContactName: z.string().optional(),
  primaryContactEmail: z.string().email().optional(),
  primaryContactPhone: z.string().optional(),
  billingContactName: z.string().optional(),
  billingContactEmail: z.string().email().optional(),
  billingAddress: z.string().optional(),
  website: z.string().url().optional(),
  industry: z.string().optional(),
  referredBy: z.string().optional(),
  firstMatterDate: z.date().optional(),
  totalRevenue: z.number().min(0).default(0),
  mattersCount: z.number().int().min(0).default(0),
  isActive: z.boolean().default(true),
  clientPortalAccess: z.boolean().default(false),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Client = z.infer<typeof ClientSchema>;

// Time Entry types
export const TimeEntrySchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  matterId: z.string(),
  userId: z.string(), // attorney/paralegal who logged time
  date: z.date(),
  startTime: z.string().optional(), // HH:mm format
  endTime: z.string().optional(),
  durationMinutes: z.number().int().min(1),
  activityCode: z.string(), // e.g., 'research', 'drafting', 'meeting'
  description: z.string(),
  billed: z.boolean().default(false),
  billable: z.boolean().default(true),
  rate: z.number().min(0),
  amount: z.number().min(0),
  invoiceId: z.string().optional(),
  submittedAt: z.date().optional(),
  approvedAt: z.date().optional(),
  approvedBy: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type TimeEntry = z.infer<typeof TimeEntrySchema>;

// Invoice types
export const InvoiceStatus = z.enum([
  'draft',
  'sent',
  'paid',
  'overdue',
  'void',
  'written_off',
]);
export type InvoiceStatus = z.infer<typeof InvoiceStatus>;

export const InvoiceSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  invoiceNumber: z.string(),
  clientId: z.string(),
  matterId: z.string().optional(),
  issuedAt: z.date(),
  dueAt: z.date(),
  billedAmount: z.number().min(0),
  paidAmount: z.number().min(0).default(0),
  writeOffAmount: z.number().min(0).default(0),
  status: InvoiceStatus,
  lineItems: z.array(z.object({
    description: z.string(),
    quantity: z.number().min(0),
    unitPrice: z.number().min(0),
    amount: z.number().min(0),
    timeEntryIds: z.array(z.string()).optional(),
  })),
  taxRate: z.number().min(0).default(0),
  taxAmount: z.number().min(0).default(0),
  totalAmount: z.number().min(0),
  sentAt: z.date().optional(),
  paidAt: z.date().optional(),
  voidedAt: z.date().optional(),
  notes: z.string().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Invoice = z.infer<typeof InvoiceSchema>;

// Trust Accounting types
export const TrustTransactionType = z.enum([
  'receipt',
  'disbursement',
  'transfer_to_operating',
  'refund',
]);
export type TrustTransactionType = z.infer<typeof TrustTransactionType>;

export const TrustTransactionSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  clientId: z.string(),
  accountId: z.string(), // trust account ID
  type: TrustTransactionType,
  amount: z.number(),
  description: z.string(),
  referenceNumber: z.string().optional(),
  createdAt: z.date(),
  createdBy: z.string(),
});
export type TrustTransaction = z.infer<typeof TrustTransactionSchema>;

// Document types
export const DocumentStatus = z.enum([
  'drafting',
  'in_review',
  'awaiting_signature',
  'executed',
  'filed',
  'archived',
]);
export type DocumentStatus = z.infer<typeof DocumentStatus>;

export const DocumentSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  matterId: z.string(),
  title: z.string(),
  type: z.string(), // contract, pleading, correspondence, etc.
  status: DocumentStatus,
  version: z.string().default('1.0'),
  fileId: z.string().optional(), // reference to storage
  url: z.string().optional(),
  createdBy: z.string(),
  assignedTo: z.string().optional(),
  dueDate: z.date().optional(),
  signedAt: z.date().optional(),
  filedAt: z.date().optional(),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type Document = z.infer<typeof DocumentSchema>;

// Calendar/Deadline types
export const DeadlineType = z.enum([
  'court_filing',
  'hearing',
  'discovery',
  'statute_of_limitations',
  'contractual',
  'internal',
]);
export type DeadlineType = z.infer<typeof DeadlineType>;

export const CalendarEventSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  matterId: z.string(),
  title: z.string(),
  type: DeadlineType,
  startDate: z.date(),
  endDate: z.date().optional(),
  allDay: z.boolean().default(false),
  location: z.string().optional(),
  description: z.string().optional(),
  reminderEnabled: z.boolean().default(true),
  reminderMinutes: z.number().int().default(1440), // 24 hours
  completedAt: z.date().optional(),
  assignedTo: z.array(z.string()).default([]),
  createdAt: z.date(),
  updatedAt: z.date(),
});
export type CalendarEvent = z.infer<typeof CalendarEventSchema>;

// Conflict Check types
export const ConflictStatus = z.enum([
  'pending',
  'cleared',
  'potential_conflict',
  'conflict_found',
]);
export type ConflictStatus = z.infer<typeof ConflictStatus>;

export const ConflictCheckSchema = z.object({
  id: z.string(),
  tenantId: z.string(),
  matterId: z.string(),
  checkedAgainst: z.string(), // client name, opposing party, etc.
  status: ConflictStatus,
  findings: z.string().optional(),
  checkedBy: z.string(),
  checkedAt: z.date(),
  resolvedAt: z.date().optional(),
  resolutionNotes: z.string().optional(),
});
export type ConflictCheck = z.infer<typeof ConflictCheckSchema>;

// Analytics
export interface ProfessionalServicesAnalytics {
  activeMatters: number;
  newMattersThisMonth: number;
  closedMattersThisMonth: number;
  utilizationRate: number; // percentage
  revenueMTD: number;
  revenueVsPlan: number; // percentage
  totalClients: number;
  activeClients: number;
  newClientsThisQuarter: number;
  clientRetentionRate: number; // percentage
  averageMatterValue: number;
  billedHoursMTD: number;
  wipHours: number;
  writeOffHours: number;
  collectionRate: number; // percentage
  dso: number; // days sales outstanding
  realizationRate: number; // percentage
  mattersByPracticeArea: Array<{ area: string; count: number; revenue: number }>;
  outstandingInvoices: number;
  overdueInvoices: number;
  unsubmittedTimesheets: number;
  pendingConflicts: number;
  upcomingDeadlines: number;
}
