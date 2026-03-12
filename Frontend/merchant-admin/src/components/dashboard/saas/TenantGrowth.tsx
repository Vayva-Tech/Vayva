'use client';

import React from 'react';
import { TenantGrowthChart } from './TenantGrowthChart';
import type { TenantGrowthMetrics } from '@/types/saas-dashboard';

export function TenantGrowth({ data: propData }: { data?: TenantGrowthMetrics }) {
  // Mock data if not provided
  const data = propData || {
    trend: [
      { month: 'Sep', tenants: 750, new: 35, churned: 8 },
      { month: 'Oct', tenants: 770, new: 38, churned: 10 },
      { month: 'Nov', tenants: 790, new: 40, churned: 12 },
      { month: 'Dec', tenants: 810, new: 42, churned: 14 },
      { month: 'Jan', tenants: 825, new: 38, churned: 15 },
      { month: 'Feb', tenants: 840, new: 40, churned: 17 },
      { month: 'Mar', tenants: 847, new: 42, churned: 8 },
    ],
    monthlyStats: { new: 42, churned: 8, net: 34 },
  };
  return (
    <div className="bg-background-secondary rounded-xl border border-border/40 p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Tenant Growth</h3>
      <div className="space-y-4">
        <TenantGrowthChart data={data.trend} />
        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-2xl font-bold text-success">+42</p>
            <p className="text-xs text-text-tertiary">New</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-error">-8</p>
            <p className="text-xs text-text-tertiary">Churned</p>
          </div>
          <div>
            <p className="text-2xl font-bold text-success">+34</p>
            <p className="text-xs text-text-tertiary">Net</p>
          </div>
        </div>
      </div>
    </div>
  );
}
