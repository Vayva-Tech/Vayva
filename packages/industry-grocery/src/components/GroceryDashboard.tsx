/**
 * Grocery Industry Dashboard Component
 * Specialized dashboard for grocery stores with inventory, sales, and fulfillment tracking
 */

import React from 'react';
import { UniversalProDashboard } from '@/components/dashboard/UniversalProDashboard';
import type { IndustryDashboardProps } from '@vayva/industry-core';

export function GroceryDashboard({
  userId,
  businessId,
  designCategory = 'signature',
  planTier = 'standard',
  className,
}: IndustryDashboardProps) {
  return (
    <UniversalProDashboard
      industry="grocery"
      variant="grocery-pro"
      userId={userId}
      businessId={businessId}
      designCategory={designCategory}
      planTier={planTier}
      className={className}
    />
  );
}

export default GroceryDashboard;