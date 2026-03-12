/**
 * Legal Industry Dashboard Configuration
 * Premium Glass Design Category - Justice Blue Theme
 */

import type { LegalDashboardResponse } from '../types';

export const LEGAL_DASHBOARD_CONFIG = {
  industry: 'legal' as const,
  title: 'Legal Dashboard',
  subtitle: 'Law Firm Management Platform',
  primaryObjectLabel: 'Cases',
  defaultTimeHorizon: 'month' as const,
  designCategory: 'premium_glass' as const,
  theme: {
    primary: '#1E40AF', // Justice Blue
    secondary: '#D97706', // Authority Gold
    accent: '#059669', // Integrity Green
    background: '#EFF6FF',
    success: '#059669',
    warning: '#D97706',
    danger: '#DC2626',
  },
};

export async function getLegalDashboardConfig(
  storeId: string
): Promise<LegalDashboardResponse> {
  // This will be implemented with actual API calls
  // For now, return empty structure that matches the types
  return {
    firmPerformance: {
      activeCases: 0,
      newCasesThisWeek: 0,
      closedThisMonth: 0,
      billableHoursMTD: 0,
      billableHoursTarget: 0,
      billableHoursVariance: 0,
      collectionsMTD: 0,
      collectionsPlan: 0,
      collectionsVariancePercent: 0,
    },
    casePipeline: {
      casesByPracticeArea: [],
      pendingIntake: 0,
      conflictsPending: 0,
      winRate: 0,
      averageCaseValue: 0,
    },
    courtCalendar: {
      todaysAppearances: [],
      upcomingHearings: [],
      judgeAssignments: [],
    },
    timeTracking: {
      billedHours: 0,
      wipHours: 0,
      nonBillableHours: 0,
      writeOffHours: 0,
      realizationRate: 0,
      collectionRate: 0,
      topProducer: { attorneyName: '', hours: 0 },
      unsubmittedTimesheets: 0,
      submissionDeadline: new Date(),
    },
    trustAccount: {
      totalBalance: 0,
      clientBalances: [],
      disbursementsPending: 0,
      transfersToOperating: 0,
      negativeBalanceAlerts: 0,
      reconciliationStatus: 'current',
    },
    documentCenter: {
      drafting: 0,
      inReview: 0,
      awaitingSignature: 0,
      executedFiled: 0,
      templateCount: 0,
      clauseCount: 0,
      eSignaturePending: 0,
      notarizationScheduled: 0,
      mostUsedTemplates: [],
    },
    criticalDeadlines: {
      todaysDeadlines: [],
      upcomingDeadlines: [],
      statuteOfLimitationsAlerts: [],
      overdueFilings: [],
    },
    clientMatters: {
      activeMatters: [],
      lowRetainerAlerts: 0,
      overdueInvoices: 0,
    },
    caseFinancials: {
      matterProfitability: [],
      wipTotal: 0,
      accountsReceivable: 0,
      contingencyEstimate: 0,
      writeOffAnalysis: [],
    },
    taskManagement: {
      highPriority: 0,
      dueToday: 0,
      overdue: 0,
      byRole: { attorneys: 0, paralegals: 0, staff: 0 },
      completionRate: 0,
      averageTurnaroundHours: 0,
    },
    actionRequired: [],
    lastUpdated: new Date(),
  };
}
