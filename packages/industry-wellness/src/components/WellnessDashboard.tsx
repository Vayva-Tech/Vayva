/**
 * Wellness Industry Dashboard Component
 * Health and wellness center management with appointment scheduling and client tracking
 */

import React from 'react';
import { UniversalProDashboard } from '@/components/dashboard/UniversalProDashboard';
import type { IndustryDashboardProps } from '@vayva/industry-core';
import { DashboardErrorBoundary } from '@/components/error-boundary/error-boundary-utils';

export function WellnessDashboard({
  userId,
  businessId,
  designCategory = 'signature',
  planTier = 'standard',
  className,
}: IndustryDashboardProps) {
  return (
    <DashboardErrorBoundary serviceName="WellnessDashboard">
      <UniversalProDashboard
        industry="wellness"
        variant="pro"
        userId={userId}
        businessId={businessId}
        designCategory={designCategory}
        planTier={planTier}
        className={className}
      />
    </DashboardErrorBoundary>
  );
}

export default WellnessDashboard;