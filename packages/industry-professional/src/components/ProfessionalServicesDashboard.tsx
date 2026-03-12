/**
 * Professional Services Dashboard Component
 * Consulting, accounting, and professional service firm management
 */

import React from 'react';
import { UniversalProDashboard } from '@/components/dashboard/UniversalProDashboard';
import type { IndustryDashboardProps } from '@vayva/industry-core';

export function ProfessionalServicesDashboard({
  userId,
  businessId,
  designCategory = 'signature',
  planTier = 'standard',
  className,
}: IndustryDashboardProps) {
  return (
    <UniversalProDashboard
      industry="professional"
      variant="professional-pro"
      userId={userId}
      businessId={businessId}
      designCategory={designCategory}
      planTier={planTier}
      className={className}
    />
  );
}

export default ProfessionalServicesDashboard;