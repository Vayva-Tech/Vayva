/**
 * Services Industry Dashboard Component
 * General service business management dashboard
 */

import React from 'react';
import { UniversalProDashboard } from '@/components/dashboard/UniversalProDashboard';
import type { IndustryDashboardProps } from '@vayva/industry-core';

export function ServicesDashboard({
  userId,
  businessId,
  designCategory = 'signature',
  planTier = 'standard',
  className,
}: IndustryDashboardProps) {
  return (
    <UniversalProDashboard
      industry="services"
      variant="pro"
      userId={userId}
      businessId={businessId}
      designCategory={designCategory}
      planTier={planTier}
      className={className}
    />
  );
}

export default ServicesDashboard;