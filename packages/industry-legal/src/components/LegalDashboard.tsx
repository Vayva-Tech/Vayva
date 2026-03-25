/**
 * Legal Industry Dashboard Component
 */

import React from 'react';
import type { IndustryDashboardProps } from '@vayva/industry-core';

export function LegalDashboard({
  userId,
  businessId,
  className,
}: IndustryDashboardProps) {
  return (
    <section
      className={className}
      data-industry="legal"
      data-user-id={userId}
      data-business-id={businessId}
      aria-label="Legal dashboard"
    />
  );
}

export default LegalDashboard;
