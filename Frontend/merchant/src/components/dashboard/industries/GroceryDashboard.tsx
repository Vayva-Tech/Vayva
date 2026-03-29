/**
 * Grocery Dashboard - Commerce Archetype
 * 
 * Features:
 * - POS with barcode scanning
 * - Fresh produce inventory tracking
 * - Expiry date alerts
 * - Weekly specials management
 */

'use client';

import { UnifiedDashboard } from '../dashboard-v2/UnifiedDashboard';
import { FeatureGate } from '../features/FeatureGate';
import { MetricsModule, MetricCard } from './modules/MetricsModule';
import { TasksModule } from './modules/TasksModule';
import { ChartsModule, DonutChart } from './modules/ChartsModule';
import { AlertsModule } from './modules/AlertsModule';
import { useModuleVisibility } from '@/hooks/useModuleVisibility';
import { ShoppingCart, TrendingUp, AlertTriangle, Package, Clock } from 'lucide-react';

export function GroceryDashboard() {
  const { isVisible: showPOS, isHiddenByPlan: posLocked } = useModuleVisibility(
    'pos',
    { industry: 'grocery', planTier: 'PRO', enabledFeatures: [] }
  );

  // Sample data - replace with real API calls
  const dailySalesData = [
    { date: 'Mon', value: 450000 },
    { date: 'Tue', value: 520000 },
    { date: 'Wed', value: 380000 },
    { date: 'Thu', value: 610000 },
    { date: 'Fri', value: 720000 },
    { date: 'Sat', value: 890000 },
    { date: 'Sun', value: 680000 },
  ];

  const categoryBreakdown = [
    { label: 'Produce', value: 35, color: '#10b981' },
    { label: 'Dairy', value: 25, color: '#3b82f6' },
    { label: 'Meat', value: 20, color: '#ef4444' },
    { label: 'Bakery', value: 12, color: '#f59e0b' },
    { label: 'Other', value: 8, color: '#6b7280' },
  ];

  return (
    <UnifiedDashboard industry="grocery" planTier="PRO" designCategory="commerce">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Daily Revenue"
          value="₦425,000"
          change={12}
          trend="up"
          icon={<TrendingUp size={16} className="text-emerald-600" />}
        />
        
        <MetricCard
          label="Transactions"
          value="156"
          change={8}
          trend="up"
          icon={<ShoppingCart size={16} className="text-blue-600" />}
        />
        
        <MetricCard
          label="Avg Basket Size"
          value="₦2,724"
          change={3}
          trend="up"
          icon={<Package size={16} className="text-purple-600" />}
        />
        
        <MetricCard
          label="Items Expiring Soon"
          value="23"
          change={-15}
          trend="down"
          icon={<AlertTriangle size={16} className="text-red-600" />}
        />
      </div>

      {/* POS Section */}
      <FeatureGate minPlan="PRO_PLUS">
        {showPOS && (
          <div className="mb-6">
            <POSSection />
          </div>
        )}
        {posLocked && (
          <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border-2 border-dashed border-emerald-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              🛒 Unlock Advanced POS Features
            </h3>
            <p className="text-gray-600 mb-4">
              Get barcode scanning, receipt printing, and offline mode with PRO+ plan
            </p>
            <a
              href="/dashboard/billing"
              className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
            >
              Upgrade to PRO+
            </a>
          </div>
        )}
      </FeatureGate>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Category Performance */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
          <DonutChart data={categoryBreakdown} size={200} />
          <div className="mt-4 space-y-2">
            {categoryBreakdown.map(cat => (
              <div key={cat.label} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: cat.color }}
                  />
                  <span className="text-gray-700">{cat.label}</span>
                </div>
                <span className="font-medium text-gray-900">{cat.value}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Weekly Specials */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Specials</h3>
          <div className="space-y-3">
            <SpecialItem
              product="Tomatoes (per kg)"
              originalPrice="₦800"
              salePrice="₦600"
              discount={25}
              expires="3 days"
            />
            <SpecialItem
              product="Milk (1L)"
              originalPrice="₦1,200"
              salePrice="₦950"
              discount={21}
              expires="5 days"
            />
            <SpecialItem
              product="Bread (Loaf)"
              originalPrice="₦500"
              salePrice="₦400"
              discount={20}
              expires="2 days"
            />
          </div>
        </div>
      </div>

      {/* Expiry Alerts */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
          <AlertTriangle size={20} className="text-red-600" />
          Expiry Alerts
        </h3>
        <div className="space-y-3">
          <ExpiryAlert
            product="Yogurt (Brand A)"
            quantity={24}
            unit="cups"
            expires="Tomorrow"
            urgency="critical"
          />
          <ExpiryAlert
            product="Fresh Milk"
            quantity={15}
            unit="bottles"
            expires="2 days"
            urgency="high"
          />
          <ExpiryAlert
            product="Cheese Slices"
            quantity={8}
            unit="packs"
            expires="5 days"
            urgency="medium"
          />
        </div>
      </div>

      {/* Sales Chart */}
      <div className="bg-white rounded-2xl p-6 shadow-sm">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Weekly Sales Trend</h3>
        <div className="h-64">
          {/* Replace with actual chart component */}
          <div className="flex items-end justify-between h-full gap-2">
            {dailySalesData.map(day => (
              <div key={day.date} className="flex-1 flex flex-col items-center gap-2">
                <div
                  className="w-full bg-gradient-to-t from-emerald-500 to-emerald-400 rounded-t-lg transition-all hover:from-emerald-600 hover:to-emerald-500"
                  style={{ height: `${(day.value / 900000) * 100}%` }}
                />
                <span className="text-xs text-gray-600">{day.date}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </UnifiedDashboard>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

function POSSection() {
  const transactions = [
    { time: '10:23 AM', items: 12, total: '₦8,450', payment: 'Card', cashier: 'Ada' },
    { time: '10:45 AM', items: 5, total: '₦3,200', payment: 'Cash', cashier: 'Bose' },
    { time: '11:02 AM', items: 8, total: '₦5,670', payment: 'Transfer', cashier: 'Ada' },
    { time: '11:15 AM', items: 15, total: '₦12,340', payment: 'Card', cashier: 'Chidi' },
  ];

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Active POS Transactions</h3>
        <button className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm font-medium">
          New Sale
        </button>
      </div>
      
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Time</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Items</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Total</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Payment</th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">Cashier</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((txn, idx) => (
              <tr key={idx} className="border-b border-gray-100 hover:bg-gray-50">
                <td className="py-3 px-4 text-sm text-gray-900">{txn.time}</td>
                <td className="py-3 px-4 text-sm text-gray-700">{txn.items}</td>
                <td className="py-3 px-4 text-sm font-medium text-gray-900">₦{txn.total.replace('₦', '')}</td>
                <td className="py-3 px-4">
                  <span className={`inline-flex px-2 py-1 text-xs font-medium rounded-full ${
                    txn.payment === 'Card' ? 'bg-blue-100 text-blue-800' :
                    txn.payment === 'Cash' ? 'bg-green-100 text-green-800' :
                    'bg-purple-100 text-purple-800'
                  }`}>
                    {txn.payment}
                  </span>
                </td>
                <td className="py-3 px-4 text-sm text-gray-700">{txn.cashier}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

interface SpecialItemProps {
  product: string;
  originalPrice: string;
  salePrice: string;
  discount: number;
  expires: string;
}

function SpecialItem({ product, originalPrice, salePrice, discount, expires }: SpecialItemProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-yellow-50 rounded-lg border border-orange-200">
      <div className="flex-1">
        <p className="font-medium text-gray-900">{product}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-gray-500 line-through">{originalPrice}</span>
          <span className="text-sm font-semibold text-emerald-700">{salePrice}</span>
          <span className="text-xs font-bold text-white bg-red-500 px-2 py-0.5 rounded">
            -{discount}%
          </span>
        </div>
      </div>
      <div className="flex items-center gap-1 text-orange-700">
        <Clock size={14} />
        <span className="text-xs font-medium">Expires in {expires}</span>
      </div>
    </div>
  );
}

interface ExpiryAlertProps {
  product: string;
  quantity: number;
  unit: string;
  expires: string;
  urgency: 'critical' | 'high' | 'medium';
}

function ExpiryAlert({ product, quantity, unit, expires, urgency }: ExpiryAlertProps) {
  const urgencyColors = {
    critical: 'bg-red-50 border-red-200',
    high: 'bg-orange-50 border-orange-200',
    medium: 'bg-yellow-50 border-yellow-200',
  };

  const badgeColors = {
    critical: 'bg-red-100 text-red-800',
    high: 'bg-orange-100 text-orange-800',
    medium: 'bg-yellow-100 text-yellow-800',
  };

  return (
    <div className={`flex items-center justify-between p-3 rounded-lg border ${urgencyColors[urgency]}`}>
      <div className="flex-1">
        <p className="font-medium text-gray-900">{product}</p>
        <p className="text-sm text-gray-600 mt-0.5">{quantity} {unit} in stock</p>
      </div>
      <div className="flex items-center gap-3">
        <span className={`text-xs font-medium px-2 py-1 rounded-full ${badgeColors[urgency]}`}>
          Expires {expires}
        </span>
        <button className="text-sm text-emerald-700 hover:text-emerald-900 font-medium">
          Discount →
        </button>
      </div>
    </div>
  );
}
