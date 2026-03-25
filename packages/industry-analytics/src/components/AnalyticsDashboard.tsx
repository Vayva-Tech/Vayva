/**
 * Analytics Industry Dashboard Component
 * Data-driven decision making dashboard with KPIs, trends, and predictive insights
 */

import React from 'react';
import { UniversalProDashboard } from '@/components/dashboard/UniversalProDashboard';
import type { IndustryDashboardProps } from '@vayva/industry-core';

export function AnalyticsDashboard({
  userId,
  businessId,
  designCategory = 'signature',
  planTier = 'advanced',
  className,
}: IndustryDashboardProps) {
  return (
    <UniversalProDashboard
      industry="analytics"
      variant="pro"
      userId={userId}
      businessId={businessId}
      designCategory={designCategory}
      planTier={planTier}
      className={className}
    />
  );
}

export default AnalyticsDashboard;
