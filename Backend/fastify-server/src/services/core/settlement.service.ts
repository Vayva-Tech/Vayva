import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class SettlementService {
  constructor(private readonly db = prisma) {}

  async getSettlements(storeId: string, limit: number = 50) {
    const settlements = await this.db.settlementBatch.findMany({
      where: { storeId },
      orderBy: { periodEnd: 'desc' },
      take: Math.min(limit, 200),
      select: {
        id: true,
        periodStart: true,
        periodEnd: true,
        totalAmount: true,
        totalFees: true,
        totalRefunds: true,
        netAmount: true,
        totalOrders: true,
        status: true,
        transactionIds: true,
        payoutId: true,
        processedAt: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    return settlements.map((s) => ({
      id: s.id,
      periodStart: s.periodStart.toISOString(),
      periodEnd: s.periodEnd.toISOString(),
      totalAmount: s.totalAmount,
      totalFees: s.totalFees,
      totalRefunds: s.totalRefunds,
      netAmount: s.netAmount,
      totalOrders: s.totalOrders,
      transactionCount: s.transactionIds?.length || 0,
      status: s.status,
      payoutId: s.payoutId,
      processedAt: s.processedAt?.toISOString(),
      paidAt: s.processedAt?.toISOString(),
      createdAt: s.createdAt.toISOString(),
    }));
  }
}
