import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class AffiliateService {
  constructor(private readonly db = prisma) {}

  async getDashboard(storeId: string) {
    const [totalAffiliates, activeAffiliates, totalClicks, totalConversions, totalRevenue] = await Promise.all([
      this.db.affiliate.count({ where: { storeId } }),
      this.db.affiliate.count({ where: { storeId, status: 'active' } }),
      this.db.affiliateClick.aggregate({
        where: { affiliate: { storeId } },
        _count: true,
      }),
      this.db.affiliateConversion.aggregate({
        where: { affiliate: { storeId } },
        _count: true,
      }),
      this.db.affiliateConversion.aggregate({
        where: { affiliate: { storeId } },
        _sum: { commission: true },
      }),
    ]);

    const topAffiliates = await this.db.affiliate.findMany({
      where: { storeId },
      include: {
        _count: {
          select: {
            clicks: true,
            conversions: true,
          },
        },
        conversions: {
          orderBy: { createdAt: 'desc' },
          take: 5,
          select: {
            id: true,
            commission: true,
            createdAt: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      take: 10,
    });

    return {
      stats: {
        totalAffiliates,
        activeAffiliates,
        totalClicks: totalClicks._count,
        totalConversions: totalConversions._count,
        totalRevenue: totalRevenue._sum.commission || 0,
      },
      topAffiliates: topAffiliates.map((a) => ({
        id: a.id,
        name: a.name,
        email: a.email,
        clicks: a._count.clicks,
        conversions: a._count.conversions,
        revenue: a._count.conversions > 0 
          ? a.conversions.reduce((sum, c) => sum + c.commission, 0) 
          : 0,
        recentConversions: a.conversions,
      })),
    };
  }

  async getPayoutApprovals(storeId: string) {
    const payouts = await this.db.affiliatePayout.findMany({
      where: { 
        affiliate: { storeId },
        status: 'pending',
      },
      include: {
        affiliate: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
      },
      orderBy: { createdAt: 'asc' },
    });

    return payouts.map((p) => ({
      id: p.id,
      affiliateId: p.affiliateId,
      affiliateName: p.affiliate.name,
      affiliateEmail: p.affiliate.email,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      requestedAt: p.createdAt,
    }));
  }
}
