// Professional Services Dashboard Types

export interface ProfessionalDashboardResponse {
  firmOverview: FirmOverviewData;
  matterPipeline: MatterPipelineData;
  clientPortfolio: ClientPortfolioData;
  timeAndBilling: TimeAndBillingData;
  documentStatus: DocumentStatusData;
  accountsReceivable: AccountsReceivableData;
  courtDatesAndDeadlines: CourtDatesAndDeadlinesData;
  taskManagement: TaskManagementData;
  complianceAndConflicts: ComplianceAndConflictsData;
  businessDevelopment: BusinessDevelopmentData;
  actionRequired: ActionRequiredItem[];
}

// Firm Overview
export interface FirmOverviewData {
  activeMatters: number;
  newMattersThisMonth: number;
  closedMattersThisMonth: number;
  utilizationRate: number;
  utilizationTarget: number;
  revenueMTD: number;
  revenueVsPlan: number;
  revenueGrowth: number;
}

// Matter Pipeline
export interface MatterPipelineData {
  byPracticeArea: Array<{
    area: string;
    count: number;
    percentage: number;
    revenueYTD: number;
  }>;
  statusBreakdown: {
    active: number;
    onHold: number;
    pendingClosure: number;
    closed: number;
  };
  pendingConflicts: number;
  agingReport: Array<{
    daysOpen: number;
    count: number;
    averageValue: number;
  }>;
}

// Client Portfolio
export interface ClientPortfolioData {
  totalClients: number;
  activeClients: number;
  newClientsThisQuarter: number;
  retentionRate: number;
  averageMatterValue: number;
  averageResponseTime: number;
  topClients: Array<{
    clientId: string;
    clientName: string;
    revenueYTD: number;
    mattersCount: number;
  }>;
  satisfactionScore: number;
}

// Time & Billing
export interface TimeAndBillingData {
  monthlyHours: {
    billed: number;
    wip: number;
    writeOffs: number;
  };
  collectionRate: number;
  dso: number; // Days Sales Outstanding
  realizationRate: number;
  unsubmittedTimesheets: number;
  approvalPending: number;
  billingRates: Array<{
    role: string;
    hourlyRate: number;
  }>;
}

// Document Status
export interface DocumentStatusData {
  pipeline: {
    drafting: number;
    inReview: number;
    awaitingSignature: number;
    executed: number;
    filed: number;
  };
  templateUsage: Array<{
    templateId: string;
    name: string;
    usageCount: number;
  }>;
  pendingSignatures: number;
  upcomingFilingDeadlines: number;
}

// Accounts Receivable
export interface AccountsReceivableData {
  outstandingInvoices: number;
  byAging: {
    current: number;
    "1_30_days": number;
    "31_60_days": number;
    "60_plus_days": number;
  };
  topDebtors: Array<{
    clientId: string;
    clientName: string;
    amount: number;
    daysOverdue: number;
  }>;
  creditHoldAccounts: number;
  paymentPlans: number;
}

// Court Dates & Deadlines
export interface CourtDatesAndDeadlinesData {
  todaysCourtCalendar: Array<{
    eventId: string;
    matterId: string;
    matterTitle: string;
    eventType: string;
    time: string;
    location: string;
  }>;
  upcomingDeadlines: Array<{
    deadlineId: string;
    matterId: string;
    matterTitle: string;
    deadlineType: string;
    dueDate: string;
    daysUntil: number;
    assignedTo: string;
  }>;
  overdueFilings: number;
  statuteLimitations: number;
}

// Task Management
export interface TaskManagementData {
  queueSummary: {
    highPriority: number;
    dueToday: number;
    overdue: number;
  };
  byRole: {
    attorneys: number;
    paralegals: number;
    admin: number;
  };
  completionRate: number;
  avgTurnaround: number; // days
}

// Compliance & Conflicts
export interface ComplianceAndConflictsData {
  conflictsCheck: {
    pending: number;
    potentialConflicts: number;
    cleared: number;
    clearedThisWeek: number;
  };
  cleCompliance: Array<{
    attorneyId: string;
    attorneyName: string;
    creditsEarned: number;
    creditsRequired: number;
    status: 'compliant' | 'warning' | 'overdue';
  }>;
  malpracticeClaims: number;
  ethicsInquiries: number;
}

// Business Development
export interface BusinessDevelopmentData {
  pipelineOpportunities: {
    qualifiedLeads: number;
    proposalsOut: number;
    estimatedValue: number;
    winRate: number;
    closingThisMonth: number;
  };
  topOpportunity: {
    clientName: string;
    estimatedValue: number;
    probability: number;
    expectedCloseDate: string;
  };
  sourceAttribution: Array<{
    source: string;
    leads: number;
    conversionRate: number;
  }>;
}

// Action Required Items
export interface ActionRequiredItem {
  id: string;
  title: string;
  description: string;
  priority: 'high' | 'medium' | 'low';
  dueDate?: string;
  assignedTo?: string;
  completed: boolean;
  actionUrl?: string;
}

// API Response Types
export interface ApiResponse<T> {
  data: T;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
  error?: string;
}

// Analytics Data
export interface ProfessionalAnalytics {
  // Utilization metrics
  utilizationRate: number;
  targetUtilization: number;
  utilizationTrend: Array<{
    date: string;
    rate: number;
  }>;
  
  // Revenue metrics
  revenueMTD: number;
  revenueVsPlan: number;
  revenueTrend: Array<{
    month: string;
    revenue: number;
  }>;
  
  // Matter metrics
  activeMatters: number;
  matterGrowth: number;
  mattersByPracticeArea: Array<{
    area: string;
    count: number;
    growth: number;
  }>;
  
  // Client metrics
  clientRetention: number;
  newClients: number;
  clientSatisfaction: number;
  
  // Billing metrics
  collectionRate: number;
  dso: number;
  realizationRate: number;
  wip: number;
}