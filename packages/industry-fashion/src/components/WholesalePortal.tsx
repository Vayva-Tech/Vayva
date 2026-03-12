'use client';

import React, { useState } from 'react';
import { GlassPanel, Button } from '@vayva/ui/components/fashion';

interface WholesaleCustomer {
  customerId: string;
  companyName: string;
  contactName: string;
  email: string;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  creditLimit: number;
  currentBalance: number;
  discountTier: number;
  totalOrders: number;
  lifetimeValue: number;
}

interface WholesaleOrder {
  orderId: string;
  customerId: string;
  customerName: string;
  total: number;
  status: 'pending' | 'approved' | 'processing' | 'shipped' | 'delivered';
  orderDate: string;
}

export interface WholesalePortalProps {
  customers?: WholesaleCustomer[];
  orders?: WholesaleOrder[];
  onApproveOrder?: (orderId: string) => void;
  onRejectOrder?: (orderId: string) => void;
}

export const WholesalePortal: React.FC<WholesalePortalProps> = ({
  customers = [],
  orders = [],
  onApproveOrder,
  onRejectOrder,
}) => {
  const [activeTab, setActiveTab] = useState<'overview' | 'customers' | 'orders'>('overview');
  const [selectedTier, setSelectedTier] = useState<string>('all');

  const getTierColor = (tier: string) => {
    switch (tier) {
      case 'platinum': return 'from-purple-500 to-purple-600';
      case 'gold': return 'from-yellow-400 to-yellow-500';
      case 'silver': return 'from-gray-300 to-gray-400';
      case 'bronze': return 'from-orange-600 to-orange-700';
      default: return 'from-gray-500 to-gray-600';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'approved': return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'processing': return 'bg-blue-500/20 text-blue-400 border-blue-500/30';
      case 'shipped': return 'bg-purple-500/20 text-purple-400 border-purple-500/30';
      case 'delivered': return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
      case 'pending': return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default: return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
    }
  };

  const filteredCustomers = selectedTier === 'all'
    ? customers
    : customers.filter(c => c.tier === selectedTier);

  const pendingOrders = orders.filter(o => o.status === 'pending');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Wholesale B2B Portal</h2>
          <p className="text-sm text-white/60 mt-1">Manage wholesale customers and orders</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant={activeTab === 'overview' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('overview')}
          >
            Overview
          </Button>
          <Button
            variant={activeTab === 'customers' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('customers')}
          >
            Customers
          </Button>
          <Button
            variant={activeTab === 'orders' ? 'primary' : 'ghost'}
            onClick={() => setActiveTab('orders')}
          >
            Orders
          </Button>
        </div>
      </div>

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <GlassPanel variant="elevated" className="p-6">
            <div className="text-sm text-white/60 mb-2">Total Customers</div>
            <div className="text-3xl font-bold text-white">{customers.length}</div>
            <div className="text-xs text-white/40 mt-2">Active wholesale accounts</div>
          </GlassPanel>

          <GlassPanel variant="elevated" className="p-6">
            <div className="text-sm text-white/60 mb-2">Pending Orders</div>
            <div className="text-3xl font-bold text-white">{pendingOrders.length}</div>
            <div className="text-xs text-white/40 mt-2">Awaiting approval</div>
          </GlassPanel>

          <GlassPanel variant="elevated" className="p-6">
            <div className="text-sm text-white/60 mb-2">Total Revenue</div>
            <div className="text-3xl font-bold text-white">
              ${customers.reduce((sum, c) => sum + c.lifetimeValue, 0).toLocaleString()}
            </div>
            <div className="text-xs text-white/40 mt-2">Lifetime value</div>
          </GlassPanel>

          <GlassPanel variant="elevated" className="p-6">
            <div className="text-sm text-white/60 mb-2">Avg Discount</div>
            <div className="text-3xl font-bold text-white">
              {customers.length > 0
                ? Math.round(customers.reduce((sum, c) => sum + c.discountTier, 0) / customers.length)
                : 0}%
            </div>
            <div className="text-xs text-white/40 mt-2">Average tier discount</div>
          </GlassPanel>

          {/* Tier Distribution */}
          <GlassPanel variant="elevated" className="p-6 md:col-span-2 lg:col-span-4">
            <h3 className="text-lg font-semibold text-white mb-4">Customer Tier Distribution</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {['platinum', 'gold', 'silver', 'bronze'].map((tier) => {
                const count = customers.filter(c => c.tier === tier).length;
                return (
                  <button
                    key={tier}
                    onClick={() => setSelectedTier(tier)}
                    className={`p-4 rounded-lg bg-gradient-to-br ${getTierColor(tier)} transition-transform hover:scale-105`}
                  >
                    <div className="text-white/80 text-xs uppercase tracking-wider mb-1">{tier}</div>
                    <div className="text-white text-2xl font-bold">{count}</div>
                  </button>
                );
              })}
            </div>
          </GlassPanel>
        </div>
      )}

      {/* Customers Tab */}
      {activeTab === 'customers' && (
        <GlassPanel variant="elevated" className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-white">Wholesale Customers</h3>
            {selectedTier !== 'all' && (
              <Button variant="ghost" onClick={() => setSelectedTier('all')}>
                Clear Filter
              </Button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/10">
                  <th className="text-left py-3 px-4 text-sm text-white/60">Company</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">Contact</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">Tier</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">Credit Limit</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">Balance</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">Orders</th>
                  <th className="text-left py-3 px-4 text-sm text-white/60">LTV</th>
                </tr>
              </thead>
              <tbody>
                {filteredCustomers.map((customer) => (
                  <tr key={customer.customerId} className="border-b border-white/5 hover:bg-white/5">
                    <td className="py-3 px-4">
                      <div className="font-medium text-white">{customer.companyName}</div>
                      <div className="text-xs text-white/40">{customer.email}</div>
                    </td>
                    <td className="py-3 px-4 text-white/80">{customer.contactName}</td>
                    <td className="py-3 px-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-gradient-to-r ${getTierColor(customer.tier)} text-white`}>
                        {customer.tier}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-white/80">${customer.creditLimit.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <div className={`${customer.currentBalance > customer.creditLimit * 0.8 ? 'text-red-400' : 'text-white/80'}`}>
                        ${customer.currentBalance.toLocaleString()}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-white/80">{customer.totalOrders}</td>
                    <td className="py-3 px-4 text-white/80">${customer.lifetimeValue.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </GlassPanel>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <GlassPanel variant="elevated" className="p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Wholesale Orders</h3>

          <div className="space-y-3">
            {orders.map((order) => (
              <div
                key={order.orderId}
                className="flex items-center justify-between p-4 rounded-lg bg-white/5 border border-white/10"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-1">
                    <span className="font-medium text-white">{order.orderId}</span>
                    <span className={`px-2 py-1 rounded text-xs border ${getStatusColor(order.status)}`}>
                      {order.status}
                    </span>
                  </div>
                  <div className="text-sm text-white/60">
                    {order.customerName} • {order.orderDate}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <div className="text-lg font-bold text-white">${order.total.toLocaleString()}</div>
                  </div>
                  {order.status === 'pending' && (
                    <div className="flex gap-2">
                      <Button
                        variant="success"
                        size="sm"
                        onClick={() => onApproveOrder?.(order.orderId)}
                      >
                        Approve
                      </Button>
                      <Button
                        variant="danger"
                        size="sm"
                        onClick={() => onRejectOrder?.(order.orderId)}
                      >
                        Reject
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </GlassPanel>
      )}
    </div>
  );
};
