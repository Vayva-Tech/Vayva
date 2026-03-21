// @ts-nocheck
// Customer Engine - Core business logic for customer management
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";

export interface Customer {
  id: string;
  firstName: string;
  lastName: string;
  email?: string;
  phone?: string;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
  };
  status: 'active' | 'inactive' | 'blacklisted';
  tags?: string[];
  notes?: string;
  totalSpent: number;
  orderCount: number;
  lastOrderAt?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CustomerFilters {
  search?: string;
  status?: Customer['status'];
  minSpent?: number;
  maxSpent?: number;
  minOrders?: number;
  maxOrders?: number;
  sortBy?: 'firstName' | 'lastName' | 'totalSpent' | 'orderCount' | 'lastOrderAt' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export class CustomerEngine {
  static async getAll(filters?: CustomerFilters): Promise<Customer[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.minSpent) params.append('minSpent', filters.minSpent.toString());
      if (filters?.maxSpent) params.append('maxSpent', filters.maxSpent.toString());
      if (filters?.minOrders) params.append('minOrders', filters.minOrders.toString());
      if (filters?.maxOrders) params.append('maxOrders', filters.maxOrders.toString());
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const queryString = params.toString();
      const url = `/api/customers${queryString ? `?${queryString}` : ''}`;
      
      return await apiJson<Customer[]>(url);
    } catch (error) {
      logger.error('[CUSTOMER_ENGINE_GET_ALL]', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<Customer> {
    try {
      return await apiJson<Customer>(`/api/customers/${id}`);
    } catch (error) {
      logger.error('[CUSTOMER_ENGINE_GET_BY_ID]', error);
      throw error;
    }
  }

  static async create(customer: Omit<Customer, 'id' | 'totalSpent' | 'orderCount' | 'lastOrderAt' | 'createdAt' | 'updatedAt'>): Promise<Customer> {
    try {
      return await apiJson<Customer>('/api/customers', {
        method: 'POST',
        body: JSON.stringify({
          ...customer,
          totalSpent: 0,
          orderCount: 0
        }),
      });
    } catch (error) {
      logger.error('[CUSTOMER_ENGINE_CREATE]', error);
      throw error;
    }
  }

  static async update(id: string, updates: Partial<Customer>): Promise<Customer> {
    try {
      return await apiJson<Customer>(`/api/customers/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updates),
      });
    } catch (error) {
      logger.error('[CUSTOMER_ENGINE_UPDATE]', error);
      throw error;
    }
  }

  static async delete(id: string): Promise<void> {
    try {
      await apiJson(`/api/customers/${id}`, {
        method: 'DELETE',
      });
    } catch (error) {
      logger.error('[CUSTOMER_ENGINE_DELETE]', error);
      throw error;
    }
  }

  static async addTag(id: string, tag: string): Promise<Customer> {
    try {
      return await apiJson<Customer>(`/api/customers/${id}/tags`, {
        method: 'POST',
        body: JSON.stringify({ tag }),
      });
    } catch (error) {
      logger.error('[CUSTOMER_ENGINE_ADD_TAG]', error);
      throw error;
    }
  }

  static async removeTag(id: string, tag: string): Promise<Customer> {
    try {
      return await apiJson<Customer>(`/api/customers/${id}/tags/${tag}`, {
        method: 'DELETE',
      });
    } catch (error) {
      logger.error('[CUSTOMER_ENGINE_REMOVE_TAG]', error);
      throw error;
    }
  }

  static async addNote(id: string, note: string): Promise<Customer> {
    try {
      return await apiJson<Customer>(`/api/customers/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      });
    } catch (error) {
      logger.error('[CUSTOMER_ENGINE_ADD_NOTE]', error);
      throw error;
    }
  }

  static async getOrderHistory(customerId: string): Promise<any[]> {
    try {
      return await apiJson<any[]>(`/api/customers/${customerId}/orders`);
    } catch (error) {
      logger.error('[CUSTOMER_ENGINE_GET_ORDER_HISTORY]', error);
      throw error;
    }
  }

  static async getLifetimeStats(customerId: string): Promise<{
    totalSpent: number;
    orderCount: number;
    averageOrderValue: number;
    lastOrderAt?: string;
  }> {
    try {
      return await apiJson(`/api/customers/${customerId}/stats`);
    } catch (error) {
      logger.error('[CUSTOMER_ENGINE_GET_LIFETIME_STATS]', error);
      throw error;
    }
  }
}