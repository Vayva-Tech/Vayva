// @ts-nocheck
/**
 * Supply Chain Visibility Dashboard
 * Supplier management, purchase orders, and inventory forecasting
 */

import { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Truck, 
  Package, 
  Factory,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  Clock,
  Calendar,
  Filter,
  Search,
  MapPin
} from '@phosphor-icons/react';
import { useSWR } from 'swr';
import { apiJson } from '@/lib/api-client-shared';
import { GradientHeader, ThemedCard, getThemeColors } from '@/lib/design-system/theme-components';
import { useStore } from '@/providers/store-provider';
import { toast } from 'sonner';

// Types
interface Supplier {
  id: string;
  name: string;
  contact: string;
  email: string;
  phone: string;
  leadTime: number; // days
  reliability: number; // 0-100%
  lastOrder: string;
  pendingOrders: number;
  totalSpent: number;
  rating: number; // 1-5 stars
  location: string;
  status: 'active' | 'inactive' | 'pending';
}

interface PurchaseOrder {
  id: string;
  supplierId: string;
  supplierName: string;
  items: number;
  totalAmount: number;
  status: 'draft' | 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  expectedDelivery: string;
  actualDelivery?: string;
  createdAt: string;
  itemsList: {
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
  }[];
}

interface DemandForecast {
  productId: string;
  productName: string;
  currentStock: number;
  forecastedDemand: number;
  suggestedOrder: number;
  leadTime: number;
  safetyStock: number;
  lastUpdated: string;
  confidence: number; // 0-100%
}

interface SupplyChainOverview {
  totalSuppliers: number;
  activeSuppliers: number;
  pendingOrders: number;
  totalSpend: number;
  onTimeDelivery: number; // percentage
  avgLeadTime: number; // days
  inventoryTurnover: number;
}

// Main Supply Chain Dashboard Component
export default function SupplyChainDashboard() {
  const { store } = useStore();
  const colors = getThemeColors(store?.industrySlug || 'default');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive' | 'pending'>('all');

  // Fetch supply chain overview
  const { data: overview, isLoading: overviewLoading } = useSWR<SupplyChainOverview>(
    '/api/supply-chain/overview',
    async (url: string) => {
      try {
        const response = await apiJson<SupplyChainOverview>(url);
        return response;
      } catch (error) {
        console.error('Failed to fetch supply chain overview:', error);
        toast.error('Failed to load supply chain data');
        return null;
      }
    }
  );

  // Fetch suppliers
  const { data: suppliers, isLoading: suppliersLoading } = useSWR<Supplier[]>(
    '/api/supply-chain/suppliers',
    async (url: string) => {
      try {
        const response = await apiJson<{ suppliers: Supplier[] }>(url);
        return response.suppliers || [];
      } catch (error) {
        console.error('Failed to fetch suppliers:', error);
        return [];
      }
    }
  );

  // Fetch purchase orders
  const { data: purchaseOrders, isLoading: ordersLoading } = useSWR<PurchaseOrder[]>(
    '/api/supply-chain/purchase-orders',
    async (url: string) => {
      try {
        const response = await apiJson<{ orders: PurchaseOrder[] }>(url);
        return response.orders || [];
      } catch (error) {
        console.error('Failed to fetch purchase orders:', error);
        return [];
      }
    }
  );

  // Fetch demand forecasts
  const { data: forecasts, isLoading: forecastsLoading } = useSWR<DemandForecast[]>(
    '/api/inventory/forecasting',
    async (url: string) => {
      try {
        const response = await apiJson<{ forecasts: DemandForecast[] }>(url);
        return response.forecasts || [];
      } catch (error) {
        console.error('Failed to fetch forecasts:', error);
        return [];
      }
    }
  );

  // Filter suppliers
  const filteredSuppliers = suppliers?.filter(supplier => {
    const matchesSearch = supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         supplier.contact.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || supplier.status === statusFilter;
    return matchesSearch && matchesStatus;
  }) || [];

  // Filter purchase orders
  const filteredOrders = purchaseOrders?.filter(order => {
    const matchesSearch = order.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.id.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesSearch;
  }) || [];

  return (
    <div className="space-y-6">
      <GradientHeader
        title="Supply Chain Management"
        subtitle="Manage suppliers, track orders, and optimize inventory"
        industry={store?.industrySlug || 'default'}
        icon={<Factory className="h-8 w-8" />}
      />

      {/* Controls */}
      <div className="flex flex-wrap gap-4">
        <div className="relative flex-1 min-w-64">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-500" />
          <input
            type="text"
            placeholder="Search suppliers or orders..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-100 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
        
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2 border border-gray-100 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-green-500"
        >
          <option value="all">All Suppliers</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
        
        <button className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:opacity-90 transition-opacity font-medium">
          <Package className="h-4 w-4" />
          New PO
        </button>
      </div>

      {/* Overview Cards */}
      {!overviewLoading && overview && (
        <motion.div 
          className="grid grid-cols-1 md:grid-cols-4 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Suppliers</p>
                <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                  {overview.totalSuppliers}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                <Factory className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">On-Time Delivery</p>
                <p className="text-2xl font-bold" style={{ color: colors.secondary }}>
                  {overview.onTimeDelivery}%
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.secondary}15` }}>
                <CheckCircle className="h-6 w-6" style={{ color: colors.secondary }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Pending Orders</p>
                <p className="text-2xl font-bold" style={{ color: colors.accent }}>
                  {overview.pendingOrders}
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.accent}15` }}>
                <Clock className="h-6 w-6" style={{ color: colors.accent }} />
              </div>
            </div>
          </ThemedCard>
          
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">Total Spend</p>
                <p className="text-2xl font-bold" style={{ color: colors.primary }}>
                  ₦{(overview.totalSpend / 1000000).toFixed(1)}M
                </p>
              </div>
              <div className="p-3 rounded-xl" style={{ backgroundColor: `${colors.primary}15` }}>
                <TrendingUp className="h-6 w-6" style={{ color: colors.primary }} />
              </div>
            </div>
          </ThemedCard>
        </motion.div>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Supplier Performance */}
        <div className="lg:col-span-2 space-y-6">
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Factory className="h-5 w-5" />
                Supplier Performance
              </h3>
              <div className="flex gap-2">
                <button className="px-3 py-1 text-sm border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
                  Export
                </button>
              </div>
            </div>
            
            {suppliersLoading ? (
              <div className="space-y-3">
                {[1,2,3,4,5].map(i => (
                  <div key={i} className="h-16 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredSuppliers.slice(0, 5).map((supplier, index) => (
                  <motion.div
                    key={supplier.id}
                    className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-xl bg-green-500/10 flex items-center justify-center">
                        <Factory className="h-6 w-6 text-green-500" />
                      </div>
                      <div>
                        <h4 className="font-medium">{supplier.name}</h4>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span>{supplier.contact}</span>
                          <div className="flex items-center gap-1">
                            <MapPin className="h-3 w-3" />
                            {supplier.location}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <p className="font-bold">{supplier.reliability}%</p>
                        <p className="text-xs text-gray-500">Reliability</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">{supplier.leadTime}d</p>
                        <p className="text-xs text-gray-500">Lead Time</p>
                      </div>
                      <div className="text-center">
                        <p className="font-bold">₦{(supplier.totalSpent / 1000).toFixed(0)}k</p>
                        <p className="text-xs text-gray-500">Total Spend</p>
                      </div>
                      <div className={`px-3 py-1 rounded-full text-xs font-medium ${
                        supplier.status === 'active' ? 'bg-green-100 text-green-800' :
                        supplier.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {supplier.status.charAt(0).toUpperCase() + supplier.status.slice(1)}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ThemedCard>

          {/* Purchase Orders */}
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <div className="flex items-center justify-between mb-6">
              <h3 className="font-semibold flex items-center gap-2">
                <Truck className="h-5 w-5" />
                Purchase Orders
              </h3>
            </div>
            
            {ordersLoading ? (
              <div className="space-y-3">
                {[1,2,3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.slice(0, 3).map((order, index) => {
                  const getStatusColor = (status: PurchaseOrder['status']) => {
                    switch (status) {
                      case 'pending': return 'bg-yellow-100 text-yellow-800';
                      case 'confirmed': return 'bg-blue-100 text-blue-800';
                      case 'shipped': return 'bg-purple-100 text-purple-800';
                      case 'delivered': return 'bg-green-100 text-green-800';
                      case 'cancelled': return 'bg-red-100 text-red-800';
                      default: return 'bg-gray-100 text-gray-800';
                    }
                  };

                  return (
                    <motion.div
                      key={order.id}
                      className="p-4 border border-gray-100 rounded-xl hover:bg-gray-100 transition-colors"
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                    >
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h4 className="font-medium">{order.id}</h4>
                          <p className="text-sm text-gray-500">Supplier: {order.supplierName}</p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-medium ${getStatusColor(order.status)}`}>
                          {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                        </span>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-6 text-sm">
                          <div>
                            <span className="font-medium">{order.items} items</span>
                          </div>
                          <div>
                            <span className="font-medium">₦{order.totalAmount.toLocaleString()}</span>
                          </div>
                          <div className="flex items-center gap-1 text-gray-500">
                            <Calendar className="h-4 w-4" />
                            <span>Due: {new Date(order.expectedDelivery).toLocaleDateString()}</span>
                          </div>
                        </div>
                        
                        <button className="px-3 py-1 text-sm border border-gray-100 rounded-lg hover:bg-gray-100 transition-colors">
                          View Details
                        </button>
                      </div>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </ThemedCard>
        </div>

        {/* Demand Forecasting */}
        <div className="space-y-6">
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <h3 className="font-semibold mb-6 flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Demand Forecasting
            </h3>
            
            {forecastsLoading ? (
              <div className="space-y-4">
                {[1,2,3].map(i => (
                  <div key={i} className="h-20 bg-gray-100 rounded-xl animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-4">
                {forecasts?.slice(0, 5).map((forecast, index) => (
                  <motion.div
                    key={forecast.productId}
                    className="p-4 border border-gray-100 rounded-xl"
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                  >
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-medium text-sm">{forecast.productName}</h4>
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        forecast.confidence >= 80 ? 'bg-green-100 text-green-800' :
                        forecast.confidence >= 60 ? 'bg-yellow-100 text-yellow-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {forecast.confidence}% confidence
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-gray-500">Current Stock</p>
                        <p className="font-medium">{forecast.currentStock}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Forecasted Demand</p>
                        <p className="font-medium">{forecast.forecastedDemand}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Suggested Order</p>
                        <p className="font-bold text-green-500">{forecast.suggestedOrder}</p>
                      </div>
                      <div>
                        <p className="text-gray-500">Lead Time</p>
                        <p className="font-medium">{forecast.leadTime} days</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            )}
          </ThemedCard>

          {/* Quick Actions */}
          <ThemedCard industry={store?.industrySlug || 'default'}>
            <h3 className="font-semibold mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                <Package className="h-5 w-5 text-green-500" />
                <span className="font-medium">Create Purchase Order</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                <Factory className="h-5 w-5 text-green-500" />
                <span className="font-medium">Add New Supplier</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-100 hover:bg-gray-100 transition-colors">
                <TrendingUp className="h-5 w-5 text-green-500" />
                <span className="font-medium">Run Forecast</span>
              </button>
            </div>
          </ThemedCard>

          {/* Alerts */}
          <ThemedCard industry={store?.industrySlug || 'default'} className="border-red-200 bg-red-50/30">
            <h3 className="font-semibold mb-4 flex items-center gap-2 text-red-900">
              <AlertTriangle className="h-5 w-5" />
              Supply Chain Alerts
            </h3>
            <div className="space-y-3">
              <div className="p-3 bg-red-100/50 rounded-lg border border-red-200">
                <p className="text-sm font-medium text-red-900">Low Stock Alert</p>
                <p className="text-xs text-red-700">5 products below safety stock levels</p>
              </div>
              <div className="p-3 bg-yellow-100/50 rounded-lg border border-yellow-200">
                <p className="text-sm font-medium text-yellow-900">Delayed Shipment</p>
                <p className="text-xs text-yellow-700">2 orders expected late by 3+ days</p>
              </div>
              <div className="p-3 bg-blue-100/50 rounded-lg border border-blue-200">
                <p className="text-sm font-medium text-blue-900">New Supplier</p>
                <p className="text-xs text-blue-700">1 pending supplier verification</p>
              </div>
            </div>
          </ThemedCard>
        </div>
      </div>
    </div>
  );
}