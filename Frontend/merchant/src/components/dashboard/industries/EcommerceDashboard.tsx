/**
 * E-commerce Dashboard - Commerce Archetype
 * 
 * For: Online Stores, D2C Brands, Digital Product Sellers
 * 
 * Features:
 * - Shopping cart analytics
 * - Conversion funnel tracking
 * - Abandoned cart recovery (PRO+)
 * - Shipping integration
 * - Customer lifetime value
 */

'use client';

import { UnifiedDashboard } from '../dashboard-v2/UnifiedDashboard';
import { FeatureGate } from '../features/FeatureGate';
import { MetricsModule, MetricCard } from './modules/MetricsModule';
import { ChartsModule, DonutChart } from './modules/ChartsModule';
import { useModuleVisibility } from '@/hooks/useModuleVisibility';
import { ShoppingCart, TrendingUp, Users, Package, Eye, DollarSign } from 'lucide-react';

export function EcommerceDashboard() {
  const { isVisible: showAdvancedAnalytics } = useModuleVisibility(
    'advanced-analytics',
    { industry: 'ecommerce', planTier: 'PRO', enabledFeatures: [] }
  );

  // Sample data
  const dailyTraffic = [
    { day: 'Mon', visitors: 1240, orders: 89 },
    { day: 'Tue', visitors: 1380, orders: 102 },
    { day: 'Wed', visitors: 1150, orders: 78 },
    { day: 'Thu', visitors: 1520, orders: 124 },
    { day: 'Fri', visitors: 1890, orders: 167 },
    { day: 'Sat', visitors: 2100, orders: 198 },
    { day: 'Sun', visitors: 1780, orders: 145 },
  ];

  const trafficSources = [
    { label: 'Organic Search', value: 35, color: '#3b82f6' },
    { label: 'Paid Ads', value: 25, color: '#10b981' },
    { label: 'Social Media', value: 20, color: '#ec4899' },
    { label: 'Direct', value: 12, color: '#f59e0b' },
    { label: 'Email', value: 8, color: '#8b5cf6' },
  ];

  return (
    <UnifiedDashboard industry="ecommerce" planTier="PRO" designCategory="commerce">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Conversion Rate"
          value="8.7%"
          change={12}
          trend="up"
          icon={<ShoppingCart size={16} className="text-emerald-600" />}
        />
        
        <MetricCard
          label="Avg Order Value"
          value="₦12,450"
          change={8}
          trend="up"
          icon={<DollarSign size={16} className="text-blue-600" />}
        />
        
        <MetricCard
          label="Customer Lifetime Value"
          value="₦87,300"
          change={15}
          trend="up"
          icon={<Users size={16} className="text-purple-600" />}
        />
        
        <MetricCard
          label="Cart Abandonment"
          value="68%"
          change={-5}
          trend="down"
          icon={<Eye size={16} className="text-orange-600" />}
        />
      </div>

      {/* Funnel Analysis */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-600" />
            Sales Funnel - Last 7 Days
          </h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            View Full Report
          </button>
        </div>
        
        <div className="space-y-4">
          <FunnelStage
            stage="Page Views"
            count={11060}
            percentage={100}
            color="bg-blue-500"
          />
          <FunnelStage
            stage="Product Page Views"
            count={6636}
            percentage={60}
            color="bg-purple-500"
          />
          <FunnelStage
            stage="Add to Cart"
            count={3318}
            percentage={30}
            color="bg-pink-500"
          />
          <FunnelStage
            stage="Checkout Started"
            count={1991}
            percentage={18}
            color="bg-orange-500"
          />
          <FunnelStage
            stage="Purchases Completed"
            count={903}
            percentage={8.7}
            color="bg-green-500"
          />
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Traffic & Orders */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <Eye size={20} className="text-emerald-600" />
            Daily Traffic vs Orders
          </h3>
          <div className="h-64">
            <div className="flex items-end justify-between h-full gap-2">
              {dailyTraffic.map(day => (
                <div key={day.day} className="flex-1 flex flex-col gap-1">
                  <div
                    className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t opacity-60"
                    style={{ height: `${(day.visitors / 2200) * 100}%` }}
                  />
                  <div
                    className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t"
                    style={{ height: `${(day.orders / 200) * 100}%` }}
                  />
                  <span className="text-xs text-gray-600 text-center">{day.day}</span>
                </div>
              ))}
            </div>
          </div>
          <div className="flex items-center justify-center gap-4 mt-2 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded opacity-60" />
              <span className="text-gray-600">Visitors</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-emerald-500 rounded" />
              <span className="text-gray-600">Orders</span>
            </div>
          </div>
        </div>

        {/* Traffic Sources */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Traffic Sources</h3>
          <DonutChart data={trafficSources} size={200} />
          <div className="mt-4 space-y-2">
            {trafficSources.map(source => (
              <div key={source.label} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: source.color }}
                  />
                  <span className="text-gray-700">{source.label}</span>
                </div>
                <span className="font-medium text-gray-900">{source.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Abandoned Carts */}
      <FeatureGate minPlan="PRO_PLUS">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <ShoppingCart size={20} className="text-pink-600" />
              Recoverable Abandoned Carts
            </h3>
            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
              PRO+ Feature
            </span>
          </div>
          
          <div className="space-y-3">
            <AbandonedCartRow
              customer="Chioma O."
              email="chioma.o@email.com"
              items={3}
              value="₦24,500"
              abandoned="2 hours ago"
              recoverable={true}
            />
            <AbandonedCartRow
              customer="Emeka A."
              email="emeka.a@email.com"
              items={2}
              value="₦18,900"
              abandoned="5 hours ago"
              recoverable={true}
            />
            <AbandonedCartRow
              customer="Guest User"
              email="not provided"
              items={5}
              value="₦45,000"
              abandoned="1 day ago"
              recoverable={false}
            />
          </div>
        </div>
      </FeatureGate>

      {/* Top Products */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package size={20} className="text-orange-600" />
            Top Selling Products
          </h3>
          <button className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm font-medium">
            View All Products
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">SKU</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Units Sold</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Revenue</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stock</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Wireless Earbuds Pro', sku: 'WEP-001', price: '₦15,900', sold: 234, revenue: '₦3,720,600', stock: 156 },
                { name: 'Smart Watch Series 5', sku: 'SWS5-002', price: '₦28,500', sold: 189, revenue: '₦5,386,500', stock: 78 },
                { name: 'Portable Charger 20000mAh', sku: 'PC20K-003', price: '₦8,900', sold: 412, revenue: '₦3,666,800', stock: 234 },
                { name: 'Bluetooth Speaker Mini', sku: 'BSM-004', price: '₦12,500', sold: 298, revenue: '₦3,725,000', stock: 145 },
              ].map((product, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{product.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-700 font-mono">{product.sku}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{product.price}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{product.sold}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{product.revenue}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      product.stock > 100 ? 'bg-green-100 text-green-800' :
                      product.stock > 50 ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {product.stock} units
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </UnifiedDashboard>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

interface FunnelStageProps {
  stage: string;
  count: number;
  percentage: number;
  color: string;
}

function FunnelStage({ stage, count, percentage, color }: FunnelStageProps) {
  return (
    <div className="relative">
      <div className="flex items-center justify-between mb-1">
        <span className="text-sm font-medium text-gray-900">{stage}</span>
        <div className="flex items-center gap-2">
          <span className="text-sm text-gray-700">{count.toLocaleString()}</span>
          <span className="text-xs font-medium text-gray-500 w-12 text-right">{percentage}%</span>
        </div>
      </div>
      <div className="w-full bg-gray-200 rounded-full h-3">
        <div
          className={`${color} h-3 rounded-full transition-all`}
          style={{ width: `${percentage}%` }}
        />
      </div>
    </div>
  );
}

interface AbandonedCartRowProps {
  customer: string;
  email: string;
  items: number;
  value: string;
  abandoned: string;
  recoverable: boolean;
}

function AbandonedCartRow({ customer, email, items, value, abandoned, recoverable }: AbandonedCartRowProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{customer}</p>
        <p className="text-sm text-gray-600 mt-0.5">{email}</p>
      </div>
      <div className="flex items-center gap-4">
        <div className="text-right">
          <p className="text-sm font-medium text-gray-900">{items} items</p>
          <p className="text-sm font-semibold text-gray-900">{value}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-600">{abandoned}</p>
          {recoverable && (
            <button className="text-xs text-blue-700 hover:text-blue-900 font-medium mt-1">
              Send Recovery →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
