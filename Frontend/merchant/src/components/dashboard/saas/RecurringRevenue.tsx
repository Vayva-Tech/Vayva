'use client';

import React from 'react';

export function RecurringRevenue() {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Recurring Revenue</h3>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Starter</span>
            <span className="text-sm font-medium text-gray-900">$18,420 (22%)</span>
          </div>
          <div className="w-full bg-white-tertiary rounded-full h-2">
            <div className="bg-green-50-primary h-2 rounded-full" style={{ width: '22%' }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Professional</span>
            <span className="text-sm font-medium text-gray-900">$42,500 (50%)</span>
          </div>
          <div className="w-full bg-white-tertiary rounded-full h-2">
            <div className="bg-green-50-primary h-2 rounded-full" style={{ width: '50%' }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-500">Enterprise</span>
            <span className="text-sm font-medium text-gray-900">$23,280 (28%)</span>
          </div>
          <div className="w-full bg-white-tertiary rounded-full h-2">
            <div className="bg-green-50-primary h-2 rounded-full" style={{ width: '28%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
