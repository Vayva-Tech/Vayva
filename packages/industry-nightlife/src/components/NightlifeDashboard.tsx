'use client';

/**
 * Nightlife Industry Dashboard Component
 * Bar, club, and entertainment venue management dashboard
 */

import React from 'react';
import { DashboardErrorBoundary } from '@/components/error-boundary/error-boundary-utils';

export interface NightlifeDashboardProps {
  userId?: string;
  businessId?: string;
  designCategory?: string;
  planTier?: string;
  className?: string;
}

export function NightlifeDashboard({
  userId,
  businessId,
  designCategory = 'signature',
  planTier = 'standard',
  className,
}: NightlifeDashboardProps) {
  return (
    <DashboardErrorBoundary serviceName="NightlifeDashboard">
      <div className={className} data-industry="nightlife" data-plan={planTier}>
        <DashboardErrorBoundary serviceName="NightlifeDashboardHeader">
          <div>Nightlife Dashboard</div>
        </DashboardErrorBoundary>
        <DashboardErrorBoundary serviceName="NightlifeDashboardInfo">
          <div>Business: {businessId}</div>
        </DashboardErrorBoundary>
      </div>
    </DashboardErrorBoundary>
  );
}

export default NightlifeDashboard;
