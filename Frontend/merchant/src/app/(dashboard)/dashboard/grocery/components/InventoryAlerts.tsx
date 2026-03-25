import { Button } from "@vayva/ui";
/**
 * Inventory Alerts Component
 */

import React from 'react';
import { AlertTriangle, CheckCircle, Package } from 'lucide-react';

interface StockAlert {
  id: string;
  productName: string;
  currentStock: number;
  threshold: number;
  status: 'critical' | 'low' | 'adequate';
  action?: string;
}

interface Props {
  alerts: StockAlert[];
  ordersToPlace?: number;
  estimatedValue?: number;
}

export function InventoryAlerts({ alerts, ordersToPlace = 8, estimatedValue = 12450 }: Props) {
  const criticalAlerts = alerts.filter(a => a.status === 'critical');
  const lowAlerts = alerts.filter(a => a.status === 'low');

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">📦 Inventory Alerts</h3>
      
      <div className="space-y-3 mb-6">
        {alerts.slice(0, 5).map((alert) => (
          <div 
            key={alert.id} 
            className={`flex items-center justify-between p-3 rounded-lg ${
              alert.status === 'critical' 
                ? 'bg-red-50 border-l-4 border-red-500' 
                : alert.status === 'low'
                ? 'bg-orange-50 border-l-4 border-orange-500'
                : 'bg-green-50 border-l-4 border-green-500'
            }`}
          >
            <div className="flex items-center space-x-3">
              {alert.status === 'critical' ? (
                <AlertTriangle className="w-5 h-5 text-red-500" />
              ) : alert.status === 'low' ? (
                <AlertTriangle className="w-5 h-5 text-orange-500" />
              ) : (
                <CheckCircle className="w-5 h-5 text-green-500" />
              )}
              <div>
                <p className="font-medium text-gray-900">{alert.productName}</p>
                <p className="text-sm text-gray-600">
                  {alert.currentStock} left (threshold: {alert.threshold})
                </p>
              </div>
            </div>
            {alert.action && (
              <Button className="text-xs bg-white px-3 py-1 rounded-md border border-gray-300 hover:bg-gray-50">
                {alert.action}
              </Button>
            )}
          </div>
        ))}
      </div>

      <div className="border-t pt-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Package className="w-5 h-5 text-blue-500" />
            <span className="text-sm font-medium text-gray-700">Orders to Place:</span>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-blue-600">{ordersToPlace}</p>
            <p className="text-xs text-gray-600">Est. ${estimatedValue.toLocaleString()}</p>
          </div>
        </div>
      </div>
    </div>
  );
}
