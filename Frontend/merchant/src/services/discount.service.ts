import { prisma } from "@/lib/prisma";
import type { Prisma } from "@vayva/db";

export interface CreateDiscountInput {
  name: string;
  type: "PERCENT" | "AMOUNT";
  valueAmount?: number | null;
  valuePercent?: number | null;
  appliesTo?: "ALL" | "PRODUCTS" | "COLLECTIONS";
  productIds?: string[];
  collectionIds?: string[];
  minOrderAmount?: number | null;
  startsAt: Date;
  endsAt?: Date | null;
  usageLimitTotal?: number | null;
  usageLimitPerCustomer?: number | null;
  code?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateDiscountInput extends Partial<CreateDiscountInput> {}

export class DiscountService {
    /**
     * Create a Discount Rule and optionally a Coupon.
     */
    static async createDiscount(storeId: string, data: CreateDiscountInput) {
        return await prisma.$transaction(async (tx) => {
            // 1. Create Rule
            const createData: Prisma.DiscountRuleCreateInput = {
                storeId,
                name: data.name,
                type: data.type,
                valueAmount: data.valueAmount ?? null,
                valuePercent: data.valuePercent ?? null,
                appliesTo: data.appliesTo || "ALL",
                productIds: data.productIds || [],
                collectionIds: data.collectionIds || [],
                minOrderAmount: data.minOrderAmount ?? null,
                startsAt: data.startsAt,
                usageLimitTotal: data.usageLimitTotal ?? null,
                usageLimitPerCustomer: data.usageLimitPerCustomer ?? null,
                requiresCoupon: !!data.code
            };
            if (data.endsAt) {
                (createData as Record<string, unknown>).endsAt = data.endsAt;
            }
            const rule = await tx.discountRule?.create({ data: createData });
            // 2. Create Coupon if code provided
            let coupon = null;
            if (data.code) {
                // Check uniqueness
                const existing = await tx.coupon?.findUnique({
                    where: {
                        storeId_code: {
                            storeId,
                            code: data.code
                        }
                    }
                });
                if (existing) {
                    throw new Error(`Coupon code ${data.code} already exists`);
                }
                coupon = await tx.coupon?.create({
                    data: {
                        storeId,
                        ruleId: rule.id,
                        code: data.code,
                        status: "ACTIVE"
                    }
                });
            }
            return { rule, coupon };
        });
    }
    static async getDiscount(storeId: string, ruleId: string) {
        const rule = await prisma.discountRule?.findUnique({
            where: { id: ruleId, storeId }
        });
        if (!rule)
            return null;
        const coupon = await prisma.coupon?.findFirst({
            where: { storeId, ruleId }
        });
        return {
            ...rule,
            code: coupon?.code || null,
            couponId: coupon?.id || null
        };
    }
    static async updateDiscount(storeId: string, ruleId: string, data: UpdateDiscountInput) {
        return await prisma.$transaction(async (tx) => {
            // 1. Update Rule
            const updateData: Prisma.DiscountRuleUpdateInput = {
                name: data.name ?? undefined,
                type: data.type ?? undefined,
                valueAmount: data.valueAmount === null ? null : data.valueAmount ?? undefined,
                valuePercent: data.valuePercent === null ? null : data.valuePercent ?? undefined,
                appliesTo: data.appliesTo ?? undefined,
                productIds: data.productIds ?? undefined,
                collectionIds: data.collectionIds ?? undefined,
                minOrderAmount: data.minOrderAmount === null ? null : data.minOrderAmount ?? undefined,
                ...(data.startsAt && { startsAt: data.startsAt }),
                ...(data.endsAt && { endsAt: data.endsAt }),
                usageLimitTotal: data.usageLimitTotal === null ? null : data.usageLimitTotal ?? undefined,
                usageLimitPerCustomer: data.usageLimitPerCustomer === null ? null : data.usageLimitPerCustomer ?? undefined,
                requiresCoupon: data.code !== undefined ? !!data.code : undefined
            };
            const rule = await tx.discountRule?.update({
                where: { id: ruleId, storeId },
                data: updateData
            });
            // 2. Sync Coupon if code provided (create/update/delete)
            if (data.code !== undefined) {
                if (data.code === "") {
                    // Remove coupon
                    await tx.coupon?.deleteMany({ where: { storeId, ruleId } });
                }
                else {
                    const existing = await tx.coupon?.findFirst({ where: { storeId, ruleId } });
                    if (existing) {
                        await tx.coupon?.update({
                            where: { id: existing.id },
                            data: { code: data.code }
                        });
                    }
                    else {
                        await tx.coupon?.create({
                            data: {
                                storeId,
                                ruleId,
                                code: data.code,
                                status: "ACTIVE"
                            }
                        });
                    }
                }
            }
            return rule;
        });
    }
    static async listDiscounts(storeId: string) {
        // Fetch rules
        const rules = await prisma.discountRule?.findMany({
            where: { storeId },
            orderBy: { createdAt: "desc" }
        });
        // Fetch coupons for these rules (manual join since no relation)
        const ruleIds = rules.filter((r: { requiresCoupon: boolean }) => r.requiresCoupon).map((r: { id: string }) => r.id);
        const coupons = await prisma.coupon?.findMany({
            where: {
                storeId,
                ruleId: { in: ruleIds }
            }
        });
        const couponMap = new Map(coupons.map((c: { ruleId: string; code: string; id: string }) => [c.ruleId, c]));
        return rules.map((rule: { id: string; requiresCoupon: boolean }) => ({
            ...rule,
            code: couponMap.get(rule.id)?.code || null,
            couponId: couponMap.get(rule.id)?.id || null
        }));
    }
    static async deleteDiscount(storeId: string, ruleId: string) {
        return await prisma.$transaction(async (tx) => {
            // Delete associated coupons first
            await tx.coupon?.deleteMany({
                where: { storeId, ruleId }
            });
            // Delete rule
            await tx.discountRule?.delete({
                where: { id: ruleId, storeId }
            });
        });
    }
}
