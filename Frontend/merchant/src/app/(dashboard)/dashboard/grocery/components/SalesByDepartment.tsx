/**
 * Sales by Department Component
 */

import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Department {
  id: string;
  name: string;
  revenue: number;
  percentageOfTotal: number;
  trend: number;
  topCategory?: string;
  decliningCategory?: string;
}

interface Props {
  departments: Department[];
}

export function SalesByDepartment({ departments }: Props) {
  const maxRevenue = Math.max(...departments.map(d => d.revenue));

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Sales by Department</h3>
      
      <div className="space-y-4">
        {departments.map((dept) => (
          <div key={dept.id} className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-700">{dept.name}</span>
              <div className="flex items-center space-x-2">
                <span className="text-sm text-gray-600">${dept.revenue.toLocaleString()}</span>
                <span className={`text-xs px-2 py-1 rounded-full ${
                  dept.trend >= 0 
                    ? 'bg-green-100 text-green-700' 
                    : 'bg-red-100 text-red-700'
                }`}>
                  {dept.percentageOfTotal}%
                </span>
              </div>
            </div>
            <div className="relative h-3 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="absolute h-full bg-gradient-to-r from-green-500 to-green-500 transition-all duration-500"
                style={{ width: `${(dept.revenue / maxRevenue) * 100}%` }}
              />
            </div>
            {dept.topCategory && (
              <div className="flex items-center text-xs text-green-600">
                <TrendingUp className="w-3 h-3 mr-1" />
                Top: {dept.topCategory}
              </div>
            )}
            {dept.decliningCategory && (
              <div className="flex items-center text-xs text-red-600">
                <TrendingDown className="w-3 h-3 mr-1" />
                Declining: {dept.decliningCategory}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
