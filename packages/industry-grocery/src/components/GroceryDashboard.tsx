'use client';

/**
 * Grocery Industry Dashboard Component
 * Specialized dashboard for grocery stores with inventory, sales, and fulfillment tracking
 */

import React from 'react';
import { DashboardErrorBoundary } from '@/components/error-boundary/error-boundary-utils';

export interface GroceryDashboardProps {
  userId?: string;
  businessId?: string;
  designCategory?: string;
  planTier?: string;
  className?: string;
}

export function GroceryDashboard({
  userId,
  businessId,
  designCategory = 'signature',
  planTier = 'standard',
  className,
}: GroceryDashboardProps) {
  return (
    <DashboardErrorBoundary serviceName="GroceryDashboard">
      <div className={className} data-industry="grocery" data-plan={planTier}>
        <DashboardErrorBoundary serviceName="GroceryHeader">
          <div>Grocery Dashboard</div>
        </DashboardErrorBoundary>
        <DashboardErrorBoundary serviceName="GroceryInfo">
          <div>Business: {businessId}</div>
        </DashboardErrorBoundary>
      </div>
    </DashboardErrorBoundary>
  );
}

export default GroceryDashboard;
