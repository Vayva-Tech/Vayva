// @ts-nocheck
'use client';

import React from 'react';
import { VayvaCard, VayvaCardHeader, VayvaCardTitle, VayvaCardContent } from './VayvaCard';
import { cn } from '@/lib/utils';

interface SizeCurveData {
  size: string;
  inventory: number;
  sales: number;
  stockoutRisk: 'low' | 'medium' | 'high';
}

interface SizeCurveChartProps {
  data: SizeCurveData[];
  className?: string;
}

/**
 * Fashion Size Curve Analysis Chart
 * Shows inventory distribution across sizes with sales velocity
 */
export const SizeCurveChart: React.FC<SizeCurveChartProps> = ({ data, className }) => {
  const maxValue = Math.max(...data.map(d => d.inventory));
  
  const getStockoutColor = (risk: string) => {
    switch (risk) {
      case 'high': return '#EF4444';
      case 'medium': return '#F59E0B';
      case 'low': return '#10B981';
    }
  };

  return (
    <VayvaCard variant="glass" className={cn('p-6', className)}>
      <VayvaCardHeader>
        <VayvaCardTitle>Size Curve Analysis</VayvaCardTitle>
        <div className="text-sm text-gray-500">Inventory distribution by size</div>
      </VayvaCardHeader>
      
      <VayvaCardContent>
        <div className="space-y-4">
          {data.map((item, index) => (
            <div key={item.size} className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="font-medium text-gray-700">Size {item.size}</span>
                <div className="flex items-center gap-3">
                  <span className="text-gray-600">{item.inventory} units</span>
                  <span 
                    className="px-2 py-0.5 rounded-full text-xs font-medium"
                    style={{
                      backgroundColor: `${getStockoutColor(item.stockoutRisk)}20`,
                      color: getStockoutColor(item.stockoutRisk),
                    }}
                  >
                    {item.stockoutRisk === 'high' ? 'High Risk' : item.stockoutRisk === 'medium' ? 'Medium Risk' : 'Good'}
                  </span>
                </div>
              </div>
              
              {/* Inventory Bar */}
              <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="absolute inset-y-0 left-0 bg-gradient-to-r from-green-500 to-purple-500 rounded-full transition-all duration-500"
                  style={{ width: `${(item.inventory / maxValue) * 100}%` }}
                />
              </div>
              
              {/* Sales Velocity Indicator */}
              <div className="flex items-center gap-2 text-xs text-gray-500">
                <span>Sold: {item.sales}</span>
                <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-green-500 rounded-full"
                    style={{ width: `${Math.min((item.sales / item.inventory) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {/* Summary Stats */}
        <div className="grid grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-200">
          <div>
            <div className="text-xs text-gray-500 mb-1">Avg Inventory</div>
            <div className="text-lg font-semibold text-gray-900">
              {Math.round(data.reduce((acc, curr) => acc + curr.inventory, 0) / data.length)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Total Sales</div>
            <div className="text-lg font-semibold text-gray-900">
              {data.reduce((acc, curr) => acc + curr.sales, 0)}
            </div>
          </div>
          <div>
            <div className="text-xs text-gray-500 mb-1">Stockout Risk</div>
            <div className="text-lg font-semibold text-orange-500">
              {data.filter(d => d.stockoutRisk === 'high').length} High
            </div>
          </div>
        </div>
      </VayvaCardContent>
    </VayvaCard>
  );
};
