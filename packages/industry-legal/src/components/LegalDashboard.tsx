/**
 * Legal Industry Dashboard Component
 */

import React from 'react';
import type { IndustryDashboardProps } from '@vayva/industry-core';
import { DashboardErrorBoundary } from '@/components/error-boundary/error-boundary-utils';

export function LegalDashboard({
  userId,
  businessId,
  className,
}: IndustryDashboardProps) {
  return (
    <DashboardErrorBoundary serviceName="LegalDashboard">
      <section
        className={className}
        data-industry="legal"
        data-user-id={userId}
        data-business-id={businessId}
        aria-label="Legal dashboard"
      >
        {/* Legal dashboard content will be added here */}
      </section>
    </DashboardErrorBoundary>
  );
}

export default LegalDashboard;
