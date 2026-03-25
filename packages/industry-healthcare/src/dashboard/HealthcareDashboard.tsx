// ============================================================================
// Healthcare Industry Dashboard Main Component
// ============================================================================

'use client';

import React from 'react';
import type { UniversalDashboardProps } from '@vayva/industry-core';

// ---------------------------------------------------------------------------
// Main Dashboard Component (merchant app composes data hooks and rich UI)
// ---------------------------------------------------------------------------

export function HealthcareDashboard({
  industry,
  variant,
  userId,
  businessId,
  className = '',
}: UniversalDashboardProps) {
  return (
    <section
      className={className}
      data-industry={industry}
      data-variant={variant ?? ''}
      data-user-id={userId}
      data-business-id={businessId}
      aria-label="Healthcare dashboard"
    />
  );
}
