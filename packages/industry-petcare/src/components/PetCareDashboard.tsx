/**
 * Pet Care Industry Dashboard Component
 * Veterinary clinic and pet service management dashboard
 */

import React from 'react';
import { UniversalProDashboard } from '@/components/dashboard/UniversalProDashboard';
import type { IndustryDashboardProps } from '@vayva/industry-core';
import { DashboardErrorBoundary } from '@/components/error-boundary/error-boundary-utils';

export function PetCareDashboard({
  userId,
  businessId,
  designCategory = 'signature',
  planTier = 'standard',
  className,
}: IndustryDashboardProps) {
  return (
    <DashboardErrorBoundary serviceName="PetCareDashboard">
      <UniversalProDashboard
        industry="petcare"
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

export default PetCareDashboard;