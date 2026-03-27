/**
 * Blog/Media Industry Dashboard Component
 * Content publishing, audience analytics, and monetization dashboard
 */

import React from 'react';
import { UniversalProDashboard } from '@/components/dashboard/UniversalProDashboard';
import type { IndustryDashboardProps } from '@vayva/industry-core';
import { DashboardErrorBoundary } from '@/components/error-boundary/error-boundary-utils';

export function BlogMediaDashboard({
  userId,
  businessId,
  designCategory = 'signature',
  planTier = 'advanced',
  className,
}: IndustryDashboardProps) {
  return (
    <DashboardErrorBoundary serviceName="BlogMediaDashboard">
      <UniversalProDashboard
        industry="blog_media"
        variant="pro"
        userId={userId}
        businessId={businessId}
        designCategory={designCategory}
        planTier={planTier}
        className={className}
      />
    </DashboardErrorBoundary>
  );
}

export default BlogMediaDashboard;
