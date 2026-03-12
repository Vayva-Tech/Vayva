/**
 * Blog/Media Industry Dashboard Component
 * Content publishing, audience analytics, and monetization dashboard
 */

import React from 'react';
import { UniversalProDashboard } from '@/components/dashboard/UniversalProDashboard';
import type { IndustryDashboardProps } from '@vayva/industry-core';

export function BlogMediaDashboard({
  userId,
  businessId,
  designCategory = 'signature',
  planTier = 'advanced',
  className,
}: IndustryDashboardProps) {
  return (
    <UniversalProDashboard
      industry="blog_media"
      variant="blog-media-pro"
      userId={userId}
      businessId={businessId}
      designCategory={designCategory}
      planTier={planTier}
      className={className}
    />
  );
}

export default BlogMediaDashboard;
