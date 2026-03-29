import { api } from '@/lib/api-client';
import type {
  ProductFreshness,
  RecipeBundle,
  GrocerySubscription,
  FreshnessStatus,
} from '@/types/phase2-industry';

export class GroceryService {
  // ===== PRODUCT FRESHNESS =====

  async getProductFreshness(storeId: string, productId: string): Promise<ProductFreshness[]> {
    const response = await api.get(`/grocery/${storeId}/products/${productId}/freshness`);
    return response.data || [];
  }

  async createFreshnessRecord(
    data: Omit<ProductFreshness, 'id' | 'createdAt' | 'currentStatus' | 'discountApplied'>
  ): Promise<ProductFreshness> {
    const response = await api.post('/grocery/freshness', {
      ...data,
    });
    return response.data || {};
  }

  async updateFreshnessStatus(): Promise<number> {
    const response = await api.post('/grocery/freshness/update-status');
    return response.data?.count || 0;
  }

  async getAgingProducts(storeId: string): Promise<ProductFreshness[]> {
    const response = await api.get(`/grocery/${storeId}/aging-products`);
    return response.data || [];
  }

  // ===== RECIPE BUNDLES =====

  async getRecipeBundles(storeId: string): Promise<RecipeBundle[]> {
    const response = await api.get(`/grocery/${storeId}/recipe-bundles`);
    return response.data || [];
  }

  async createRecipeBundle(
    storeId: string,
    data: Omit<RecipeBundle, 'id' | 'storeId' | 'isActive'>
  ): Promise<RecipeBundle> {
    const response = await api.post('/grocery/recipe-bundles', {
      storeId,
      ...data,
    });
    return response.data || {};
  }

  // ===== SUBSCRIPTIONS =====

  async getCustomerSubscriptions(
    storeId: string,
    customerId: string
  ): Promise<GrocerySubscription[]> {
    const response = await api.get(`/grocery/${storeId}/customers/${customerId}/subscriptions`);
    return response.data || [];
  }

  async createSubscription(
    data: Omit<GrocerySubscription, 'id'>
  ): Promise<GrocerySubscription> {
    const response = await api.post('/grocery/subscriptions', {
      ...data,
    });
    return response.data || {};
  }

  async pauseSubscription(id: string): Promise<GrocerySubscription> {
    const response = await api.post(`/grocery/subscriptions/${id}/pause`);
    return response.data || {};
  }

  async processSubscriptionDeliveries(): Promise<number> {
    const response = await api.post('/grocery/subscriptions/process-deliveries');
    return response.data?.processed || 0;
  }

  // ===== HELPERS =====

  private calculateFreshnessStatus(expiryDate: Date, shelfLifeDays: number): FreshnessStatus {
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );

    if (daysUntilExpiry <= 0) return 'expired';
    if (daysUntilExpiry <= 2) return 'aging';
    return 'fresh';
  }
}

export const groceryService = new GroceryService();
