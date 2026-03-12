'use client';

import React from 'react';

export function RecurringRevenue() {
  return (
    <div className="bg-background-secondary rounded-xl border border-border/40 p-6">
      <h3 className="text-lg font-semibold text-text-primary mb-4">Recurring Revenue</h3>
      <div className="space-y-4">
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Starter</span>
            <span className="text-sm font-medium text-text-primary">$18,420 (22%)</span>
          </div>
          <div className="w-full bg-background-tertiary rounded-full h-2">
            <div className="bg-accent-primary h-2 rounded-full" style={{ width: '22%' }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Professional</span>
            <span className="text-sm font-medium text-text-primary">$42,500 (50%)</span>
          </div>
          <div className="w-full bg-background-tertiary rounded-full h-2">
            <div className="bg-accent-primary h-2 rounded-full" style={{ width: '50%' }} />
          </div>
        </div>
        <div>
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-text-secondary">Enterprise</span>
            <span className="text-sm font-medium text-text-primary">$23,280 (28%)</span>
          </div>
          <div className="w-full bg-background-tertiary rounded-full h-2">
            <div className="bg-accent-primary h-2 rounded-full" style={{ width: '28%' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
