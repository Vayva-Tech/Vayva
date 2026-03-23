// @ts-nocheck
/**
 * Bottle Service Dashboard Component
 * Advanced bottle service management with inventory tracking
 */

import React from 'react';

interface BottleOrder {
  id: string;
  tableNumber: string;
  customerName: string;
  bottles: Array<{
    brand: string;
    type: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  status: 'pending' | 'preparing' | 'served';
}

interface BottleServiceDashboardProps {
  orders?: BottleOrder[];
  inventory?: Array<{
    brand: string;
    type: string;
    stock: number;
    reorderLevel: number;
  }>;
  onCreateOrder?: (order: any) => void;
  onUpdateStatus?: (orderId: string, status: string) => void;
}

export const BottleServiceDashboard: React.FC<BottleServiceDashboardProps> = ({
  orders,
  inventory,
  onCreateOrder,
  onUpdateStatus,
}) => {
  const displayOrders = orders || [
    {
      id: 'bso_1',
      tableNumber: 'VIP-1',
      customerName: 'Alex M.',
      bottles: [
        { brand: 'Grey Goose', type: 'vodka', quantity: 2, price: 75 },
        { brand: 'Dom Pérignon', type: 'champagne', quantity: 1, price: 450 },
      ],
      total: 600,
      status: 'preparing',
    },
    {
      id: 'bso_2',
      tableNumber: 'T5',
      customerName: 'Sarah K.',
      bottles: [{ brand: 'Patron Silver', type: 'tequila', quantity: 1, price: 95 }],
      total: 95,
      status: 'pending',
    },
  ];

  const displayInventory = inventory || [
    { brand: 'Grey Goose', type: 'vodka', stock: 24, reorderLevel: 6 },
    { brand: 'Don Julio 1942', type: 'whiskey', stock: 12, reorderLevel: 3 },
    { brand: 'Dom Pérignon', type: 'champagne', stock: 18, reorderLevel: 4 },
    { brand: 'Patron Silver', type: 'tequila', stock: 20, reorderLevel: 5 },
  ];

  const stats = {
    totalOrders: displayOrders.length,
    pendingOrders: displayOrders.filter(o => o.status === 'pending').length,
    totalRevenue: displayOrders.reduce((sum, o) => sum + o.total, 0),
    lowStockItems: displayInventory.filter(i => i.stock <= i.reorderLevel).length,
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'preparing': return 'bg-blue-100 text-blue-800';
      case 'served': return 'bg-green-100 text-green-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">🍾 Bottle Service Dashboard</h3>
        {onCreateOrder && (
          <button className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700">
            + New Order
          </button>
        )}
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-purple-50 rounded-lg">
          <p className="text-2xl font-bold text-purple-600">{stats.totalOrders}</p>
          <p className="text-sm text-gray-600">Total Orders</p>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">${stats.totalRevenue.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Revenue</p>
        </div>
        <div className="text-center p-4 bg-red-50 rounded-lg">
          <p className="text-2xl font-bold text-red-600">{stats.lowStockItems}</p>
          <p className="text-sm text-gray-600">Low Stock</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-6">
        {/* Active Orders */}
        <div>
          <h4 className="font-semibold mb-3">Active Orders</h4>
          <div className="space-y-3">
            {displayOrders.map(order => (
              <div key={order.id} className="p-4 border rounded-lg hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <p className="font-medium">{order.tableNumber}</p>
                    <p className="text-sm text-gray-500">{order.customerName}</p>
                  </div>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </div>
                <div className="space-y-1 mb-3">
                  {order.bottles.map((bottle, idx) => (
                    <div key={idx} className="text-sm text-gray-600">
                      {bottle.quantity}x {bottle.brand} (${bottle.price})
                    </div>
                  ))}
                </div>
                <div className="flex justify-between items-center">
                  <p className="font-bold text-lg">${order.total}</p>
                  {onUpdateStatus && order.status === 'pending' && (
                    <button
                      onClick={() => onUpdateStatus(order.id, 'preparing')}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Start Preparing
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Inventory Status */}
        <div>
          <h4 className="font-semibold mb-3">Inventory Status</h4>
          <div className="space-y-3">
            {displayInventory.map((item, idx) => (
              <div key={idx} className="p-3 bg-gray-50 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <div>
                    <p className="font-medium">{item.brand}</p>
                    <p className="text-xs text-gray-500 capitalize">{item.type}</p>
                  </div>
                  <div className="text-right">
                    <p className={`font-bold ${item.stock <= item.reorderLevel ? 'text-red-600' : 'text-green-600'}`}>
                      {item.stock} bottles
                    </p>
                    {item.stock <= item.reorderLevel && (
                      <p className="text-xs text-red-600">Reorder needed!</p>
                    )}
                  </div>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      item.stock <= item.reorderLevel ? 'bg-red-600' : 'bg-green-600'
                    }`}
                    style={{ width: `${Math.min((item.stock / item.reorderLevel) * 100, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
