'use client';

import React, { useEffect } from 'react';
import { Card } from '@vayva/ui';
import { foodDashboardConfig } from '../dashboard/config';
import { registerFoodWidgets } from '../widgets/registry';
import { DashboardErrorBoundary } from '@/components/error-boundary/error-boundary-utils';

export interface FoodDashboardProps {
  industry: string;
  variant?: string;
  userId: string;
  businessId: string;
  designCategory?: 'signature' | 'glass' | 'bold' | 'dark' | 'natural';
  planTier?: 'basic' | 'standard' | 'advanced' | 'pro';
}

export function FoodDashboard({
  userId,
  businessId,
}: FoodDashboardProps) {
  useEffect(() => {
    registerFoodWidgets();
  }, []);

  return (
    <div className="space-y-6 p-6">
      <DashboardErrorBoundary serviceName="FoodHeader">
        <div>
          <h1 className="text-2xl font-bold">{foodDashboardConfig.title}</h1>
          <p className="text-muted-foreground">{foodDashboardConfig.subtitle}</p>
          <p className="text-sm text-muted-foreground mt-2">
            Business {businessId} · User {userId}
          </p>
        </div>
      </DashboardErrorBoundary>
      <DashboardErrorBoundary serviceName="FoodContent">
        <Card className="p-6">
          <p className="text-sm text-muted-foreground">
            Food widgets are registered on mount. Connect your merchant shell or{' '}
            <code className="text-xs">DashboardEngine</code> to render live widget data.
          </p>
        </Card>
      </DashboardErrorBoundary>
    </div>
  );
}
