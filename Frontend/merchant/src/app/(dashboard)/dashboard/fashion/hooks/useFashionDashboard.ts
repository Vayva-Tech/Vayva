/**
 * Standardized React Query hooks for Fashion Dashboard
 * Caching, auto-refresh, and optimistic updates for fashion retail data
 */

'use client';

import { useQuery } from '@tanstack/react-query';
import { apiJson } from '@/lib/api-client-shared';
import { QUERY_KEYS, DEFAULT_QUERY_CONFIG } from '@/lib/react-query';

// Type definitions
interface Product {
  id: string;
  sku: string;
  name: string;
  category: string;
  subcategory?: string;
  price: number;
  costPrice: number;
  stock: number;
  lowStockThreshold: number;
  sizes: string[];
  colors: string[];
  season: string;
  collection?: string;
  status: "active" | "draft" | "archived" | "discontinued";
  imageUrl?: string;
}

interface Order {
  id: string;
  orderNumber: string;
  customerId: string;
  customerName?: string;
  items: OrderItem[];
  totalAmount: number;
  status: "pending" | "processing" | "shipped" | "delivered" | "cancelled";
  orderDate: string;
  shippingAddress?: string;
}

interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  price: number;
  size: string;
  color: string;
}

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  totalOrders: number;
  totalSpent: number;
  lastOrderDate?: string;
  createdAt: string;
}

interface Supplier {
  id: string;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  leadTimeDays: number;
  reliabilityScore: number;
  productsSupplied: number;
}

interface Trend {
  id: string;
  name: string;
  category: string;
  trendScore: number;
  velocity: 'rising' | 'stable' | 'declining';
  socialMentions: number;
  searchVolume: number;
  predictedDemand: 'high' | 'medium' | 'low';
}

interface Collection {
  id: string;
  name: string;
  season: string;
  year: number;
  productCount: number;
  totalValue: number;
  launchDate: string;
  status: "upcoming" | "active" | "ended";
}

interface DashboardStats {
  totalProducts: number;
  activeProducts: number;
  lowStockItems: number;
  totalOrders: number;
  pendingOrders: number;
  totalRevenue: number;
  monthlyRevenue: number;
  averageOrderValue: number;
  totalCustomers: number;
  newCustomersThisMonth: number;
  inventoryValue: number;
  sellThroughRate: number;
}

/**
 * Main hook for fetching complete fashion dashboard data
 */
export function useFashionDashboard() {
  const queryKey = QUERY_KEYS.fashion.dashboard('default');
  
  const { data, isLoading, error, refetch, isFetching } = useQuery<{
    stats: DashboardStats | null;
    products: Product[];
    orders: Order[];
    customers: Customer[];
    suppliers: Supplier[];
    trends: Trend[];
    collections: Collection[];
  }, Error>({
    queryKey,
    queryFn: async () => {
      const [statsRes, productsRes, ordersRes, customersRes, suppliersRes, trendsRes, collectionsRes] = await Promise.all([
        apiJson<{ data: DashboardStats | null }>("/api/fashion/stats").catch(() => ({ data: null })),
        apiJson<{ data: Product[] }>("/api/fashion/products?limit=100").catch(() => ({ data: [] })),
        apiJson<{ data: Order[] }>("/api/fashion/orders?limit=50").catch(() => ({ data: [] })),
        apiJson<{ data: Customer[] }>("/api/fashion/customers?limit=100").catch(() => ({ data: [] })),
        apiJson<{ data: Supplier[] }>("/api/fashion/suppliers?limit=50").catch(() => ({ data: [] })),
        apiJson<{ data: Trend[] }>("/api/fashion/trends?limit=20").catch(() => ({ data: [] })),
        apiJson<{ data: Collection[] }>("/api/fashion/collections?limit=20").catch(() => ({ data: [] })),
      ]);

      return {
        stats: statsRes.data,
        products: productsRes.data || [],
        orders: ordersRes.data || [],
        customers: customersRes.data || [],
        suppliers: suppliersRes.data || [],
        trends: trendsRes.data || [],
        collections: collectionsRes.data || [],
      };
    },
    ...DEFAULT_QUERY_CONFIG,
  });

  return {
    data: data || {
      stats: null,
      products: [],
      orders: [],
      customers: [],
      suppliers: [],
      trends: [],
      collections: [],
    },
    loading: isLoading,
    fetching: isFetching,
    error: error?.message || null,
    refetch,
  };
}

/**
 * Hook for fetching only fashion products with filtering
 */
export function useFashionProducts(filters?: { category?: string; season?: string }) {
  const queryKey = QUERY_KEYS.fashion.inventory('default');
  
  const { data, isLoading, error, refetch } = useQuery<Product[], Error>({
    queryKey: filters ? [...queryKey, filters] : queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '100' });
      if (filters?.category) params.append('category', filters.category);
      if (filters?.season) params.append('season', filters.season);
      
      const response = await apiJson<{ data: Product[] }>(`/api/fashion/products?${params}`);
      return response.data || [];
    },
    ...DEFAULT_QUERY_CONFIG,
  });

  return {
    products: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

/**
 * Hook for fetching fashion orders
 */
export function useFashionOrders(status?: string) {
  const queryKey = QUERY_KEYS.fashion.orders('default');
  
  const { data, isLoading, error, refetch } = useQuery<Order[], Error>({
    queryKey: status ? [...queryKey, status] : queryKey,
    queryFn: async () => {
      const params = new URLSearchParams({ limit: '50' });
      if (status) params.append('status', status);
      
      const response = await apiJson<{ data: Order[] }>(`/api/fashion/orders?${params}`);
      return response.data || [];
    },
    ...DEFAULT_QUERY_CONFIG,
  });

  return {
    orders: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}

/**
 * Hook for fetching fashion trends
 */
export function useFashionTrends() {
  const queryKey = ['dashboard', 'fashion', 'trends'] as const;
  
  const { data, isLoading, error, refetch } = useQuery<Trend[], Error>({
    queryKey,
    queryFn: async () => {
      const response = await apiJson<{ data: Trend[] }>('/api/fashion/trends?limit=20');
      return response.data || [];
    },
    ...DEFAULT_QUERY_CONFIG,
    staleTime: 5 * 60 * 1000, // 5 minutes - trends don't change rapidly
  });

  return {
    trends: data || [],
    loading: isLoading,
    error: error?.message || null,
    refetch,
  };
}
