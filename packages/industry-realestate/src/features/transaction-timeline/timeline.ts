// @ts-nocheck
/**
 * Transaction Timeline Manager
 * Manages transaction milestones and timeline
 */

import type { 
  Transaction, 
  TransactionTimeline, 
  Milestone,
  RiskFlag,
  TimelineConfig,
  TimelineUpdateRequest,
} from '../../types';
import { STANDARD_MILESTONES } from '../../types/transaction';
import { 
  createMilestonesFromTemplates,
  getNextMilestone,
  getOverdueMilestones,
  getUpcomingMilestones,
  calculateMilestoneProgress,
  getCurrentPhase,
  getDaysToClose,
  getDaysInContract,
  updateMilestoneStatus,
} from './milestones';
import { detectAllRisks, DEFAULT_RISK_CONFIG } from './risk-detector';

export { STANDARD_MILESTONES };

/**
 * Create a new transaction timeline
 */
export function createTransactionTimeline(
  transaction: Transaction,
  config?: Partial<TimelineConfig>
): TransactionTimeline {
  const milestones = createMilestonesFromTemplates(
    transaction,
    config?.milestoneTemplates || STANDARD_MILESTONES
  );

  const risks = detectAllRisks(transaction, milestones);

  return buildTransactionTimeline(transaction, milestones, risks);
}

/**
 * Build transaction timeline from components
 */
export function buildTransactionTimeline(
  transaction: Transaction,
  milestones: Milestone[],
  riskFlags: RiskFlag[]
): TransactionTimeline {
  const completedMilestones = milestones.filter(m => m.status === 'completed').length;
  const totalMilestones = milestones.length;
  const progressPercent = calculateMilestoneProgress(milestones);
  const daysToClose = getDaysToClose(transaction, milestones);
  const daysInContract = getDaysInContract(transaction);

  return {
    transaction,
    milestones,
    currentPhase: getCurrentPhase(milestones),
    daysToClose,
    daysInContract,
    progressPercent,
    completedMilestones,
    totalMilestones,
    overdueMilestones: getOverdueMilestones(milestones),
    upcomingMilestones: getUpcomingMilestones(milestones),
    riskFlags,
  };
}

/**
 * Update a milestone in the timeline
 */
export function updateTimelineMilestone(
  timeline: TransactionTimeline,
  request: TimelineUpdateRequest
): { success: boolean; error?: string; timeline?: TransactionTimeline } {
  const milestoneIndex = timeline.milestones.findIndex(m => m.id === request.milestoneId);
  
  if (milestoneIndex === -1) {
    return { success: false, error: 'Milestone not found' };
  }

  const milestone = timeline.milestones[milestoneIndex];
  
  const result = updateMilestoneStatus(
    milestone,
    request.status,
    timeline.milestones
  );

  if (!result.success) {
    return { success: false, error: result.error };
  }

  // Update the milestone with additional fields
  const updatedMilestone: Milestone = {
    ...result.updatedMilestone!,
    notes: request.notes || milestone.notes,
    completedDate: request.completedDate || result.updatedMilestone!.completedDate,
  };

  const updatedMilestones = [...timeline.milestones];
  updatedMilestones[milestoneIndex] = updatedMilestone;

  // Re-detect risks
  const risks = detectAllRisks(timeline.transaction, updatedMilestones);

  // Rebuild timeline
  const updatedTimeline = buildTransactionTimeline(
    timeline.transaction,
    updatedMilestones,
    risks
  );

  return { success: true, timeline: updatedTimeline };
}

/**
 * Add a custom milestone to the timeline
 */
export function addMilestone(
  timeline: TransactionTimeline,
  milestone: Omit<Milestone, 'id' | 'transactionId' | 'createdAt' | 'updatedAt'>
): TransactionTimeline {
  const newMilestone: Milestone = {
    ...milestone,
    id: `milestone-${timeline.transaction.id}-${Date.now()}`,
    transactionId: timeline.transaction.id,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const updatedMilestones = [...timeline.milestones, newMilestone];
  const risks = detectAllRisks(timeline.transaction, updatedMilestones);

  return buildTransactionTimeline(timeline.transaction, updatedMilestones, risks);
}

/**
 * Remove a milestone from the timeline
 */
export function removeMilestone(
  timeline: TransactionTimeline,
  milestoneId: string
): { success: boolean; error?: string; timeline?: TransactionTimeline } {
  const milestone = timeline.milestones.find(m => m.id === milestoneId);
  
  if (!milestone) {
    return { success: false, error: 'Milestone not found' };
  }

  // Check if any other milestones depend on this one
  const dependents = timeline.milestones.filter(m => 
    m.dependencies.includes(milestoneId) || m.dependencies.includes(milestone.templateId || '')
  );

  if (dependents.length > 0) {
    return {
      success: false,
      error: `Cannot remove: ${dependents.length} milestone(s) depend on this one`,
    };
  }

  const updatedMilestones = timeline.milestones.filter(m => m.id !== milestoneId);
  const risks = detectAllRisks(timeline.transaction, updatedMilestones);

  const updatedTimeline = buildTransactionTimeline(
    timeline.transaction,
    updatedMilestones,
    risks
  );

  return { success: true, timeline: updatedTimeline };
}

/**
 * Get timeline summary for dashboard display
 */
export function getTimelineSummary(timeline: TransactionTimeline) {
  return {
    transactionId: timeline.transaction.id,
    transactionNumber: timeline.transaction.transactionNumber,
    status: timeline.transaction.status,
    currentPhase: timeline.currentPhase,
    progressPercent: timeline.progressPercent,
    daysToClose: timeline.daysToClose,
    daysInContract: timeline.daysInContract,
    completedMilestones: timeline.completedMilestones,
    totalMilestones: timeline.totalMilestones,
    overdueCount: timeline.overdueMilestones.length,
    upcomingCount: timeline.upcomingMilestones.length,
    riskCount: timeline.riskFlags.length,
    criticalRisks: timeline.riskFlags.filter(r => r.level === 'critical').length,
    nextMilestone: getNextMilestone(timeline.milestones)?.name,
    nextMilestoneDueDate: getNextMilestone(timeline.milestones)?.dueDate,
  };
}

/**
 * Check if transaction is on track
 */
export function isTransactionOnTrack(timeline: TransactionTimeline): boolean {
  // Transaction is on track if:
  // 1. No critical risks
  // 2. No overdue milestones
  // 3. Progress is reasonable for days in contract
  
  const hasCriticalRisks = timeline.riskFlags.some(r => r.level === 'critical');
  const hasOverdueMilestones = timeline.overdueMilestones.length > 0;
  
  if (hasCriticalRisks || hasOverdueMilestones) {
    return false;
  }

  // Check if progress is reasonable
  // Assuming 30-day contract, each day should account for ~3.3% progress
  const expectedProgress = Math.min(100, (timeline.daysInContract / 30) * 100);
  const progressDifference = timeline.progressPercent - expectedProgress;
  
  // Allow 15% variance
  return progressDifference >= -15;
}

/**
 * Get recommended actions for the timeline
 */
export function getRecommendedActions(timeline: TransactionTimeline): string[] {
  const actions: string[] = [];

  // Check for overdue milestones
  if (timeline.overdueMilestones.length > 0) {
    actions.push(`Follow up on ${timeline.overdueMilestones.length} overdue milestone(s)`);
  }

  // Check for upcoming milestones
  if (timeline.upcomingMilestones.length > 0) {
    actions.push(`Prepare for upcoming: ${timeline.upcomingMilestones[0].name}`);
  }

  // Check for risks
  const criticalRisks = timeline.riskFlags.filter(r => r.level === 'critical');
  if (criticalRisks.length > 0) {
    actions.push(`URGENT: Address ${criticalRisks.length} critical risk(s)`);
  }

  // Check if closing is approaching
  if (timeline.daysToClose <= 7 && timeline.daysToClose > 0) {
    actions.push('Schedule final walkthrough and closing coordination');
  }

  // Check progress
  if (!isTransactionOnTrack(timeline)) {
    actions.push('Review transaction timeline and adjust expectations');
  }

  return actions;
}

/**
 * Export timeline to calendar events
 */
export function exportToCalendarEvents(timeline: TransactionTimeline) {
  return timeline.milestones
    .filter(m => m.dueDate && m.status !== 'completed' && m.status !== 'skipped')
    .map(m => ({
      title: `${timeline.transaction.transactionNumber}: ${m.name}`,
      start: m.dueDate,
      description: m.description || '',
      category: m.category,
      status: m.status,
    }));
}

// Re-export functions from milestones
export {
  getNextMilestone,
  getOverdueMilestones,
  getUpcomingMilestones,
  calculateMilestoneProgress,
  getCurrentPhase,
  getDaysToClose,
  getDaysInContract,
};

// Re-export from risk-detector
export { detectAllRisks } from './risk-detector';
