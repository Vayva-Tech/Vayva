"use client";

import React from 'react';
import { UnifiedDashboard } from '../UnifiedDashboard';
import { MetricCard, TasksModule, RevenueChart, OrderStatusChart, AlertsModule } from '../modules';
import { useModuleVisibility } from '@/hooks/useModuleVisibility';
import { FeatureGate } from '@/components/features/FeatureGate';
import { ChefHat, Clock, Users, TrendingUp } from 'lucide-react';

/**
 * Restaurant Dashboard - Industry-specific implementation
 * 
 * Features:
 * - KDS (Kitchen Display System) for PRO+ plans
 * - Table management and turnover metrics
 * - Reservation tracking
 * - Food safety compliance tasks
 * - Staff performance monitoring
 */
export function RestaurantDashboard() {
  const { isVisible: showKDS, isHiddenByPlan: kdsLockedByPlan } = useModuleVisibility(
    'kds',
    { industry: 'restaurant', planTier: 'PRO', enabledFeatures: [] }
  );
  
  const { isVisible: showTableMgmt } = useModuleVisibility(
    'table-management',
    { industry: 'restaurant', planTier: 'PRO', enabledFeatures: [] }
  );
  
  return (
    <UnifiedDashboard industry="restaurant" planTier="PRO">
      {/* Restaurant-Specific Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MetricCard
          label="Active Tickets"
          value={24}
          change={12}
          trend="up"
          icon={<ChefHat size={16} />}
        />
        <MetricCard
          label="Table Turnover"
          value="2.4h"
          change={-8}
          trend="down"
          icon={<Clock size={16} />}
        />
        <MetricCard
          label="Avg Ticket Size"
          value="₦12,450"
          change={15}
          trend="up"
          icon={<TrendingUp size={16} />}
        />
        <MetricCard
          label="Reservations Today"
          value={48}
          change={5}
          trend="up"
          icon={<Users size={16} />}
        />
      </div>
      
      {/* PRO+ Features: Kitchen Display System */}
      <FeatureGate minPlan="PRO_PLUS">
        {showKDS && (
          <div className="mb-6">
            <KDSSection />
          </div>
        )}
      </FeatureGate>
      
      {/* Locked Feature Prompt */}
      {kdsLockedByPlan && (
        <div className="mb-6 p-6 bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl border border-green-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Unlock Kitchen Display System
          </h3>
          <p className="text-sm text-gray-600 mb-4">
            Get real-time kitchen order tracking, station workload management, and 86 board
          </p>
          <a
            href="/dashboard/billing"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-green-500 text-white hover:bg-green-600 transition-colors text-sm font-medium"
          >
            Upgrade to PRO+
          </a>
        </div>
      )}
      
      {/* Table Management (if visible) */}
      {showTableMgmt && (
        <div className="mb-6">
          <TableManagementSection />
        </div>
      )}
      
      {/* Restaurant Revenue Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <RevenueChart
          data={[
            { date: 'Mon', value: 245000 },
            { date: 'Tue', value: 312000 },
            { date: 'Wed', value: 278000 },
            { date: 'Thu', value: 389000 },
            { date: 'Fri', value: 567000 },
            { date: 'Sat', value: 623000 },
            { date: 'Sun', value: 445000 },
          ]}
          title="Weekly Revenue"
          showTrend
        />
        
        <OrderStatusChart
          delivered={156}
          processing={23}
          pending={12}
          cancelled={5}
          title="Order Status"
        />
      </div>
      
      {/* Restaurant-Specific Tasks */}
      <TasksModule
        tasks={[
          { id: '1', title: 'Check inventory levels', completed: false, priority: 'high' },
          { id: '2', title: 'Review today\'s reservations', completed: false, priority: 'medium' },
          { id: '3', title: 'Brief kitchen staff', completed: false, priority: 'medium' },
          { id: '4', title: 'Update daily specials', completed: true, priority: 'low' },
          { id: '5', title: 'Food safety checklist', completed: false, priority: 'high' },
        ]}
      />
      
      {/* Restaurant Alerts */}
      <AlertsModule
        alerts={[
          {
            id: 'low-stock-1',
            type: 'warning',
            title: 'Low Inventory Alert',
            message: 'Tomatoes running low (3kg remaining)',
            action: { label: 'Order now', href: '/dashboard/products/restock' },
          },
          {
            id: 'reservation-1',
            type: 'info',
            title: 'Large Party Tonight',
            message: 'Reservation for 12 guests at 7:30 PM - Table 5',
          },
        ]}
      />
    </UnifiedDashboard>
  );
}

// ============================================================================
// Restaurant-Specific Sub-Components
// ============================================================================

function KDSSection() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
          <ChefHat size={20} className="text-green-500" />
          Kitchen Display System
        </h3>
        <span className="text-xs font-medium px-2 py-1 rounded-lg bg-green-50 text-green-700">
          Live Updates
        </span>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StationWorkloadCard station="Grill" orders={8} avgTime="12min" />
        <StationWorkloadCard station="Fryer" orders={5} avgTime="8min" />
        <StationWorkloadCard station="Salad" orders={3} avgTime="6min" />
      </div>
      
      <div className="mt-6 pt-6 border-t border-gray-100">
        <h4 className="text-sm font-semibold text-gray-700 mb-3">Active Orders</h4>
        <div className="space-y-2">
          <ActiveOrderRow table={5} items={['Jollof Rice', 'Grilled Chicken'], time="8m ago" priority="normal" />
          <ActiveOrderRow table={12} items=['Fried Rice', 'Beef Suya'] time="5m ago" priority="high" />
          <ActiveOrderRow table={3} items=['Egusi Soup', 'Pounded Yam'] time="3m ago" priority="urgent" />
        </div>
      </div>
    </div>
  );
}

function StationWorkloadCard({
  station,
  orders,
  avgTime,
}: {
  station: string;
  orders: number;
  avgTime: string;
}) {
  return (
    <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-sm font-semibold text-gray-700">{station}</span>
        <span className="text-xs text-gray-500">Avg: {avgTime}</span>
      </div>
      <div className="text-2xl font-bold text-gray-900">{orders}</div>
      <div className="text-xs text-gray-500">active orders</div>
    </div>
  );
}

function ActiveOrderRow({
  table,
  items,
  time,
  priority,
}: {
  table: number;
  items: string[];
  time: string;
  priority: 'normal' | 'high' | 'urgent';
}) {
  const priorityColors = {
    normal: 'border-l-gray-300',
    high: 'border-l-amber-500',
    urgent: 'border-l-red-500',
  };
  
  return (
    <div className={cn('flex items-center justify-between p-3 bg-white rounded-lg border-l-4', priorityColors[priority])}>
      <div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-gray-900">Table {table}</span>
          {priority === 'urgent' && (
            <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-red-500 text-white">
              URGENT
            </span>
          )}
        </div>
        <div className="text-xs text-gray-500 mt-0.5">{items.join(', ')}</div>
      </div>
      <span className="text-xs text-gray-400">{time}</span>
    </div>
  );
}

function TableManagementSection() {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Table Status</h3>
        <a href="/dashboard/tables" className="text-sm text-green-600 hover:text-green-700 font-medium">
          Manage tables
        </a>
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <TableStatusCard tableNumber={1} status="occupied" guests={4} duration="45m" />
        <TableStatusCard tableNumber={2} status="available" />
        <TableStatusCard tableNumber={3} status="reserved" time="7:30 PM" />
        <TableStatusCard tableNumber={4} status="occupied" guests={2} duration="20m" />
      </div>
      
      <div className="mt-6 flex items-center gap-4 text-xs">
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-green-500" />
          <span className="text-gray-600">Occupied</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-gray-200" />
          <span className="text-gray-600">Available</span>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="w-3 h-3 rounded bg-blue-500" />
          <span className="text-gray-600">Reserved</span>
        </div>
      </div>
    </div>
  );
}

function TableStatusCard({
  tableNumber,
  status,
  guests,
  duration,
  time,
}: {
  tableNumber: number;
  status: 'occupied' | 'available' | 'reserved';
  guests?: number;
  duration?: string;
  time?: string;
}) {
  const statusStyles = {
    occupied: 'bg-green-50 border-green-200',
    available: 'bg-gray-50 border-gray-200',
    reserved: 'bg-blue-50 border-blue-200',
  };
  
  return (
    <div className={cn('rounded-xl p-4 border', statusStyles[status])}>
      <div className="text-sm font-semibold text-gray-700 mb-2">Table {tableNumber}</div>
      <div className={cn(
        'text-xs font-medium px-2 py-1 rounded inline-block',
        status === 'occupied' ? 'bg-green-100 text-green-700' :
        status === 'reserved' ? 'bg-blue-100 text-blue-700' :
        'bg-gray-100 text-gray-600'
      )}>
        {status.toUpperCase()}
      </div>
      {guests && (
        <div className="text-xs text-gray-500 mt-2">{guests} guests</div>
      )}
      {duration && (
        <div className="text-xs text-gray-500 mt-0.5">{duration}</div>
      )}
      {time && (
        <div className="text-xs text-gray-500 mt-2">at {time}</div>
      )}
    </div>
  );
}

// Helper imports
import cn from 'clsx';
