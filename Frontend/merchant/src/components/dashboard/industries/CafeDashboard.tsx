/**
 * Cafe Dashboard - Food & Beverage Archetype
 * 
 * For: Coffee Shops, Tea Houses, Quick Service Cafes
 * 
 * Features:
 * - Quick order processing
 * - Table management (PRO)
 * - Menu customization
 * - Loyalty program (PRO+)
 * - Peak hours analytics
 */

'use client';

import { UnifiedDashboard } from '../dashboard-v2/UnifiedDashboard';
import { FeatureGate } from '../features/FeatureGate';
import { MetricsModule, MetricCard } from './modules/MetricsModule';
import { ChartsModule, DonutChart } from './modules/ChartsModule';
import { useModuleVisibility } from '@/hooks/useModuleVisibility';
import { Coffee, TrendingUp, Users, Clock, Award } from 'lucide-react';

export function CafeDashboard() {
  const { isVisible: showTables, isHiddenByPlan: tablesLocked } = useModuleVisibility(
    'tables',
    { industry: 'cafe', planTier: 'PRO', enabledFeatures: [] }
  );

  // Sample data
  const dailySales = [
    { time: '7AM', value: 45000 },
    { time: '9AM', value: 128000 },
    { time: '11AM', value: 89000 },
    { time: '1PM', value: 67000 },
    { time: '3PM', value: 78000 },
    { time: '5PM', value: 92000 },
    { time: '7PM', value: 56000 },
  ];

  const productMix = [
    { label: 'Espresso Drinks', value: 40, color: '#78350f' },
    { label: 'Specialty Coffee', value: 25, color: '#92400e' },
    { label: 'Pastries', value: 20, color: '#f59e0b' },
    { label: 'Tea/Other', value: 10, color: '#10b981' },
    { label: 'Sandwiches', value: 5, color: '#3b82f6' },
  ];

  return (
    <UnifiedDashboard industry="cafe" planTier="PRO" designCategory="food_beverage">
      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Today's Revenue"
          value="₦555,000"
          change={12}
          trend="up"
          icon={<TrendingUp size={16} className="text-emerald-600" />}
        />
        
        <MetricCard
          label="Total Orders"
          value="342"
          change={18}
          trend="up"
          icon={<Coffee size={16} className="text-amber-600" />}
        />
        
        <MetricCard
          label="Avg Ticket Size"
          value="₦1,623"
          change={5}
          trend="up"
          icon={<Users size={16} className="text-purple-600" />}
        />
        
        <MetricCard
          label="Peak Hour Traffic"
          value="9AM"
          change={0}
          trend="stable"
          icon={<Clock size={16} className="text-orange-600" />}
        />
      </div>

      {/* Table Management */}
      <FeatureGate minPlan="PRO">
        {showTables && (
          <div className="mb-6">
            <TableManagementSection />
          </div>
        )}
        {tablesLocked && (
          <div className="mb-6 p-6 bg-gradient-to-br from-amber-50 to-orange-50 rounded-2xl border-2 border-dashed border-amber-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              ☕ Unlock Table Management
            </h3>
            <p className="text-gray-600 mb-4">
              Get floor plan visualization, table status tracking, and turnover analytics with PRO plan
            </p>
            <a
              href="/dashboard/billing"
              className="inline-flex items-center px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
            >
              Upgrade to PRO →
            </a>
          </div>
        )}
      </FeatureGate>

      {/* Two Column Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Hourly Sales Trend */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp size={20} className="text-amber-600" />
            Hourly Sales Pattern
          </h3>
          <div className="h-64">
            <div className="flex items-end justify-between h-full gap-2">
              {dailySales.map(slot => (
                <div key={slot.time} className="flex-1 flex flex-col items-center gap-2">
                  <div
                    className="w-full bg-gradient-to-t from-amber-500 to-amber-400 rounded-t-lg transition-all hover:from-amber-600 hover:to-amber-500"
                    style={{ height: `${(slot.value / 140000) * 100}%` }}
                  />
                  <span className="text-xs text-gray-600">{slot.time}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Product Mix */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Sales by Category</h3>
          <DonutChart data={productMix} size={200} />
          <div className="mt-4 space-y-2">
            {productMix.map(product => (
              <div key={product.label} className="flex justify-between items-center text-sm">
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: product.color }}
                  />
                  <span className="text-gray-700">{product.label}</span>
                </div>
                <span className="font-medium text-gray-900">{product.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Queue/Order Status */}
      <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
            <Coffee size={20} className="text-amber-600" />
            Current Orders in Queue
          </h3>
          <button className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm font-medium">
            New Order
          </button>
        </div>
        
        <div className="space-y-3">
          <OrderTicket
            orderNumber="142"
            items={['2x Cappuccino', '1x Croissant']}
            type='dine-in'
            timeAgo={2}
            status='preparing'
          />
          <OrderTicket
            orderNumber="143"
            items={['1x Latte', '1x Muffin', '1x Espresso']}
            type='takeaway'
            timeAgo={5}
            status='ready'
          />
          <OrderTicket
            orderNumber="144"
            items={['3x Americano', '2x Sandwich']}
            type='delivery'
            timeAgo={8}
            status='pending'
          />
        </div>
      </div>

      {/* Loyalty Program */}
      <FeatureGate minPlan="PRO_PLUS">
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Award size={20} className="text-purple-600" />
              Top Loyalty Members
            </h3>
            <span className="text-xs font-medium text-purple-700 bg-purple-100 px-2 py-1 rounded-full">
              PRO+ Feature
            </span>
          </div>
          
          <div className="space-y-3">
            <LoyaltyMemberRow
              rank={1}
              name="Chioma O."
              points={2450}
              visits={48}
              favorite="Cappuccino"
            />
            <LoyaltyMemberRow
              rank={2}
              name="Emeka A."
              points={2180}
              visits={42}
              favorite="Latte"
            />
            <LoyaltyMemberRow
              rank={3}
              name="Blessing N."
              points={1920}
              visits={38}
              favorite="Americano"
            />
          </div>
        </div>
      </FeatureGate>
    </UnifiedDashboard>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// Sub-components
// ──────────────────────────────────────────────────────────────────────────

function TableManagementSection() {
  const tables = [
    { number: 1, status: 'occupied', party: 2, duration: 25 },
    { number: 2, status: 'available', party: null, duration: null },
    { number: 3, status: 'occupied', party: 4, duration: 45 },
    { number: 4, status: 'reserved', party: 3, duration: null },
    { number: 5, status: 'occupied', party: 2, duration: 15 },
    { number: 6, status: 'available', party: null, duration: null },
  ];

  const statusColors = {
    available: 'bg-green-100 border-green-300',
    occupied: 'bg-red-100 border-red-300',
    reserved: 'bg-yellow-100 border-yellow-300',
  };

  const statusBadges = {
    available: 'bg-green-600',
    occupied: 'bg-red-600',
    reserved: 'bg-yellow-600',
  };

  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-900">Floor Plan</h3>
        <div className="flex gap-2 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-green-600 rounded-full" />
            <span>Available</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-red-600 rounded-full" />
            <span>Occupied</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 bg-yellow-600 rounded-full" />
            <span>Reserved</span>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        {tables.map(table => (
          <div
            key={table.number}
            className={`aspect-square rounded-lg border-2 flex flex-col items-center justify-center ${statusColors[table.status]}`}
          >
            <div className={`w-8 h-8 rounded-full ${statusBadges[table.status]} mb-2`} />
            <p className="font-bold text-gray-900">Table {table.number}</p>
            {table.party && (
              <p className="text-xs text-gray-600 mt-1">{table.party} guests</p>
            )}
            {table.duration && (
              <p className="text-xs text-gray-500">{table.duration} min</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

interface OrderTicketProps {
  orderNumber: string;
  items: string[];
  type: 'dine-in' | 'takeaway' | 'delivery';
  timeAgo: number;
  status: 'pending' | 'preparing' | 'ready';
}

function OrderTicket({ orderNumber, items, type, timeAgo, status }: OrderTicketProps) {
  const statusColors = {
    pending: 'bg-yellow-100 text-yellow-800',
    preparing: 'bg-blue-100 text-blue-800',
    ready: 'bg-green-100 text-green-800',
  };

  const typeBadges = {
    'dine-in': 'bg-amber-100 text-amber-800',
    takeaway: 'bg-purple-100 text-purple-800',
    delivery: 'bg-blue-100 text-blue-800',
  };

  return (
    <div className="border border-gray-200 rounded-lg p-4 hover:border-amber-300 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <div>
          <p className="font-semibold text-gray-900">Order #{orderNumber}</p>
          <p className="text-xs text-gray-500 mt-0.5">{timeAgo}m ago</p>
        </div>
        <div className="flex gap-2">
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${typeBadges[type]}`}>
            {type.replace('-', ' ').toUpperCase()}
          </span>
          <span className={`text-xs font-medium px-2 py-1 rounded-full ${statusColors[status]}`}>
            {status.toUpperCase()}
          </span>
        </div>
      </div>
      
      <ul className="space-y-1">
        {items.map((item, idx) => (
          <li key={idx} className="text-sm text-gray-700">• {item}</li>
        ))}
      </ul>
    </div>
  );
}

interface LoyaltyMemberRowProps {
  rank: number;
  name: string;
  points: number;
  visits: number;
  favorite: string;
}

function LoyaltyMemberRow({ rank, name, points, visits, favorite }: LoyaltyMemberRowProps) {
  return (
    <div className="flex items-center justify-between p-3 bg-gradient-to-r from-purple-50 to-amber-50 rounded-lg border border-purple-200">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
          {rank}
        </div>
        <div>
          <p className="font-medium text-gray-900">{name}</p>
          <p className="text-xs text-gray-600">{visits} visits • Favorite: {favorite}</p>
        </div>
      </div>
      <div className="text-right">
        <p className="font-bold text-purple-700">{points.toLocaleString()}</p>
        <p className="text-xs text-gray-600">points</p>
      </div>
    </div>
  );
}
