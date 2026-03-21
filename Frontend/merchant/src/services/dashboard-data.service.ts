// @ts-nocheck
/**
 * Real Dashboard Data Services
 * Replaces mock data with actual API calls to backend services
 * Includes comprehensive error handling and reliability features
 */

import { apiJson } from '@/lib/api-client-shared';
import { logger } from '@vayva/shared';

// Retry configuration
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 1000,
  maxDelay: 10000,
  exponentialFactor: 2
};

// Cache configuration
const CACHE_CONFIG = {
  ttl: 5 * 60 * 1000, // 5 minutes
  maxSize: 100
};

// Simple in-memory cache
class SimpleCache {
  private cache: Map<string, { data: any; timestamp: number }> = new Map();
  
  get(key: string): any | null {
    const item = this.cache.get(key);
    if (!item) return null;
    
    if (Date.now() - item.timestamp > CACHE_CONFIG.ttl) {
      this.cache.delete(key);
      return null;
    }
    
    return item.data;
  }
  
  set(key: string, data: any): void {
    if (this.cache.size >= CACHE_CONFIG.maxSize) {
      // Remove oldest entry
      const firstKey = this.cache.keys().next().value;
      if (firstKey) this.cache.delete(firstKey);
    }
    
    this.cache.set(key, { data, timestamp: Date.now() });
  }
  
  clear(): void {
    this.cache.clear();
  }
}

const cache = new SimpleCache();

// Product interface
interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  price: number;
  stock: number;
  status: 'active' | 'draft' | 'archived';
  image?: string;
  sales: number;
  revenue: number;
  lastUpdated: string;
}

// Order interface
interface Order {
  id: string;
  customer: {
    name: string;
    email: string;
    phone: string;
  };
  items: number;
  total: number;
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';
  date: string;
  deliveryAddress: string;
  paymentMethod: string;
  trackingNumber?: string;
}

// Retry utility with exponential backoff
async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  retries: number = RETRY_CONFIG.maxRetries
): Promise<T> {
  try {
    return await operation();
  } catch (error) {
    if (retries <= 0) throw error;
    
    const delay = Math.min(
      RETRY_CONFIG.baseDelay * Math.pow(RETRY_CONFIG.exponentialFactor, RETRY_CONFIG.maxRetries - retries),
      RETRY_CONFIG.maxDelay
    );
    
    logger.warn(`Operation failed, retrying in ${delay}ms...`, { retriesLeft: retries });
    await new Promise(resolve => setTimeout(resolve, delay));
    
    return retryWithBackoff(operation, retries - 1);
  }
}
interface DashboardMetric {
  title: string;
  value: string | number;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

interface FinancialMetric {
  title: string;
  value: string;
  change: number;
  trend: 'up' | 'down';
  icon: React.ReactNode;
}

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  category: string;
  description: string;
  amount: number;
  date: string;
  status: 'completed' | 'pending' | 'failed';
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  totalSpent: number;
  orderCount: number;
  lastOrder: string;
  status: 'active' | 'inactive' | 'vip';
  tags: string[];
  avatar?: string;
}

interface KPIData {
  metric: string;
  value: string;
  trend: string;
}

interface DeadlineItem {
  task: string;
  date: string;
  priority: 'high' | 'medium' | 'low';
}

// Control Center Data Service
export class ControlCenterDataService {
  static async getOverviewMetrics(forceRefresh: boolean = false): Promise<DashboardMetric[]> {
    const cacheKey = 'control-center-metrics';
    
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached) return cached;
    }
    
    return retryWithBackoff(async () => {
      try {
        const response = await apiJson<{
          revenue: number;
          orders: number;
          customers: number;
          pendingOrders: number;
          revenueChange: number;
          ordersChange: number;
          customersChange: number;
          pendingOrdersChange: number;
        }>('/api/dashboard/metrics/overview');
        
        const metrics: DashboardMetric[] = [
          {
            title: "Total Revenue",
            value: `₦${response.revenue.toLocaleString()}`,
            change: response.revenueChange,
            trend: response.revenueChange >= 0 ? 'up' : 'down',
            icon: null
          },
          {
            title: "Orders This Month",
            value: response.orders.toLocaleString(),
            change: response.ordersChange,
            trend: response.ordersChange >= 0 ? 'up' : 'down',
            icon: null
          },
          {
            title: "Active Customers",
            value: response.customers.toLocaleString(),
            change: response.customersChange,
            trend: response.customersChange >= 0 ? 'up' : 'down',
            icon: null
          },
          {
            title: "Pending Orders",
            value: response.pendingOrders.toString(),
            change: response.pendingOrdersChange,
            trend: response.pendingOrdersChange >= 0 ? 'up' : 'down',
            icon: null
          }
        ];
        
        cache.set(cacheKey, metrics);
        return metrics;
      } catch (error) {
        logger.error('[CONTROL_CENTER_METRICS_ERROR] Failed to fetch metrics:', error);
        throw new Error('Failed to load dashboard metrics. Please try again.');
      }
    });
  }

  static async getKPIs(forceRefresh: boolean = false): Promise<KPIData[]> {
    const cacheKey = 'control-center-kpis';
    
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached) return cached;
    }
    
    return retryWithBackoff(async () => {
      try {
        const response = await apiJson<{
          conversionRate: number;
          averageOrderValue: number;
          customerLifetimeValue: number;
          repeatPurchaseRate: number;
          conversionRateChange: number;
          aovChange: number;
          clvChange: number;
          rprChange: number;
        }>('/api/dashboard/kpis');
        
        const kpis: KPIData[] = [
          { 
            metric: 'Conversion Rate', 
            value: `${response.conversionRate.toFixed(1)}%`, 
            trend: `${response.conversionRateChange >= 0 ? '+' : ''}${response.conversionRateChange.toFixed(1)}%` 
          },
          { 
            metric: 'Average Order Value', 
            value: `₦${response.averageOrderValue.toLocaleString()}`, 
            trend: `${response.aovChange >= 0 ? '+' : ''}${response.aovChange.toFixed(0)}%` 
          },
          { 
            metric: 'Customer Lifetime Value', 
            value: `₦${response.customerLifetimeValue.toLocaleString()}`, 
            trend: `${response.clvChange >= 0 ? '+' : ''}${response.clvChange.toFixed(0)}%` 
          },
          { 
            metric: 'Repeat Purchase Rate', 
            value: `${response.repeatPurchaseRate.toFixed(0)}%`, 
            trend: `${response.rprChange >= 0 ? '+' : ''}${response.rprChange.toFixed(1)}%` 
          }
        ];
        
        cache.set(cacheKey, kpis);
        return kpis;
      } catch (error) {
        logger.error('[CONTROL_CENTER_KPIS_ERROR] Failed to fetch KPIs:', error);
        throw new Error('Failed to load business metrics. Please try again.');
      }
    });
  }

  static async getUpcomingDeadlines(forceRefresh: boolean = false): Promise<DeadlineItem[]> {
    const cacheKey = 'control-center-deadlines';
    
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached) return cached;
    }
    
    return retryWithBackoff(async () => {
      try {
        const response = await apiJson<{
          deadlines: DeadlineItem[];
        }>('/api/dashboard/deadlines');
        
        cache.set(cacheKey, response.deadlines);
        return response.deadlines;
      } catch (error) {
        logger.error('[CONTROL_CENTER_DEADLINES_ERROR] Failed to fetch deadlines:', error);
        throw new Error('Failed to load upcoming deadlines. Please try again.');
      }
    });
  }
  
  // Clear all cached data
  static clearCache(): void {
    cache.clear();
    logger.info('[CONTROL_CENTER] Cache cleared');
  }
}

// Finance Data Service
export class FinanceDataService {
  static async getFinancialMetrics(timeRange: '7d' | '30d' | '90d' | '1y' = '30d', forceRefresh: boolean = false): Promise<FinancialMetric[]> {
    const cacheKey = `finance-metrics-${timeRange}`;
    
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached) return cached;
    }
    
    return retryWithBackoff(async () => {
      try {
        const response = await apiJson<{
          revenue: number;
          netProfit: number;
          operatingCosts: number;
          cashFlow: number;
          revenueChange: number;
          profitChange: number;
          costsChange: number;
          cashFlowChange: number;
        }>(`/api/finance/metrics?range=${timeRange}`);
        
        const metrics: FinancialMetric[] = [
          {
            title: "Total Revenue",
            value: `₦${response.revenue.toLocaleString()}`,
            change: response.revenueChange,
            trend: response.revenueChange >= 0 ? 'up' : 'down',
            icon: null
          },
          {
            title: "Net Profit",
            value: `₦${response.netProfit.toLocaleString()}`,
            change: response.profitChange,
            trend: response.profitChange >= 0 ? 'up' : 'down',
            icon: null
          },
          {
            title: "Operating Costs",
            value: `₦${response.operatingCosts.toLocaleString()}`,
            change: response.costsChange,
            trend: response.costsChange <= 0 ? 'down' : 'up', // Costs decreasing is good
            icon: null
          },
          {
            title: "Cash Flow",
            value: `₦${response.cashFlow.toLocaleString()}`,
            change: response.cashFlowChange,
            trend: response.cashFlowChange >= 0 ? 'up' : 'down',
            icon: null
          }
        ];
        
        cache.set(cacheKey, metrics);
        return metrics;
      } catch (error) {
        logger.error('[FINANCE_METRICS_ERROR] Failed to fetch financial metrics:', error);
        throw new Error('Failed to load financial metrics. Please try again.');
      }
    });
  }

  static async getRecentTransactions(filter: 'all' | 'income' | 'expense' = 'all', forceRefresh: boolean = false): Promise<Transaction[]> {
    const cacheKey = `finance-transactions-${filter}`;
    
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached) return cached;
    }
    
    return retryWithBackoff(async () => {
      try {
        const response = await apiJson<{
          transactions: Transaction[];
        }>(`/api/finance/transactions?filter=${filter}`);
        
        cache.set(cacheKey, response.transactions);
        return response.transactions;
      } catch (error) {
        logger.error('[FINANCE_TRANSACTIONS_ERROR] Failed to fetch transactions:', error);
        throw new Error('Failed to load transactions. Please try again.');
      }
    });
  }

  static async getRevenueChartData(months: number = 12, forceRefresh: boolean = false): Promise<number[]> {
    const cacheKey = `finance-revenue-chart-${months}`;
    
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached) return cached;
    }
    
    return retryWithBackoff(async () => {
      try {
        const response = await apiJson<{
          data: number[];
        }>(`/api/finance/revenue-chart?months=${months}`);
        
        cache.set(cacheKey, response.data);
        return response.data;
      } catch (error) {
        logger.error('[FINANCE_CHART_ERROR] Failed to fetch revenue chart data:', error);
        throw new Error('Failed to load revenue chart. Please try again.');
      }
    });
  }
  
  // Clear finance cache
  static clearCache(): void {
    // Clear all finance-related cache entries
    const keysToDelete: string[] = [];
    cache['cache'].forEach((_, key) => {
      if (key.startsWith('finance-')) {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => cache['cache'].delete(key));
    logger.info('[FINANCE] Cache cleared');
  }
}

// Customer Data Service
export class CustomerDataService {
  static async getCustomerSummary(forceRefresh: boolean = false): Promise<{
    total: number;
    active: number;
    vip: number;
    averageOrderValue: number;
  }> {
    const cacheKey = 'customer-summary';
    
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached) return cached;
    }
    
    return retryWithBackoff(async () => {
      try {
        const response = await apiJson<{
          total: number;
          active: number;
          vip: number;
          averageOrderValue: number;
        }>('/api/customers/summary');
        
        cache.set(cacheKey, response);
        return response;
      } catch (error) {
        logger.error('[CUSTOMER_SUMMARY_ERROR] Failed to fetch customer summary:', error);
        throw new Error('Failed to load customer summary. Please try again.');
      }
    });
  }

  static async getCustomers(
    searchTerm: string = '',
    statusFilter: 'all' | 'active' | 'inactive' | 'vip' = 'all',
    sortBy: 'name' | 'spent' | 'orders' | 'recent' = 'name',
    forceRefresh: boolean = false
  ): Promise<Customer[]> {
    const cacheKey = `customers-${searchTerm}-${statusFilter}-${sortBy}`;
    
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached) return cached;
    }
    
    return retryWithBackoff(async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        params.append('sort', sortBy);
        
        const response = await apiJson<{
          customers: Customer[];
        }>(`/api/customers?${params.toString()}`);
        
        cache.set(cacheKey, response.customers);
        return response.customers;
      } catch (error) {
        logger.error('[CUSTOMERS_LIST_ERROR] Failed to fetch customers:', error);
        throw new Error('Failed to load customers. Please try again.');
      }
    });
  }
  
  // Clear customer cache
  static clearCache(): void {
    const keysToDelete: string[] = [];
    cache['cache'].forEach((_, key) => {
      if (key.startsWith('customers-') || key === 'customer-summary') {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => cache['cache'].delete(key));
    logger.info('[CUSTOMERS] Cache cleared');
  }
}

// Product Data Service
export class ProductService {
  static async getProductSummary(forceRefresh: boolean = false): Promise<{
    total: number;
    active: number;
    lowStock: number;
    totalRevenue: number;
  }> {
    const cacheKey = 'product-summary';
    
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached) return cached;
    }
    
    return retryWithBackoff(async () => {
      try {
        const response = await apiJson<{
          total: number;
          active: number;
          lowStock: number;
          totalRevenue: number;
        }>('/api/products/summary');
        
        cache.set(cacheKey, response);
        return response;
      } catch (error) {
        logger.error('[PRODUCT_SUMMARY_ERROR] Failed to fetch product summary:', error);
        throw new Error('Failed to load product summary. Please try again.');
      }
    });
  }

  static async getProducts(
    searchTerm: string = '',
    statusFilter: 'all' | 'active' | 'draft' | 'archived' = 'all',
    categoryFilter: string = 'all',
    sortBy: 'name' | 'price' | 'stock' | 'sales' = 'name',
    forceRefresh: boolean = false
  ): Promise<Product[]> {
    const cacheKey = `products-${searchTerm}-${statusFilter}-${categoryFilter}-${sortBy}`;
    
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached) return cached;
    }
    
    return retryWithBackoff(async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        if (categoryFilter !== 'all') params.append('category', categoryFilter);
        params.append('sort', sortBy);
        
        const response = await apiJson<{
          products: Product[];
        }>(`/api/products?${params.toString()}`);
        
        cache.set(cacheKey, response.products);
        return response.products;
      } catch (error) {
        logger.error('[PRODUCTS_LIST_ERROR] Failed to fetch products:', error);
        throw new Error('Failed to load products. Please try again.');
      }
    });
  }
  
  static async getProductCategories(): Promise<string[]> {
    const cacheKey = 'product-categories';
    const cached = cache.get(cacheKey);
    if (cached) return cached;
    
    return retryWithBackoff(async () => {
      try {
        const response = await apiJson<{
          categories: string[];
        }>('/api/products/categories');
        
        cache.set(cacheKey, response.categories);
        return response.categories;
      } catch (error) {
        logger.error('[PRODUCT_CATEGORIES_ERROR] Failed to fetch categories:', error);
        // Return default categories as fallback
        return ['Clothing', 'Electronics', 'Food & Beverage', 'Beauty', 'Home & Garden'];
      }
    });
  }
  
  // Clear product cache
  static clearCache(): void {
    const keysToDelete: string[] = [];
    cache['cache'].forEach((_, key) => {
      if (key.startsWith('products-') || key === 'product-summary' || key === 'product-categories') {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => cache['cache'].delete(key));
    logger.info('[PRODUCTS] Cache cleared');
  }
}

// Order Data Service
export class OrderService {
  static async getOrderSummary(forceRefresh: boolean = false): Promise<{
    total: number;
    pending: number;
    processing: number;
    shipped: number;
    delivered: number;
    cancelled: number;
    totalRevenue: number;
  }> {
    const cacheKey = 'order-summary';
    
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached) return cached;
    }
    
    return retryWithBackoff(async () => {
      try {
        const response = await apiJson<{
          total: number;
          pending: number;
          processing: number;
          shipped: number;
          delivered: number;
          cancelled: number;
          totalRevenue: number;
        }>('/api/orders/summary');
        
        cache.set(cacheKey, response);
        return response;
      } catch (error) {
        logger.error('[ORDER_SUMMARY_ERROR] Failed to fetch order summary:', error);
        throw new Error('Failed to load order summary. Please try again.');
      }
    });
  }

  static async getOrders(
    searchTerm: string = '',
    statusFilter: 'all' | 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled' = 'all',
    sortBy: 'date' | 'total' | 'customer' = 'date',
    forceRefresh: boolean = false
  ): Promise<Order[]> {
    const cacheKey = `orders-${searchTerm}-${statusFilter}-${sortBy}`;
    
    if (!forceRefresh) {
      const cached = cache.get(cacheKey);
      if (cached) return cached;
    }
    
    return retryWithBackoff(async () => {
      try {
        const params = new URLSearchParams();
        if (searchTerm) params.append('search', searchTerm);
        if (statusFilter !== 'all') params.append('status', statusFilter);
        params.append('sort', sortBy);
        
        const response = await apiJson<{
          orders: Order[];
        }>(`/api/orders?${params.toString()}`);
        
        cache.set(cacheKey, response.orders);
        return response.orders;
      } catch (error) {
        logger.error('[ORDERS_LIST_ERROR] Failed to fetch orders:', error);
        throw new Error('Failed to load orders. Please try again.');
      }
    });
  }
  
  // Clear order cache
  static clearCache(): void {
    const keysToDelete: string[] = [];
    cache['cache'].forEach((_, key) => {
      if (key.startsWith('orders-') || key === 'order-summary') {
        keysToDelete.push(key);
      }
    });
    keysToDelete.forEach(key => cache['cache'].delete(key));
    logger.info('[ORDERS] Cache cleared');
  }
}

// Generic Dashboard Service for common operations
export class DashboardService {
  static async getTimeRangeData(timeRange: '7d' | '30d' | '90d' | '1y') {
    try {
      const response = await apiJson<any>(`/api/dashboard/data?range=${timeRange}`);
      return response;
    } catch (error) {
      console.error('Failed to fetch time range data:', error);
      throw error;
    }
  }

  static async getExportData(endpoint: string, params: Record<string, string> = {}) {
    try {
      const searchParams = new URLSearchParams(params);
      const response = await apiJson<{
        csv: string;
        filename: string;
        count: number;
      }>(`/api/export/${endpoint}?${searchParams.toString()}`);
      
      return response;
    } catch (error) {
      console.error('Failed to fetch export data:', error);
      throw error;
    }
  }
}