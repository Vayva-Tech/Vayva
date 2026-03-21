'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export function ChurnRisk() {
  const highRiskTenants = [
    { name: 'TechCorp Inc', daysSinceLogin: 14, usageChange: -42 },
    { name: 'StartupXYZ', daysSinceLogin: 9, usageChange: -28 },
  ];

  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Churn Risk</h3>
      
      <div className="mb-4">
        <p className="text-sm text-gray-500 mb-2">At-Risk Tenants: <span className="font-semibold text-error">24</span></p>
      </div>

      <div className="space-y-3 mb-4">
        <h4 className="text-sm font-medium text-gray-900">🔴 High Risk (8 tenants)</h4>
        {highRiskTenants.map((tenant) => (
          <div key={tenant.name} className="p-3 bg-error/5 rounded-lg border border-error/20">
            <p className="text-sm font-medium text-gray-900 mb-1">{tenant.name}</p>
            <p className="text-xs text-gray-400">Last login: {tenant.daysSinceLogin} days ago</p>
            <p className="text-xs text-gray-400">Usage: {tenant.usageChange}% this month</p>
            <div className="flex items-center gap-2 mt-2">
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                Intervene
              </Button>
              <Button variant="outline" size="sm" className="h-7 px-2 text-xs">
                Email
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="pt-4 border-t border-gray-100">
        <p className="text-xs text-gray-400">
          Prediction Accuracy: <span className="font-medium text-gray-900">87%</span> (Last 30 days)
        </p>
      </div>
    </div>
  );
}
