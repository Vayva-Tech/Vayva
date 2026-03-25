/**
 * Professional Services Dashboard Component
 * Consulting, accounting, and professional service firm management
 */

import React from 'react';
import type { IndustryDashboardProps } from '@vayva/industry-core';

/**
 * Shell component: merchant apps compose UniversalProDashboard with routing and theming.
 */
export function ProfessionalServicesDashboard({
  userId,
  businessId,
  className,
}: IndustryDashboardProps) {
  return (
    <section
      className={className}
      data-industry="professional"
      data-user-id={userId}
      data-business-id={businessId}
      aria-label="Professional services dashboard"
    />
  );
}

export default ProfessionalServicesDashboard;
