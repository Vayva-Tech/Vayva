/**
 * Grocery Industry Types
 * Type definitions for grocery-specific features
 */

export interface Department {
  id: string;
  name: string;
  slug: string;
  revenue: number;
  percentageOfTotal: number;
  trend: number;
  topCategory?: string;
  decliningCategory?: string;
}

export interface StockAlert {
  id: string;
  productId: string;
  productName: string;
  currentStock: number;
  threshold: number;
  status: 'critical' | 'low' | 'adequate';
  action?: string;
  imageUrl?: string;
}

export interface OnlineOrder {
  id: string;
  orderNumber: string;
  status: 'pending' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered';
  items: number;
  total: number;
  customerName: string;
  pickupTime?: string;
  deliveryAddress?: string;
  assignedShopper?: string;
  assignedDriver?: string;
}

export interface CustomerSegment {
  id: string;
  name: string;
  count: number;
  percentage: number;
  averageSpend: number;
  growthRate: number;
}

export interface Promotion {
  id: string;
  name: string;
  type: 'bogo' | 'percentage' | 'fixed' | 'coupon' | 'flash-sale';
  itemsCount: number;
  liftPercentage: number;
  redemptionRate: number;
  startDate: string;
  endDate: string;
  status: 'active' | 'scheduled' | 'expired';
}

export interface ExpiringProduct {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  expiryDate: string;
  daysUntilExpiry: number;
  action: 'markdown' | 'donate' | 'discard';
  department: string;
}

export interface SupplierDelivery {
  id: string;
  supplierId: string;
  supplierName: string;
  expectedTime: string;
  poNumber: string;
  dockDoor: string;
  status: 'on-time' | 'delayed' | 'early' | 'arrived';
  items: number;
  value: number;
}

export interface InventoryHealth {
  inStock: number;
  lowStock: number;
  outOfStock: number;
  overstocked: number;
  turnoverDays: number;
  shrinkageRate: number;
  totalValue: number;
}

export interface PriceOptimization {
  productId: string;
  productName: string;
  currentPrice: number;
  competitorPrices: CompetitorPrice[];
  suggestedAction: 'match' | 'increase' | 'clearance';
  marginImpact: number;
  elasticityScore: number;
}

export interface CompetitorPrice {
  store: string;
  price: number;
  difference: number;
}

export interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  dueTime?: string;
  completed: boolean;
  category: 'price-check' | 'waste-report' | 'purchase-orders' | 'supplier' | 'staff' | 'safety';
}

export interface LoyaltyMember {
  id: string;
  name: string;
  tier: 'basic' | 'premium' | 'elite';
  points: number;
  lifetimeValue: number;
  lastVisit: string;
  totalVisits: number;
}

export interface DashboardMetrics {
  salesToday: number;
  salesTrend: number;
  transactions: number;
  onlineTransactions: number;
  inStoreTransactions: number;
  averageBasketSize: number;
  basketSizeTrend: number;
  notifications: number;
}
