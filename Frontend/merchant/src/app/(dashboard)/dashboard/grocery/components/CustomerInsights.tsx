/**
 * Customer Insights Component (Stub)
 */

import React from 'react';

interface Props {
  segments: any[];
  metrics: any;
}

export function CustomerInsights({ segments, metrics }: Props) {
  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h3 className="text-lg font-bold text-gray-900 mb-4">👥 Customer Insights</h3>
      <div className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-sm text-gray-600">Total Customers</p>
            <p className="text-2xl font-bold text-gray-900">{metrics.totalCustomers?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Loyalty Members</p>
            <p className="text-2xl font-bold text-green-600">{metrics.loyaltyMembers?.toLocaleString()}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">New This Week</p>
            <p className="text-2xl font-bold text-green-600">+{metrics.newThisWeek}</p>
          </div>
          <div>
            <p className="text-sm text-gray-600">Returning Rate</p>
            <p className="text-2xl font-bold text-blue-600">{(metrics.returningRate * 100).toFixed(0)}%</p>
          </div>
        </div>
        
        <div className="border-t pt-4">
          <p className="text-sm font-medium text-gray-700 mb-2">Average Spend by Segment</p>
          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Loyalty</span>
              <span className="font-medium">$34.50</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Non-member</span>
              <span className="font-medium">$18.75</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
