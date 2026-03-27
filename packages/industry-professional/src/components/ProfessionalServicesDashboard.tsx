/**
 * Professional Services Dashboard Component
 * Consulting, accounting, and professional service firm management
 */

import React from 'react';
import type { IndustryDashboardProps } from '@vayva/industry-core';
import { DashboardErrorBoundary } from '@/components/error-boundary/error-boundary-utils';

/**
 * Shell component: merchant apps compose UniversalProDashboard with routing and theming.
 */
export function ProfessionalServicesDashboard({
  userId,
  businessId,
  className,
}: IndustryDashboardProps) {
  return (
    <DashboardErrorBoundary serviceName="ProfessionalServicesDashboard">
      <section
        className={className}
        data-industry="professional"
        data-user-id={userId}
        data-business-id={businessId}
        aria-label="Professional services dashboard"
      >
        {/* Professional services content will be added here */}
      </section>
    </DashboardErrorBoundary>
  );
}

export default ProfessionalServicesDashboard;
