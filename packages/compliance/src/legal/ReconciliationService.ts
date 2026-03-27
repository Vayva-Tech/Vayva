/**
 * Three-Way Reconciliation Service for Legal Trust Accounting
 * Reconciles: 1) Bank Statement, 2) Trust Ledger, 3) Client Ledgers
 */

import { logger } from '@vayva/shared';

export interface BankStatementEntry {
  date: string;
  description: string;
  amount: number;
  balance: number;
  checkNumber?: string;
  transactionType: 'DEPOSIT' | 'WITHDRAWAL' | 'FEE' | 'INTEREST';
}

export interface TrustLedgerEntry {
  id: string;
  date: string;
  description: string;
  amount: number;
  clientId: string;
  matterId: string;
  transactionType: 'DEPOSIT' | 'DISBURSEMENT' | 'TRANSFER';
  cleared: boolean;
}

export interface ClientLedgerBalance {
  clientId: string;
  clientName: string;
  balance: number;
  transactions: Array<{
    id: string;
    date: string;
    description: string;
    amount: number;
    type: 'CREDIT' | 'DEBIT';
  }>;
}

export interface ReconciliationResult {
  reconciled: boolean;
  bankBalance: number;
  ledgerBalance: number;
  clientLedgersTotal: number;
  discrepancies: Discrepancy[];
  outstandingItems: {
    deposits: OutstandingItem[];
    disbursements: OutstandingItem[];
  };
  adjustedBankBalance: number;
  adjustedLedgerBalance: number;
  status: 'BALANCED' | 'OUT_OF_BALANCE' | 'REQUIRES_REVIEW';
}

export interface Discrepancy {
  type: 'TIMING_DIFFERENCE' | 'ERROR' | 'MISSING_TRANSACTION' | 'AMOUNT_MISMATCH';
  severity: 'CRITICAL' | 'WARNING' | 'INFO';
  description: string;
  amount: number;
  suggestedAction: string;
}

export interface OutstandingItem {
  id: string;
  date: string;
  amount: number;
  description: string;
  daysOutstanding: number;
}

export class ThreeWayReconciliationService {
  /**
   * Perform three-way reconciliation
   */
  reconcile(
    bankStatement: BankStatementEntry[],
    trustLedger: TrustLedgerEntry[],
    clientLedgers: ClientLedgerBalance[],
    reconciliationDate: string
  ): ReconciliationResult {
    const discrepancies: Discrepancy[] = [];
    
    // Get ending bank balance
    const bankBalance = bankStatement.length > 0 
      ? bankStatement[bankStatement.length - 1].balance 
      : 0;

    // Calculate trust ledger balance
    const ledgerBalance = trustLedger.reduce((sum, entry) => {
      return sum + (entry.transactionType === 'DEPOSIT' ? entry.amount : -entry.amount);
    }, 0);

    // Calculate total of all client ledgers
    const clientLedgersTotal = clientLedgers.reduce(
      (sum, client) => sum + client.balance,
      0
    );

    // Find outstanding items
    const outstandingDeposits: OutstandingItem[] = this.findOutstandingDeposits(
      bankStatement,
      trustLedger,
      reconciliationDate
    );

    const outstandingDisbursements: OutstandingItem[] = this.findOutstandingDisbursements(
      bankStatement,
      trustLedger,
      reconciliationDate
    );

    // Calculate adjusted balances
    const totalOutstandingDeposits = outstandingDeposits.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const totalOutstandingDisbursements = outstandingDisbursements.reduce(
      (sum, item) => sum + item.amount,
      0
    );

    const adjustedBankBalance = bankBalance + totalOutstandingDeposits - totalOutstandingDisbursements;
    const adjustedLedgerBalance = ledgerBalance;

    // Check if three-way balances
    const threeWayMatch = Math.abs(clientLedgersTotal - adjustedLedgerBalance) < 0.01;
    
    if (!threeWayMatch) {
      discrepancies.push({
        type: 'ERROR',
        severity: 'CRITICAL',
        description: `Client ledgers (${clientLedgersTotal.toFixed(2)}) do not match trust ledger (${adjustedLedgerBalance.toFixed(2)})`,
        amount: clientLedgersTotal - adjustedLedgerBalance,
        suggestedAction: 'Review all client ledger entries and recalculate balances',
      });
    }

    // Check for timing differences
    if (Math.abs(adjustedBankBalance - adjustedLedgerBalance) > 0.01) {
      const difference = adjustedBankBalance - adjustedLedgerBalance;
      
      discrepancies.push({
        type: 'TIMING_DIFFERENCE',
        severity: 'WARNING',
        description: `Bank and ledger differ by ${difference.toFixed(2)} after adjustments`,
        amount: difference,
        suggestedAction: 'Identify and document outstanding transactions',
      });
    }

    // Check for old outstanding items
    const oldItems = [
      ...outstandingDeposits.filter(item => item.daysOutstanding > 30),
      ...outstandingDisbursements.filter(item => item.daysOutstanding > 30),
    ];

    if (oldItems.length > 0) {
      discrepancies.push({
        type: 'MISSING_TRANSACTION',
        severity: 'WARNING',
        description: `${oldItems.length} transaction(s) outstanding for over 30 days`,
        amount: oldItems.reduce((sum, item) => sum + item.amount, 0),
        suggestedAction: 'Follow up on stale outstanding transactions',
      });
    }

    // Determine status
    let status: ReconciliationResult['status'] = 'BALANCED';
    
    if (discrepancies.some(d => d.severity === 'CRITICAL')) {
      status = 'OUT_OF_BALANCE';
    } else if (discrepancies.length > 0) {
      status = 'REQUIRES_REVIEW';
    }

    return {
      reconciled: status === 'BALANCED',
      bankBalance,
      ledgerBalance,
      clientLedgersTotal,
      discrepancies,
      outstandingItems: {
        deposits: outstandingDeposits,
        disbursements: outstandingDisbursements,
      },
      adjustedBankBalance,
      adjustedLedgerBalance,
      status,
    };
  }

  /**
   * Find deposits in transit
   */
  private findOutstandingDeposits(
    bankStatement: BankStatementEntry[],
    trustLedger: TrustLedgerEntry[],
    reconciliationDate: string
  ): OutstandingItem[] {
    const reconDate = new Date(reconciliationDate);
    const bankDeposits = new Set(
      bankStatement
        .filter(entry => entry.transactionType === 'DEPOSIT')
        .map(entry => `${entry.date}-${entry.amount}-${entry.description}`)
    );

    return trustLedger
      .filter(entry => {
        if (entry.transactionType !== 'DEPOSIT') return false;
        if (entry.cleared) return false;
        
        const key = `${entry.date}-${entry.amount}-${entry.description}`;
        return !bankDeposits.has(key);
      })
      .map(entry => ({
        id: entry.id,
        date: entry.date,
        amount: entry.amount,
        description: entry.description,
        daysOutstanding: this.calculateDaysOutstanding(entry.date, reconciliationDate),
      }));
  }

  /**
   * Find outstanding checks/disbursements
   */
  private findOutstandingDisbursements(
    bankStatement: BankStatementEntry[],
    trustLedger: TrustLedgerEntry[],
    reconciliationDate: string
  ): OutstandingItem[] {
    const bankWithdrawals = new Set(
      bankStatement
        .filter(entry => entry.transactionType === 'WITHDRAWAL')
        .map(entry => `${entry.date}-${entry.amount}-${entry.description}`)
    );

    return trustLedger
      .filter(entry => {
        if (entry.transactionType !== 'DISBURSEMENT') return false;
        if (entry.cleared) return false;
        
        const key = `${entry.date}-${entry.amount}-${entry.description}`;
        return !bankWithdrawals.has(key);
      })
      .map(entry => ({
        id: entry.id,
        date: entry.date,
        amount: entry.amount,
        description: entry.description,
        daysOutstanding: this.calculateDaysOutstanding(entry.date, reconciliationDate),
      }));
  }

  /**
   * Calculate days outstanding
   */
  private calculateDaysOutstanding(transactionDate: string, asOfDate: string): number {
    const transDate = new Date(transactionDate);
    const reconDate = new Date(asOfDate);
    const diffTime = Math.abs(reconDate.getTime() - transDate.getTime());
    return Math.floor(diffTime / (1000 * 60 * 60 * 24));
  }

  /**
   * Generate reconciliation report for compliance
   */
  generateReconciliationReport(result: ReconciliationResult, period: string): {
    period: string;
    generatedAt: string;
    status: string;
    summary: string;
    actionItems: string[];
  } {
    const statusText = result.status === 'BALANCED' ? 'RECONCILED' : result.status;
    
    const actionItems = result.discrepancies.map(d => d.suggestedAction);
    
    let summary = '';
    if (result.reconciled) {
      summary = `Trust account successfully reconciled. All three ledgers balance to $${result.adjustedBankBalance.toFixed(2)}.`;
    } else {
      summary = `Reconciliation incomplete. ${result.discrepancies.length} discrepancy(ies) require attention.`;
    }

    return {
      period,
      generatedAt: new Date().toISOString(),
      status: statusText,
      summary,
      actionItems: [...new Set(actionItems)], // Remove duplicates
    };
  }

  /**
   * Validate IOLTA compliance
   */
  validateIOLTACompliance(result: ReconciliationResult): {
    compliant: boolean;
    violations: string[];
    warnings: string[];
  } {
    const violations: string[] = [];
    const warnings: string[] = [];

    // Critical: Client ledgers must match trust ledger
    if (Math.abs(result.clientLedgersTotal - result.ledgerBalance) > 0.01) {
      violations.push('CRITICAL: Client ledger totals do not match trust ledger balance');
    }

    // Warning: Large unreconciled differences
    const unreconciledDiff = Math.abs(result.adjustedBankBalance - result.ledgerBalance);
    if (unreconciledDiff > 100) {
      warnings.push(`Unreconciled difference exceeds $100: $${unreconciledDiff.toFixed(2)}`);
    }

    // Warning: Old outstanding items
    const oldItemsCount = result.outstandingItems.deposits.filter(i => i.daysOutstanding > 30).length +
                         result.outstandingItems.disbursements.filter(i => i.daysOutstanding > 30).length;
    
    if (oldItemsCount > 0) {
      warnings.push(`${oldItemsCount} transaction(s) outstanding for over 30 days`);
    }

    return {
      compliant: violations.length === 0,
      violations,
      warnings,
    };
  }
}

// Singleton instance
export const reconciliationService = new ThreeWayReconciliationService();
