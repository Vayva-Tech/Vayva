/**
 * @vayva/industry-legal - Type Definitions
 * 
 * Comprehensive TypeScript types for Legal & Law Firm Platform
 * Based on BATCH_5_DESIGN_LEGAL.md specification
 */

// ============================================================================
// CORE ENTITY TYPES (Mirror Prisma models)
// ============================================================================

export interface PracticeArea {
  id: string;
  name: string;
  code: string; // CRIMINAL, PI, FAMILY, DUI, CIVIL
  description?: string;
  color: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Case {
  id: string;
  caseNumber: string;
  storeId: string;
  practiceAreaId: string;
  title: string;
  description?: string;
  type: 'litigation' | 'transactional' | 'criminal' | 'civil';
  stage: 'intake' | 'pleading' | 'discovery' | 'pre_trial' | 'trial' | 'post_trial' | 'appeal' | 'closed';
  status: 'active' | 'pending' | 'closed' | 'on_hold';
  feeArrangement: 'hourly' | 'flat_fee' | 'contingency' | 'retainer' | 'hybrid';
  leadAttorneyId: string;
  leadAttorneyName: string;
  coCounsel: string[];
  clientIds: string[];
  clientNames: string[];
  opposingParties?: any;
  budget?: number;
  estimatedValue?: number;
  actualValue?: number;
  amountBilled: number;
  amountCollected: number;
  costsAdvanced: number;
  retainerAmount?: number;
  retainerBalance?: number;
  contingencyPercent?: number;
  winLoss?: 'won' | 'lost' | 'settled' | 'pending';
  closedDate?: Date;
  closedReason?: string;
  tags: string[];
  notes?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface LitigationParty {
  id: string;
  caseId: string;
  partyType: 'plaintiff' | 'defendant' | 'petitioner' | 'respondent' | 'witness' | 'expert_witness' | 'interested_party';
  name: string;
  entityType: 'individual' | 'organization' | 'government_agency';
  contactInfo?: any;
  attorneyId?: string;
  attorneyName?: string;
  firmName?: string;
  relationship?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface JudgeAssignment {
  id: string;
  caseId: string;
  judgeName: string;
  courtName: string;
  department?: string;
  location?: string;
  standingOrders?: string;
  assignedDate: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ConflictCheck {
  id: string;
  caseId?: string;
  storeId: string;
  prospectiveClientName: string;
  matterDescription: string;
  partiesChecked: string[];
  conflictsFound: boolean;
  conflictDetails?: string;
  status: 'pending' | 'cleared' | 'blocked' | 'waived';
  clearedBy?: string;
  clearedDate?: Date;
  waiverReason?: string;
  ethicalWallRequired: boolean;
  ethicalWallAttorneys: string[];
  checkedBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface EngagementLetter {
  id: string;
  caseId: string;
  templateId?: string;
  content: string;
  feeTerms: string;
  scopeOfWork: string;
  status: 'draft' | 'sent' | 'signed' | 'declined';
  sentDate?: Date;
  signedDate?: Date;
  declinedReason?: string;
  signatureData?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface TimeEntry {
  id: string;
  caseId: string;
  attorneyId: string;
  attorneyName: string;
  userId?: string;
  userName: string;
  date: Date;
  startTime?: Date;
  endTime?: Date;
  duration: number; // Hours
  description: string;
  taskCode?: string;
  category: 'billable' | 'non_billable' | 'administrative' | 'pro_bono';
  billingRate: number;
  amount: number;
  status: 'unsubmitted' | 'submitted' | 'approved' | 'invoiced' | 'written_off';
  invoiceId?: string;
  narrative?: string;
  writeOffId?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface BillingRate {
  id: string;
  practiceAreaId?: string;
  storeId: string;
  role: 'partner' | 'associate' | 'counsel' | 'paralegal' | 'law_clerk';
  level?: 'senior' | 'mid' | 'junior';
  rate: number;
  effectiveDate: Date;
  endDate?: Date;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface WriteOff {
  id: string;
  caseId: string;
  timeEntryId?: string;
  amount: number;
  reasonCode: 'admin_error' | 'relationship_goodwill' | 'quality_issue' | 'collection_issue';
  reasonDetail?: string;
  requestedBy: string;
  requestedById: string;
  status: 'pending' | 'approved' | 'rejected';
  approvedBy?: string;
  approvedDate?: Date;
  rejectionReason?: string;
  financialImpact: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrustAccount {
  id: string;
  storeId: string;
  name: string;
  accountType: 'iolta' | 'non_iolta' | 'client_specific';
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  currentBalance: number;
  ledgerBalance: number;
  isActive: boolean;
  lastReconciliation?: Date;
  reconciliationStatus: 'current' | 'overdue' | 'discrepancy';
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface TrustTransaction {
  id: string;
  accountId: string;
  clientId: string;
  caseId: string;
  type: 'deposit' | 'disbursement' | 'transfer_to_operating' | 'refund' | 'nsf';
  amount: number;
  balance: number; // Running balance
  description: string;
  checkNumber?: string;
  referenceNumber?: string;
  payee?: string;
  category?: string;
  status: 'pending' | 'completed' | 'cancelled' | 'returned';
  processedBy: string;
  approvedBy?: string;
  notes?: string;
  transactionDate: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ClientLedger {
  id: string;
  accountId: string;
  clientId: string;
  clientName: string;
  caseId: string;
  caseNumber: string;
  balance: number; // Must never go negative
  totalDeposits: number;
  totalDisbursements: number;
  totalTransfers: number;
  lastActivity: Date;
  alerts: string[]; // low_balance, negative_balance, replenishment_needed
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface LegalDocument {
  id: string;
  caseId: string;
  templateId?: string;
  title: string;
  documentType: 'pleading' | 'motion' | 'brief' | 'contract' | 'will' | 'trust' | 'agreement' | 'letter' | 'form';
  category?: string;
  description?: string;
  fileUrl: string;
  fileName: string;
  fileSize?: number;
  mimeType?: string;
  version: number;
  status: 'draft' | 'in_review' | 'awaiting_signature' | 'executed' | 'filed';
  authorId: string;
  authorName: string;
  reviewerId?: string;
  reviewComments?: string;
  reviewedAt?: Date;
  filedDate?: Date;
  courtId?: string;
  executedDate?: Date;
  signatureData?: any;
  notarizationData?: any;
  tags: string[];
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface DocumentTemplate {
  id: string;
  storeId: string;
  practiceAreaId?: string;
  name: string;
  description?: string;
  category: 'pleading' | 'transactional' | 'form' | 'letter' | 'contract';
  subcategory?: string;
  content: string;
  mergeFields?: any;
  usageCount: number;
  isActive: boolean;
  lastUsed?: Date;
  tags: string[];
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface Deadline {
  id: string;
  caseId: string;
  title: string;
  description?: string;
  type: 'statute_limitations' | 'court_ordered' | 'contractual' | 'internal' | 'discovery' | 'filing' | 'hearing' | 'trial';
  category?: string;
  dueDate: Date;
  calculatedDate?: Date;
  businessDays?: number;
  isHard: boolean; // Non-extendable
  priority: 'low' | 'normal' | 'high' | 'critical' | 'urgent';
  status: 'pending' | 'completed' | 'overdue' | 'cancelled';
  completedDate?: Date;
  responsibleAttorneyId: string;
  responsibleAttorneyName: string;
  reminderSettings?: any;
  remindersSent: Date[];
  relatedDocumentId?: string;
  courtRule?: string;
  tollingInfo?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CourtAppearance {
  id: string;
  caseId: string;
  type: 'arraignment' | 'motion_hearing' | 'status_conference' | 'pretrial_conference' | 'trial' | 'sentencing' | 'deposition';
  title: string;
  description?: string;
  dateTime: Date;
  duration?: number; // Minutes
  location: string;
  department?: string;
  judgeName?: string;
  appearancesRequired: string[];
  appearanceType: 'in_person' | 'remote' | 'telephone';
  remoteLink?: string;
  dialInInfo?: string;
  status: 'scheduled' | 'completed' | 'cancelled' | 'rescheduled';
  notes?: string;
  preparation?: string;
  outcome?: string;
  nextHearing?: Date;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface DiscoveryRequest {
  id: string;
  caseId: string;
  type: 'interrogatories' | 'request_for_production' | 'request_for_admission' | 'deposition_notice' | 'subpoena';
  title: string;
  description?: string;
  servedDate: Date;
  dueDate: Date;
  responseDue: Date;
  status: 'pending' | 'responded' | 'objected' | 'motion_to_compel' | 'completed';
  responses?: any;
  objections?: string;
  extensions: number;
  extensionReason?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface CLECredit {
  id: string;
  attorneyId: string;
  attorneyName: string;
  storeId: string;
  jurisdiction: string;
  creditType: 'general' | 'ethics' | 'elimination_of_bias' | 'substance_abuse' | 'competency' | 'specialization';
  courseName: string;
  provider: string;
  credits: number;
  completionDate: Date;
  expirationDate?: Date;
  certificateUrl?: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  cost?: number;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface IntakeQuestionnaire {
  id: string;
  storeId: string;
  prospectiveClientId: string;
  prospectiveClientName: string;
  contactEmail: string;
  contactPhone: string;
  practiceAreaId?: string;
  matterType: string;
  description: string;
  opposingParties: string[];
  caseGoals?: string;
  urgency: 'low' | 'normal' | 'high' | 'emergency';
  referralSource?: string;
  score?: number;
  merit?: 'strong' | 'moderate' | 'weak';
  damages?: number;
  collectibility?: 'high' | 'medium' | 'low';
  jurisdiction?: string;
  status: 'new' | 'under_review' | 'accepted' | 'declined' | 'conflict';
  reviewedBy?: string;
  reviewedDate?: Date;
  acceptanceDecision?: string;
  declineReason?: string;
  conflictsPending: boolean;
  questionnaireData: any;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface MalpracticeIncident {
  id: string;
  storeId: string;
  caseId?: string;
  incidentType: 'missed_deadline' | 'error_in_filing' | 'conflict_violation' | 'confidentiality_breach' | 'other';
  description: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  status: 'reported' | 'under_review' | 'claim_filed' | 'resolved';
  reportedDate: Date;
  discoveredBy: string;
  potentialDamages?: number;
  actualDamages?: number;
  carrierNotified: boolean;
  claimNumber?: string;
  adjusterContact?: any;
  resolution?: string;
  resolvedDate?: Date;
  lessonsLearned?: string;
  preventiveMeasures?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

// ============================================================================
// DASHBOARD METRIC TYPES
// ============================================================================

export interface FirmPerformanceMetrics {
  activeCases: number;
  newCasesThisWeek: number;
  closedThisMonth: number;
  billableHoursMTD: number;
  billableHoursTarget: number;
  billableHoursVariance: number;
  collectionsMTD: number;
  collectionsPlan: number;
  collectionsVariancePercent: number;
}

export interface CasePipelineMetrics {
  casesByPracticeArea: Array<{
    practiceArea: string;
    code: string;
    count: number;
    percentage: number;
    avgValue: number;
  }>;
  pendingIntake: number;
  conflictsPending: number;
  winRate: number;
  averageCaseValue: number;
}

export interface CourtCalendarMetrics {
  todaysAppearances: CourtAppearance[];
  upcomingHearings: CourtAppearance[];
  judgeAssignments: JudgeAssignment[];
}

export interface TimeTrackingMetrics {
  billedHours: number;
  wipHours: number;
  nonBillableHours: number;
  writeOffHours: number;
  realizationRate: number;
  collectionRate: number;
  topProducer: {
    attorneyName: string;
    hours: number;
  };
  unsubmittedTimesheets: number;
  submissionDeadline: Date;
}

export interface TrustAccountMetrics {
  totalBalance: number;
  clientBalances: Array<{
    clientName: string;
    balance: number;
    caseNumber: string;
  }>;
  disbursementsPending: number;
  transfersToOperating: number;
  negativeBalanceAlerts: number;
  reconciliationStatus: 'current' | 'overdue' | 'discrepancy';
}

export interface DocumentCenterMetrics {
  drafting: number;
  inReview: number;
  awaitingSignature: number;
  executedFiled: number;
  templateCount: number;
  clauseCount: number;
  eSignaturePending: number;
  notarizationScheduled: number;
  mostUsedTemplates: Array<{
    name: string;
    usageCount: number;
  }>;
}

export interface DeadlineMetrics {
  todaysDeadlines: Deadline[];
  upcomingDeadlines: Deadline[];
  statuteOfLimitationsAlerts: Array<{
    caseNumber: string;
    deadlineDate: Date;
    daysRemaining: number;
  }>;
  overdueFilings: Deadline[];
}

export interface ClientMattersMetrics {
  activeMatters: Array<{
    caseNumber: string;
    clientName: string;
    practiceArea: string;
    retainerType: string;
    retainerBalance?: number;
    status: string;
  }>;
  lowRetainerAlerts: number;
  overdueInvoices: number;
}

export interface CaseFinancialsMetrics {
  matterProfitability: Array<{
    caseNumber: string;
    clientName: string;
    budget?: number;
    billed: number;
    margin: number;
    status: 'on_track' | 'at_risk' | 'over_budget';
  }>;
  wipTotal: number;
  accountsReceivable: number;
  contingencyEstimate: number;
  writeOffAnalysis: Array<{
    reason: string;
    amount: number;
    count: number;
  }>;
}

export interface TaskManagementMetrics {
  highPriority: number;
  dueToday: number;
  overdue: number;
  byRole: {
    attorneys: number;
    paralegals: number;
    staff: number;
  };
  completionRate: number;
  averageTurnaroundHours: number;
}

export interface ActionRequiredItem {
  id: string;
  type: 'trust_disbursement' | 'court_filing' | 'client_call' | 'discovery_review' | 'deposition_prep' | 'trust_reconciliation' | 'cle_registration' | 'bar_dues' | 'malpractice_renewal';
  title: string;
  description: string;
  caseNumber?: string;
  dueDate: Date;
  priority: 'low' | 'normal' | 'high' | 'urgent';
  completed: boolean;
  metadata?: any;
}

// ============================================================================
// API REQUEST/RESPONSE TYPES
// ============================================================================

export interface LegalDashboardResponse {
  firmPerformance: FirmPerformanceMetrics;
  casePipeline: CasePipelineMetrics;
  courtCalendar: CourtCalendarMetrics;
  timeTracking: TimeTrackingMetrics;
  trustAccount: TrustAccountMetrics;
  documentCenter: DocumentCenterMetrics;
  criticalDeadlines: DeadlineMetrics;
  clientMatters: ClientMattersMetrics;
  caseFinancials: CaseFinancialsMetrics;
  taskManagement: TaskManagementMetrics;
  actionRequired: ActionRequiredItem[];
  lastUpdated: Date;
}

// ============================================================================
// SETTINGS CONFIGURATION TYPES
// ============================================================================

export interface CaseManagementSettings {
  defaultCaseStages: string[];
  autoConflictCheck: boolean;
  requireEngagementLetter: boolean;
  enableEthicalWalls: boolean;
  caseNumberFormat: string;
  defaultFeeArrangement: string;
}

export interface TimeBillingSettings {
  minimumIncrement: number; // Minutes (6, 10, 15)
  requireNarrative: boolean;
  enableTaskCodes: boolean;
  timelyEntryDays: number;
  autoInvoiceApproval: boolean;
  writeOffApprovalThreshold: number;
}

export interface TrustAccountSettings {
  ioltaAccountId?: string;
  threeWayReconciliationFrequency: 'daily' | 'weekly' | 'monthly';
  negativeBalanceAlert: boolean;
  autoTransferToOperating: boolean;
  escheatmentTracking: boolean;
}

export interface CourtCalendarSettings {
  courtHolidayCalendars: string[];
  defaultReminderDays: number[];
  enableEFiling: boolean;
  businessDayCalculation: 'exclude_weekends' | 'exclude_weekends_holidays';
}

export interface DocumentManagementSettings {
  defaultStorageProvider: 'local' | 's3' | 'azure' | 'google_drive';
  enableVersionControl: boolean;
  maxVersions: number;
  enableESignature: boolean;
  eSignatureProvider?: 'docusign' | 'adobe_sign';
  enableNotarization: boolean;
}

export interface ClientIntakeSettings {
  enableOnlineIntake: boolean;
  intakeFormFields: any[];
  autoScoreCases: boolean;
  scoringCriteria: any;
  requireConflictCheck: boolean;
  autoDeclineConflicts: boolean;
}

export interface LitigationSupportSettings {
  discoveryTrackingEnabled: boolean;
  defaultDiscoveryDeadlineDays: number;
  enableExhibitManagement: boolean;
  enableWitnessManagement: boolean;
  trialPreparationDays: number;
}

export interface ComplianceSettings {
  cleJurisdictions: string[];
  cleCreditRequirements: any;
  malpracticeCarrier: string;
  policyNumber?: string;
  barAssociationMemberships: string[];
  fileRetentionYears: number;
}
