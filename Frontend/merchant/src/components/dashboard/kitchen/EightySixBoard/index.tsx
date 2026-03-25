'use client';
import { Button } from "@vayva/ui";

import React, { useState } from 'react';
import { useRealTimeKDS } from '@/hooks/useRealTimeKDS';
import { AlertTriangle, Package, Clock, CheckCircle } from 'lucide-react';

interface EightySixBoardProps {
  designCategory?: string;
  industry?: string;
  planTier?: string;
}

/**
 * EightySixBoard Component
 * 
 * Displays out-of-stock items and inventory alerts
 */
export function EightySixBoard({
  designCategory = 'signature',
  industry = 'food',
  planTier = 'standard'
}: EightySixBoardProps) {
  const [showAddModal, setShowAddModal] = useState(false);
  
  // Mock data - would come from API in real implementation
  const eightySixItems = [
    {
      id: '86_1',
      itemName: 'Lobster Tail',
      reason: 'out_of_stock',
      quantityRemaining: 0,
      estimatedRestock: new Date(Date.now() + 4 * 60 * 60 * 1000), // 4 hours
      reportedAt: new Date(),
      status: 'active',
    },
    {
      id: '86_2',
      itemName: 'Sea Bass',
      reason: 'low_stock',
      quantityRemaining: 3,
      estimatedRestock: new Date(Date.now() + 2 * 60 * 60 * 1000), // 2 hours
      reportedAt: new Date(),
      status: 'active',
    },
    {
      id: '86_3',
      itemName: 'Avocado',
      reason: 'low_stock',
      quantityRemaining: 12,
      estimatedRestock: new Date(Date.now() + 6 * 60 * 60 * 1000),
      reportedAt: new Date(),
      status: 'active',
    },
  ];

  const getReasonIcon = (reason: string) => {
    switch (reason) {
      case 'out_of_stock':
        return <AlertTriangle className="h-5 w-5 text-red-600" />;
      case 'low_stock':
        return <Package className="h-5 w-5 text-yellow-600" />;
      case 'quality_issue':
        return <AlertTriangle className="h-5 w-5 text-orange-600" />;
      default:
        return <Package className="h-5 w-5 text-gray-600" />;
    }
  };

  const getReasonColor = (reason: string) => {
    switch (reason) {
      case 'out_of_stock':
        return 'red';
      case 'low_stock':
        return 'yellow';
      case 'quality_issue':
        return 'orange';
      default:
        return 'gray';
    }
  };

  const formatRestockTime = (date: Date) => {
    const hours = Math.max(0, Math.ceil((date.getTime() - Date.now()) / (1000 * 60 * 60)));
    if (hours <= 0) return 'Any minute now';
    if (hours < 24) return `In ${hours}h`;
    return `In ${Math.floor(hours / 24)}d ${hours % 24}h`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertTriangle className="h-5 w-5 text-gray-600" />
          <h3 className="text-lg font-semibold">86 Board</h3>
        </div>
        
        <Button
          onClick={() => setShowAddModal(true)}
          className="px-4 py-2 text-sm font-medium bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          Add Item
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Currently 86'd Items */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            Currently 86'd ({eightySixItems.filter(i => i.reason === 'out_of_stock').length})
          </h4>
          
          <div className="space-y-3">
            {eightySixItems
              .filter(item => item.reason === 'out_of_stock')
              .map(item => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    {getReasonIcon(item.reason)}
                    <div>
                      <p className="font-medium text-red-900">{item.itemName}</p>
                      <p className="text-xs text-red-700 mt-1">
                        Expected: {formatRestockTime(item.estimatedRestock!)}
                      </p>
                    </div>
                  </div>
                  <Button className="text-red-600 hover:text-red-800">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            
            {eightySixItems.filter(i => i.reason === 'out_of_stock').length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                All items in stock ✅
              </p>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className="border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
            <Package className="h-4 w-4 text-yellow-600" />
            Running Low ({eightySixItems.filter(i => i.reason === 'low_stock').length})
          </h4>
          
          <div className="space-y-3">
            {eightySixItems
              .filter(item => item.reason === 'low_stock')
              .map(item => (
                <div
                  key={item.id}
                  className="flex items-start justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg"
                >
                  <div className="flex items-start gap-2">
                    {getReasonIcon(item.reason)}
                    <div>
                      <p className="font-medium text-yellow-900">{item.itemName}</p>
                      <p className="text-xs text-yellow-700 mt-1">
                        {item.quantityRemaining} left • Restock: {formatRestockTime(item.estimatedRestock!)}
                      </p>
                    </div>
                  </div>
                  <Button className="text-yellow-600 hover:text-yellow-800">
                    <CheckCircle className="h-4 w-4" />
                  </Button>
                </div>
              ))}
            
            {eightySixItems.filter(i => i.reason === 'low_stock').length === 0 && (
              <p className="text-sm text-gray-500 text-center py-4">
                No low stock alerts ✅
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Expected Restocks Timeline */}
      <div className="border border-gray-200 rounded-lg p-4">
        <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
          <Clock className="h-4 w-4 text-blue-600" />
          Expected Restocks
        </h4>
        
        <div className="space-y-2">
          {eightySixItems.map(item => (
            <div
              key={item.id}
              className="flex items-center justify-between p-2 hover:bg-gray-50 rounded"
            >
              <span className="text-sm text-gray-700">{item.itemName}</span>
              <span className="text-xs font-medium text-blue-600">
                {formatRestockTime(item.estimatedRestock!)}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

