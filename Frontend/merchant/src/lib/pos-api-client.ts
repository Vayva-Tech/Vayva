/**
 * POS API Client
 * 
 * Handles all communication with the Fastify POS backend endpoints
 */

import { apiClient } from './api-client';

export interface POSTable {
  id: string;
  storeId: string;
  type: 'PRODUCT' | 'SERVICE' | 'TIME_SLOT' | 'BUNDLE';
  productId?: string;
  serviceId?: string;
  name: string;
  price: number;
  taxCategory?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface POSCartItem {
  posItemId: string;
  name: string;
  price: number;
  quantity: number;
  discount?: number;
  notes?: string;
  modifiers?: Array<{
    name: string;
    value: string;
    price?: number;
  }>;
}

export interface CreatePOSOrderPayload {
  storeId: string;
  tableId?: string;
  customerId?: string;
  cashierId?: string;
  items: Array<{
    posItemId: string;
    quantity: number;
    unitPrice: number;
    discount?: number;
    notes?: string;
    modifiers?: Array<{
      name: string;
      value: string;
      price?: number;
    }>;
  }>;
  paymentMethod?: string;
  splitPayments?: Array<{
    method: string;
    amount: number;
  }>;
  tip?: number;
  serviceCharge?: number;
  notes?: string;
}

export interface POSOrder {
  id: string;
  storeId: string;
  orderId?: string;
  tableId?: string;
  customerId?: string;
  cashierId?: string;
  status: 'DRAFT' | 'COMPLETED' | 'VOIDED' | 'REFUNDED';
  paymentMethod?: string;
  paymentStatus: 'UNPAID' | 'PARTIAL' | 'PAID' | 'REFUNDED';
  subtotal: number;
  tax: number;
  discount: number;
  tip: number;
  serviceCharge: number;
  total: number;
  splitPayments?: Array<{ method: string; amount: number }>;
  receiptNumber?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
  items: Array<{
    id: string;
    posItemId: string;
    quantity: number;
    unitPrice: number;
    discount: number;
    subtotal: number;
    notes?: string;
    modifiers?: Array<{ name: string; value: string; price?: number }>;
    posItem: POSTable;
  }>;
  payments: Array<{
    id: string;
    method: string;
    amount: number;
    status: string;
  }>;
}

export interface TodayStats {
  totalOrders: number;
  totalRevenue: number;
  avgTransaction: number;
}

// ============================================================================
// API Methods
// ============================================================================

export const posApi = {
  /**
   * Get all POS items for a store
   */
  async getItems(storeId: string, filters?: { type?: string; search?: string }) {
    const params = new URLSearchParams();
    if (filters?.type) params.append('type', filters.type);
    if (filters?.search) params.append('search', filters.search);

    const response = await apiClient.get(`/api/v1/pos/items?${params}`);
    return response.data as { success: boolean; data: POSTable[]; count: number };
  },

  /**
   * Create a new POS item
   */
  async createItem(data: Omit<POSTable, 'id' | 'createdAt'>) {
    const response = await apiClient.post('/api/v1/pos/items', data);
    return response.data as { success: boolean; data: POSTable };
  },

  /**
   * Get a single POS item
   */
  async getItem(id: string, storeId: string) {
    const response = await apiClient.get(`/api/v1/pos/items/${id}`);
    return response.data as { success: boolean; data: POSTable };
  },

  /**
   * Update a POS item
   */
  async updateItem(id: string, updates: Partial<Omit<POSTable, 'id' | 'createdAt'>>) {
    const response = await apiClient.put(`/api/v1/pos/items/${id}`, updates);
    return response.data as { success: boolean; data: POSTable };
  },

  /**
   * Delete a POS item
   */
  async deleteItem(id: string) {
    const response = await apiClient.delete(`/api/v1/pos/items/${id}`);
    return response.data as { success: boolean };
  },

  /**
   * Create a POS order from cart
   */
  async createOrder(data: CreatePOSOrderPayload) {
    const response = await apiClient.post('/api/v1/pos/orders', data);
    return response.data as { success: boolean; data: POSOrder };
  },

  /**
   * Get POS order details
   */
  async getOrder(orderId: string) {
    const response = await apiClient.get(`/api/v1/pos/orders/${orderId}`);
    return response.data as { success: boolean; data: POSOrder };
  },

  /**
   * Process split payment
   */
  async processSplitPayment(
    orderId: string,
    payments: Array<{ method: string; amount: number }>
  ) {
    const response = await apiClient.post(
      `/api/v1/pos/orders/${orderId}/payments/split`,
      { payments }
    );
    return response.data as { success: boolean; data: any };
  },

  /**
   * Generate receipt
   */
  async generateReceipt(orderId: string) {
    const response = await apiClient.get(`/api/v1/pos/orders/${orderId}/receipt`);
    return response.data as { 
      success: boolean; 
      data: {
        receiptNumber: string;
        storeId: string;
        date: string;
        items: Array<{ name: string; quantity: number; unitPrice: number; subtotal: number }>;
        subtotal: number;
        tax: number;
        discount: number;
        tip: number;
        serviceCharge: number;
        total: number;
        payments: Array<{ method: string; amount: number }>;
        balance: number;
      }
    };
  },

  /**
   * Get today's statistics
   */
  async getTodayStats(storeId: string) {
    const response = await apiClient.get('/api/v1/pos/stats/today');
    return response.data as { success: boolean; data: TodayStats };
  },

  /**
   * Get recent orders
   */
  async getRecentOrders(storeId: string, limit?: number) {
    const params = limit ? `?limit=${limit}` : '';
    const response = await apiClient.get(`/api/v1/pos/orders/recent${params}`);
    return response.data as { success: boolean; data: POSOrder[] };
  },
};
