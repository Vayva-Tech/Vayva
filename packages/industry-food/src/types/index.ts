// @ts-nocheck
// ============================================================================
// Food Industry Types
// ============================================================================

export interface MenuItem {
  id: string;
  storeId: string;
  name: string;
  description?: string;
  price: number;
  cost: number;
  category: string;
  available: boolean;
  prepTimeMinutes?: number;
  ingredients?: string[];
  allergens?: string[];
  images?: string[];
}

export interface KDSOrder {
  id: string;
  storeId: string;
  orderNumber: string;
  orderType: "dine-in" | "takeout" | "delivery";
  tableNumber?: string;
  items: Array<{
    menuItemId: string;
    quantity: number;
    notes?: string;
    modifiers?: string[];
  }>;
  status: "pending" | "preparing" | "ready" | "completed";
  createdAt: Date;
  completedAt?: Date;
  prepTimeMinutes?: number;
}

export interface Table {
  id: string;
  storeId: string;
  tableNumber: string;
  capacity: number;
  status: "available" | "occupied" | "reserved" | "maintenance";
  currentOrderId?: string;
  seatedAt?: Date;
}

export interface FoodMetrics {
  ordersToday: number;
  averagePrepTime: number;
  tableTurnoverRate: number;
  revenue: number;
  soldOutItems: number;
  customerSatisfaction?: number;
}
