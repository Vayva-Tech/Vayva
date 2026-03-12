'use client';

import React from 'react';

export function TenantHealth() {
  return (
    <div className="bg-background-secondary rounded-xl border border-border/40 p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Tenant Health</h3>
      <div className="space-y-4">
        <div className="flex items-center justify-between p-3 bg-success/10 rounded-lg border border-success/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🟢</span>
            <div>
              <p className="text-sm font-medium text-text-primary">Healthy</p>
              <p className="text-xs text-text-tertiary">742 tenants (88%)</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-warning/10 rounded-lg border border-warning/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🟡</span>
            <div>
              <p className="text-sm font-medium text-text-primary">At Risk</p>
              <p className="text-xs text-text-tertiary">81 tenants (9%)</p>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-between p-3 bg-error/10 rounded-lg border border-error/20">
          <div className="flex items-center gap-3">
            <span className="text-2xl">🔴</span>
            <div>
              <p className="text-sm font-medium text-text-primary">Critical</p>
              <p className="text-xs text-text-tertiary">24 tenants (3%)</p>
            </div>
          </div>
        </div>
        <div className="pt-4 border-t border-border/40">
          <p className="text-sm text-text-secondary mb-2">NPS Score: <span className="font-semibold text-text-primary">72</span></p>
          <p className="text-xs text-text-tertiary">Promoters: 68%</p>
        </div>
      </div>
    </div>
  );
}
