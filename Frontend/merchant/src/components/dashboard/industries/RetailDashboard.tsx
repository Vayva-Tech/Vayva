"use client";

import React from 'react';
import { UnifiedDashboard } from '../UnifiedDashboard';
import { MetricCard, TasksModule, RevenueChart, OrderStatusChart, AlertsModule } from '../modules';
import { useModuleVisibility } from '@/hooks/useModuleVisibility';
import { FeatureGate } from '@/components/features/FeatureGate';
import { ShoppingCart, Package, TrendingUp, Users, AlertTriangle, CreditCard } from 'lucide-react';
import cn from 'clsx';

/**
 * Retail Dashboard - Industry-specific implementation
 * 
 * Features:
 * - POS (Point of Sale) overview and transactions
 * - Inventory level tracking
 * - Stock alerts and reorder points (PRO)
 * - Sales trends and analytics
 * - Customer loyalty programs (PRO+)
 * - Foot traffic analysis
 */
export function RetailDashboard() {
  const { isVisible: showStockAlerts, isHiddenByPlan: alertsLockedByPlan } = useModuleVisibility(
    'inventory',
    { industry: 'retail', planTier: 'STARTER', enabledFeatures: [] }
  );
  
  const { isVisible: showLoyalty, isHiddenByPlan: loyaltyLockedByPlan } = useModuleVisibility(
    'loyalty-programs',
    { industry: 'retail', planTier: 'PRO', enabledFeatures: [] }
  );
  
  const { isVisible: showPOS } = useModuleVisibility(
    'pos',
    { industry: 'retail', planTier: 'STARTER', enabledFeatures: [] }
  );
  
  return (
    <UnifiedDashboard industry="retail" planTier="PRO">
      {/* Retail-Specific Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Today's Sales"
          value="₦456,000"
          change={18}
          trend="up"
          icon={<ShoppingCart size={16} />}
        />
        <MetricCard
          label="Transactions"
          value={89}
          change={12}
          trend="up"
          icon={<CreditCard size={16} />}
        />
        <MetricCard
          label="Low Stock Items"
          value={8}
          change={-3}
          trend="up"
          icon={<Package size={16} />}
        />
        <MetricCard
          label="Foot Traffic"
          value={342}
          change={25}
          trend="up"
          icon={<Users size={16} />}
        />
      </div>
      
      {/* PRO Features: Stock Alerts */}
      <FeatureGate minPlan="PRO">
        {showStockAlerts && (
          <div className="mb-6">
            <StockAlertsSection />
          </div>
        )}
      </FeatureGate>
      
      {/* Locked Feature Prompt */}
      {alertsLockedByPlan && (
        <div className="mb-6 p-6 bg-gradient-to-br from-orange-50 to-red-50 rounded-2xl border border-orange-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unlock Advanced Inventory Alerts
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Get automated low stock notifications, reorder point suggestions, and supplier integration
          </p>
          <a
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-orange-500 text-white hover:bg-orange-600 transition-colors text-sm font-medium"
          >
            Upgrade to PRO
          </a>
        </div>
      )}
      
      {/* POS Overview */}
      {showPOS && (
        <div className="mb-6">
          <POSOverviewSection />
        </div>
      )}
      
      {/* Retail Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart
          data={[
            { date: 'Mon', value: 385000 },
            { date: 'Tue', value: 412000 },
            { date: 'Wed', value: 378000 },
            { date: 'Thu', value: 489000 },
            { date: 'Fri', value: 567000 },
            { date: 'Sat', value: 623000 },
            { date: 'Sun', value: 498000 },
          ]}
          title="Weekly Sales"
          showTrend
        />
        
        <CategoryBreakdownChart />
      </div>
      
      {/* PRO+ Features: Customer Loyalty */}
      <FeatureGate minPlan="PRO_PLUS">
        {showLoyalty && (
          <div className="mb-6">
            <LoyaltyProgramSection />
          </div>
        )}
      </FeatureGate>
      
      {/* Loyalty Locked Prompt */}
      {loyaltyLockedByPlan && (
        <div className="mb-6 p-6 bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border border-purple-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unlock Customer Loyalty Programs
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Build customer retention with points, rewards, VIP tiers, and automated campaigns
          </p>
          <a
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-500 text-white hover:bg-purple-600 transition-colors text-sm font-medium"
          >
            Upgrade to PRO+
          </a>
        </div>
      )}
      
      {/* Retail-Specific Tasks */}
      <TasksModule
        tasks={[
          { id: '1', title: 'Restock low inventory items', completed: false, priority: 'high' },
          { id: '2', title: 'Update product displays', completed: false, priority: 'medium' },
          { id: '3', title: 'Review daily sales report', completed: false, priority: 'medium' },
          { id: '4', title: 'Process new shipments', completed: true, priority: 'low' },
          { id: '5', title: 'Price tag updates', completed: false, priority: 'low' },
        ]}
      />
      
      {/* Retail Alerts */}
      <AlertsModule
        alerts={[
          {
            id: 'stock-1',
            type: 'warning',
            title: 'Low Stock Alert',
            message: 'Rice (50kg bags) running low (12 bags remaining)',
            action: { label: 'Reorder now', href: '/dashboard/products/restock' },
          },
          {
            id: 'expiring-1',
            type: 'error',
            title: 'Products Expiring Soon',
            message: '5 products expire within 7 days - check inventory',
            action: { label: 'View products', onClick: () => console.log('View expiring') },
          },
          {
            id: 'target-1',
            type: 'success',
            title: 'Daily Target Achieved! 🎯',
            message: 'Congratulations! You\'ve exceeded today\'s sales target by 15%',
          },
        ]}
      />
    </UnifiedDashboard>
  );
}

// ============================================================================
// Retail-Specific Sub-Components
// ============================================================================

function POSOverviewSection() {
  const transactions = [
    { time: '10:23 AM', items: 5, total: '₦23,500', payment: 'Card', cashier: 'Ada' },
    { time: '10:45 AM', items: 3, total: '₦18,200', payment: 'Cash', cashier: 'Bose' },
    { time: '11:12 AM', items: 8, total: '₦45,800', payment: 'Transfer', cashier: 'Ada' },
    { time: '11:34 AM', items: 2, total: '₦12,000', payment: 'Card', cashier: 'Chidi' },
    { time: '12:05 PM', items: 6, total: '₦34,500', payment: 'Cash', cashier: 'Bose' },
  ];
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <CreditCard size={20} className="text-green-500" />
          POS Transactions Today
        </h3>
        <div className="flex items-center gap-2">
          <a href="/dashboard/pos" className="text-sm text-green-600 hover:text-green-700 font-medium">
            View all transactions
          </a>
          <button className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-medium">
            <span>New Sale</span>
          </button>
        </div>
      </div>
      
      <div className="space-y-3">
        {transactions.map((txn, idx) => (
          <TransactionRow key={idx} {...txn} />
        ))}
      </div>
    </div>
  );
}

function TransactionRow({
  time,
  items,
  total,
  payment,
  cashier,
}: {
  time: string;
  items: number;
  total: string;
  payment: string;
  cashier: string;
}) {
  const paymentColors: Record<string, string> = {
    Card: 'bg-blue-50 text-blue-700',
    Cash: 'bg-green-50 text-green-700',
    Transfer: 'bg-purple-50 text-purple-700',
  };
  
  return (
    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-xl border border-gray-200 hover:border-green-300 transition-colors">
      <div className="text-center min-w-[70px]">
        <div className="text-sm font-bold text-gray-900">{time}</div>
      </div>
      
      <div className="w-1 h-12 bg-green-500 rounded-full" />
      
      <div className="flex-1">
        <div className="font-semibold text-gray-900">{items} items</div>
        <div className="text-sm text-gray-600">Cashier: {cashier}</div>
      </div>
      
      <div className={cn(
        'px-3 py-1.5 rounded-lg text-xs font-medium',
        paymentColors[payment] || 'bg-gray-100 text-gray-700'
      )}>
        {payment}
      </div>
      
      <div className="text-right">
        <div className="font-bold text-gray-900">{total}</div>
      </div>
      
      <div className="flex items-center gap-2">
        <button className="p-2 rounded-lg hover:bg-white transition-colors" title="View Details">
          <ShoppingCart size={16} className="text-gray-400" />
        </button>
        <button className="p-2 rounded-lg hover:bg-blue-50 transition-colors" title="Print Receipt">
          <CreditCard size={16} className="text-blue-600" />
        </button>
      </div>
    </div>
  );
}

function StockAlertsSection() {
  const lowStockItems = [
    { name: 'Rice (50kg bag)', current: 12, min: 20, status: 'critical' },
    { name: 'Vegetable Oil (5L)', current: 8, min: 15, status: 'critical' },
    { name: 'Tomato Paste', current: 25, min: 30, status: 'low' },
    { name: 'Indomie Noodles', current: 45, min: 50, status: 'low' },
  ];
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <AlertTriangle size={20} className="text-orange-500" />
          Stock Alerts
        </h3>
        <a href="/dashboard/inventory" className="text-sm text-orange-600 hover:text-orange-700 font-medium">
          Manage inventory
        </a>
      </div>
      
      <div className="space-y-3">
        {lowStockItems.map((item, idx) => (
          <StockAlertRow key={idx} {...item} />
        ))}
      </div>
    </div>
  );
}

function StockAlertRow({
  name,
  current,
  min,
  status,
}: {
  name: string;
  current: number;
  min: number;
  status: 'critical' | 'low';
}) {
  const percentage = (current / min) * 100;
  
  return (
    <div className="border border-gray-200 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        <div className="font-semibold text-gray-900">{name}</div>
        <div className={cn(
          'px-2 py-1 rounded-lg text-xs font-medium',
          status === 'critical' ? 'bg-red-50 text-red-700' : 'bg-amber-50 text-amber-700'
        )}>
          {status.toUpperCase()}
        </div>
      </div>
      
      <div className="flex items-center gap-4 mb-2">
        <div className="text-sm text-gray-600">Current: <span className="font-semibold">{current}</span></div>
        <div className="text-sm text-gray-600">Min: <span className="font-semibold">{min}</span></div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={cn(
            'h-2 rounded-full transition-all',
            status === 'critical' ? 'bg-red-500' : 'bg-amber-500'
          )}
          style={{ width: `${Math.min(percentage, 100)}%` }}
        />
      </div>
      
      <div className="mt-3 flex items-center justify-between">
        <div className="text-xs text-gray-500">
          Need to reorder: <span className="font-medium">{min - current} units</span>
        </div>
        <button className="text-xs font-medium text-blue-600 hover:text-blue-700">
          Reorder now →
        </button>
      </div>
    </div>
  );
}

function CategoryBreakdownChart() {
  const categories = [
    { label: 'Groceries', value: 45, color: '#10b981', sales: '₦205,200' },
    { label: 'Beverages', value: 25, color: '#3b82f6', sales: '₦114,000' },
    { label: 'Household', value: 20, color: '#f59e0b', sales: '₦91,200' },
    { label: 'Personal Care', value: 10, color: '#ec4899', sales: '₦45,600' },
  ];
  
  let cumulativePercent = 0;
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-5">
      <h3 className="text-sm font-semibold text-gray-900 mb-4">Sales by Category</h3>
      
      <div className="flex items-center gap-4">
        <div className="relative w-24 h-24">
          <div
            className="w-full h-full rounded-full"
            style={{
              background: `conic-gradient(${categories.map(seg => {
                const start = cumulativePercent;
                cumulativePercent += seg.value;
                return `${seg.color} ${start}% ${cumulativePercent}%`;
              }).join(', ')})`,
            }}
          />
          <div className="absolute inset-2 bg-white rounded-full" />
        </div>
        
        <div className="flex-1 space-y-2">
          {categories.map((category, idx) => (
            <div key={idx} className="flex items-center gap-2">
              <div
                className="w-3 h-3 rounded"
                style={{ backgroundColor: category.color }}
              />
              <span className="text-xs text-gray-600">{category.label}</span>
              <span className="text-xs font-semibold text-gray-900 ml-auto">
                {category.sales}
              </span>
            </div>
          ))}
        </div>
      </div>
      
      <div className="mt-4 pt-4 border-t border-gray-100 text-center">
        <span className="text-xs text-gray-500">Total Weekly Sales</span>
        <p className="text-lg font-bold text-gray-900">₦456,000</p>
      </div>
    </div>
  );
}

function LoyaltyProgramSection() {
  const topMembers = [
    { name: 'Chioma O.', points: 12450, tier: 'Platinum', visits: 28 },
    { name: 'Emeka A.', points: 9800, tier: 'Gold', visits: 22 },
    { name: 'Fatima K.', points: 7650, tier: 'Gold', visits: 18 },
    { name: 'Godwin E.', points: 5400, tier: 'Silver', visits: 14 },
  ];
  
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <Star size={20} className="text-purple-500" />
          Customer Loyalty Program
        </h3>
        <a href="/dashboard/loyalty" className="text-sm text-purple-600 hover:text-purple-700 font-medium">
          Manage program
        </a>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Top Members</h4>
          <div className="space-y-3">
            {topMembers.map((member, idx) => (
              <LoyaltyMemberRow key={idx} {...member} rank={idx + 1} />
            ))}
          </div>
        </div>
        
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-3">Program Stats</h4>
          <div className="grid grid-cols-2 gap-3">
            <LoyaltyStatCard label="Total Members" value="1,248" />
            <LoyaltyStatCard label="Active This Month" value="456" />
            <LoyaltyStatCard label="Points Redeemed" value="45.2K" />
            <LoyaltyStatCard label="Revenue from Members" value="₦2.1M" />
          </div>
        </div>
      </div>
    </div>
  );
}

function LoyaltyMemberRow({
  name,
  points,
  tier,
  visits,
  rank,
}: {
  name: string;
  points: number;
  tier: string;
  visits: number;
  rank: number;
}) {
  const tierColors: Record<string, string> = {
    Platinum: 'bg-purple-50 text-purple-700 border-purple-200',
    Gold: 'bg-amber-50 text-amber-700 border-amber-200',
    Silver: 'bg-gray-50 text-gray-700 border-gray-200',
  };
  
  return (
    <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
      <div className="w-8 h-8 rounded-full bg-purple-100 text-purple-600 flex items-center justify-center font-bold text-sm">
        {rank}
      </div>
      
      <div className="flex-1">
        <div className="font-semibold text-gray-900">{name}</div>
        <div className="text-xs text-gray-500">{visits} visits</div>
      </div>
      
      <div className="text-right">
        <div className="text-sm font-bold text-purple-600">{points.toLocaleString()}</div>
        <div className={cn(
          'text-xs px-2 py-0.5 rounded border',
          tierColors[tier]
        )}>
          {tier}
        </div>
      </div>
    </div>
  );
}

function LoyaltyStatCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="bg-purple-50 rounded-xl p-4 border border-purple-200">
      <div className="text-xs text-purple-700 mb-2">{label}</div>
      <div className="text-xl font-bold text-gray-900">{value}</div>
    </div>
  );
}

// Helper import
import { Star } from 'lucide-react';
