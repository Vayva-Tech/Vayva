// @ts-nocheck
'use client';

/**
 * Expiration Alerts Widget
 * Displays products nearing expiration with action recommendations
 */

import React, { useState } from 'react';

export interface ExpirationAlert {
  id: string;
  productId: string;
  productName: string;
  batchNumber: string;
  expirationDate: Date;
  daysUntilExpiry: number;
  quantity: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  suggestedAction: string;
  acknowledged: boolean;
}

export interface AlertStats {
  total: number;
  critical: number;
  high: number;
  medium: number;
  low: number;
  acknowledged: number;
  expired: number;
}

export interface ExpirationAlertsProps {
  alerts?: ExpirationAlert[];
  stats?: AlertStats;
  onAcknowledge?: (alertId: string, action?: string) => void;
  onBulkAction?: (action: string, alertIds: string[]) => void;
}

export const ExpirationAlerts: React.FC<ExpirationAlertsProps> = ({
  alerts = [],
  stats,
  onAcknowledge,
  onBulkAction,
}) => {
  const [selectedAlerts, setSelectedAlerts] = useState<Set<string>>(new Set());
  const [filterSeverity, setFilterSeverity] = useState<string>('all');

  const displayAlerts = alerts.length > 0 ? alerts : [
    {
      id: 'alert-1',
      productId: 'prod-1',
      productName: 'Fresh Milk',
      batchNumber: 'BATCH-101',
      expirationDate: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000),
      daysUntilExpiry: 1,
      quantity: 24,
      severity: 'critical',
      suggestedAction: 'Apply maximum discount or donate',
      acknowledged: false,
    },
    {
      id: 'alert-2',
      productId: 'prod-2',
      productName: 'Yogurt Pack',
      batchNumber: 'BATCH-102',
      expirationDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
      daysUntilExpiry: 2,
      quantity: 12,
      severity: 'critical',
      suggestedAction: 'Remove from shelves immediately',
      acknowledged: false,
    },
    {
      id: 'alert-3',
      productId: 'prod-3',
      productName: 'Cheese Blocks',
      batchNumber: 'BATCH-103',
      expirationDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
      daysUntilExpiry: 5,
      quantity: 8,
      severity: 'high',
      suggestedAction: 'Apply 30-50% discount',
      acknowledged: false,
    },
    {
      id: 'alert-4',
      productId: 'prod-4',
      productName: 'Orange Juice',
      batchNumber: 'BATCH-104',
      expirationDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
      daysUntilExpiry: 7,
      quantity: 36,
      severity: 'medium',
      suggestedAction: 'Monitor closely and plan promotion',
      acknowledged: false,
    },
  ];

  const displayStats = stats || {
    total: displayAlerts.length,
    critical: displayAlerts.filter(a => a.severity === 'critical').length,
    high: displayAlerts.filter(a => a.severity === 'high').length,
    medium: displayAlerts.filter(a => a.severity === 'medium').length,
    low: displayAlerts.filter(a => a.severity === 'low').length,
    acknowledged: displayAlerts.filter(a => a.acknowledged).length,
    expired: displayAlerts.filter(a => a.daysUntilExpiry < 0).length,
  };

  const filteredAlerts = filterSeverity === 'all' 
    ? displayAlerts 
    : displayAlerts.filter(a => a.severity === filterSeverity);

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-100 text-red-800 border-red-300';
      case 'high': return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const toggleAlertSelection = (id: string) => {
    const newSelected = new Set(selectedAlerts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedAlerts(newSelected);
  };

  const handleBulkAction = (action: string) => {
    onBulkAction?.(action, Array.from(selectedAlerts));
    setSelectedAlerts(new Set());
  };

  return (
    <div className="bg-white rounded-lg shadow-lg">
      <div className="px-6 py-4 border-b">
        <h3 className="text-xl font-semibold">Expiration Alerts</h3>
        <p className="text-sm text-gray-500">Monitor and manage products nearing expiry</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-7 gap-3 p-6 bg-gray-50">
        <div className="text-center">
          <p className="text-2xl font-bold text-gray-800">{displayStats.total}</p>
          <p className="text-xs text-gray-600">Total</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-600">{displayStats.critical}</p>
          <p className="text-xs text-gray-600">Critical</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-orange-600">{displayStats.high}</p>
          <p className="text-xs text-gray-600">High</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-yellow-600">{displayStats.medium}</p>
          <p className="text-xs text-gray-600">Medium</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-blue-600">{displayStats.low}</p>
          <p className="text-xs text-gray-600">Low</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-green-600">{displayStats.acknowledged}</p>
          <p className="text-xs text-gray-600">Resolved</p>
        </div>
        <div className="text-center">
          <p className="text-2xl font-bold text-red-800">{displayStats.expired}</p>
          <p className="text-xs text-gray-600">Expired</p>
        </div>
      </div>

      {/* Filter and Bulk Actions */}
      <div className="px-6 py-4 border-b bg-gray-50">
        <div className="flex justify-between items-center">
          <select
            value={filterSeverity}
            onChange={(e) => setFilterSeverity(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="all">All Severities</option>
            <option value="critical">Critical Only</option>
            <option value="high">High Priority</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          {selectedAlerts.size > 0 && (
            <div className="flex gap-2">
              <span className="text-sm text-gray-600 self-center">
                {selectedAlerts.size} selected
              </span>
              <button
                onClick={() => handleBulkAction('acknowledge')}
                className="px-3 py-2 bg-green-600 text-white text-sm rounded hover:bg-green-700"
              >
                Acknowledge Selected
              </button>
              <button
                onClick={() => handleBulkAction('discount')}
                className="px-3 py-2 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
              >
                Apply Discount
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Alerts List */}
      <div className="divide-y">
        {filteredAlerts.map(alert => (
          <div 
            key={alert.id}
            className={`p-4 hover:bg-gray-50 transition-colors ${
              alert.acknowledged ? 'bg-gray-50 opacity-75' : 'bg-white'
            }`}
          >
            <div className="flex items-start gap-4">
              <input
                type="checkbox"
                checked={selectedAlerts.has(alert.id)}
                onChange={() => toggleAlertSelection(alert.id)}
                className="mt-1 rounded border-gray-300"
              />
              
              <div className="flex-1">
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h4 className="font-semibold text-lg">{alert.productName}</h4>
                    <p className="text-sm text-gray-500">
                      Batch: {alert.batchNumber} • Qty: {alert.quantity}
                    </p>
                  </div>
                  <span className={`px-3 py-1 text-sm font-medium rounded-full border ${getSeverityColor(alert.severity)}`}>
                    {alert.severity.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-4 mb-3">
                  <div>
                    <p className="text-xs text-gray-500">Expires In</p>
                    <p className={`font-semibold ${
                      alert.daysUntilExpiry < 0 ? 'text-red-600' :
                      alert.daysUntilExpiry <= 2 ? 'text-red-600' :
                      alert.daysUntilExpiry <= 5 ? 'text-orange-600' : 'text-yellow-600'
                    }`}>
                      {alert.daysUntilExpiry < 0 
                        ? `Expired ${Math.abs(alert.daysUntilExpiry)} days ago`
                        : `${alert.daysUntilExpiry} day${alert.daysUntilExpiry > 1 ? 's' : ''}`
                      }
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Expiration Date</p>
                    <p className="font-medium">
                      {new Date(alert.expirationDate).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <p className="text-xs text-gray-500">Product ID</p>
                    <p className="font-medium">{alert.productId}</p>
                  </div>
                </div>

                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-3">
                  <p className="text-xs text-blue-700 font-medium mb-1">💡 Recommended Action:</p>
                  <p className="text-sm text-blue-900">{alert.suggestedAction}</p>
                </div>

                {!alert.acknowledged && onAcknowledge && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => onAcknowledge(alert.id, 'discount-applied')}
                      className="px-3 py-1 bg-blue-600 text-white text-sm rounded hover:bg-blue-700"
                    >
                      Apply Discount
                    </button>
                    <button
                      onClick={() => onAcknowledge(alert.id, 'removed')}
                      className="px-3 py-1 bg-red-600 text-white text-sm rounded hover:bg-red-700"
                    >
                      Remove from Shelf
                    </button>
                    <button
                      onClick={() => onAcknowledge(alert.id, 'donated')}
                      className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700"
                    >
                      Mark as Donated
                    </button>
                  </div>
                )}

                {alert.acknowledged && (
                  <p className="text-sm text-green-600 font-medium">✓ Acknowledged - Action taken</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="px-6 py-4 bg-gray-50 border-t">
        <p className="text-sm text-gray-600">
          Showing {filteredAlerts.length} of {displayAlerts.length} alerts
        </p>
      </div>
    </div>
  );
};
