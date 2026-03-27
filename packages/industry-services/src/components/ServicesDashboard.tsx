/**
 * Services Industry Dashboard Component
 * General service business management dashboard
 */

import React from 'react';
import { UniversalProDashboard } from '@/components/dashboard/UniversalProDashboard';
import type { IndustryDashboardProps } from '@vayva/industry-core';
import { DashboardErrorBoundary } from '@/components/error-boundary/error-boundary-utils';

export function ServicesDashboard({
  userId,
  businessId,
  designCategory = 'signature',
  planTier = 'standard',
  className,
}: IndustryDashboardProps) {
  return (
    <DashboardErrorBoundary serviceName="ServicesDashboard">
      <UniversalProDashboard
        industry="services"
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

export default ServicesDashboard;