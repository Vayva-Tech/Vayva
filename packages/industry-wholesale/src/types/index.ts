// @ts-nocheck
/**
 * Wholesale Industry Types
 * Type definitions for wholesale-specific features
 */

// Core Business Metrics
export interface BusinessOverview {
  ordersToday: number;
  ordersTrend: number;
  revenueMTD: number;
  revenueTrend: number;
  averageOrderValue: number;
  aovTrend: number;
}

// Order Pipeline
export interface OrderStatusBreakdown {
  pending: number;
  processing: number;
  shipped: number;
  readyForPickup: number;
  totalBacklog: number;
  onTimeShipRate: number;
}

export interface SalesByCategory {
  categories: CategoryPerformance[];
  topBrand: string;
  topBrandGrowth: number;
  decliningCategory: string;
  decliningCategoryDrop: number;
}

export interface CategoryPerformance {
  id: string;
  name: string;
  revenue: number;
  percentage: number;
  trend: number;
  color: string;
}

// Inventory
export interface InventoryHealth {
  inStock: number;
  lowStock: number;
  outOfStock: number;
  overstocked: number;
  inventoryTurnoverDays: number;
  fillRate: number;
  carryingCost: number;
}

// Customer Insights
export interface CustomerInsights {
  totalAccounts: number;
  activeAccounts: number;
  newThisMonth: number;
  atRiskAccounts: number;
  topCustomers: TopCustomer[];
  customerLifetimeValue: number;
  avgOrderFrequency: number;
}

export interface TopCustomer {
  id: string;
  name: string;
  revenue: number;
  orderCount: number;
  percentageOfTotal: number;
}

// Purchase Orders
export interface PurchaseOrders {
  pendingApproval: number;
  inTransit: number;
  expectedThisWeek: number;
  supplierDelays: number;
  qualityIssues: number;
  supplierOTD: number;
}

// Reorder Forecast
export interface ReorderForecast {
  autoGenerateCount: number;
  priorityRestocks: ReorderItem[];
  estimatedInvestment: number;
  projectedROI: number;
}

export interface ReorderItem {
  id: string;
  sku: string;
  productName: string;
  currentStock: number;
  suggestedQty: number;
  dueDate: string;
  priority: 'urgent' | 'soon' | 'routine';
}

// Accounts Receivable
export interface AccountsReceivable {
  current: number;
  oneToThirtyDays: number;
  thirtyOneToSixtyDays: number;
  sixtyPlusDays: number;
  dso: number;
  collectionEffectiveness: number;
}

// Warehouse Performance
export interface WarehousePerformance {
  ordersToPick: number;
  pickingProgress: number;
  packingQueue: number;
  shippedToday: number;
  picksPerHour: number;
  picksPerHourTarget: number;
  accuracyRate: number;
}

// Quote Pipeline
export interface QuotePipeline {
  pendingQuotes: number;
  quoteValue: number;
  winRate: number;
  closingThisMonth: number;
  topOpportunity: QuoteOpportunity;
}

export interface QuoteOpportunity {
  id: string;
  customerName: string;
  value: number;
  probability: number;
}

// Action Items
export interface ActionRequired {
  tasks: Task[];
  lowStockApprovals: number;
  pastDueCustomerCalls: number;
  quoteRequests: number;
}

export interface Task {
  id: string;
  title: string;
  priority: 'high' | 'medium' | 'low';
  dueTime?: string;
  completed: boolean;
  category: 'inventory' | 'customer' | 'quote' | 'warehouse' | 'supplier' | 'finance';
}

// Theme Presets
export interface ThemePreset {
  id: string;
  name: string;
  primary: string;
  secondary: string;
  accent: string;
  background: string;
  success: string;
  warning: string;
  danger: string;
  textPrimary: string;
  textSecondary: string;
  cardBg: string;
  borderRadius: string;
  shadow: string;
}

// Dashboard Data
export interface WholesaleDashboardData {
  businessOverview: BusinessOverview;
  orderPipeline: OrderStatusBreakdown;
  salesByCategory: SalesByCategory;
  inventoryHealth: InventoryHealth;
  customerInsights: CustomerInsights;
  purchaseOrders: PurchaseOrders;
  reorderForecast: ReorderForecast;
  accountsReceivable: AccountsReceivable;
  warehousePerformance: WarehousePerformance;
  quotePipeline: QuotePipeline;
  actionRequired: ActionRequired;
  notifications: number;
}

// API Response Types
export interface WholesaleApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
}

export interface TieredPricing {
  productId: string;
  tiers: PricingTier[];
}

export interface PricingTier {
  minQuantity: number;
  maxQuantity: number;
  price: number;
  discountPercent?: number;
}

export interface CustomerTier {
  id: string;
  name: string;
  criteria: {
    annualSpend?: number;
    orderFrequency?: number;
  };
  benefits: string[];
}

export interface SupplierPerformance {
  supplierId: string;
  supplierName: string;
  onTimeDelivery: number;
  qualityScore: number;
  avgLeadTime: number;
}

export interface CycleCount {
  id: string;
  sku: string;
  productName: string;
  expectedCount: number;
  actualCount: number;
  variance: number;
  status: 'pending' | 'completed' | 'approved';
}

export interface CreditStatus {
  customerId: string;
  creditLimit: number;
  currentBalance: number;
  availableCredit: number;
  status: 'good' | 'warning' | 'hold';
}

export interface SalesRepAssignment {
  customerId: string;
  salesRepId: string;
  salesRepName: string;
  territory: string;
  commissionRate: number;
}

export interface WarehouseLocation {
  id: string;
  name: string;
  address: string;
  bins: BinLocation[];
}

export interface BinLocation {
  id: string;
  code: string;
  zone: string;
  capacity: number;
  currentStock: number;
}

export interface ReorderPoint {
  productId: string;
  minStock: number;
  maxStock: number;
  reorderPoint: number;
  leadTimeDays: number;
}

export interface ShipmentTracking {
  orderId: string;
  trackingNumber: string;
  carrier: string;
  status: string;
  estimatedDelivery: string;
  actualDelivery?: string;
}

export interface Quote {
  id: string;
  quoteNumber: string;
  customerId: string;
  customerName: string;
  items: QuoteItem[];
  total: number;
  status: 'draft' | 'sent' | 'accepted' | 'rejected' | 'expired';
  createdAt: string;
  expiresAt: string;
  probability: number;
}

export interface QuoteItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  discount?: number;
}

export interface Invoice {
  id: string;
  invoiceNumber: string;
  customerId: string;
  customerName: string;
  amount: number;
  dueDate: string;
  status: 'paid' | 'unpaid' | 'overdue' | 'void';
  agingBucket: 'current' | '1-30' | '31-60' | '60+';
}

export interface CollectionCall {
  id: string;
  customerId: string;
  customerName: string;
  overdueAmount: number;
  lastContact: string;
  priority: 'high' | 'medium' | 'low';
}

export interface ReportConfig {
  type: 'sales-by-customer' | 'sales-by-category' | 'sales-by-rep' | 'inventory-valuation' | 'customer-profitability' | 'product-profitability' | 'cash-flow-forecast';
  filters: {
    dateRange?: { from: string; to: string };
    customerId?: string;
    categoryId?: string;
    salesRepId?: string;
  };
  format: 'pdf' | 'xlsx' | 'csv';
}

export interface Forecast {
  productId: string;
  productName: string;
  currentStock: number;
  forecastedDemand: number;
  recommendedOrder: number;
  confidence: number;
}
