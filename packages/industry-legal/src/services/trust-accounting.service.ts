/**
 * Trust Accounting Service (in-process stub)
 */

export interface TrustTransactionData {
  accountId: string;
  clientId: string;
  caseId: string;
  amount: number;
  type: 'deposit' | 'disbursement' | 'transfer';
  description: string;
  payee?: string;
  checkNumber?: string;
  processedBy: string;
  approvedBy?: string;
}

export class TrustAccountingService {
  async getTrustAccounts(_storeId: string): Promise<unknown[]> {
    return [];
  }

  async getTrustAccountBalance(
    _accountId: string,
  ): Promise<{ currentBalance: number; ledgerBalance: number; reconciliationStatus: string } | null> {
    return null;
  }

  async recordTrustReceipt(
    data: TrustTransactionData,
  ): Promise<{ transaction: { id: string }; ledger: { id: string } }> {
    return {
      transaction: { id: `tt_${Date.now()}` },
      ledger: { id: `cl_${Date.now()}` },
    };
  }

  async recordTrustDisbursement(data: TrustTransactionData): Promise<{ id: string }> {
    return { id: `tt_${Date.now()}` };
  }

  async transferTrustToOperating(_data: {
    accountId: string;
    clientId: string;
    caseId: string;
    amount: number;
    description: string;
    processedBy: string;
  }): Promise<{ id: string }> {
    return { id: `tt_${Date.now()}` };
  }

  async generateThreeWayReconciliation(_accountId: string): Promise<{
    accountId: string;
    cashBalance: number;
    totalLedgerBalances: number;
    discrepancy: number;
    isReconciled: boolean;
    clientLedgers: Array<{ clientName: string; caseNumber: string; balance: number }>;
    reconciledAt: Date;
  }> {
    return {
      accountId: _accountId,
      cashBalance: 0,
      totalLedgerBalances: 0,
      discrepancy: 0,
      isReconciled: true,
      clientLedgers: [],
      reconciledAt: new Date(),
    };
  }

  async getNegativeBalanceAlerts(_storeId: string): Promise<unknown[]> {
    return [];
  }

  async getAccountTransactions(_accountId: string, _limit: number = 50): Promise<unknown[]> {
    return [];
  }

  async initialize(): Promise<void> {
    console.log('[TrustAccountingService] Initialized');
  }

  async dispose(): Promise<void> {}
}
