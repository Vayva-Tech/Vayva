/**
 * Promotion Performance Component (Stub)
 */

import React from 'react';

interface Props {
  promotions: any[];
  roi: any;
}

export function PromotionPerformance({ promotions, roi }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">🏷️ Promotion Performance</h3>
      <div className="space-y-3">
        {promotions.map((promo) => (
          <div key={promo.id} className="p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="font-medium text-gray-900">{promo.name}</p>
                <p className="text-sm text-gray-600">{promo.itemsCount} products</p>
              </div>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                +{promo.liftPercentage}% lift
              </span>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-gray-600">Digital Coupons: 234 uses (18.4% redemption)</p>
      </div>
    </div>
  );
}

/**
 * Price Optimization Component (Stub)
 */

export function PriceOptimization({ comparisons, suggestions }: any) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">📊 Price Optimization</h3>
      <div className="space-y-3">
        {suggestions?.slice(0, 3).map((suggestion: any) => (
          <div key={suggestion.productId} className="p-3 bg-gray-50 rounded-lg">
            <p className="font-medium text-gray-900">{suggestion.productName}</p>
            <div className="flex justify-between items-center mt-2">
              <span className="text-sm text-gray-600">Current: ${suggestion.currentPrice}</span>
              <span className={`text-xs px-2 py-1 rounded ${
                suggestion.suggestedAction === 'match' ? 'bg-blue-100 text-blue-700' :
                suggestion.suggestedAction === 'increase' ? 'bg-green-100 text-green-700' :
                'bg-orange-100 text-orange-700'
              }`}>
                {suggestion.suggestedAction}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Expiration Tracking Component (Stub)
 */

export function ExpirationTracking({ expiring, savings }: any) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">⏰ Expiration Tracking</h3>
      <div className="space-y-2">
        {expiring?.slice(0, 4).map((item: any) => (
          <div key={item.id} className="flex justify-between items-center p-2">
            <div>
              <p className="text-sm font-medium text-gray-900">{item.productName}</p>
              <p className="text-xs text-gray-600">{item.quantity} units • {item.daysUntilExpiry} days</p>
            </div>
            <span className="text-xs bg-orange-100 text-orange-700 px-2 py-1 rounded">
              {item.action}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-4 pt-4 border-t">
        <p className="text-sm text-green-600 font-medium">
          💰 Waste Reduction Savings: ${savings}
        </p>
      </div>
    </div>
  );
}

/**
 * Supplier Deliveries Component (Stub)
 */

export function SupplierDeliveries({ deliveries }: any) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">🚚 Supplier Deliveries</h3>
      <div className="space-y-3">
        {deliveries?.map((delivery: any) => (
          <div key={delivery.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
            <div>
              <p className="font-medium text-gray-900">{delivery.supplierName}</p>
              <p className="text-sm text-gray-600">{delivery.expectedTime} • {delivery.dockDoor}</p>
            </div>
            <span className={`text-xs px-2 py-1 rounded ${
              delivery.status === 'on-time' ? 'bg-green-100 text-green-700' :
              delivery.status === 'delayed' ? 'bg-red-100 text-red-700' :
              'bg-blue-100 text-blue-700'
            }`}>
              {delivery.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Stock Levels Component (Stub)
 */

export function StockLevels({ inventoryHealth }: any) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">📦 Stock Levels</h3>
      <div className="grid grid-cols-2 gap-4">
        <div className="p-3 bg-green-50 rounded-lg">
          <p className="text-xs text-green-600">In Stock</p>
          <p className="text-xl font-bold text-green-700">{inventoryHealth.inStock}</p>
        </div>
        <div className="p-3 bg-orange-50 rounded-lg">
          <p className="text-xs text-orange-600">Low Stock</p>
          <p className="text-xl font-bold text-orange-700">{inventoryHealth.lowStock}</p>
        </div>
        <div className="p-3 bg-red-50 rounded-lg">
          <p className="text-xs text-red-600">Out of Stock</p>
          <p className="text-xl font-bold text-red-700">{inventoryHealth.outOfStock}</p>
        </div>
        <div className="p-3 bg-blue-50 rounded-lg">
          <p className="text-xs text-blue-600">Overstocked</p>
          <p className="text-xl font-bold text-blue-700">{inventoryHealth.overstocked}</p>
        </div>
      </div>
      <div className="mt-4 pt-4 border-t grid grid-cols-2 gap-4">
        <div>
          <p className="text-sm text-gray-600">Turnover</p>
          <p className="text-lg font-bold text-gray-900">{inventoryHealth.turnoverDays} days</p>
        </div>
        <div>
          <p className="text-sm text-gray-600">Shrinkage</p>
          <p className="text-lg font-bold text-red-600">{(inventoryHealth.shrinkageRate * 100).toFixed(1)}%</p>
        </div>
      </div>
    </div>
  );
}

/**
 * Action Required Component (Stub)
 */

export function ActionRequired({ tasks }: any) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">⚠️ Action Required</h3>
      <div className="space-y-2">
        {tasks?.map((task: any) => (
          <div key={task.id} className="flex items-center space-x-3 p-2 hover:bg-gray-50 rounded">
            <input 
              type="checkbox" 
              checked={task.completed}
              className="w-4 h-4 rounded border-gray-300 text-emerald-600 focus:ring-emerald-500"
            />
            <div className="flex-1">
              <p className={`text-sm ${task.completed ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                {task.title}
              </p>
              {task.dueTime && (
                <p className="text-xs text-gray-500">Due: {task.dueTime}</p>
              )}
            </div>
            {task.priority === 'high' && (
              <span className="text-xs bg-red-100 text-red-700 px-2 py-1 rounded">High</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
