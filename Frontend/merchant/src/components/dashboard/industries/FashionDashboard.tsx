/**
 * Fashion Dashboard - Commerce Archetype
 * 
 * For: Clothing Boutiques, Fashion Retailers, Apparel Brands
 * 
 * Features:
 * - Seasonal collection management
 * - Size/variant tracking
 * - Trend forecasting (PRO+)
 * - Stylist recommendations
 * - Inventory turnover analytics
 */

'use client';

import { UnifiedDashboard } from '../dashboard-v2/UnifiedDashboard';
import { FeatureGate } from '../features/FeatureGate';
import { MetricsModule, MetricCard } from './modules/MetricsModule';
import { ChartsModule, DonutChart } from './modules/ChartsModule';
import { useModuleVisibility } from '@/hooks/useModuleVisibility';
import { Shirt, TrendingUp, Package, Users, Award } from 'lucide-react';

export function FashionDashboard() {
  const { isVisible: showAdvancedAnalytics } = useModuleVisibility(
    'advanced-analytics',
    { industry: 'fashion', planTier: 'PRO', enabledFeatures: [] }
  );

  // Sample data
  const seasonalSales = [
    { month: 'Jan', revenue: 1200000 },
    { month: 'Feb', revenue: 1450000 },
    { month: 'Mar', revenue: 1680000 },
    { month: 'Apr', revenue: 1520000 },
    { month: 'May', revenue: 1890000 },
    { month: 'Jun', revenue: 2100000 },
  ];

  const categoryBreakdown = [
    { label: 'Dresses', value: 30, color: '#ec4899' },
    { label: 'Tops', value: 25, color: '#8b5cf6' },
    { label: 'Bottoms', value: 20, color: '#3b82f6' },
    { label: 'Outerwear', value: 15, color: '#10b981' },
    { label: 'Accessories', value: 10, color: '#f59e0b' },
  ];

  return (
    <UnifiedDashboard industry="fashion" planTier="PRO" designCategory="commerce">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Monthly Revenue"
          value="₦2.1M"
          change={22}
          trend="up"
          icon={<TrendingUp size={16} className="text-emerald-600" />}
        />
        
        <MetricCard
          label="Units Sold"
          value="1,247"
          change={18}
          trend="up"
          icon={<Shirt size={16} className="text-pink-600" />}
        />
        
        <MetricCard
          label="Inventory Turnover"
          value="4.2x"
          change={15}
          trend="up"
          icon={<Package size={16} className="text-purple-600" />}
        />
        
        <MetricCard
          label="Return Rate"
          value="3.2%"
          change={-20}
          trend="down"
          icon={<Award size={16} className="text-orange-600" />}
        />
      </div>

      {/* New Arrivals */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Shirt size={20} className="text-pink-600" />
            New Arrivals This Week
          </h3>
          <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm font-medium">
            Add New Product
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Category</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Price</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Sizes Available</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Stock</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
              </tr>
            </thead>
            <tbody>
              {[
                { name: 'Floral Summer Dress', category: 'Dresses', price: '₦18,500', sizes: ['XS', 'S', 'M', 'L'], stock: 45, status: 'trending' },
                { name: 'High-Waist Jeans', category: 'Bottoms', price: '₦15,900', sizes: ['26', '27', '28', '29', '30'], stock: 62, status: 'new' },
                { name: 'Silk Blouse', category: 'Tops', price: '₦12,500', sizes: ['S', 'M', 'L'], stock: 38, status: 'hot' },
                { name: 'Denim Jacket', category: 'Outerwear', price: '₦22,000', sizes: ['XS', 'S', 'M', 'L', 'XL'], stock: 28, status: 'new' },
              ].map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.category}</td>
                  <td className="py-3 px-4 text-sm font-semibold text-gray-900">{item.price}</td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      {item.sizes.map(size => (
                        <span key={size} className="text-xs bg-gray-100 text-gray-700 px-2 py-1 rounded">
                          {size}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.stock}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.status === 'trending' ? 'bg-pink-100 text-pink-800' :
                      item.status === 'hot' ? 'bg-red-100 text-red-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Seasonal Sales Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-600" />
            Seasonal Collection Performance
          </h3>
          <div className="h-64">
            <div className="flex items-end justify-between h-full gap-2">
              {seasonalSales.map(month => (
                <div key={month.month} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-pink-500 to-pink-400 rounded-t-lg transition-all hover:from-pink-600 hover:to-pink-500"
                    style={{ height: `${(month.revenue / 2200000) * 100}%` }}
                  />
                  <span className="text-xs text-gray-600">{month.month}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Category Breakdown */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
          <DonutChart data={categoryBreakdown} size={200} />
          <div className="mt-4 space-y-2">
            {categoryBreakdown.map(category => (
              <div key={category.label} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  <span className="text-gray-700">{category.label}</span>
                </div>
                <span className="font-medium text-gray-900">{category.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Size Analytics */}
      <FeatureGate minPlan="PRO_PLUS">
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Users size={20} className="text-purple-600" />
              Size Distribution Analytics
            </h3>
            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
              PRO+ Feature
            </span>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <SizeDistribution category="Dresses" mostPopular="M" distribution={[10, 25, 35, 25, 5]} />
            <SizeDistribution category="Tops" mostPopular="S" distribution={[15, 35, 30, 15, 5]} />
            <SizeDistribution category="Bottoms" mostPopular="M" distribution={[8, 20, 32, 28, 12]} />
            <SizeDistribution category="Outerwear" mostPopular="L" distribution={[12, 28, 30, 22, 8]} />
          </div>
        </div>
      </FeatureGate>

      {/* Low Stock Alerts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package size={20} className="text-orange-600" />
            Low Stock Alerts
          </h3>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
            Reorder Inventory
          </button>
        </div>
        
        <div className="space-y-3">
          <LowStockAlert
            product="Little Black Dress"
            variant="Size M"
            currentStock={3}
            minStock={10}
            sku="LBD-M-001"
          />
          <LowStockAlert
            product="Skinny Jeans - Dark Wash"
            variant="Size 27"
            currentStock={5}
            minStock={15}
            sku="SJ-DW-27"
          />
          <LowStockAlert
            product="Cashmere Sweater"
            variant="Size S"
            currentStock={7}
            minStock={12}
            sku="CS-S-002"
          />
        </div>
      </div>
    </UnifiedDashboard>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

interface SizeDistributionProps {
  category: string;
  mostPopular: string;
  distribution: number[];
}

function SizeDistribution({ category, mostPopular, distribution }: SizeDistributionProps) {
  const sizes = ['XS', 'S', 'M', 'L', 'XL'];
  const max = Math.max(...distribution);
  
  return (
    <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-4 border border-purple-200">
      <h4 className="font-semibold text-gray-900 mb-2">{category}</h4>
      <p className="text-xs text-gray-600 mb-3">Most Popular: <span className="font-bold text-purple-700">{mostPopular}</span></p>
      
      <div className="flex items-end justify-between gap-1 h-20">
        {sizes.map((size, idx) => (
          <div key={size} className="flex-1 flex flex-col items-center gap-1">
            <div
              className="w-full bg-gradient-to-t from-purple-500 to-purple-400 rounded-t transition-all hover:from-purple-600 hover:to-purple-500"
              style={{ height: `${(distribution[idx] / max) * 100}%` }}
            />
            <span className="text-xs text-gray-600">{size}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

interface LowStockAlertProps {
  product: string;
  variant: string;
  currentStock: number;
  minStock: number;
  sku: string;
}

function LowStockAlert({ product, variant, currentStock, minStock, sku }: LowStockAlertProps) {
  const percentage = Math.round((currentStock / minStock) * 100);
  const isCritical = currentStock <= 5;
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${
      isCritical ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{product}</p>
        <p className="text-sm text-gray-600 mt-0.5">
          {variant} • SKU: <span className="font-mono">{sku}</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">{currentStock} units</p>
          <p className="text-xs text-gray-600">Min: {minStock}</p>
        </div>
        <button className="text-sm text-emerald-700 hover:text-emerald-900 font-medium">
          Reorder →
        </button>
      </div>
    </div>
  );
}
