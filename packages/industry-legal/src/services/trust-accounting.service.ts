/**
 * Trust Accounting Service
 * 
 * Manages IOLTA trust accounts, client ledgers, and three-way
 * reconciliation for legal trust accounting.
 */

import { PrismaClient } from '@vayva/prisma';

const prisma = new PrismaClient();

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
  /**
   * Get trust accounts with balances
   */
  async getTrustAccounts(storeId: string): Promise<any[]> {
    return prisma.trustAccount.findMany({
      where: { storeId, isActive: true },
      include: {
        clientLedgers: {
          where: { balance: { gt: 0 } },
        },
      },
    });
  }

  /**
   * Get trust account balance
   */
  async getTrustAccountBalance(accountId: string): Promise<{
    currentBalance: number;
    ledgerBalance: number;
    reconciliationStatus: string;
  }> {
    const account = await prisma.trustAccount.findUnique({
      where: { id: accountId },
      select: {
        currentBalance: true,
        ledgerBalance: true,
        reconciliationStatus: true,
      },
    });

    return account!;
  }

  /**
   * Record trust receipt (deposit)
   */
  async recordTrustReceipt(data: TrustTransactionData): Promise<{
    transaction: any;
    ledger: any;
  }> {
    const account = await prisma.trustAccount.findUnique({
      where: { id: data.accountId },
    });

    if (!account) {
      throw new Error('Trust account not found');
    }

    // Create transaction
    const transaction = await prisma.trustTransaction.create({
      data: {
        ...data,
        balance: account.currentBalance + data.amount,
        status: 'completed',
      },
    });

    // Update account balance
    await prisma.trustAccount.update({
      where: { id: data.accountId },
      data: { currentBalance: transaction.balance },
    });

    // Update/create client ledger
    const ledger = await prisma.clientLedger.upsert({
      where: {
        accountId_clientId: {
          accountId: data.accountId,
          clientId: data.clientId,
        },
      },
      update: {
        balance: { increment: data.amount },
        totalDeposits: { increment: data.amount },
        lastActivity: new Date(),
      },
      create: {
        accountId: data.accountId,
        clientId: data.clientId,
        caseId: data.caseId,
        caseNumber: '',
        clientName: '',
        balance: data.amount,
        totalDeposits: data.amount,
        totalDisbursements: 0,
        totalTransfers: 0,
        lastActivity: new Date(),
      },
    });

    return { transaction, ledger };
  }

  /**
   * Record trust disbursement
   */
  async recordTrustDisbursement(data: TrustTransactionData): Promise<any> {
    const account = await prisma.trustAccount.findUnique({
      where: { id: data.accountId },
    });

    const ledger = await prisma.clientLedger.findFirst({
      where: {
        accountId: data.accountId,
        clientId: data.clientId,
      },
    });

    if (!ledger || ledger.balance < data.amount) {
      throw new Error('Insufficient trust balance');
    }

    const newBalance = account!.currentBalance - data.amount;

    const transaction = await prisma.trustTransaction.create({
      data: {
        ...data,
        type: 'disbursement',
        balance: newBalance,
        status: 'pending',
      },
    });

    await prisma.trustAccount.update({
      where: { id: data.accountId },
      data: { currentBalance: newBalance },
    });

    await prisma.clientLedger.update({
      where: { id: ledger.id },
      data: {
        balance: { decrement: data.amount },
        totalDisbursements: { increment: data.amount },
        lastActivity: new Date(),
        alerts: ledger.balance - data.amount < 0 ? ['negative_balance'] : [],
      },
    });

    return transaction;
  }

  /**
   * Transfer from trust to operating
   */
  async transferTrustToOperating(data: {
    accountId: string;
    clientId: string;
    caseId: string;
    amount: number;
    description: string;
    processedBy: string;
  }): Promise<any> {
    return this.recordTrustDisbursement({
      ...data,
      type: 'transfer_to_operating',
      payee: 'Operating Account',
      approvedBy: data.processedBy,
    });
  }

  /**
   * Generate three-way reconciliation
   */
  async generateThreeWayReconciliation(accountId: string): Promise<{
    accountId: string;
    accountName: string;
    cashBalance: number;
    totalLedgerBalances: number;
    discrepancy: number;
    isReconciled: boolean;
    clientLedgers: any[];
    reconciledAt: Date;
  }> {
    const account = await prisma.trustAccount.findUnique({
      where: { id: accountId },
      include: {
        clientLedgers: true,
        transactions: {
          where: {
            transactionDate: {
              gte: new Date(new Date().setMonth(new Date().getMonth() - 1)),
            },
          },
        },
      },
    });

    if (!account) {
      throw new Error('Trust account not found');
    }

    const totalLedgerBalances = account.clientLedgers.reduce(
      (sum, ledger) => sum + ledger.balance,
      0
    );

    const cashBalance = account.currentBalance;
    const discrepancy = cashBalance - totalLedgerBalances;

    return {
      accountId: account.id,
      accountName: account.name,
      cashBalance,
      totalLedgerBalances,
      discrepancy,
      isReconciled: Math.abs(discrepancy) < 0.01,
      clientLedgers: account.clientLedgers.map((l) => ({
        clientName: l.clientName,
        caseNumber: l.caseNumber,
        balance: l.balance,
      })),
      reconciledAt: new Date(),
    };
  }

  /**
   * Get negative balance alerts
   */
  async getNegativeBalanceAlerts(storeId: string): Promise<any[]> {
    const ledgers = await prisma.clientLedger.findMany({
      where: {
        account: { storeId },
        balance: { lt: 0 },
      },
      include: {
        account: true,
      },
    });

    return ledgers.map((l) => ({
      clientId: l.clientId,
      clientName: l.clientName,
      caseNumber: l.caseNumber,
      balance: l.balance,
      accountId: l.accountId,
      accountName: l.account.name,
    }));
  }

  /**
   * Get trust account transactions
   */
  async getAccountTransactions(
    accountId: string,
    startDate?: Date,
    endDate?: Date
  ): Promise<any[]> {
    const where: any = { accountId };

    if (startDate && endDate) {
      where.transactionDate = {
        gte: startDate,
        lte: endDate,
      };
    }

    return prisma.trustTransaction.findMany({
      where,
      orderBy: { transactionDate: 'desc' },
    });
  }

  async initialize(): Promise<void> {
    console.log('[TrustAccountingService] Initialized');
  }

  async dispose(): Promise<void> {
    // Cleanup if needed
  }
}
