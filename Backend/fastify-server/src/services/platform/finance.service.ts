import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class FinanceService {
  constructor(private readonly db = prisma) {}

  async getOverview(storeId: string) {
    const now = new Date();
    const start6Months = new Date(now.getFullYear(), now.getMonth() - 5, 1);

    const [wallet, recentCharges, recentPayouts, monthAgg] = await Promise.all([
      this.db.wallet?.findUnique({
        where: { storeId },
        select: {
          availableKobo: true,
          pendingKobo: true,
          vaStatus: true,
          vaBankName: true,
          vaAccountNumber: true,
          vaAccountName: true,
        },
      }),
      this.db.paymentTransaction?.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { 
          id: true, 
          createdAt: true, 
          amount: true, 
          status: true, 
          reference: true 
        },
      }),
      this.db.payout?.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { 
          id: true, 
          createdAt: true, 
          amount: true, 
          status: true, 
          reference: true,
          destination: true 
        },
      }),
      this.db.$queryRaw`
        SELECT
          DATE_TRUNC('month', o."createdAt") as month,
          COALESCE(SUM(o."total"), 0)::float as revenue
        FROM "Order" o
        WHERE o."storeId" = ${storeId}
          AND o."status" != 'CANCELLED'
          AND o."createdAt" >= ${start6Months}
        GROUP BY 1
        ORDER BY 1 ASC
      ` as Promise<Array<{ month: Date; revenue: number }>>,
    ]);

    const availableBalance = Number(wallet?.availableKobo || 0) / 100;
    const pendingBalance = Number(wallet?.pendingKobo || 0) / 100;
    const virtualAccount = wallet?.vaAccountNumber && wallet?.vaBankName && wallet?.vaAccountName
      ? {
          status: String(wallet?.vaStatus || 'UNKNOWN'),
          bankName: String(wallet.vaBankName),
          accountNumber: String(wallet.vaAccountNumber),
          accountName: String(wallet.vaAccountName),
        }
      : null;

    const months = Array.from({ length: 6 }).map((_, i) => 
      new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    );
    const monthMap = new Map<string, number>(
      (monthAgg || []).map((r) => [new Date(r.month).toISOString().slice(0, 7), Number(r.revenue || 0)])
    );
    const revenueData = months.map((m) => ({
      month: m.toLocaleString('en-NG', { month: 'short' }),
      value: monthMap.get(m.toISOString().slice(0, 7)) ?? 0,
    }));

    return {
      wallet: {
        availableBalance,
        pendingBalance,
        virtualAccount,
      },
      recentCharges,
      recentPayouts,
      revenueData,
      kpis: {
        totalRevenue: revenueData.reduce((sum, r) => sum + r.value, 0),
        pendingPayouts: pendingBalance,
      },
    };
  }

  async getTransactions(storeId: string, limit: number = 50) {
    const [payments, payouts, refunds] = await Promise.all([
      this.db.paymentTransaction?.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          reference: true,
          amount: true,
          currency: true,
          status: true,
          provider: true,
          type: true,
          createdAt: true,
        },
      }),
      this.db.payout?.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          reference: true,
          amount: true,
          currency: true,
          status: true,
          provider: true,
          createdAt: true,
        },
      }),
      this.db.refund?.findMany({
        where: { storeId },
        orderBy: { createdAt: 'desc' },
        take: limit,
        select: {
          id: true,
          chargeId: true,
          amount: true,
          currency: true,
          status: true,
          providerRefundId: true,
          createdAt: true,
        },
      }),
    ]);

    const mapStatus = (status: string | null | undefined): string => {
      const s = (status || '').toUpperCase();
      if (s === 'SUCCESS' || s === 'SUCCESSFUL' || s === 'COMPLETED') return 'success';
      if (s === 'FAILED' || s === 'FAILURE') return 'failed';
      if (s === 'PENDING') return 'pending';
      return s.toLowerCase() || 'unknown';
    };

    const transactions = [
      ...(payments || []).map((p) => ({
        id: p.id,
        reference: p.reference || p.id,
        type: 'CHARGE' as const,
        amount: Number(p.amount),
        currency: p.currency || 'NGN',
        status: mapStatus(p.status),
        date: p.createdAt?.toISOString(),
        provider: p.provider || 'unknown',
      })),
      ...(payouts || []).map((p) => ({
        id: p.id,
        reference: p.reference || p.id,
        type: 'PAYOUT' as const,
        amount: Number(p.amount),
        currency: p.currency || 'NGN',
        status: mapStatus(p.status),
        date: p.createdAt?.toISOString(),
        provider: p.provider || 'unknown',
      })),
      ...(refunds || []).map((r) => ({
        id: r.id,
        reference: r.chargeId || r.id,
        type: 'REFUND' as const,
        amount: Number(r.amount),
        currency: r.currency || 'NGN',
        status: mapStatus(r.status),
        date: r.createdAt?.toISOString(),
        provider: r.providerRefundId ? 'external' : 'internal',
      })),
    ];

    transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    return {
      data: transactions.slice(0, limit),
    };
  }

  async getStats(storeId: string, range: 'today' | 'week' | 'month' | 'year' = 'month') {
    const now = new Date();
    let startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    
    if (range === 'today') {
      startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    } else if (range === 'week') {
      const dayOfWeek = now.getDay();
      startDate = new Date(now.getTime() - (dayOfWeek * 24 * 60 * 60 * 1000));
    } else if (range === 'year') {
      startDate = new Date(now.getFullYear(), 0, 1);
    }

    const [totalRevenue, totalExpenses, pendingPayouts] = await Promise.all([
      this.db.order.aggregate({
        where: { 
          storeId, 
          status: { not: 'CANCELLED' },
          createdAt: { gte: startDate }
        },
        _sum: { total: true },
      }),
      this.db.expense.aggregate({
        where: { 
          storeId,
          createdAt: { gte: startDate }
        },
        _sum: { amount: true },
      }),
      this.db.payout.aggregate({
        where: { 
          storeId, 
          status: 'PENDING',
          createdAt: { gte: startDate }
        },
        _sum: { amount: true },
      }),
    ]);

    return {
      totalRevenue: Number(totalRevenue._sum.total || 0),
      totalExpenses: Number(totalExpenses._sum.amount || 0),
      pendingPayouts: Number(pendingPayouts._sum.amount || 0),
      netProfit: Number(totalRevenue._sum.total || 0) - Number(totalExpenses._sum.amount || 0),
    };
  }

  async getWallet(storeId: string) {
    const wallet = await this.db.wallet?.findUnique({
      where: { storeId },
      select: {
        id: true,
        availableKobo: true,
        pendingKobo: true,
        currency: true,
        vaStatus: true,
        vaBankName: true,
        vaAccountNumber: true,
        vaAccountName: true,
        updatedAt: true,
      },
    });

    const availableBalance = Number(wallet?.availableKobo || 0) / 100;
    const pendingBalance = Number(wallet?.pendingKobo || 0) / 100;
    
    const virtualAccount = wallet?.vaAccountNumber && wallet?.vaBankName && wallet?.vaAccountName
      ? {
          status: String(wallet?.vaStatus || 'UNKNOWN'),
          bankName: String(wallet.vaBankName),
          accountNumber: String(wallet.vaAccountNumber),
          accountName: String(wallet.vaAccountName),
        }
      : null;

    return {
      availableBalance,
      pendingBalance,
      currency: wallet?.currency || 'NGN',
      virtualAccount,
      lastUpdated: wallet?.updatedAt?.toISOString(),
    };
  }

  async getPayouts(storeId: string, filters: { status?: string; limit?: number; offset?: number }) {
    const { status, limit = 20, offset = 0 } = filters;

    const where: any = { storeId };
    if (status) {
      where.status = status;
    }

    const [payouts, total] = await Promise.all([
      this.db.payout?.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          reference: true,
          amount: true,
          currency: true,
          status: true,
          destination: true,
          bankName: true,
          accountNumber: true,
          accountName: true,
          createdAt: true,
          processedAt: true,
        },
      }),
      this.db.payout?.count({ where }),
    ]);

    return {
      data: payouts || [],
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total,
      },
    };
  }

  async requestPayout(storeId: string, amount: number, bankAccountId?: string) {
    // Validate amount
    if (amount <= 0) {
      throw new Error('Invalid payout amount');
    }

    // Check wallet balance
    const wallet = await this.db.wallet?.findUnique({
      where: { storeId },
      select: { availableKobo: true },
    });

    const availableBalance = Number(wallet?.availableKobo || 0) / 100;
    
    if (availableBalance < amount) {
      const error = new Error('Insufficient wallet balance') as any;
      error.code = 'INSUFFICIENT_BALANCE';
      throw error;
    }

    // Create payout record
    const payout = await this.db.payout?.create({
      data: {
        storeId,
        amount: amount * 100, // Convert to kobo
        currency: 'NGN',
        status: 'PENDING',
        destination: bankAccountId || 'bank_transfer',
        reference: `PAYOUT-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      },
      select: {
        id: true,
        reference: true,
        amount: true,
        status: true,
        createdAt: true,
      },
    });

    return {
      id: payout?.id,
      reference: payout?.reference,
      amount: Number(payout?.amount) / 100,
      status: payout?.status,
      createdAt: payout?.createdAt?.toISOString(),
      message: 'Payout request submitted successfully. Processing will begin within 24 hours.',
    };
  }

  async generateFinanceStatements(storeId: string, monthIndex: number, year: number) {
    const start = new Date(Date.UTC(year, monthIndex - 1, 1, 0, 0, 0));
    const end = new Date(Date.UTC(year, monthIndex, 1, 0, 0, 0));

    const orders = await this.db.order?.findMany({
      where: {
        storeId,
        status: { not: 'CANCELLED' },
        createdAt: { gte: start, lt: end },
      },
      select: {
        id: true,
        orderNumber: true,
        createdAt: true,
        total: true,
        currency: true,
        paymentStatus: true,
      },
      orderBy: { createdAt: 'asc' },
      take: 5000,
    });

    return orders || [];
  }
}
