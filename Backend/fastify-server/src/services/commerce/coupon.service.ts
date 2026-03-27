import { prisma } from '@vayva/db';
import { logger } from '../../lib/logger';
import { randomBytes } from 'crypto';

export class CouponService {
  constructor(private readonly db = prisma) {}

  async findAll(storeId: string, filters: any) {
    const limit = Math.min(filters.limit || 50, 100);
    const offset = filters.offset || 0;
    const where: any = { storeId };

    if (filters.status) where.status = filters.status;
    if (filters.ruleId) where.ruleId = filters.ruleId;

    const [coupons, total] = await Promise.all([
      this.db.coupon.findMany({
        where,
        take: limit,
        skip: offset,
        orderBy: { createdAt: 'desc' },
      }),
      this.db.coupon.count({ where }),
    ]);

    return {
      coupons: coupons.map((c) => ({
        id: c.id,
        code: c.code,
        status: c.status,
        ruleId: c.ruleId,
        createdAt: c.createdAt,
        updatedAt: c.updatedAt,
      })),
      pagination: {
        total,
        limit,
        offset,
      },
    };
  }

  async create(storeId: string, data: any) {
    const { ruleId, code, generateCode, codePrefix, quantity = 1 } = data;

    // Verify rule exists and belongs to store
    const rule = await this.db.discountRule.findFirst({
      where: { id: ruleId, storeId },
    });

    if (!rule) {
      throw new Error('Discount rule not found');
    }

    const createdCoupons = [];

    if (quantity === 1) {
      const couponCode = code || generateCode ? this.generateCouponCode(codePrefix) : code;

      const coupon = await this.db.coupon.create({
        data: {
          storeId,
          ruleId,
          code: couponCode.toUpperCase(),
          status: 'ACTIVE',
        },
      });

      createdCoupons.push(coupon);
    } else {
      // Bulk generate coupons
      for (let i = 0; i < quantity; i++) {
        const couponCode = this.generateCouponCode(codePrefix);

        try {
          const coupon = await this.db.coupon.create({
            data: {
              storeId,
              ruleId,
              code: couponCode.toUpperCase(),
              status: 'ACTIVE',
            },
          });
          createdCoupons.push(coupon);
        } catch {
          // If code collision, retry once
          const retryCode = this.generateCouponCode(codePrefix);
          const coupon = await this.db.coupon.create({
            data: {
              storeId,
              ruleId,
              code: retryCode.toUpperCase(),
              status: 'ACTIVE',
            },
          });
          createdCoupons.push(coupon);
        }
      }
    }

    logger.info(`[Coupon] Created ${createdCoupons.length} coupon(s)`);
    return {
      success: true,
      coupons: createdCoupons,
      count: createdCoupons.length,
    };
  }

  async disableByRule(ruleId: string, storeId: string) {
    const result = await this.db.coupon.updateMany({
      where: { ruleId, storeId },
      data: { status: 'DISABLED' },
    });

    logger.info(`[Coupon] Disabled ${result.count} coupon(s) for rule ${ruleId}`);
    return { count: result.count };
  }

  private generateCouponCode(prefix?: string): string {
    const code = randomBytes(4).toString('hex').toUpperCase();
    return prefix ? `${prefix}-${code}` : code;
  }
}
