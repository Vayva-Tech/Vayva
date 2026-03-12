// Product Engine - Core business logic for product management
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  compareAtPrice?: number;
  sku?: string;
  barcode?: string;
  inventory: {
    quantity: number;
    trackQuantity: boolean;
  };
  status: 'active' | 'draft' | 'archived';
  images: string[];
  categories: string[];
  tags: string[];
  variants: ProductVariant[];
  createdAt: string;
  updatedAt: string;
}

export interface ProductVariant {
  id: string;
  name: string;
  price: number;
  sku?: string;
  barcode?: string;
  inventory: {
    quantity: number;
  };
  options: Record<string, string>;
}

export interface ProductFilters {
  search?: string;
  category?: string;
  status?: Product['status'];
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'name' | 'price' | 'createdAt' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export class ProductEngine {
  static async getAll(filters?: ProductFilters): Promise<Product[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.category) params.append('category', filters.category);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.minPrice) params.append('minPrice', filters.minPrice.toString());
      if (filters?.maxPrice) params.append('maxPrice', filters.maxPrice.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const queryString = params.toString();
      const url = `/api/products${queryString ? `?${queryString}` : ''}`;
      
      return await apiJson<Product[]>(url);
    } catch (error) {
      logger.error('[PRODUCT_ENGINE_GET_ALL]', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<Product> {
    try {
      return await apiJson<Product>(`/api/products/${id}`);
    } catch (error) {
      logger.error('[PRODUCT_ENGINE_GET_BY_ID]', error);
      throw error;
    }
  }

  static async create(product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>): Promise<Product> {
    try {
      return await apiJson<Product>('/api/products', {
        method: 'POST',
        body: JSON.stringify(product),
      });
    } catch (error) {
      logger.error('[PRODUCT_ENGINE_CREATE]', error);
      throw error;
    }
  }

  static async update(id: string, updates: Partial<Product>): Promise<Product> {
    try {
      return await apiJson<Product>(`/api/products/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      logger.error('[PRODUCT_ENGINE_UPDATE]', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await apiJson(`/api/products/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      logger.error('[PRODUCT_ENGINE_DELETE]', error);
      throw error;
    }
  }

  static async updateInventory(productId: string, variantId: string, quantity: number): Promise<void> {
    try {
      await apiJson(`/api/products/${productId}/variants/${variantId}/inventory`, {
        method: 'PATCH',
        body: JSON.stringify({ quantity }),
      });
    } catch (error) {
      logger.error('[PRODUCT_ENGINE_UPDATE_INVENTORY]', error);
      throw error;
    }
  }
}