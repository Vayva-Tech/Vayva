import { prisma } from "@/lib/db";
import { DiscountAppliesTo, DiscountType } from "@vayva/db";

const DISCOUNT_TYPES = new Set<string>(Object.values(DiscountType));
const DISCOUNT_APPLIES_TO = new Set<string>(Object.values(DiscountAppliesTo));

function getString(value: unknown): string | undefined {
  return typeof value === "string" ? value : undefined;
}

function getNumber(value: unknown): number | undefined {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : undefined;
  }
  return undefined;
}

function getDate(value: unknown): Date | undefined {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    const parsed = new Date(value);
    return Number.isNaN(parsed.getTime()) ? undefined : parsed;
  }
  return undefined;
}

function getStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.filter((entry): entry is string => typeof entry === "string");
}

function getDiscountType(value: unknown): DiscountType {
  if (typeof value === "string" && DISCOUNT_TYPES.has(value)) {
    return value as DiscountType;
  }
  throw new Error("Invalid discount type");
}

function getAppliesTo(value: unknown): DiscountAppliesTo {
  if (typeof value === "string" && DISCOUNT_APPLIES_TO.has(value)) {
    return value as DiscountAppliesTo;
  }
  return DiscountAppliesTo.ALL;
}
export class DiscountService {
  /**
   * Create a Discount Rule and optionally a Coupon.
   */
  static async createDiscount(storeId: string, data: Record<string, unknown>) {
    const name = getString(data.name);
    if (!name) throw new Error("Discount name is required");
    const type = getDiscountType(data.type);
    const startsAt = getDate(data.startsAt);
    if (!startsAt) throw new Error("Discount startsAt is required");
    const endsAt = getDate(data.endsAt);
    const code = getString(data.code);
    return await prisma.$transaction(async (tx) => {
      // 1. Create Rule
      const rule = await tx.discountRule.create({
        data: {
          storeId,
          name,
          type,
          valueAmount: getNumber(data.valueAmount),
          valuePercent: getNumber(data.valuePercent),
          appliesTo: getAppliesTo(data.appliesTo),
          productIds: getStringArray(data.productIds),
          collectionIds: getStringArray(data.collectionIds),
          minOrderAmount: getNumber(data.minOrderAmount),
          startsAt,
          endsAt,
          usageLimitTotal: getNumber(data.usageLimitTotal),
          usageLimitPerCustomer: getNumber(data.usageLimitPerCustomer),
          requiresCoupon: Boolean(code),
        },
      });
      // 2. Create Coupon if code provided
      let coupon = null;
      if (code) {
        // Check uniqueness
        const existing = await tx.coupon.findUnique({
          where: {
            storeId_code: {
              storeId,
              code,
            },
          },
        });
        if (existing) {
          throw new Error(`Coupon code ${code} already exists`);
        }
        coupon = await tx.coupon.create({
          data: {
            storeId,
            ruleId: rule.id,
            code,
            status: "ACTIVE",
          },
        });
      }
      return { rule, coupon };
    });
  }
  static async getDiscount(storeId: string, ruleId: string) {
    const rule = await prisma.discountRule.findUnique({
      where: { id: ruleId, storeId },
    });
    if (!rule) return null;
    const coupon = await prisma.coupon.findFirst({
      where: { storeId, ruleId },
    });
    return {
      ...rule,
      code: coupon?.code || null,
      couponId: coupon?.id || null,
    };
  }
  static async updateDiscount(
    storeId: string,
    ruleId: string,
    data: Record<string, unknown>,
  ) {
    const name = getString(data.name);
    const type = getDiscountType(data.type);
    const startsAt = getDate(data.startsAt);
    if (!startsAt) throw new Error("Discount startsAt is required");
    const endsAt = getDate(data.endsAt);
    const code = getString(data.code);
    return await prisma.$transaction(async (tx) => {
      // 1. Update Rule
      const rule = await tx.discountRule.update({
        where: { id: ruleId, storeId },
        data: {
          name: name ?? undefined,
          type,
          valueAmount: getNumber(data.valueAmount),
          valuePercent: getNumber(data.valuePercent),
          appliesTo: getAppliesTo(data.appliesTo),
          productIds: getStringArray(data.productIds),
          collectionIds: getStringArray(data.collectionIds),
          minOrderAmount: getNumber(data.minOrderAmount),
          startsAt,
          endsAt,
          usageLimitTotal: getNumber(data.usageLimitTotal),
          usageLimitPerCustomer: getNumber(data.usageLimitPerCustomer),
          requiresCoupon: data.code !== undefined ? Boolean(code) : undefined,
        },
      });
      // 2. Sync Coupon if code provided (create/update/delete)
      if (data.code !== undefined) {
        if (!code) {
          // Remove coupon
          await tx.coupon.deleteMany({ where: { storeId, ruleId } });
        } else {
          const existing = await tx.coupon.findFirst({
            where: { storeId, ruleId },
          });
          if (existing) {
            await tx.coupon.update({
              where: { id: existing.id },
              data: { code },
            });
          } else {
            await tx.coupon.create({
              data: {
                storeId,
                ruleId,
                code,
                status: "ACTIVE",
              },
            });
          }
        }
      }
      return rule;
    });
  }
  static async listDiscounts(storeId: string) {
    // Fetch rules
    const rules = await prisma.discountRule.findMany({
      where: { storeId },
      orderBy: { createdAt: "desc" },
    });
    // Fetch coupons for these rules (manual join since no relation)
    const ruleIds = rules.filter((r) => r.requiresCoupon).map((r) => r.id);
    const coupons = await prisma.coupon.findMany({
      where: {
        storeId,
        ruleId: { in: ruleIds },
      },
    });
    const couponMap = new Map(coupons.map((c) => [c.ruleId, c]));
    return rules.map((rule) => ({
      ...rule,
      code: couponMap.get(rule.id)?.code || null,
      couponId: couponMap.get(rule.id)?.id || null,
    }));
  }
  static async deleteDiscount(storeId: string, ruleId: string) {
    return await prisma.$transaction(async (tx) => {
      // Delete associated coupons first
      await tx.coupon.deleteMany({
        where: { storeId, ruleId },
      });
      // Delete rule
      await tx.discountRule.delete({
        where: { id: ruleId, storeId },
      });
    });
  }
}
