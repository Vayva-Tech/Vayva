// @ts-nocheck
/**
 * Transaction Risk Detection
 * Identifies potential risks and delays in real estate transactions
 */

import type { Milestone, RiskFlag, Transaction } from '../../types';

export interface RiskDetectionConfig {
  enableDelayDetection: boolean;
  enableDocumentCheck: boolean;
  enableCommunicationCheck: boolean;
  overdueThresholdDays: number;
}

export const DEFAULT_RISK_CONFIG: RiskDetectionConfig = {
  enableDelayDetection: true,
  enableDocumentCheck: true,
  enableCommunicationCheck: true,
  overdueThresholdDays: 2,
};

/**
 * Detect overdue milestones
 */
export function detectOverdueMilestones(
  milestones: Milestone[],
  thresholdDays: number = 2
): RiskFlag[] {
  const risks: RiskFlag[] = [];
  const now = new Date();

  for (const milestone of milestones) {
    if (milestone.status === 'completed' || milestone.status === 'skipped') {
      continue;
    }

    if (!milestone.dueDate) continue;

    const daysOverdue = Math.floor(
      (now.getTime() - milestone.dueDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysOverdue >= thresholdDays) {
      const level = daysOverdue > 7 ? 'critical' : daysOverdue > 3 ? 'high' : 'medium';
      
      risks.push({
        id: `risk-overdue-${milestone.id}`,
        transactionId: milestone.transactionId,
        type: 'overdue_milestone',
        level,
        message: `"${milestone.name}" is ${daysOverdue} days overdue`,
        milestoneId: milestone.id,
        detectedAt: new Date(),
      });
    }
  }

  return risks;
}

/**
 * Detect missing documents
 */
export function detectMissingDocuments(
  milestones: Milestone[]
): RiskFlag[] {
  const risks: RiskFlag[] = [];

  for (const milestone of milestones) {
    if (milestone.status !== 'completed') continue;

    // Check if milestone requires documents
    const requiredDocs = milestone.documents || [];
    
    // This is a simplified check - in production, you'd check against
    // actual uploaded documents
    if (requiredDocs.length > 0 && requiredDocs.length < 2) {
      // Simulate document check
      const missingCount = requiredDocs.length;
      
      if (missingCount > 0) {
        risks.push({
          id: `risk-docs-${milestone.id}`,
          transactionId: milestone.transactionId,
          type: 'missing_documents',
          level: 'medium',
          message: `"${milestone.name}" is missing ${missingCount} required document(s)`,
          milestoneId: milestone.id,
          detectedAt: new Date(),
        });
      }
    }
  }

  return risks;
}

/**
 * Detect financing risks
 */
export function detectFinancingRisks(
  transaction: Transaction,
  milestones: Milestone[]
): RiskFlag[] {
  const risks: RiskFlag[] = [];

  const loanApproval = milestones.find(m => 
    m.name.toLowerCase().includes('loan approval') ||
    m.name.toLowerCase().includes('financing')
  );

  if (loanApproval) {
    // Check if financing contingency is approaching
    if (loanApproval.status === 'pending' && loanApproval.dueDate) {
      const daysUntil = Math.floor(
        (loanApproval.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );

      if (daysUntil <= 3 && daysUntil > 0) {
        risks.push({
          id: `risk-financing-${transaction.id}`,
          transactionId: transaction.id,
          type: 'financing_deadline',
          level: 'high',
          message: `Financing contingency expires in ${daysUntil} days`,
          milestoneId: loanApproval.id,
          detectedAt: new Date(),
        });
      }
    }
  }

  // Check if buyer is not pre-approved
  if (!transaction.buyer.preApproved && transaction.side === 'buyer') {
    risks.push({
      id: `risk-preapproval-${transaction.id}`,
      transactionId: transaction.id,
      type: 'no_preapproval',
      level: 'medium',
      message: 'Buyer is not pre-approved for financing',
      detectedAt: new Date(),
    });
  }

  return risks;
}

/**
 * Detect inspection risks
 */
export function detectInspectionRisks(
  transaction: Transaction,
  milestones: Milestone[]
): RiskFlag[] {
  const risks: RiskFlag[] = [];

  const inspection = milestones.find(m => 
    m.name.toLowerCase().includes('inspection')
  );

  if (inspection && inspection.dueDate) {
    const daysUntil = Math.floor(
      (inspection.dueDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntil <= 2 && daysUntil > 0 && inspection.status !== 'completed') {
      risks.push({
        id: `risk-inspection-${transaction.id}`,
        transactionId: transaction.id,
        type: 'inspection_deadline',
        level: 'high',
        message: `Inspection period ends in ${daysUntil} days`,
        milestoneId: inspection.id,
        detectedAt: new Date(),
      });
    }
  }

  return risks;
}

/**
 * Detect closing risks
 */
export function detectClosingRisks(
  transaction: Transaction,
  milestones: Milestone[]
): RiskFlag[] {
  const risks: RiskFlag[] = [];
  const daysToClose = Math.floor(
    (transaction.closingDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  );

  // Check if closing is approaching with incomplete milestones
  if (daysToClose <= 7 && daysToClose > 0) {
    const incompleteMilestones = milestones.filter(
      m => m.status !== 'completed' && m.status !== 'skipped'
    );

    if (incompleteMilestones.length > 0) {
      const criticalMilestones = incompleteMilestones.filter(m => 
        m.category === 'closing' || m.category === 'financial'
      );

      if (criticalMilestones.length > 0) {
        risks.push({
          id: `risk-closing-${transaction.id}`,
          transactionId: transaction.id,
          type: 'closing_at_risk',
          level: 'critical',
          message: `${criticalMilestones.length} critical milestone(s) incomplete with ${daysToClose} days to close`,
          detectedAt: new Date(),
        });
      }
    }
  }

  // Check if earnest money is not deposited
  const earnestMoney = milestones.find(m => 
    m.name.toLowerCase().includes('earnest money')
  );

  if (earnestMoney && earnestMoney.status !== 'completed') {
    const daysOverdue = earnestMoney.dueDate 
      ? Math.floor((Date.now() - earnestMoney.dueDate.getTime()) / (1000 * 60 * 60 * 24))
      : 0;

    if (daysOverdue > 0) {
      risks.push({
        id: `risk-earnest-${transaction.id}`,
        transactionId: transaction.id,
        type: 'earnest_money_overdue',
        level: 'high',
        message: `Earnest money deposit is ${daysOverdue} days overdue`,
        milestoneId: earnestMoney.id,
        detectedAt: new Date(),
      });
    }
  }

  return risks;
}

/**
 * Run all risk detection checks
 */
export function detectAllRisks(
  transaction: Transaction,
  milestones: Milestone[],
  config: RiskDetectionConfig = DEFAULT_RISK_CONFIG
): RiskFlag[] {
  const allRisks: RiskFlag[] = [];

  if (config.enableDelayDetection) {
    allRisks.push(...detectOverdueMilestones(milestones, config.overdueThresholdDays));
  }

  if (config.enableDocumentCheck) {
    allRisks.push(...detectMissingDocuments(milestones));
  }

  allRisks.push(...detectFinancingRisks(transaction, milestones));
  allRisks.push(...detectInspectionRisks(transaction, milestones));
  allRisks.push(...detectClosingRisks(transaction, milestones));

  // Sort by level (critical first)
  const levelOrder = { critical: 0, high: 1, medium: 2, low: 3 };
  return allRisks.sort((a, b) => levelOrder[a.level] - levelOrder[b.level]);
}

/**
 * Get risk summary statistics
 */
export function getRiskSummary(risks: RiskFlag[]) {
  const summary = {
    total: risks.length,
    critical: 0,
    high: 0,
    medium: 0,
    low: 0,
  };

  for (const risk of risks) {
    summary[risk.level]++;
  }

  return summary;
}

/**
 * Check if transaction is at risk
 */
export function isTransactionAtRisk(risks: RiskFlag[]): boolean {
  return risks.some(r => r.level === 'critical' || r.level === 'high');
}

/**
 * Get escalation recommendations
 */
export function getEscalationRecommendations(risks: RiskFlag[]): string[] {
  const recommendations: string[] = [];

  const criticalRisks = risks.filter(r => r.level === 'critical');
  const highRisks = risks.filter(r => r.level === 'high');

  if (criticalRisks.length > 0) {
    recommendations.push('Immediate escalation to broker/manager required');
    recommendations.push('Contact all parties to assess transaction viability');
  }

  if (highRisks.length > 0) {
    recommendations.push('Schedule check-in call with client within 24 hours');
    recommendations.push('Review contingency deadlines and extension options');
  }

  if (risks.some(r => r.type === 'financing_deadline')) {
    recommendations.push('Contact lender for status update on loan approval');
  }

  if (risks.some(r => r.type === 'inspection_deadline')) {
    recommendations.push('Schedule inspection immediately or negotiate extension');
  }

  return recommendations;
}
