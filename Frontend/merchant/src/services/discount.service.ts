import { api } from '@/lib/api-client';

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
        const response = await api.post('/discounts', {
            storeId,
            ...data,
        });
        return response.data || {};
    }
    static async getDiscount(storeId: string, ruleId: string) {
        const response = await api.get(`/discounts/${ruleId}`, {
            storeId,
        });
        return response.data || null;
    }
    static async updateDiscount(storeId: string, ruleId: string, data: UpdateDiscountInput) {
        const response = await api.patch(`/discounts/${ruleId}`, {
            storeId,
            ...data,
        });
        return response.data || {};
    }
    static async listDiscounts(storeId: string) {
        const response = await api.get('/discounts', {
            storeId,
        });
        return response.data || [];
    }
    static async deleteDiscount(storeId: string, ruleId: string) {
        await api.delete(`/discounts/${ruleId}`, {
            storeId,
        });
    }
}
