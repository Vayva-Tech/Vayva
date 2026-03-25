/**
 * Creative Industry Dashboard Component
 * Design studio, creative agency, and artistic portfolio management
 */

import React from 'react';
import { UniversalProDashboard } from '@/components/dashboard/UniversalProDashboard';
import type { IndustryDashboardProps } from '@vayva/industry-core';

export function CreativeDashboard({
  userId,
  businessId,
  designCategory = 'signature',
  planTier = 'standard',
  className,
}: IndustryDashboardProps) {
  return (
    <UniversalProDashboard
      industry="creative_portfolio"
      variant="pro"
      userId={userId}
      businessId={businessId}
      designCategory={designCategory}
      planTier={planTier}
      className={className}
    />
  );
}

export default CreativeDashboard;