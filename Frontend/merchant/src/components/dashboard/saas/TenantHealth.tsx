'use client';

import React from 'react';

export function TenantHealth() {
  return (
    <div className="bg-gray-50 rounded-xl border border-gray-100 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">Tenant Health</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-500/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🟢</span>
            <div>
              <p className="text-sm font-medium text-gray-900">Healthy</p>
              <p className="text-xs text-gray-400">742 tenants (88%)</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-amber-50 rounded-lg border border-amber-500/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🟡</span>
            <div>
              <p className="text-sm font-medium text-gray-900">At Risk</p>
              <p className="text-xs text-gray-400">81 tenants (9%)</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-error/10 rounded-lg border border-error/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔴</span>
            <div>
              <p className="text-sm font-medium text-gray-900">Critical</p>
              <p className="text-xs text-gray-400">24 tenants (3%)</p>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-gray-100">
          <p className="text-sm text-gray-500 mb-2">NPS Score: <span className="font-semibold text-gray-900">72</span></p>
          <p className="text-xs text-gray-400">Promoters: 68%</p>
        </div>
      </div>
    </div>
  );
}
