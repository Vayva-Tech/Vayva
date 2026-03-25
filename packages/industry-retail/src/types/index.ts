// ============================================================================
// Retail Industry Types
// ============================================================================

export interface RetailProduct {
  id: string;
  storeId: string;
  name: string;
  sku: string;
  price: number;
  cost: number;
  stock: number;
  soldCount: number;
  status: "active" | "archived" | "draft";
  category?: string;
  images?: Array<string>;
}

export interface RetailOrder {
  id: string;
  storeId: string;
  orderNumber: string;
  customerId?: string;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  total: number;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  shippingAddress?: {
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
  };
}

export interface RetailInventoryAlert {
  id: string;
  storeId: string;
  productId: string;
  threshold: number;
  currentStock: number;
  severity: "low" | "critical" | "out_of_stock";
}

export interface RetailMetrics {
  revenue: number;
  orders: number;
  customers: number;
  conversionRate: number;
  averageOrderValue: number;
  inventoryTurnover: number;
}
