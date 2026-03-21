/**
 * Online Orders Component
 */

import React from 'react';
import { Clock, Truck, ShoppingBag } from 'lucide-react';

interface OnlineOrder {
  id: string;
  orderNumber: string;
  status: 'pending' | 'preparing' | 'ready' | 'out-for-delivery' | 'delivered';
  items: number;
  total: number;
  customerName: string;
  pickupTime?: string;
}

interface Props {
  orders: OnlineOrder[];
}

export function OnlineOrders({ orders }: Props) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-700';
      case 'preparing': return 'bg-blue-100 text-blue-700';
      case 'ready': return 'bg-green-100 text-green-700';
      case 'out-for-delivery': return 'bg-purple-100 text-purple-700';
      default: return 'bg-gray-100 text-gray-700';
    }
  };

  const pending = orders.filter(o => o.status === 'pending').length;
  const preparing = orders.filter(o => o.status === 'preparing').length;
  const ready = orders.filter(o => o.status === 'ready').length;
  const outForDelivery = orders.filter(o => o.status === 'out-for-delivery').length;

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">🛒 Online Orders</h3>
      
      {/* Status Summary */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <div className="bg-yellow-50 p-3 rounded-lg">
          <p className="text-xs text-yellow-600">Pending</p>
          <p className="text-xl font-bold text-yellow-700">{pending}</p>
        </div>
        <div className="bg-blue-50 p-3 rounded-lg">
          <p className="text-xs text-blue-600">Preparing</p>
          <p className="text-xl font-bold text-blue-700">{preparing}</p>
        </div>
        <div className="bg-green-50 p-3 rounded-lg">
          <p className="text-xs text-green-600">Ready</p>
          <p className="text-xl font-bold text-green-700">{ready}</p>
        </div>
        <div className="bg-purple-50 p-3 rounded-lg">
          <p className="text-xs text-purple-600">Out for Delivery</p>
          <p className="text-xl font-bold text-purple-700">{outForDelivery}</p>
        </div>
      </div>

      {/* Recent Orders */}
      <div className="space-y-2">
        {orders.slice(0, 4).map((order) => (
          <div key={order.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{order.orderNumber}</p>
              <p className="text-sm text-gray-600">{order.items} items • ${order.total.toFixed(2)}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded-full ${getStatusColor(order.status)}`}>
              {order.status.replace('-', ' ')}
            </span>
          </div>
        ))}
      </div>

      {/* Next Pickup Window */}
      <div className="mt-4 pt-4 border-t flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Clock className="w-4 h-4 text-gray-500" />
          <span className="text-sm text-gray-600">Next Pickup: 2-4 PM</span>
        </div>
        <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">95% on-time</span>
      </div>
    </div>
  );
}
