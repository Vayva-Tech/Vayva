"use client";

import React from "react";
import { UniversalProDashboard } from "@/components/dashboard/UniversalProDashboard";
import type { IndustryDashboardProps } from "@vayva/industry-core";

/**
 * Blog/media industry dashboard — lives in merchant so it can use UniversalProDashboard (@/ paths).
 */
export function BlogMediaDashboard({
  userId,
  businessId,
  designCategory = "signature",
  planTier = "advanced",
  className,
}: IndustryDashboardProps) {
  return (
    <UniversalProDashboard
      industry="blog_media"
      variant="pro"
      userId={userId}
      businessId={businessId}
      designCategory={designCategory}
      planTier={planTier}
      className={className}
    />
  );
}

export default BlogMediaDashboard;
