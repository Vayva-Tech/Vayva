import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class FinanceExtendedService {
  constructor(private readonly db = prisma) {}

  async getActivity(storeId: string) {
    const activities = await this.db.financeActivity.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
      take: 100,
    });

    return activities.map((a) => ({
      id: a.id,
      type: a.type,
      amount: Number(a.amount),
      currency: a.currency,
      status: a.status,
      reference: a.reference,
      description: a.description,
      metadata: a.metadata,
      createdAt: a.createdAt,
    }));
  }

  async getStatements(storeId: string) {
    const statements = await this.db.financeStatement.findMany({
      where: { storeId },
      include: {
        transactions: {
          select: {
            id: true,
            type: true,
            amount: true,
            reference: true,
            date: true,
          },
          take: 10,
        },
      },
      orderBy: { periodEnd: 'desc' },
    });

    return statements.map((s) => ({
      id: s.id,
      type: s.type,
      periodStart: s.periodStart,
      periodEnd: s.periodEnd,
      totalIncome: Number(s.totalIncome),
      totalExpenses: Number(s.totalExpenses),
      netIncome: Number(s.netIncome),
      transactionCount: s._count.transactions,
      recentTransactions: s.transactions,
      generatedAt: s.generatedAt,
    }));
  }

  async generateStatement(storeId: string, data: any) {
    const { periodStart, periodEnd, type = 'monthly' } = data;

    const [income, expenses] = await Promise.all([
      this.db.paymentTransaction.aggregate({
        where: {
          storeId,
          createdAt: { gte: new Date(periodStart), lte: new Date(periodEnd) },
          status: 'SUCCESS',
        },
        _sum: { amount: true },
      }),
      this.db.expense.aggregate({
        where: {
          storeId,
          createdAt: { gte: new Date(periodStart), lte: new Date(periodEnd) },
        },
        _sum: { amount: true },
      }),
    ]);

    const totalIncome = Number(income._sum.amount || 0);
    const totalExpenses = Number(expenses._sum.amount || 0);
    const netIncome = totalIncome - totalExpenses;

    const statement = await this.db.financeStatement.create({
      data: {
        storeId,
        type,
        periodStart: new Date(periodStart),
        periodEnd: new Date(periodEnd),
        totalIncome,
        totalExpenses,
        netIncome,
      },
    });

    logger.info(`[Finance] Generated statement ${statement.id} for ${storeId}`);
    return statement;
  }

  async getBanks(storeId: string) {
    const banks = await this.db.bankAccount.findMany({
      where: { storeId },
      orderBy: { createdAt: 'desc' },
    });

    return banks.map((b) => ({
      id: b.id,
      bankName: b.bankName,
      accountNumber: b.accountNumber,
      accountName: b.accountName,
      currency: b.currency,
      isDefault: b.isDefault,
      status: b.status,
    }));
  }

  async getPayouts(storeId: string) {
    const payouts = await this.db.payout.findMany({
      where: { storeId },
      include: {
        bankAccount: {
          select: {
            bankName: true,
            accountNumber: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return payouts.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      currency: p.currency,
      status: p.status,
      reference: p.reference,
      bankName: p.bankAccount?.bankName,
      accountNumber: p.bankAccount?.accountNumber,
      scheduledDate: p.scheduledDate,
      processedAt: p.processedAt,
      createdAt: p.createdAt,
    }));
  }
}
