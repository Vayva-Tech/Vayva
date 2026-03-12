'use client';

import React from 'react';
import { Button } from '@/components/ui/button';

export function AIInsightsPanel() {
  return (
    <div className="bg-gradient-to-r from-accent-primary/10 to-accent-secondary/10 rounded-xl border border-accent-primary/20 p-6">
      <div className="flex items-start gap-4">
        <div className="text-3xl">💡</div>
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-text-primary mb-2">
            Churn Alert: 3 enterprise tenants showing risk signals
          </h3>
          <p className="text-sm text-text-secondary mb-3">
            Based on: Usage decline, support ticket patterns, login frequency
          </p>
          <div className="flex items-center gap-4 mb-4">
            <div className="text-sm text-text-secondary">
              <span className="font-medium text-text-primary">Recommendation:</span> Schedule success calls, offer training sessions
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-success/20 rounded-full text-xs font-medium text-success">
              Impact: Prevent $8,400 MRR churn
            </div>
          </div>
          <div className="flex items-center gap-3 mt-4">
            <Button variant="outline" size="sm">
              View Risk List
            </Button>
            <Button variant="default" size="sm">
              Create Campaign
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
