/**
 * Transaction Milestone Templates
 * Standard milestones for real estate transactions
 */

import type { Milestone, MilestoneTemplate, Transaction } from '../../types';

export { STANDARD_MILESTONES } from '../../types/transaction';

/**
 * Create milestone instances from templates for a transaction
 */
export function createMilestonesFromTemplates(
  transaction: Transaction,
  templates: MilestoneTemplate[]
): Milestone[] {
  const contractDate = transaction.createdAt;
  
  return templates.map((template, index) => {
    const dueDate = new Date(contractDate);
    dueDate.setDate(dueDate.getDate() + template.defaultDueDays);

    return {
      id: `milestone-${transaction.id}-${template.id}`,
      transactionId: transaction.id,
      templateId: template.id,
      name: template.name,
      category: template.category,
      description: template.description,
      status: index === 0 ? 'in_progress' : 'pending',
      dueDate,
      completedDate: undefined,
      assignedTo: undefined,
      notes: undefined,
      documents: [],
      dependencies: template.dependencies,
      remindersSent: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
  });
}

/**
 * Get the next pending milestone
 */
export function getNextMilestone(milestones: Milestone[]): Milestone | undefined {
  return milestones
    .filter(m => m.status === 'pending' || m.status === 'in_progress')
    .sort((a, b) => {
      // Sort by due date
      if (a.dueDate && b.dueDate) {
        return a.dueDate.getTime() - b.dueDate.getTime();
      }
      return 0;
    })[0];
}

/**
 * Get overdue milestones
 */
export function getOverdueMilestones(milestones: Milestone[]): Milestone[] {
  const now = new Date();
  return milestones.filter(
    m => m.dueDate && m.dueDate < now && m.status !== 'completed' && m.status !== 'skipped'
  );
}

/**
 * Get upcoming milestones (within next 7 days)
 */
export function getUpcomingMilestones(milestones: Milestone[]): Milestone[] {
  const now = new Date();
  const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  
  return milestones.filter(
    m => 
      m.dueDate &&
      m.dueDate >= now &&
      m.dueDate <= nextWeek &&
      m.status !== 'completed' &&
      m.status !== 'skipped'
  );
}

/**
 * Check if a milestone can be started (dependencies met)
 */
export function canStartMilestone(
  milestone: Milestone,
  allMilestones: Milestone[]
): boolean {
  if (milestone.status !== 'pending') return false;
  
  for (const depId of milestone.dependencies) {
    const dep = allMilestones.find(m => m.templateId === depId || m.id === depId);
    if (!dep || dep.status !== 'completed') {
      return false;
    }
  }
  
  return true;
}

/**
 * Get milestones that can be started
 */
export function getStartableMilestones(milestones: Milestone[]): Milestone[] {
  return milestones.filter(m => canStartMilestone(m, milestones));
}

/**
 * Calculate milestone progress percentage
 */
export function calculateMilestoneProgress(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0;
  
  const completed = milestones.filter(m => m.status === 'completed').length;
  const skipped = milestones.filter(m => m.status === 'skipped').length;
  
  return Math.round(((completed + skipped) / milestones.length) * 100);
}

/**
 * Get the current phase of the transaction
 */
export function getCurrentPhase(milestones: Milestone[]): string {
  const inProgress = milestones.find(m => m.status === 'in_progress');
  if (inProgress) return inProgress.category;
  
  const nextPending = getNextMilestone(milestones);
  if (nextPending) return nextPending.category;
  
  // All completed
  const lastCompleted = milestones
    .filter(m => m.status === 'completed')
    .sort((a, b) => (b.completedDate?.getTime() || 0) - (a.completedDate?.getTime() || 0))[0];
  
  return lastCompleted?.category || 'contract';
}

/**
 * Get milestone by category
 */
export function getMilestonesByCategory(
  milestones: Milestone[],
  category: string
): Milestone[] {
  return milestones.filter(m => m.category === category);
}

/**
 * Get required documents for a milestone
 */
export function getRequiredDocuments(milestone: Milestone): string[] {
  // This would typically look up documents from the template
  // For now, return empty array or use milestone.documents
  return milestone.documents || [];
}

/**
 * Check if all required documents are uploaded
 */
export function hasAllDocuments(milestone: Milestone): boolean {
  const required = getRequiredDocuments(milestone);
  return required.every(doc => milestone.documents.includes(doc));
}

/**
 * Get days until closing
 */
export function getDaysToClose(
  transaction: Transaction,
  milestones: Milestone[]
): number {
  const closingMilestone = milestones.find(m => 
    m.name.toLowerCase().includes('closing') || 
    m.name.toLowerCase().includes('close')
  );
  
  if (closingMilestone?.dueDate) {
    const now = new Date();
    const diffTime = closingMilestone.dueDate.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
  
  // Fallback to transaction closing date
  const now = new Date();
  const diffTime = transaction.closingDate.getTime() - now.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Get days in contract
 */
export function getDaysInContract(transaction: Transaction): number {
  const now = new Date();
  const diffTime = now.getTime() - transaction.createdAt.getTime();
  return Math.floor(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Update milestone status with validation
 */
export function updateMilestoneStatus(
  milestone: Milestone,
  newStatus: Milestone['status'],
  allMilestones: Milestone[]
): { success: boolean; error?: string; updatedMilestone?: Milestone } {
  // Validate transition
  const validTransitions: Record<string, string[]> = {
    pending: ['in_progress', 'skipped'],
    in_progress: ['completed', 'blocked'],
    blocked: ['in_progress'],
    overdue: ['completed', 'in_progress'],
  };

  if (!validTransitions[milestone.status]?.includes(newStatus)) {
    return {
      success: false,
      error: `Invalid status transition from ${milestone.status} to ${newStatus}`,
    };
  }

  // Check dependencies if trying to complete
  if (newStatus === 'completed') {
    for (const depId of milestone.dependencies) {
      const dep = allMilestones.find(m => m.templateId === depId || m.id === depId);
      if (!dep || dep.status !== 'completed') {
        return {
          success: false,
          error: `Cannot complete: dependency "${dep?.name || depId}" is not completed`,
        };
      }
    }
  }

  const updatedMilestone: Milestone = {
    ...milestone,
    status: newStatus,
    completedDate: newStatus === 'completed' ? new Date() : milestone.completedDate,
    updatedAt: new Date(),
  };

  return { success: true, updatedMilestone };
}
