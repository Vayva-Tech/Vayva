import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';
import { randomBytes } from 'crypto';

export class ReferralService {
  constructor(private readonly db = prisma) {}

  async getReferralData(storeId: string) {
    const store = await this.db.store.findUnique({
      where: { id: storeId },
      select: { settings: true },
    });

    const settings = (store?.settings as any) || {};
    let code = typeof settings?.referralCode === 'string' ? settings.referralCode : undefined;
    
    if (!code) {
      code = await this.generateCode(storeId);
    }

    const stats = await this.db.referralAttribution.findMany({
      where: { metadata: { path: ['referrerStoreId'], equals: storeId } },
    });

    const rewards = await this.db.ledgerEntry.findMany({
      where: {
        storeId,
        referenceType: 'REFERRAL_REWARD',
      },
      orderBy: { createdAt: 'desc' },
    });

    const pendingDiscount = await this.getMonthlyDiscount(storeId);

    return {
      code,
      stats: {
        total: stats.length,
        conversions: stats.filter((s) => !!s.firstPaymentAt).length,
      },
      pendingDiscount,
      rewards: rewards.map((r) => ({
        id: r.id,
        amount: r.amount,
        createdAt: r.createdAt,
        description: r.description,
      })),
    };
  }

  async generateCode(storeId: string): Promise<string> {
    const code = `REF-${randomBytes(4).toString('hex').toUpperCase()}`;
    
    await this.db.store.update({
      where: { id: storeId },
      data: {
        settings: {
          referralCode: code,
        },
      },
    });

    logger.info(`[Referral] Generated code ${code} for store ${storeId}`);
    return code;
  }

  async getMonthlyDiscount(storeId: string) {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const discounts = await this.db.ledgerEntry.aggregate({
      where: {
        storeId,
        referenceType: 'REFERRAL_REWARD',
        createdAt: { gte: startOfMonth },
      },
      _sum: {
        amount: true,
      },
    });

    return discounts._sum.amount || 0;
  }
}
