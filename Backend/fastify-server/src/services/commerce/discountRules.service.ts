import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';

export class DiscountRulesService {
  constructor(private readonly db = prisma) {}

  async findAll(storeId: string, filters: any) {
    const limit = Math.min(filters.limit || 50, 100);
    const offset = filters.offset || 0;
    const where: any = { storeId };

    if (filters.active === 'true') {
      const now = new Date();
      where.startsAt = { lte: now };
      where.OR = [{ endsAt: null }, { endsAt: { gt: now } }];
    }

    const [rules, total] = await Promise.all([
      this.db.discountRule.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.discountRule.count({ where }),
    ]);

    return {
      rules: rules.map((r) => ({
        id: r.id,
        name: r.name,
        type: r.type,
        valueAmount: r.valueAmount,
        valuePercent: r.valuePercent,
        appliesTo: r.appliesTo,
        minOrderAmount: r.minOrderAmount,
        maxDiscountAmount: r.maxDiscountAmount,
        startsAt: r.startsAt,
        endsAt: r.endsAt,
        usageLimitTotal: r.usageLimitTotal,
        usageLimitPerCustomer: r.usageLimitPerCustomer,
        requiresCoupon: r.requiresCoupon,
        couponCount: 0,
        createdAt: r.createdAt,
        updatedAt: r.updatedAt,
      })),
      pagination: {
        total,
        limit,
        offset,
      },
    };
  }

  async create(storeId: string, data: any) {
    const {
      name,
      type,
      valueAmount,
      valuePercent,
      appliesTo = 'ALL',
      productIds,
      collectionIds,
      minOrderAmount,
      maxDiscountAmount,
      startsAt,
      endsAt,
      usageLimitTotal,
      usageLimitPerCustomer,
      requiresCoupon = false,
    } = data;

    // Validate discount value
    if (type === 'PERCENT' && !valuePercent) {
      throw new Error('valuePercent required for PERCENT type');
    }
    if (type === 'AMOUNT' && !valueAmount) {
      throw new Error('valueAmount required for AMOUNT type');
    }

    const rule = await this.db.discountRule.create({
      data: {
        storeId,
        name,
        type,
        valueAmount: valueAmount || null,
        valuePercent: valuePercent || null,
        appliesTo,
        productIds: productIds || [],
        collectionIds: collectionIds || [],
        minOrderAmount: minOrderAmount || null,
        maxDiscountAmount: maxDiscountAmount || null,
        startsAt: new Date(startsAt),
        endsAt: endsAt ? new Date(endsAt) : null,
        usageLimitTotal,
        usageLimitPerCustomer,
        requiresCoupon,
      },
    });

    logger.info(`[DiscountRule] Created ${rule.id}`);
    return rule;
  }

  async update(ruleId: string, storeId: string, data: any) {
    const existingRule = await this.db.discountRule.findFirst({
      where: { id: ruleId, storeId },
    });

    if (!existingRule) {
      throw new Error('Discount rule not found');
    }

    const updateData: any = {};
    if (data.name) updateData.name = data.name;
    if (data.endsAt) updateData.endsAt = new Date(data.endsAt);
    if (data.usageLimitTotal) updateData.usageLimitTotal = data.usageLimitTotal;

    const rule = await this.db.discountRule.update({
      where: { id: ruleId },
      data: updateData,
    });

    // If status is DISABLED, disable all associated coupons
    if (data.status === 'DISABLED') {
      await this.db.coupon.updateMany({
        where: { ruleId: ruleId },
        data: { status: 'DISABLED' },
      });
    }

    logger.info(`[DiscountRule] Updated ${ruleId}`);
    return rule;
  }

  async delete(ruleId: string, storeId: string) {
    // Check for redemptions
    const redemptionCount = await this.db.discountRedemption.count({
      where: { ruleId },
    });

    if (redemptionCount > 0) {
      throw new Error('Cannot delete rule with existing redemptions');
    }

    // Delete associated coupons first
    await this.db.coupon.deleteMany({
      where: { ruleId, storeId },
    });

    // Delete rule
    await this.db.discountRule.delete({
      where: { id: ruleId },
    });

    logger.info(`[DiscountRule] Deleted ${ruleId}`);
    return { success: true };
  }
}
