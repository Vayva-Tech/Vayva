/**
 * Bulk Order Manager Component
 */

import React from 'react';

interface BulkOrderItem {
  productId: string;
  quantity: number;
  unitPrice: number;
}

interface BulkOrderManagerProps {
  orders?: Array<{
    id: string;
    customerId: string;
    items: BulkOrderItem[];
    totalValue: number;
    status: string;
    createdAt: Date;
  }>;
  onCreateOrder?: (order: any) => void;
  onUpdateStatus?: (orderId: string, status: string) => void;
}

export const BulkOrderManager: React.FC<BulkOrderManagerProps> = ({
  orders,
  onCreateOrder,
  onUpdateStatus,
}) => {
  const displayOrders = orders || [
    {
      id: 'bulk_001',
      customerId: 'cust_1',
      items: [
        { productId: 'prod_1', quantity: 100, unitPrice: 25 },
        { productId: 'prod_2', quantity: 50, unitPrice: 15 },
      ],
      totalValue: 3250,
      status: 'confirmed',
      createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    },
    {
      id: 'bulk_002',
      customerId: 'cust_2',
      items: [{ productId: 'prod_3', quantity: 200, unitPrice: 10 }],
      totalValue: 2000,
      status: 'pending',
      createdAt: new Date(),
    },
  ];

  const stats = {
    total: displayOrders.length,
    pending: displayOrders.filter(o => o.status === 'pending').length,
    confirmed: displayOrders.filter(o => o.status === 'confirmed').length,
    totalValue: displayOrders.reduce((sum, o) => sum + o.totalValue, 0),
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'confirmed': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'processing': return 'bg-blue-100 text-blue-800';
      case 'shipped': return 'bg-purple-100 text-purple-800';
      case 'delivered': return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-lg p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-xl font-semibold">Bulk Orders</h3>
        {onCreateOrder && (
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
            + Create Order
          </button>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 bg-gray-50 rounded-lg">
          <p className="text-2xl font-bold">{stats.total}</p>
          <p className="text-sm text-gray-600">Total Orders</p>
        </div>
        <div className="text-center p-4 bg-yellow-50 rounded-lg">
          <p className="text-2xl font-bold text-yellow-600">{stats.pending}</p>
          <p className="text-sm text-gray-600">Pending</p>
        </div>
        <div className="text-center p-4 bg-green-50 rounded-lg">
          <p className="text-2xl font-bold text-green-600">{stats.confirmed}</p>
          <p className="text-sm text-gray-600">Confirmed</p>
        </div>
        <div className="text-center p-4 bg-blue-50 rounded-lg">
          <p className="text-2xl font-bold text-blue-600">${stats.totalValue.toLocaleString()}</p>
          <p className="text-sm text-gray-600">Total Value</p>
        </div>
      </div>

      {/* Orders Table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Order ID</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Items</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Total Value</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {displayOrders.map(order => (
              <tr key={order.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap font-medium">{order.id}</td>
                <td className="px-4 py-3 whitespace-nowrap text-sm">
                  {order.items.reduce((sum, item) => sum + item.quantity, 0)} units
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium">
                  ${order.totalValue.toLocaleString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(order.status)}`}>
                    {order.status}
                  </span>
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  {new Date(order.createdAt).toLocaleDateString()}
                </td>
                <td className="px-4 py-3 whitespace-nowrap">
                  <select
                    value={order.status}
                    onChange={(e) => onUpdateStatus?.(order.id, e.target.value)}
                    className="text-sm border border-gray-300 rounded px-2 py-1"
                  >
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="processing">Processing</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
