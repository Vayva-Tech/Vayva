/**
 * Bakery Dashboard - Food & Beverage Archetype
 * 
 * For: Bakeries, Patisseries, Cake Shops
 * 
 * Features:
 * - Custom order management
 * - Production scheduling
 * - Recipe costing
 * - Ingredient inventory
 * - Wedding/event cake bookings (PRO+)
 */

'use client';

import { UnifiedDashboard } from '../dashboard-v2/UnifiedDashboard';
import { FeatureGate } from '../features/FeatureGate';
import { MetricsModule, MetricCard } from './modules/MetricsModule';
import { ChartsModule, DonutChart } from './modules/ChartsModule';
import { useModuleVisibility } from '@/hooks/useModuleVisibility';
import { Cake, TrendingUp, Calendar, Package, Clock } from 'lucide-react';

export function BakeryDashboard() {
  const { isVisible: showAdvancedOrders } = useModuleVisibility(
    'advanced-analytics',
    { industry: 'bakery', planTier: 'PRO', enabledFeatures: [] }
  );

  // Sample data
  const weeklySales = [
    { day: 'Mon', value: 180000 },
    { day: 'Tue', value: 220000 },
    { day: 'Wed', value: 195000 },
    { day: 'Thu', value: 280000 },
    { day: 'Fri', value: 340000 },
    { day: 'Sat', value: 420000 },
    { day: 'Sun', value: 310000 },
  ];

  const productCategories = [
    { label: 'Custom Cakes', value: 35, color: '#ec4899' },
    { label: 'Bread', value: 25, color: '#f59e0b' },
    { label: 'Pastries', value: 20, color: '#8b5cf6' },
    { label: 'Cookies', value: 12, color: '#10b981' },
    { label: 'Cupcakes', value: 8, color: '#3b82f6' },
  ];

  return (
    <UnifiedDashboard industry="bakery" planTier="PRO" designCategory="food_beverage">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Weekly Revenue"
          value="₦1.95M"
          change={18}
          trend="up"
          icon={<TrendingUp size={16} className="text-emerald-600" />}
        />
        
        <MetricCard
          label="Custom Orders"
          value="34"
          change={12}
          trend="up"
          icon={<Cake size={16} className="text-pink-600" />}
        />
        
        <MetricCard
          label="Production Efficiency"
          value="94%"
          change={3}
          trend="up"
          icon={<Clock size={16} className="text-purple-600" />}
        />
        
        <MetricCard
          label="Ingredient Waste"
          value="2.1%"
          change={-15}
          trend="down"
          icon={<Package size={16} className="text-orange-600" />}
        />
      </div>

      {/* Production Schedule */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Calendar size={20} className="text-blue-600" />
            Today's Production Schedule
          </h3>
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium">
            Add Production Run
          </button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200">
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Product</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Quantity</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Type</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Status</th>
                <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Baker</th>
              </tr>
            </thead>
            <tbody>
              {[
                { time: '5:00 AM', product: 'Sourdough Bread', quantity: 48, type: 'Daily Batch', status: 'completed', baker: 'Emeka' },
                { time: '7:00 AM', product: 'Croissants', quantity: 36, type: 'Daily Batch', status: 'in-progress', baker: 'Bola' },
                { time: '9:00 AM', product: 'Wedding Cake (3-tier)', quantity: 1, type: 'Custom Order', status: 'in-progress', baker: 'Ngozi' },
                { time: '11:00 AM', product: 'Chocolate Cupcakes', quantity: 24, type: 'Pre-order', status: 'pending', baker: 'Tunde' },
                { time: '2:00 PM', product: 'Assorted Pastries', quantity: 60, type: 'Daily Batch', status: 'pending', baker: 'Chidi' },
              ].map((item, idx) => (
                <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-3 px-4 text-sm font-medium text-gray-900">{item.time}</td>
                  <td className="py-3 px-4 text-sm text-gray-900">{item.product}</td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.quantity}</td>
                  <td className="py-3 px-4">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      item.type === 'Custom Order' ? 'bg-pink-100 text-pink-800' :
                      item.type === 'Pre-order' ? 'bg-purple-100 text-purple-800' :
                      'bg-blue-100 text-blue-800'
                    }`}>
                      {item.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <StatusBadge status={item.status} />
                  </td>
                  <td className="py-3 px-4 text-sm text-gray-700">{item.baker}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Weekly Sales Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-emerald-600" />
            Weekly Sales Pattern
          </h3>
          <div className="h-64">
            <div className="flex items-end justify-between h-full gap-2">
              {weeklySales.map(day => (
                <div key={day.day} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-pink-500 to-pink-400 rounded-t-lg transition-all hover:from-pink-600 hover:to-pink-500"
                    style={{ height: `${(day.value / 450000) * 100}%` }}
                  />
                  <span className="text-xs text-gray-600">{day.day}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Categories */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Revenue by Category</h3>
          <DonutChart data={productCategories} size={200} />
          <div className="mt-4 space-y-2">
            {productCategories.map(category => (
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

      {/* Custom Orders Pipeline */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Cake size={20} className="text-pink-600" />
            Active Custom Orders
          </h3>
          <button className="px-4 py-2 bg-pink-600 text-white rounded-lg hover:bg-pink-700 text-sm font-medium">
            New Custom Order
          </button>
        </div>
        
        <div className="space-y-3">
          <CustomOrderCard
            orderNumber="CK-2026-089"
            customer="Mrs. Adeleke"
            product="5-Tier Wedding Cake"
            eventDate="April 20, 2026"
            progress={60}
            deposit={true}
            notes="Ivory fondant, sugar flowers"
          />
          <CustomOrderCard
            orderNumber="CK-2026-090"
            customer="TechStart Ltd"
            product="Corporate Event Cupcakes (100pcs)"
            eventDate="April 5, 2026"
            progress={30}
            deposit={true}
            notes="Company logo toppers"
          />
          <CustomOrderCard
            orderNumber="CK-2026-091"
            customer="Chioma O."
            product="Birthday Cake (2-tier)"
            eventDate="March 30, 2026"
            progress={85}
            deposit={false}
            notes="Spiderman theme"
          />
        </div>
      </div>

      {/* Inventory Alerts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Package size={20} className="text-orange-600" />
            Ingredient Inventory
          </h3>
          <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
            Order Supplies
          </button>
        </div>
        
        <div className="space-y-3">
          <InventoryAlert
            ingredient="Premium Flour (50kg bag)"
            currentStock={2)
            minStock={5}
            unit="bags"
            status="critical"
          />
          <InventoryAlert
            ingredient="Butter (Unsalted)"
            currentStock={15}
            minStock={25}
            unit="kg"
            status="low"
          />
          <InventoryAlert
            ingredient="Dark Chocolate Chips"
            currentStock={8}
            minStock={12}
            unit="kg"
            status="low"
          />
        </div>
      </div>
    </UnifiedDashboard>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

interface StatusBadgeProps {
  status: 'pending' | 'in-progress' | 'completed' | 'delayed';
}

function StatusBadge({ status }: StatusBadgeProps) {
  const colors = {
    pending: 'bg-yellow-100 text-yellow-800',
    'in-progress': 'bg-blue-100 text-blue-800',
    completed: 'bg-green-100 text-green-800',
    delayed: 'bg-red-100 text-red-800',
  };

  return (
    <span className={`text-xs font-medium px-2 py-1 rounded-full ${colors[status]}`}>
      {status.replace('-', ' ').toUpperCase()}
    </span>
  );
}

interface CustomOrderCardProps {
  orderNumber: string;
  customer: string;
  product: string;
  eventDate: string;
  progress: number;
  deposit: boolean;
  notes: string;
}

function CustomOrderCard({ orderNumber, customer, product, eventDate, progress, deposit, notes }: CustomOrderCardProps) {
  return (
    <div className="border border-pink-200 rounded-lg p-4 hover:border-pink-300 transition-colors bg-gradient-to-r from-pink-50 to-white">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-gray-900">{orderNumber}</p>
          <p className="text-sm text-gray-700 mt-0.5">{customer}</p>
        </div>
        <div className="text-right">
          <p className="text-xs font-medium text-pink-700 bg-pink-100 px-2 py-1 rounded">
            {deposit ? 'Deposit Paid ✓' : 'Deposit Pending'}
          </p>
          <p className="text-xs text-gray-600 mt-1">Event: {eventDate}</p>
        </div>
      </div>
      
      <p className="text-sm font-medium text-gray-900 mb-2">{product}</p>
      <p className="text-xs text-gray-600 mb-3">{notes}</p>
      
      <div className="flex items-center gap-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className="bg-pink-500 h-2 rounded-full transition-all"
            style={{ width: `${progress}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-700">{progress}%</span>
      </div>
    </div>
  );
}

interface InventoryAlertProps {
  ingredient: string;
  currentStock: number;
  minStock: number;
  unit: string;
  status: 'critical' | 'low';
}

function InventoryAlert({ ingredient, currentStock, minStock, unit, status }: InventoryAlertProps) {
  const percentage = Math.round((currentStock / minStock) * 100);
  
  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${
      status === 'critical' ? 'bg-red-50 border-red-200' : 'bg-yellow-50 border-yellow-200'
    }`}>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{ingredient}</p>
        <p className="text-sm text-gray-600 mt-0.5">
          Current: <span className="font-semibold">{currentStock} {unit}</span> • 
          Min: <span className="font-semibold">{minStock} {unit}</span>
        </p>
      </div>
      <div className="flex items-center gap-3">
        <div className="text-right">
          <p className="text-sm font-semibold text-gray-900">{percentage}%</p>
          <p className="text-xs text-gray-600">of minimum</p>
        </div>
        <button className="text-sm text-emerald-700 hover:text-emerald-900 font-medium">
          Reorder →
        </button>
      </div>
    </div>
  );
}
