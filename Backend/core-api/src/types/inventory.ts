export interface InventoryLocation {
  id: string;
  storeId: string;
  name: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryItem {
  id: string;
  locationId: string;
  variantId: string;
  productId: string;
  onHand: number;
  available: number;
  lowStockThreshold?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface InventoryMovement {
  id: string;
  storeId: string;
  locationId: string;
  variantId: string;
  type: string;
  quantity: number;
  reason: string | null;
  userId: string | null;
  createdAt: Date;
  inventoryLocation?: InventoryLocation;
}

export interface StockAdjustmentResult {
  onHand: number;
  available: number;
}

export interface InventoryProduct {
  id: string;
  name: string;
  inventory?: {
    quantity: number;
  };
  price: number;
  category?: string;
}

export interface InventoryApiResponse {
  data?: InventoryProduct[];
  items?: InventoryProduct[];
}
