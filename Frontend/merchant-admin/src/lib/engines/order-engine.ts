// Order Engine - Core business logic for order management
import { apiJson } from "@/lib/api-client-shared";
import { logger } from "@vayva/shared";

export interface Order {
  id: string;
  orderNumber: string;
  status: 'pending' | 'confirmed' | 'paid' | 'processing' | 'shipped' | 'delivered' | 'cancelled' | 'refunded';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  fulfillmentStatus: 'pending' | 'processing' | 'shipped' | 'delivered' | 'returned';
  customer: {
    id?: string;
    name: string;
    email?: string;
    phone?: string;
    address?: string;
  };
  items: OrderItem[];
  totals: {
    subtotal: number;
    tax: number;
    shipping: number;
    discount: number;
    total: number;
  };
  payment: {
    method: string;
    reference?: string;
    paidAt?: string;
  };
  fulfillment: {
    method: string;
    trackingNumber?: string;
    shippedAt?: string;
    deliveredAt?: string;
  };
  notes?: string;
  tags?: string[];
  createdAt: string;
  updatedAt: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  variantId?: string;
  variantName?: string;
  quantity: number;
  price: number;
  total: number;
}

export interface OrderFilters {
  search?: string;
  status?: Order['status'];
  paymentStatus?: Order['paymentStatus'];
  fulfillmentStatus?: Order['fulfillmentStatus'];
  dateFrom?: string;
  dateTo?: string;
  sortBy?: 'orderNumber' | 'createdAt' | 'total' | 'updatedAt';
  sortOrder?: 'asc' | 'desc';
}

export class OrderEngine {
  static async getAll(filters?: OrderFilters): Promise<Order[]> {
    try {
      const params = new URLSearchParams();
      if (filters?.search) params.append('search', filters.search);
      if (filters?.status) params.append('status', filters.status);
      if (filters?.paymentStatus) params.append('paymentStatus', filters.paymentStatus);
      if (filters?.fulfillmentStatus) params.append('fulfillmentStatus', filters.fulfillmentStatus);
      if (filters?.dateFrom) params.append('dateFrom', filters.dateFrom);
      if (filters?.dateTo) params.append('dateTo', filters.dateTo);
      if (filters?.sortBy) params.append('sortBy', filters.sortBy);
      if (filters?.sortOrder) params.append('sortOrder', filters.sortOrder);

      const queryString = params.toString();
      const url = `/api/orders${queryString ? `?${queryString}` : ''}`;
      
      return await apiJson<Order[]>(url);
    } catch (error) {
      logger.error('[ORDER_ENGINE_GET_ALL]', error);
      throw error;
    }
  }

  static async getById(id: string): Promise<Order> {
    try {
      return await apiJson<Order>(`/api/orders/${id}`);
    } catch (error) {
      logger.error('[ORDER_ENGINE_GET_BY_ID]', error);
      throw error;
    }
  }

  static async updateStatus(id: string, status: Order['status']): Promise<Order> {
    try {
      return await apiJson<Order>(`/api/orders/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
    } catch (error) {
      logger.error('[ORDER_ENGINE_UPDATE_STATUS]', error);
      throw error;
    }
  }

  static async updateFulfillment(id: string, fulfillment: Partial<Order['fulfillment']>): Promise<Order> {
    try {
      return await apiJson<Order>(`/api/orders/${id}/fulfillment`, {
        method: 'PATCH',
        body: JSON.stringify(fulfillment),
      });
    } catch (error) {
      logger.error('[ORDER_ENGINE_UPDATE_FULFILLMENT]', error);
      throw error;
    }
  }

  static async addNote(id: string, note: string): Promise<Order> {
    try {
      return await apiJson<Order>(`/api/orders/${id}/notes`, {
        method: 'POST',
        body: JSON.stringify({ note }),
      });
    } catch (error) {
      logger.error('[ORDER_ENGINE_ADD_NOTE]', error);
      throw error;
    }
  }

  static async createDraft(customer: Order['customer'], items: Omit<OrderItem, 'id' | 'total'>[]): Promise<Order> {
    try {
      const orderItems = items.map((item, index) => ({
        ...item,
        id: `item_${index}_${Date.now()}`,
        total: item.price * item.quantity
      }));

      const subtotal = orderItems.reduce((sum, item) => sum + item.total, 0);
      
      const draftOrder: Partial<Order> = {
        customer,
        items: orderItems,
        totals: {
          subtotal,
          tax: 0,
          shipping: 0,
          discount: 0,
          total: subtotal
        },
        status: 'pending',
        paymentStatus: 'pending',
        fulfillmentStatus: 'pending'
      };

      return await apiJson<Order>('/api/orders/draft', {
        method: 'POST',
        body: JSON.stringify(draftOrder),
      });
    } catch (error) {
      logger.error('[ORDER_ENGINE_CREATE_DRAFT]', error);
      throw error;
    }
  }
}