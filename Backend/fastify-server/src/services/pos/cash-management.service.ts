import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

/**
 * POS Cash Management Service - Backend
 * Manages cash drawers, transactions, and reconciliation
 */
export class CashManagementService {
  constructor(private readonly db = prisma) {}

  /**
   * Open a cash drawer for a session
   */
  async openDrawer(sessionData: any) {
    const { storeId, userId, deviceId, openingAmount, currency = 'NGN' } = sessionData;

    // Check if there's already an open session for this device
    const existingSession = await this.db.cashManagementSession.findFirst({
      where: {
        deviceId,
        status: 'open',
      },
    });

    if (existingSession) {
      throw new Error('Cash drawer is already open');
    }

    const session = await this.db.cashManagementSession.create({
      data: {
        id: `cash-${Date.now()}`,
        storeId,
        userId,
        deviceId,
        status: 'open',
        openingAmount,
        currency,
        openedAt: new Date(),
      },
    });

    return session;
  }

  /**
   * Record a cash transaction
   */
  async recordTransaction(transactionData: any) {
    const { sessionId, type, amount, description, reference } = transactionData;

    // Verify session is open
    const session = await this.db.cashManagementSession.findUnique({
      where: { id: sessionId },
    });

    if (!session || session.status !== 'open') {
      throw new Error('Cash drawer is not open');
    }

    const transaction = await this.db.cashTransaction.create({
      data: {
        id: `txn-${Date.now()}`,
        sessionId,
        storeId: session.storeId,
        type, // 'in' or 'out'
        amount,
        description: description || '',
        reference: reference || null,
        balanceAfter: await this.calculateCurrentBalance(sessionId),
      },
    });

    return transaction;
  }

  /**
   * Calculate current balance for a session
   */
  private async calculateCurrentBalance(sessionId: string): Promise<number> {
    const session = await this.db.cashManagementSession.findUnique({
      where: { id: sessionId },
      include: {
        transactions: true,
      },
    });

    if (!session) return 0;

    const opening = session.openingAmount || 0;
    const totalIn = session.transactions
      .filter((t) => t.type === 'in')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const totalOut = session.transactions
      .filter((t) => t.type === 'out')
      .reduce((sum, t) => sum + t.amount, 0);

    return opening + totalIn - totalOut;
  }

  /**
   * Close a cash drawer session
   */
  async closeDrawer(sessionId: string, closingData: any) {
    const { expectedAmount, notes } = closingData;

    const session = await this.db.cashManagementSession.findUnique({
      where: { id: sessionId },
      include: {
        transactions: true,
      },
    });

    if (!session || session.status !== 'open') {
      throw new Error('Cash drawer is not open');
    }

    const actualAmount = await this.calculateCurrentBalance(sessionId);
    const discrepancy = actualAmount - (expectedAmount || actualAmount);

    const closedSession = await this.db.cashManagementSession.update({
      where: { id: sessionId },
      data: {
        status: 'closed',
        closedAt: new Date(),
        closingAmount: actualAmount,
        expectedClosingAmount: expectedAmount || actualAmount,
        discrepancy: discrepancy !== 0 ? discrepancy : null,
        closingNotes: notes || null,
      },
    });

    return {
      ...closedSession,
      discrepancy,
      isBalanced: discrepancy === 0,
    };
  }

  /**
   * Get current session for a device
   */
  async getCurrentSession(deviceId: string) {
    return await this.db.cashManagementSession.findFirst({
      where: {
        deviceId,
        status: 'open',
      },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });
  }

  /**
   * Get session history for a store
   */
  async getSessionHistory(storeId: string, filters?: { status?: string; fromDate?: Date; toDate?: Date }) {
    const where: any = { storeId };

    if (filters?.status) where.status = filters.status;
    if (filters?.fromDate || filters?.toDate) {
      where.openedAt = {};
      if (filters.fromDate) where.openedAt.gte = filters.fromDate;
      if (filters.toDate) where.openedAt.lte = filters.toDate;
    }

    return await this.db.cashManagementSession.findMany({
      where,
      orderBy: { openedAt: 'desc' },
      take: 50,
    });
  }

  /**
   * Get transaction history for a session
   */
  async getSessionTransactions(sessionId: string) {
    return await this.db.cashTransaction.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
    });
  }

  /**
   * Generate cash report for a period
   */
  async generateCashReport(storeId: string, fromDate: Date, toDate: Date) {
    const sessions = await this.db.cashManagementSession.findMany({
      where: {
        storeId,
        openedAt: {
          gte: fromDate,
          lte: toDate,
        },
      },
      include: {
        transactions: true,
      },
    });

    const totalOpening = sessions.reduce((sum, s) => sum + (s.openingAmount || 0), 0);
    const totalClosing = sessions.reduce((sum, s) => sum + (s.closingAmount || 0), 0);
    const totalDiscrepancy = sessions.reduce((sum, s) => sum + (s.discrepancy || 0), 0);

    const totalTransactions = sessions.reduce((sum, s) => sum + s.transactions.length, 0);
    const totalCashIn = sessions.reduce((sum, s) => 
      sum + s.transactions.filter(t => t.type === 'in').reduce((acc, t) => acc + t.amount, 0), 0
    );
    const totalCashOut = sessions.reduce((sum, s) => 
      sum + s.transactions.filter(t => t.type === 'out').reduce((acc, t) => acc + t.amount, 0), 0
    );

    return {
      period: { fromDate, toDate },
      totalSessions: sessions.length,
      totalOpening,
      totalClosing,
      totalDiscrepancy,
      totalTransactions,
      totalCashIn,
      totalCashOut,
      sessionsWithDiscrepancy: sessions.filter(s => s.discrepancy !== null && s.discrepancy !== 0).length,
    };
  }
}
