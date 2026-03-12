/**
 * Real Estate Transaction Timeline Types
 * Contract-to-close tracking and milestone management
 */

import type { Property, PropertyListing } from './property';

export type TransactionStatus = 
  | 'draft'
  | 'active' 
  | 'pending'
  | 'contingent'
  | 'clear_to_close'
  | 'closed'
  | 'cancelled'
  | 'on_hold';

export type TransactionType = 'purchase' | 'sale' | 'refinance' | 'lease';

export type TransactionSide = 'buyer' | 'seller' | 'dual';

export type MilestoneStatus = 
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'skipped'
  | 'blocked';

export type RiskLevel = 'low' | 'medium' | 'high' | 'critical';

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: 'individual' | 'couple' | 'entity';
  isFirstTimeBuyer?: boolean;
  preApproved?: boolean;
  preApprovalAmount?: number;
  lenderName?: string;
}

export interface Transaction {
  id: string;
  merchantId: string;
  agentId: string;
  transactionNumber: string;
  type: TransactionType;
  side: TransactionSide;
  status: TransactionStatus;
  propertyId: string;
  property: Property;
  listingId?: string;
  listing?: PropertyListing;
  buyer: Client;
  seller: Client;
  contractPrice: number;
  earnestMoney: number;
  earnestMoneyDueDate?: Date;
  closingDate: Date;
  possessionDate?: Date;
  commissionRate?: number;
  commissionAmount?: number;
  referralFee?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  closedAt?: Date;
}

export interface MilestoneTemplate {
  id: string;
  name: string;
  category: string;
  description?: string;
  defaultDueDays: number; // days from contract date
  isRequired: boolean;
  dependencies: string[]; // other milestone IDs
  documents: string[]; // required document types
  automated: boolean;
}

export interface Milestone {
  id: string;
  transactionId: string;
  templateId?: string;
  name: string;
  category: string;
  description?: string;
  status: MilestoneStatus;
  dueDate?: Date;
  completedDate?: Date;
  assignedTo?: string;
  notes?: string;
  documents: string[];
  dependencies: string[];
  remindersSent: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionTimeline {
  transaction: Transaction;
  milestones: Milestone[];
  currentPhase: string;
  daysToClose: number;
  daysInContract: number;
  progressPercent: number;
  completedMilestones: number;
  totalMilestones: number;
  overdueMilestones: Milestone[];
  upcomingMilestones: Milestone[];
  riskFlags: RiskFlag[];
}

export interface RiskFlag {
  id: string;
  transactionId: string;
  type: string;
  level: RiskLevel;
  message: string;
  milestoneId?: string;
  detectedAt: Date;
  resolvedAt?: Date;
  resolvedBy?: string;
  notes?: string;
}

export interface DocumentChecklistItem {
  id: string;
  name: string;
  category: string;
  required: boolean;
  uploaded: boolean;
  uploadedAt?: Date;
  uploadedBy?: string;
  documentUrl?: string;
  notes?: string;
}

export interface TimelineConfig {
  milestoneTemplates: MilestoneTemplate[];
  automatedReminders: boolean;
  reminderDays: number[]; // days before due date
  documentChecklist: boolean;
  commissionTracking: boolean;
  riskDetection: boolean;
}

export interface TimelineUpdateRequest {
  milestoneId: string;
  status: MilestoneStatus;
  notes?: string;
  completedDate?: Date;
}

// Standard milestone templates for real estate transactions
export const STANDARD_MILESTONES: MilestoneTemplate[] = [
  {
    id: 'contract_signed',
    name: 'Contract Signed',
    category: 'contract',
    defaultDueDays: 0,
    isRequired: true,
    dependencies: [],
    documents: ['purchase_agreement'],
    automated: true,
  },
  {
    id: 'earnest_money',
    name: 'Earnest Money Deposited',
    category: 'financial',
    defaultDueDays: 3,
    isRequired: true,
    dependencies: ['contract_signed'],
    documents: ['earnest_money_receipt'],
    automated: false,
  },
  {
    id: 'inspection',
    name: 'Inspection Period',
    category: 'inspection',
    defaultDueDays: 10,
    isRequired: true,
    dependencies: ['contract_signed'],
    documents: ['inspection_report', 'inspection_notice'],
    automated: false,
  },
  {
    id: 'financing_contingency',
    name: 'Financing Contingency',
    category: 'financial',
    defaultDueDays: 21,
    isRequired: false,
    dependencies: ['contract_signed'],
    documents: ['loan_commitment_letter'],
    automated: false,
  },
  {
    id: 'appraisal_ordered',
    name: 'Appraisal Ordered',
    category: 'appraisal',
    defaultDueDays: 14,
    isRequired: true,
    dependencies: ['financing_contingency'],
    documents: ['appraisal_order'],
    automated: true,
  },
  {
    id: 'appraisal_completed',
    name: 'Appraisal Completed',
    category: 'appraisal',
    defaultDueDays: 21,
    isRequired: true,
    dependencies: ['appraisal_ordered'],
    documents: ['appraisal_report'],
    automated: false,
  },
  {
    id: 'title_search',
    name: 'Title Search',
    category: 'title',
    defaultDueDays: 15,
    isRequired: true,
    dependencies: ['contract_signed'],
    documents: ['title_commitment'],
    automated: true,
  },
  {
    id: 'title_clear',
    name: 'Title Clear',
    category: 'title',
    defaultDueDays: 25,
    isRequired: true,
    dependencies: ['title_search'],
    documents: ['title_policy'],
    automated: false,
  },
  {
    id: 'loan_approval',
    name: 'Final Loan Approval',
    category: 'financial',
    defaultDueDays: 28,
    isRequired: false,
    dependencies: ['appraisal_completed'],
    documents: ['final_approval_letter'],
    automated: false,
  },
  {
    id: 'clear_to_close',
    name: 'Clear to Close',
    category: 'closing',
    defaultDueDays: 30,
    isRequired: true,
    dependencies: ['loan_approval', 'title_clear'],
    documents: ['clear_to_close_notice'],
    automated: true,
  },
  {
    id: 'final_walkthrough',
    name: 'Final Walkthrough',
    category: 'closing',
    defaultDueDays: 30,
    isRequired: true,
    dependencies: ['clear_to_close'],
    documents: ['walkthrough_checklist'],
    automated: false,
  },
  {
    id: 'closing',
    name: 'Closing Day',
    category: 'closing',
    defaultDueDays: 30,
    isRequired: true,
    dependencies: ['final_walkthrough'],
    documents: ['closing_disclosure', 'deed', 'settlement_statement'],
    automated: false,
  },
];
